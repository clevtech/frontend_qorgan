import warning from '@/assets/warning.mp3'
import { DashboardMap } from '@/components/app-components/dashboard/DashboardMap/components/DashboardMap'
import { QorganService } from '@/services/QorganService'
import {
	Button,
	Card,
	DatePicker,
	Modal,
	notification,
	Table,
	Tag,
	Typography,
} from 'antd'
import { saveAs } from 'file-saver'
import moment from 'moment'
import { useEffect, useState } from 'react'
import useWebSocket from 'react-use-websocket'
import * as XLSX from 'xlsx'
import { RootState } from '@/store'
import { useSelector } from 'react-redux'

const warningAudio = new Audio(warning)

import type { TableColumnsType } from 'antd'
import { Message } from '@/lang/Message'
import { WEBSOCKET_BASE_URL } from '@/configs/AppConfig'

const getColor = (text: string) => {
	const value = parseFloat(text)

	if (value > -3) {
		return 'red'
	} else if (value >= -10) {
		return 'gold'
	} else {
		return 'green'
	}
}

const Incidents = () => {
	const [mode, setMode] = useState<'auto' | 'manual' | 'off'>('auto')
	const [data, setData] = useState<any[]>([])
	const [loading, setLoading] = useState<boolean>(false)
	const [modules, setModules] = useState<any>([])
	const [selectedRow, setSelectedRow] = useState<any>(null)
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [pagination, setPagination] = useState({
		current: 1,
		pageSize: 10,
		total: 0,
	})
	const lang = useSelector((state: RootState) => state.theme.locale) as
		| 'en'
		| 'ru'
		| 'kk'

	const [tempDateFrom, setTempDateFrom] = useState<string | undefined>(
		undefined
	)
	const [tempDateTo, setTempDateTo] = useState<string | undefined>(undefined)

	// WebSocket connection for detections
	const { lastMessage } = useWebSocket(
		`${WEBSOCKET_BASE_URL}/backend/ws/detections/`,
		{
			onOpen: () => {
				console.log('WebSocket соединение открыто')
			},
			onMessage: message => {
				console.log('Получено сообщение из WebSocket:', message.data)
			},
			onError: error => {
				console.error('WebSocket ошибка:', error)
			},
			shouldReconnect: () => true, // автоматическое переподключение
		}
	)

	const columns = (() => {
		return [
			{
				dataIndex: 'direction',
				key: 'direction',
				title: Message.sector[lang],
				width: '20%',
			},
			{
				dataIndex: 'drone_name',
				key: 'drone_name',
				title: Message.name[lang],
				width: '20%',
			},
			{
				dataIndex: 'frequency',
				key: 'frequency',
				title: Message.droneFrequency[lang],
				width: '20%',
				render: (text: string | null) => (
					<span>{text ? `${text} ГГц` : 'Отсутствует'}</span>
				),
			},
			{
				dataIndex: 'power',
				key: 'power',
				title: Message.signalPower[lang],
				width: '20%',
				render: (text: string | null) => (
					<Tag color={getColor(text)}>{text ? text : 'Отсутствует'}</Tag>
				),
			},
			{
				dataIndex: 'datetime',
				key: 'datetime',
				title: Message.time[lang],
				width: '20%',
				render: (createdAt: string) => (
					<Typography.Text>
						{moment(createdAt).format('DD/MM/YYYY HH:mm')}
					</Typography.Text>
				),
			},
			{
				title: Message.action[lang],
				width: '20%',
				render: (_, record) => (
					<Button
						type='primary'
						onClick={() => {
							setSelectedRow(record)
							setIsModalOpen(true)
						}}
					>
						{Message.more[lang]}
					</Button>
				),
			},
		] as TableColumnsType<any>
	})()

	console.log(lastMessage)

	useEffect(() => {
		let cancelled = false
		const previousMode = mode

		const fetchData = async () => {
			setLoading(true)
			try {
				let response
				if (mode === 'auto') {
					response = await QorganService.getAuto()
				} else if (mode === 'manual') {
					response = await QorganService.getOn()
				} else if (mode === 'off') {
					response = await QorganService.getOff()
				}
				if (!cancelled) {
				}
			} catch (error) {
				if (!cancelled) {
					setMode(previousMode)
					notification.error({
						message: Message.getDataError[lang],
						description: (error as Error).message || Message.getDataErrorDescription[lang],
					})
				}
			} finally {
				if (!cancelled) setLoading(false)
			}
		}

		fetchData()
		return () => {
			cancelled = true
		}
	}, [mode])

	const fetchDetections = async (page = 1, pageSize = 10) => {
		try {
			const skip = (page - 1) * pageSize
			const response: any = await QorganService.getDetections({
				limit: pageSize,
				skip,
				datefrom: tempDateFrom,
				dateto: tempDateTo,
			})
			setData(response.data.detections)
			setPagination(prev => ({
				...prev,
				total: response.data.total_count || 0,
			}))
		} catch (error) {
			notification.error({
				message: Message.getSensorError[lang],
				description:
					(error as Error).message ||
					Message.getSensorErrorDescription[lang],
			})
		}
	}

	const fetchModules = async () => {
		try {
			const response: any = await QorganService.getModules({})
			setData(response.data.detections)
			setModules(response.data.modules)
		} catch (error) {
			notification.error({
				message: Message.getModulesError[lang],
				description:
					(error as Error).message || Message.getModulesErrorDescription[lang],
			})
		}
	}

	useEffect(() => {
		fetchDetections(pagination.current, pagination.pageSize)
		fetchModules()
	}, [tempDateFrom, tempDateTo])

	// Добавляем новые сообщения из WebSocket в начало data
	useEffect(() => {
		if (lastMessage !== null) {
			try {
				const newDetection = JSON.parse(lastMessage.data)

				if (parseFloat(newDetection.frequency) > -3) {
					warningAudio.play()
					setTimeout(() => warningAudio.pause(), 3000)
				}

				setData(prevData => [newDetection, ...prevData])
			} catch (e) {
				console.error(Message.getWebSocketError[lang], e)
			}
		}
	}, [lastMessage])

	const handleExport = () => {
		const worksheet = XLSX.utils.json_to_sheet(data)
		const workbook = XLSX.utils.book_new()
		XLSX.utils.book_append_sheet(workbook, worksheet, 'Detections')

		const excelBuffer = XLSX.write(workbook, {
			bookType: 'xlsx',
			type: 'array',
		})
		const blob = new Blob([excelBuffer], { type: 'application/octet-stream' })
		saveAs(blob, 'detections.xlsx')
	}

	return (
		<div style={{ height: '100%', width: '100%' }}>
			{selectedRow && (
				<Modal
					open={isModalOpen}
					onCancel={() => setIsModalOpen(false)}
					onOk={() => setIsModalOpen(false)}
					width={1000}
					title={Message.more[lang]}
				>
					<div style={{ display: 'flex', flexDirection: 'row', gap: '10px' }}>
						<div style={{ background: '#eee', width: '70%', height: '30rem' }}>
							<DashboardMap height={490} data={selectedRow} />
						</div>
						<div
							style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
						>
							<Typography.Title level={5}>
								{' '}
								{Message.sector[lang]}: {selectedRow.direction}
							</Typography.Title>
							<Typography.Text>
								{Message.name[lang]}: {selectedRow.drone_name}
							</Typography.Text>
							<Typography.Text>
								{Message.droneFrequency[lang]}: {selectedRow.frequency} ГГц
							</Typography.Text>
							<Typography.Text>
								{Message.signalPower[lang]}:{' '}
								<Tag color={getColor(selectedRow.power)}>
									{selectedRow.power ? selectedRow.power : 'Отсутствует'}
								</Tag>
							</Typography.Text>
							<Typography.Text>
								{Message.time[lang]}: {moment(selectedRow.datetime).format('HH:mm')}
							</Typography.Text>
							<Typography.Text>
								{Message.date[lang]}: {moment(selectedRow.datetime).format('DD.MM.YYYY')}
							</Typography.Text>
						</div>
					</div>
				</Modal>
			)}
			<Card style={{ height: '100%', width: '100%' }}>
				<div
					style={{
						marginBottom: '16px',
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
					}}
				>
					<div className='flex-column mb-3 ml-1'>
						<DatePicker.RangePicker
							className='mr-2'
							style={{ width: '100%', borderRadius: '12px' }}
							placeholder={[Message.fromDate[lang], Message.toDate[lang]]}
							value={
								tempDateFrom && tempDateTo
									? [moment(tempDateFrom), moment(tempDateTo)]
									: undefined
							}
							onChange={(_, dateString) => {
								setTempDateFrom(dateString[0])
								setTempDateTo(dateString[1])
							}}
						/>
					</div>
					<Button type='primary' onClick={handleExport}>
						{Message.download[lang]}
					</Button>
				</div>
				<Table
					columns={columns}
					dataSource={data}
					loading={loading}
					pagination={{
						current: pagination.current,
						pageSize: pagination.pageSize,
						total: pagination.total,
					}}
					onChange={pagination => {
						setPagination(pagination)
						fetchDetections(pagination.current, pagination.pageSize)
					}}
				/>
			</Card>
		</div>
	)
}

export default Incidents
