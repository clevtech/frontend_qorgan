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

const warningAudio = new Audio(warning)

import type { TableColumnsType } from 'antd'

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
	const [tempDateFrom, setTempDateFrom] = useState<string | undefined>(
		undefined
	)
	const [tempDateTo, setTempDateTo] = useState<string | undefined>(undefined)

	// WebSocket connection for detections
	const { lastMessage } = useWebSocket(
		`wss://${window.location.hostname}/backend/ws/detections/`,
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
				title: 'Сектор',
				width: '20%',
			},
			{
				dataIndex: 'drone_name',
				key: 'drone_name',
				title: 'Названае',
				width: '20%',
			},
			{
				dataIndex: 'frequency',
				key: 'frequency',
				title: 'Частота дрона',
				width: '20%',
				render: (text: string | null) => (
					<span>{text ? `${text} ГГц` : 'Отсутствует'}</span>
				),
			},
			{
				dataIndex: 'power',
				key: 'power',
				title: 'Сила сигнала',
				width: '20%',
				render: (text: string | null) => (
					<Tag color={getColor(text)}>{text ? text : 'Отсутствует'}</Tag>
				),
			},
			{
				dataIndex: 'datetime',
				key: 'datetime',
				title: 'Время',
				width: '20%',
				render: (createdAt: string) => (
					<Typography.Text>
						{moment(createdAt).format('DD/MM/YYYY HH:mm')}
					</Typography.Text>
				),
			},
			{
				title: 'Действия',
				width: '20%',
				render: (_, record) => (
					<Button
						type='primary'
						onClick={() => {
							setSelectedRow(record)
							setIsModalOpen(true)
						}}
					>
						Подробнее
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
						message: 'Ошибка при получении данных',
						description: (error as Error).message || 'Что-то пошло не так.',
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
				message: 'Ошибка при получении обнаружений',
				description:
					(error as Error).message ||
					'Не удалось загрузить данные обнаружений.',
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
				message: 'Ошибка при получении модулей',
				description:
					(error as Error).message || 'Не удалось загрузить данные модулей.',
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
				console.error('Ошибка при парсинге сообщения WebSocket:', e)
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
					title='Подробнее'
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
								Сектор: {selectedRow.direction}
							</Typography.Title>
							<Typography.Text>
								Название дрона: {selectedRow.drone_name}
							</Typography.Text>
							<Typography.Text>
								Частота дрона: {selectedRow.frequency} ГГц
							</Typography.Text>
							<Typography.Text>
								Сила сигнала:{' '}
								<Tag color={getColor(selectedRow.power)}>
									{selectedRow.power ? selectedRow.power : 'Отсутствует'}
								</Tag>
							</Typography.Text>
							<Typography.Text>
								Время: {moment(selectedRow.datetime).format('HH:mm')}
							</Typography.Text>
							<Typography.Text>
								Дата: {moment(selectedRow.datetime).format('DD.MM.YYYY')}
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
						Скачать
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
