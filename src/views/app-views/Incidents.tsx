import { QorganService } from '@/services/QorganService'
import {
	Button,
	Card,
	Col,
	notification,
	Radio,
	Row,
	Table,
	Typography,
	Tooltip,
} from 'antd'
import { saveAs } from 'file-saver'
import moment from 'moment'
import { useEffect, useState } from 'react'
import useWebSocket from 'react-use-websocket'
import * as XLSX from 'xlsx'

import type { TableColumnsType } from 'antd'

const Incidents = () => {
	const [mode, setMode] = useState<'auto' | 'manual' | 'off'>('auto')
	const [data, setData] = useState<any[]>([])
	const [loading, setLoading] = useState<boolean>(false)
	const [modules, setModules] = useState<any>([])
	const [pagination, setPagination] = useState({
		current: 1,
		pageSize: 10,
		total: 0,
	})

	const [moduleStates, setModuleStates] = useState<
		{ direction: number; status: number }[]
	>([])

	const { lastMessage } = useWebSocket('ws://192.168.1.144/ws/statuses/', {
		onOpen: () => console.log('WebSocket connection opened'),
		onClose: () => console.log('WebSocket connection closed'),
		onError: event => console.error('WebSocket error:', event),
		shouldReconnect: () => true,
		reconnectAttempts: 10,
		reconnectInterval: 3000,
	})

	useEffect(() => {
		if (lastMessage?.data) {
			try {
				const incoming = JSON.parse(lastMessage.data)
				console.log(incoming.statuses)
				setModuleStates(incoming.statuses)
			} catch (err) {
				console.error('Ошибка при парсинге WebSocket-сообщения:', err)
			}
		}
	}, [lastMessage])

	const getFillColor = (direction: number) => {
		const found = moduleStates.find(m => m.direction === direction)
		console.log(found)
		if (!found) return '#AAC5FF' // отсутствует
		if (found.status === 0) return '#407BFF' // в наличии
		if (found.status === 1) return '#D63604' // включен
		return '#AAC5FF'
	}

	const renderModuleTooltip = (direction: number, pathElement: JSX.Element) => {
		const module = modules.find((m: any) => m.direction === direction)
		if (!module) return pathElement

		const tooltipContent = (
			<div>
				<div><strong>{module.name}</strong></div>
				<div>Угол: {module.angle}°</div>
				<div>Коорд: {module.coordinates?.join(', ')}</div>
				<div>Частоты: {module.frequencies?.[0]?.join(', ')}</div>
			</div>
		)

		return <Tooltip title={tooltipContent}>{pathElement}</Tooltip>
	}

	// useEffect(() => {
	// 	// Пример: загрузка статусов по ID модуля
	// 	setModuleStates({
	// 		module1: 'absent',
	// 		module2: 'available',
	// 		module3: 'active',
	// 	})
	// }, [])

	const columns = (() => {
		return [
			{
				dataIndex: 'detection',
				key: 'detection',
				title: 'Сектор',
				width: '25%',
				render: (text: any) => (
					<span>{`${text}`}</span>
				),
			},
			{
				dataIndex: 'frequency',
				key: 'frequency',
				title: 'Частота дрона',
				width: '25%',
				render: (text: string | null) => (
					<span>{text ? text : 'Отсутствует'}</span>
				),
			},
			{
				dataIndex: 'power',
				key: 'power',
				title: 'Сила сигнала',
				width: '25%',
				render: (text: string | null) => (
					<span>{text ? text : 'Отсутствует'}</span>
				),
			},
			{
				dataIndex: 'datetime',
				key: 'datetime',
				title: 'Время',
				width: '25%',
				render: (createdAt: string) => (
					<Typography.Text>
						{moment(createdAt).format('DD/MM/YYYY HH:mm')}
					</Typography.Text>
				),
			},
		] as TableColumnsType<any>
	})()

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
					(error as Error).message ||
					'Не удалось загрузить данные модулей.',
			})
		}
	}

	useEffect(() => {
		fetchDetections(pagination.current, pagination.pageSize)
		fetchModules()
	}, [])

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
		<div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
			<Row gutter={16} style={{ flex: 1 }} align='stretch'>
				<Col span={12} style={{ height: '100%' }}>
					<Card title='Статус устройств' style={{ height: '100%' }}>
						<div
							style={{
								display: 'flex',
								justifyContent: 'center',
								flexDirection: 'center',
							}}
						>
							<svg
								width='70%'
								height='70%'
								viewBox='0 0 404 405'
								fill='none'
								xmlns='http://www.w3.org/2000/svg'
							>
								<circle
									cx='202.6'
									cy='200.343'
									r='88'
									transform='rotate(-22.5 202.6 200.343)'
									stroke='#407BFF'
									stroke-width='5'
									stroke-linecap='round'
									stroke-dasharray='12 24'
								/>
								{renderModuleTooltip(7,
									<path
										id='module1'
										d='M59.0225 318.495C53.8212 322.645 46.0936 320.652 43.5474 314.505L9.04199 231.201C6.509 225.086 10.509 218.242 17.0801 217.447L85.4275 209.181C89.8819 208.642 94.1499 211.136 95.867 215.281L115.97 263.815C117.676 267.932 116.451 272.68 112.968 275.459L59.0225 318.495Z'
										fill={getFillColor(7)}
									/>
								)}
								{renderModuleTooltip(5,
									<path
										id='module2'
										d='M319.495 349.349C323.644 354.55 321.652 362.278 315.505 364.824L232.201 399.33C226.086 401.863 219.241 397.863 218.447 391.291L210.181 322.944C209.642 318.49 212.136 314.222 216.281 312.505L264.815 292.401C268.932 290.696 273.68 291.92 276.459 295.404L319.495 349.349Z'
										fill={getFillColor(5)}
									/>
								)}
								{renderModuleTooltip(3,
									<path
										id='module3'
										d='M345.349 81.2881C350.55 77.1387 358.278 79.1313 360.824 85.2785L395.33 168.582C397.863 174.697 393.863 181.542 387.291 182.336L318.944 190.603C314.49 191.141 310.222 188.647 308.505 184.502L288.401 135.968C286.696 131.851 287.92 127.103 291.404 124.324L345.349 81.2881Z'
										fill={getFillColor(3)}
									/>
								)}
								{renderModuleTooltip(1,
									<path
										id='module4'
										d='M83.2881 55.022C79.1387 49.8207 81.1313 42.0932 87.2785 39.5469L170.582 5.0415C176.697 2.50852 183.542 6.50849 184.336 13.0796L192.603 81.427C193.141 85.8815 190.647 90.1494 186.502 91.8665L137.968 111.97C133.851 113.675 129.103 112.451 126.324 108.967L83.2881 55.022Z'
										fill={getFillColor(1)}
									/>
								)}
								{renderModuleTooltip(0,
									<path
										id='module5'
										d='M13.6045 182.726C6.99257 181.982 2.93737 175.109 5.48362 168.962L39.989 85.6583C42.522 79.5432 50.1903 77.5317 55.3987 81.6163L109.573 124.1C113.103 126.869 114.358 131.65 112.641 135.796L92.5372 184.33C90.832 188.446 86.6086 190.938 82.1805 190.44L13.6045 182.726Z'
										fill={getFillColor(0)}
									/>
								)}
								{renderModuleTooltip(4,
									<path
										id='module3_alt'
										d='M390.561 216.768C397.173 217.512 401.229 224.385 398.682 230.532L364.177 313.836C361.644 319.951 353.976 321.962 348.767 317.878L294.593 275.394C291.062 272.625 289.808 267.844 291.525 263.698L311.629 215.164C313.334 211.048 317.557 208.556 321.985 209.054L390.561 216.768Z'
										fill={getFillColor(4)}
									/>
								)}
								{renderModuleTooltip(6,
									<path
										id='module6'
										d='M183.71 391.492C182.966 398.104 176.093 402.16 169.946 399.613L86.6423 365.108C80.5272 362.575 78.5157 354.907 82.6003 349.698L125.084 295.524C127.853 291.994 132.635 290.739 136.78 292.456L185.314 312.56C189.43 314.265 191.922 318.488 191.424 322.916L183.71 391.492Z'
										fill={getFillColor(6)}
									/>
								)}
								{renderModuleTooltip(2,
									<path
										id='module4_alt'
										d='M222.37 14.6229C223.114 8.01088 229.987 3.95568 236.134 6.50193L319.438 41.0073C325.553 43.5403 327.564 51.2086 323.48 56.417L280.996 110.591C278.227 114.122 273.446 115.376 269.3 113.659L220.766 93.5555C216.65 91.8503 214.158 87.6269 214.656 83.1989L222.37 14.6229Z'
										fill={getFillColor(2)}
									/>
								)}
							</svg>
						</div>
					</Card>
				</Col>
				<Col span={12} style={{ height: '100%' }}>
					<Card style={{ height: '100%' }}>
						<div
							style={{
								marginBottom: '16px',
								display: 'flex',
								justifyContent: 'space-between',
								alignItems: 'center',
							}}
						>
							<Radio.Group
								defaultValue='auto'
								onChange={e => {
									const newMode = e.target.value
									setMode(newMode)
								}}
							>
								<Radio value='auto'>Автоматическое</Radio>
								<Radio value='manual'>Вручную</Radio>
								<Radio value='off'>Выкл</Radio>
							</Radio.Group>
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
				</Col>
			</Row>
		</div>
	)
}

export default Incidents
