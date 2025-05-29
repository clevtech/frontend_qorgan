import drone from '@/assets/drone.png'
import { DashboardMap } from '@/components/app-components/dashboard/DashboardMap/components/DashboardMap'
import { QorganService } from '@/services/QorganService'
import { Card, notification, Radio, Switch, Tooltip } from 'antd'
import { useEffect, useState } from 'react'
import useWebSocket from 'react-use-websocket'

/**
 * Возвращает стили для позиционирования дрона на карте.
 * distance должен быть в диапазоне от 100 до 1000.
 * 100 = 0%, 1000 = 100%, плавный переход между ними.
 */
const getDroneStyle = (angleDeg: number, distance: number) => {
	const offset = ((distance - 100) / 900) * 615 // можно подогнать под твою карту
	return {
		position: 'absolute' as const,
		left: '50%',
		bottom: '-7%',
		transform: `
			translate(-50%, -50%)
			rotate(${angleDeg}deg)
			translateY(-${offset}px)
			rotate(${-angleDeg}deg)
		`,
		width: '5%',
	}
}

const getTitleStyle = (angleDeg: number, distance: number) => {
	const offset = ((distance - 100) / 900) * 615 // можно подогнать под твою карту
	return {
		position: 'absolute' as const,
		left: '54.5%',
		bottom: '9%',
		transform: `
			translate(-50%, -50%)
			rotate(${angleDeg}deg)
			translateY(-${offset}px)
			rotate(${-angleDeg}deg)
		`,
		width: '15%',
	}
}

const Incidents = () => {
	const [mode, setMode] = useState<'auto' | 'manual' | 'off'>('auto')
	const [data, setData] = useState<any[]>([])
	const [loading, setLoading] = useState<boolean>(false)
	const [modules, setModules] = useState<any>([])
	const [isSwitched, setIsSwitched] = useState(false)

	const [pagination, setPagination] = useState({
		current: 1,
		pageSize: 10,
		total: 0,
	})

	const [moduleStates, setModuleStates] = useState<
		{ direction: number; status: number }[]
	>([])

	const { lastMessage } = useWebSocket(
		// `ws://${window.location.hostname}:8080/ws/statuses/`,
		`ws://${window.location.hostname}:8080/ws/statuses/`,
		{
			onOpen: () => console.log('WebSocket connection opened'),
			onClose: () => console.log('WebSocket connection closed'),
			onError: event => console.error('WebSocket error:', event),
			shouldReconnect: () => true,
			reconnectAttempts: 10,
			reconnectInterval: 3000,
		}
	)

	useEffect(() => {
		if (lastMessage?.data) {
			try {
				const incoming = JSON.parse(lastMessage.data)
				setModuleStates(incoming.statuses)
			} catch (err) {
				console.error('Ошибка при парсинге WebSocket-сообщения:', err)
			}
		}
	}, [lastMessage])

	const getFillColor = (direction: number) => {
		const found = moduleStates.find(m => m.direction === direction)
		if (!found) return '#AAC5FF' // отсутствует
		if (found.status === 0) return '#407BFF' // в наличии
		if (found.status === 1) return '#D63604' // включен
		return '#AAC5FF'
	}



	// useEffect(() => {
	// 	// Пример: загрузка статусов по ID модуля
	// 	setModuleStates({
	// 		module1: 'absent',
	// 		module2: 'available',
	// 		module3: 'active',
	// 	})
	// }, [])

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
					(error as Error).message || 'Не удалось загрузить данные модулей.',
			})
		}
	}

	useEffect(() => {
		fetchDetections(pagination.current, pagination.pageSize)
		fetchModules()
	}, [])

	const onChangeSwitch = (checked: boolean) => {
		setIsSwitched(checked)
	}


	return (
		<div style={{ height: '100%', width: '100%' }}>
			<div
				style={{
					marginBottom: '16px',
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					background: '#fff',
					padding: '1rem',
					borderRadius: '1rem',
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
				<span>
					Demo: <Switch onChange={onChangeSwitch} />{' '}
				</span>
			</div>

			<Card>
				<div style={{ position: 'relative' }}>
					<DashboardMap switched={isSwitched} />

					<div style={{display: 'flex', justifyContent: 'space-between'}} >
						{modules.map((module: any, index: number) => (
						<div>
							<div>
								<strong>{module.name}</strong>
							</div>
							<div>Угол: {module.angle}°</div>
							<div>Коорд: {module.coordinates?.join(', ')}</div>
							<div>Частоты: {module.frequencies?.[0]?.join(', ')}</div>
						</div>
					))}
					</div>
				</div>
			</Card>
		</div>
	)
}

export default Incidents
