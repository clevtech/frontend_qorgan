import fetch from '@/api/FetchInterceptor'
import { DashboardMap } from '@/components/app-components/dashboard/DashboardMap/components/DashboardMap'
import { WEBSOCKET_BASE_URL } from '@/configs/AppConfig'
import { Message } from '@/lang/Message'
import { QorganService } from '@/services/QorganService'
import { LeftOutlined, RightOutlined } from '@ant-design/icons'
import {
	Button,
	Card,
	Form,
	Input,
	Modal,
	notification,
	Radio,
	Switch,
} from 'antd'
import { useEffect, useRef, useState } from 'react'
import useWebSocket from 'react-use-websocket'

type Module = {
	angle: number
	coordinates: number[]
	frequencies: string[]
	name: string
}

type Object = {
	angle: number
	latitude: number
	longitude: number
	modules: Module[]
	name: 'string'
}

const Incidents = () => {
	const [mode, setMode] = useState<'auto' | 'manual' | 'off'>('auto')
	const [data, setData] = useState<any[]>([])
	const [loading, setLoading] = useState<boolean>(false)
	const [modules, setModules] = useState<Module[]>([])
	const [objects, setObjects] = useState<Object[]>([])
	const [isSwitched, setIsSwitched] = useState(false)
	const [isAddObject, setIsAddObject] = useState(false)
	const objectsScrollRef = useRef<HTMLDivElement | null>(null)
	const scrollObjectsBy = (dx: number) => {
		if (objectsScrollRef.current) {
			objectsScrollRef.current.scrollBy({ left: dx, behavior: 'smooth' })
		}
	}
	const handleShowOnMap = (obj: any) => {
		try {
			window.dispatchEvent(
				new CustomEvent('dashboardmap:focus', {
					detail: {
						latitude: obj.latitude,
						longitude: obj.longitude,
						name: obj.name,
					},
				})
			)
		} catch (e) {
			console.log('focus event error', e)
		}
	}
	const lang = (localStorage.getItem('lang') || 'ru') as 'en' | 'ru' | 'kk'

	const [form] = Form.useForm()

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
		`${WEBSOCKET_BASE_URL}/backend/ws/statuses/`,
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
		fetch({
			url: '/backend/objects/',
			method: 'GET',
		}).then(res => {
			console.log(res)
			setObjects(res.data.objects)
		})
	}, [])

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
				message: Message.getSensorError[lang],
				description:
					(error as Error).message || Message.getSensorErrorDescription[lang],
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
	}, [])

	const onChangeSwitch = (checked: boolean) => {
		setIsSwitched(checked)
	}

	const handleOnFinish = (values: any) => {
		console.log(values)
		fetch({
			url: '/backend/object/',
			method: 'POST',
			data: {
				...values,
				modules: [
					{
						angle: 0,
						coordinates: [values.longitude, values.latitude],
						frequencies: ['0'],
						name: 'module',
					},
				],
			},
		}).then(res => {
			if (res.data.status === 'created') {
				setIsAddObject(false)
				form.resetFields()
				fetch({
					url: '/backend/objects/',
					method: 'GET',
				}).then(res => {
					setObjects(res.data.objects)
				})
				notification.success({
					message: 'Объект добавлен',
				})
			}
		})
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
					<Radio value='auto'>{Message.autoMode[lang]}</Radio>
					<Radio value='manual'>{Message.manualMode[lang]}</Radio>
					<Radio value='off'>{Message.offMode[lang]}</Radio>
				</Radio.Group>

				<span>
					<Button className='mr-3' onClick={() => setIsAddObject(true)}>
						Добавить объект
					</Button>
					<Modal
						open={isAddObject}
						onCancel={() => setIsAddObject(false)}
						onOk={() => setIsAddObject(false)}
						footer={null}
						title='Добавить объект'
					>
						<Form form={form} layout='vertical' onFinish={handleOnFinish}>
							<Form.Item name='name'>
								<Input placeholder='Название объекта' />
							</Form.Item>
							<Form.Item name='latitude'>
								<Input placeholder='Широта' />
							</Form.Item>
							<Form.Item name='longitude'>
								<Input placeholder='Долгота' />
							</Form.Item>
							<Form.Item name='angle'>
								<Input placeholder='Угол' />
							</Form.Item>
							<div style={{ display: 'flex', justifyContent: 'flex-end' }}>
								<Button type='primary' htmlType='submit'>
									Добавить
								</Button>
							</div>
						</Form>
					</Modal>
					{Message.demo[lang]}: <Switch onChange={onChangeSwitch} />{' '}
				</span>
			</div>

			<Card>
				<div>
					<div style={{ position: 'relative' }}>
						<div
							style={{
								position: 'absolute',
								top: 10,
								left: 180,
								zIndex: 1000,
								padding: '8px 40px',
								borderRadius: 12,
							}}
						>
							{/* Scroll buttons */}
							<Button
								type='text'
								size='small'
								aria-label='Прокрутить влево'
								onClick={() => scrollObjectsBy(-320)}
								style={{
									position: 'absolute',
									left: 4,
									top: '50%',
									transform: 'translateY(-50%)',
								}}
								icon={<LeftOutlined />}
							/>
							<Button
								type='text'
								size='small'
								aria-label='Прокрутить вправо'
								onClick={() => scrollObjectsBy(320)}
								style={{
									position: 'absolute',
									right: 4,
									top: '50%',
									transform: 'translateY(-50%)',
								}}
								icon={<RightOutlined />}
							/>

							{/* Horizontal scroll area */}
							<div
								ref={objectsScrollRef}
								style={{
									display: 'flex',
									gap: '12px',
									flexWrap: 'nowrap',
									overflowX: 'auto',
									overflowY: 'hidden',
									maxWidth: '70vw',
									paddingBottom: 4,
								}}
							>
								{objects && objects.length > 0 ? (
									objects.map((obj: any, idx: number) => (
										<Card
											key={idx}
											size='small'
											style={{ minWidth: 240, flex: '0 0 auto' }}
										>
											<div style={{ marginBottom: 6 }}>
												<strong>{obj.name}</strong>
											</div>
											<div>
												Lat: {obj.latitude}, Lng: {obj.longitude}
											</div>
											<div>Модулей: {obj.modules ? obj.modules.length : 0}</div>
											<div
												style={{
													marginTop: 8,
													display: 'flex',
													justifyContent: 'flex-end',
												}}
											>
												<Button
													size='small'
													onClick={() => handleShowOnMap(obj)}
												>
													На карте
												</Button>
											</div>
										</Card>
									))
								) : (
									<span style={{ opacity: 0.6 }}>Нет объектов</span>
								)}
							</div>
						</div>
						<DashboardMap switched={isSwitched} />

						<div className='flex justify-between'>
							{modules?.map((module: any, index: number) => (
								<div>
									<div>
										<strong>{module.name}</strong>
									</div>
									<div>
										{Message.angle[lang]}: {module.angle}°
									</div>
									<div>
										{Message.coordinates[lang]}:{' '}
										{module.coordinates?.join(', ')}
									</div>
									<div>
										{Message.frequencies[lang]}:{' '}
										{module.frequencies?.[0]?.join(', ')}
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</Card>
		</div>
	)
}

export default Incidents
