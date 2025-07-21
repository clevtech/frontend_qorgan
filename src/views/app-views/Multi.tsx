import { MilitaryPersonnelListModal } from '@/components/app-components/attendance/MilitaryPersonnelListModal'
import { CameraCard } from '@/components/app-components/cameras/CameraCard'
import { TransportModal } from '@/components/app-components/dashboard/TransportModal'
import { CreateIncidentModal } from '@/components/app-components/incidents/CreateIncidentModal'
import { IncidentModal } from '@/components/app-components/incidents/IncidentModal'
import LazyLoadedIncidentsList from '@/components/app-components/incidents/LazyLoadedIncidentsList'
import { ReadIncidentModal } from '@/components/app-components/incidents/ReadIncidentModal'
import { CustomCard } from '@/components/custom-components/CustomCard'
import { NoData } from '@/components/util-components/NoData'
import { CamerasService } from '@/services/CamerasService'
import { EmployeeService } from '@/services/EmployeeService'
import { IncidentsService } from '@/services/IncidentsService'
import {
	CloseOutlined,
	DownloadOutlined,
	SearchOutlined,
} from '@ant-design/icons'
import useWebSocket from 'react-use-websocket'
import './style.less'

import { CustomCardButton } from '@/components/custom-components/CustomCardButton'
import { IconColumns1, IconColumns2, IconColumns3 } from '@tabler/icons-react'
import {
	Button,
	Card,
	Col,
	DatePicker,
	Input,
	Radio,
	Row,
	Select,
	Spin,
	Table,
	Typography,
} from 'antd'
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import ReactApexChart from 'react-apexcharts'
import { useLocation } from 'react-router-dom'

const Multi = () => {
	const [modalOpen, setModalOpen] = useState(false)
	const [transportOpen, setTransportOpen] = useState(false)
	const [current, setCurrent] = useState<number>(1)
	const [incidentTypes, setIncidentTypes] = useState<unknown[]>([])
	const [cameras, setCameras] = useState<any>([])

	const [dataSource, setDataSource] = useState<any>({
		incidents: [],
		totalCount: 0,
		users: [],
		attendance: [],
		statistics: [],
	})
	const [dateFrom, setDateFrom] = useState<string>()
	const [searchComment, setSearchComment] = useState<string>()
	const [searchCameraId, setSearchCameraId] = useState<string>()
	const [searchFio, setSearchFio] = useState<string>()
	const [dateTo, setDateTo] = useState<string>()
	const [incidentId, setIncidentId] = useState<string>()
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false)
	const [isReadModalOpen, setIsReadModalOpen] = useState<boolean>(false)
	const [cameraSize, setCameraSize] = useState('Маленькие значки')

	const [childs, setChilds] = useState([])
	const [isCurrent, setIsCurrent] = useState(false)
	const [selectedChild, setSelectedChild] = useState('')

	const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false)
	const [selectedIncident, setSelectedIncident] = useState({})
	const [hasMore, setHasMore] = useState(true)
	const [nextPage, setNextPage] = useState(1)
	const [selectedValue, setSelectedValue] = useState(
		localStorage.getItem('selected') || 'all'
	)
	const [desk, setDesk] = useState<number | null>(null)
	const [selectedDesk, setSelectedDesk] = useState<number | null>(null)
	const [сashier, setСashier] = useState<number | null>(null)
	const [selectedСashier, setSelectedСashier] = useState<number | null>(null)
	const currentPath = useLocation()
	const closeModal = () => setModalOpen(false)

	const showModal = () => setModalOpen(true)

	const [tempSearchComment, setTempSearchComment] = useState<
		string | undefined
	>(undefined)
	const [tempSearchCameraId, setTempSearchCameraId] = useState<
		string | undefined
	>(undefined)
	const [tempSearchFio, setTempSearchFio] = useState<string | undefined>(
		undefined
	)
	const [tempDateFrom, setTempDateFrom] = useState<string | undefined>(
		undefined
	)
	const [tempDateTo, setTempDateTo] = useState<string | undefined>(undefined)
	const [tempSelectedChild, setTempSelectedChild] = useState<string>(
		localStorage.getItem('me') || ''
	)

	const { sendMessage, lastMessage, readyState } = useWebSocket(
		`wss://${localStorage.getItem('selected')}8080/ws?name=${
			currentPath.pathname.split('/')[2]
		}`,
		{
			shouldReconnect: () => true, // автоматический reconnect
			reconnectAttempts: 10,
			reconnectInterval: 3000,
		}
	)

	useEffect(() => {
		if (lastMessage !== null) {
			console.log('Получено сообщение:', JSON.parse(lastMessage.data).data)
			setDataSource({
				...dataSource,
				incidents: [JSON.parse(lastMessage.data).data, ...dataSource.incidents],
			})
		}
	}, [lastMessage])

	const [isCamerasLoading, setIsCamerasLoading] = useState(false)

	const getLastWeekDates = () => {
		const dates = []
		const options = { day: 'numeric', month: 'short' } // Формат: "21 марта"

		for (let i = 6; i >= 0; i--) {
			const date = new Date()
			date.setDate(date.getDate() - i)
			dates.push(date.toLocaleDateString('ru-RU', options))
		}

		return dates
	}

	const selectChangeHendler = (value: any) => {
		setSelectedValue(value) // Обновляем состояние Select

		if (value == 'all') {
			setIsCurrent(false)
			localStorage.setItem('selected', `${localStorage.getItem('me')}`)
			setSelectedChild(`${localStorage.getItem('me')}`)
			return
		}

		if (value == `${localStorage.getItem('me')}`) {
			localStorage.setItem('selected', `${localStorage.getItem('me')}`)
			setIsCurrent(true)
			return
		}

		localStorage.setItem('selected', value)
		setSelectedChild(value)
		setIsCurrent(false)
	}
	const selectDeskChangeHendler = (value: string) => {
		if (value === 'all' || value === 'Все столики') {
			setSelectedDesk(null)
			setDesk(null)
		} else {
			const parsedValue = Number(value)
			if (!isNaN(parsedValue)) {
				setSelectedDesk(parsedValue)
				setDesk(parsedValue)
			} else {
				setSelectedDesk(null)
				setDesk(null)
			}
		}
	}

	const selectDCashierChangeHendler = (value: string) => {
		if (value === 'all' || value === 'Все кассы') {
			setSelectedСashier(null)
			setСashier(null)
		} else {
			const parsedValue = Number(value)
			if (!isNaN(parsedValue)) {
				setSelectedСashier(parsedValue)
				setСashier(parsedValue)
			} else {
				setSelectedСashier(null)
				setСashier(null)
			}
		}
	}

	const currentSection = currentPath.pathname.split('/')[2] as keyof typeof pathNameMap
	const pathNameMap = {
		thermo_zone: 'Превышение разрешенной температуры',
		working_hours: 'Время работы станка за последние 24 часа',
		storage: 'Остаток на складе',
		acceptance: 'Статистика по входным зонам',
		service_table: 'Данные обслуживания столов официантами',
		people_map: 'Посещаемость зон по часам',
		checkout_lines: 'Статистика посетителей у касс',
		cashier: 'Время работы касс'
	}

	const [state, setState] = useState({
		series: [
			{
				name: 'Инциденты',
				data: dataSource?.incidents_by_day ?? [],
			},
		],
		options: {
			colors: ['#852ed1'],
			chart: {
				height: 350,
				type: 'line',
				zoom: { enabled: false },
			},
			dataLabels: { enabled: false },
			stroke: { curve: 'straight', width: 3 },
			// title: {
			// 	text: pathNameMap[currentSection] || 'Инциденты за последнюю неделю',
			// 	align: 'left',
			// },
			grid: {
				row: { colors: ['#f3f3f3', 'transparent'], opacity: 0.5 },
			},
			xaxis: { categories: getLastWeekDates() },
		},
	});
	const [tableTitle, setTableTitle] = useState('')

	useEffect(() => {
		setState((prev) => ({
			...prev,
			series: [
				{
					name: 'Инциденты',
					data: dataSource?.incidents_by_day ?? [],
				},
			],
			options: {
				...prev.options,
				// title: {
				// 	text: pathNameMap[currentSection] || 'Инциденты за последнюю неделю',
				// 	align: 'left',
				// },
				xaxis: {
					categories: getLastWeekDates(),
				},
			},
		}));
		setTableTitle(pathNameMap[currentSection])
	}, [currentSection, dataSource]);
	
	const options = {
		chart: {
			type: 'donut',
		},
		labels: ['На месте', 'Опоздал', 'Отсутствует'],
		plotOptions: {
			pie: {
				startAngle: -90,
				endAngle: 90,
				offsetY: 10,
				donut: {
					size: '75%',
				},
			},
		},
		dataLabels: {
			enabled: true,
			style: {
				fontSize: '14px',
			},
		},

		legend: {
			position: 'right',
		},
		tooltip: {
			y: {
				formatter: function (value: any) {
					return `${value} человек` // <- выводит значение, а не %
				},
			},
		},
	}

	React.useEffect(() => {
		if (dataSource.incidents_by_day) {
			setState(prev => ({
				...prev,
				series: [{ name: 'Инциденты', data: dataSource.incidents_by_day }],
			}))
		}
	}, [dataSource.incidents_by_day])

	useEffect(() => {
		EmployeeService.getEmployeesChild({
			query: {},
		}).then(response => {
			const { data }: { data: any } = response

			setChilds(data)
		})
	}, [])

	const closeReadModal = () => setIsReadModalOpen(false)

	const handleCreateModalOk = async () => {
		// await fetchIncidents()

		setIsCreateModalOpen(false)
	}

	const handleReadModalOk = () => setIsReadModalOpen(false)

	const fetchIncidentsTypes = async () => {
		setIsLoading(true)

		await IncidentsService.getIncidentsTypes({})
			.then(response => {
				const { data }: { data: unknown } = response

				setIncidentTypes(data?.types)
			})
			.finally(() => setIsLoading(false))
	}

	const downloadExcel = async () => {
		setIsLoading(true)

		await IncidentsService.getIncidentsExcel({
			query: {
				date_from: dateFrom || undefined,
				date_to: dateTo || undefined,
				comment: searchComment || undefined,
				camera_id: searchCameraId || undefined,
				name: currentPath.pathname.split('/')[2], // Получаем параметр из пути
				current: isCurrent ? 1 : undefined,
				desk: desk || undefined,
				сashier: сashier || undefined,
			},
		})
			.then(response => {
				const url = window.URL.createObjectURL(new Blob([response.data]))

				const a = document.createElement('a')
				a.href = url
				a.download = 'data.xlsx'
				document.body.appendChild(a)
				a.click()
				document.body.removeChild(a)

				window.URL.revokeObjectURL(url)
			})
			.finally(() => setIsLoading(false))
	}
	const [isInitialLoading, setIsInitialLoading] = useState(true)
	const [isLoadingMore, setIsLoadingMore] = useState(false)

	const fetchIncidents = async (
		page = 1,
		params?: {
			dateFrom?: string
			dateTo?: string
			searchComment?: string
			searchCameraId?: string
			searchFio?: string
			selectedChild?: string
			isCurrent?: boolean
			desk?: number
		}
	) => {
		if (isLoadingMore) return

		if (page === 1) setIsInitialLoading(true)
		else setIsLoadingMore(true)

		try {
			const response = await IncidentsService.getIncidents({
				query: {
					skip: (page - 1) * 10,
					limit: 10,
					full_name: params?.searchFio?.toLowerCase().split(' ').join(''),
					date_from: params?.dateFrom,
					date_to: params?.dateTo,
					comment: params?.searchComment,
					camera_id: params?.searchCameraId,
					name: currentPath.pathname.split('/')[2],
					current: params?.isCurrent ? 1 : undefined,
					desk: params?.desk || undefined,
				},
			})

			const {
				incidents = [],
				totalCount = 0,
				users = [],
				attendances = [],
				missings = [],
				statistic = [],
				incidents_by_day = [],
			} = response?.data ?? {}

			setDataSource(prev => ({
				incidents: page === 1 ? incidents : [...prev.incidents, ...incidents],
				totalCount,
				users,
				attendances,
				missings,
				statistic,
				incidents_by_day,
			}))

			setHasMore(incidents.length === 10)
			setNextPage(page + 1)
		} finally {
			setIsInitialLoading(false)
			setIsLoadingMore(false)
		}
	}

	const getColProps = () => {
		switch (cameraSize) {
			case 'Крупные значки':
				return { xs: 24, sm: 12, xl: 24 } // Крупные значки: 1/4 ширины
			case 'Маленькие значки':
				return { xs: 24, sm: 12, xl: 8 } // Маленькие значки: 1/4 ширины
			case 'Очень маленькие значки':
				return { xs: 24, sm: 12, xl: 6 } // Маленькие значки: 1/4 ширины
			default:
				return { xs: 24, sm: 12, xl: 12 } // Средние значки: 1/4 ширины
		}
	}

	const updateFiltersAndFetch = () => {
		const params = {
			dateFrom: tempDateFrom,
			dateTo: tempDateTo,
			searchComment: tempSearchComment,
			searchCameraId: tempSearchCameraId,
			searchFio: tempSearchFio,
			selectedChild: tempSelectedChild,
			desk: selectedDesk,
			сashier: selectedСashier,
			isCurrent,
		}

		setDateFrom(params.dateFrom)
		setDateTo(params.dateTo)
		setSearchComment(params.searchComment)
		setSearchCameraId(params.searchCameraId)
		setSearchFio(params.searchFio)
		setSelectedChild(params.selectedChild)
		setDesk(params.desk)
		console.log('Params for fetchIncidents:', params)
		fetchIncidents(1, params)
		// setTimeout(() => {
		// 	fetchIncidents(1, params)
		// }, 0)
	}

	useEffect(() => {
		setNextPage(1)
		setHasMore(true)
		setIsCamerasLoading(true)
		setDataSource({
			incidents: [],
			totalCount: 0,
			users: [],
			attendance: [],
			statistic: [],
			missings: [],
			incidents_by_day: [],
		})

		// Вызов данных только по смене страницы
		const params = {
			dateFrom,
			dateTo,
			searchComment,
			searchCameraId,
			searchFio,
			selectedChild,
			desk: selectedDesk !== null ? selectedDesk : undefined,
			сashier: selectedСashier !== null ? selectedСashier : undefined,
			isCurrent,
		}

		fetchIncidents(1, params)
		fetchIncidentsTypes()

		CamerasService.getCameras({
			query: {
				incident_name: location.pathname.split('/')[2],
				current: isCurrent ? 1 : undefined,
			},
		})
			.then(response => {
				setCameras(response.data)
			})
			.finally(() => setIsCamerasLoading(false))
	}, [currentPath]) // ✅ только pathname

	const onClose = () => {
		setIsIncidentModalOpen(false)
		setSelectedIncident({})
	}

	const loadMore = () => {
		const params = {
			dateFrom,
			dateTo,
			searchComment,
			searchCameraId,
			searchFio,
			selectedChild,
			desk,
			isCurrent,
		}
		fetchIncidents(nextPage, params)
	}

	interface Column {
		title: string
		dataIndex: string
		key: string
	}

	interface Data {
		name?: string
		email?: string
		time?: string
		storage?: string
		product?: string
		gate?: string
		count?: string
	}

	const columnsMap: Record<string, Column[]> = {
		working_hours: [
			{ title: 'Станок', dataIndex: 'name', key: 'name' },
			{ title: 'Был в работе', dataIndex: 'time', key: 'time' },
		],
		storage: [
			{ title: 'Хранилище', dataIndex: 'storage', key: 'storage' },
			{ title: 'Продукт', dataIndex: 'product', key: 'product' },
		],
		acceptance: [
			{ title: 'Вход', dataIndex: 'gate', key: 'gate' },
			{ title: 'Количество', dataIndex: 'count', key: 'count' },
		],
		cashier: [
			{ title: 'Касса', dataIndex: 'name', key: 'name' },
			{ title: 'Был в работе', dataIndex: 'time', key: 'time' },
		],
	}

	const dataMap: Record<string, Data[]> = {
		working_hours: [
			{ name: 'Фрезерный станок №12', time: '11 часов' },
			{ name: 'ЧПУ фрезерный станок №14', time: '6 часов' },
			{ name: 'Токарный станок №3', time: '8 часов' },
			{ name: 'Сверлильный станок №7', time: '5 часов' },
			{ name: 'ЧПУ лазерный резак №2', time: '9 часов' },
			{ name: 'Фрезерный станок №18', time: '7 часов' },
			{ name: 'Шлифовальный станок №6', time: '4 часа' },
			{ name: 'Гидравлический пресс №5', time: '10 часов' },
			{ name: 'ЧПУ фрезерный станок №21', time: '12 часов' },
			{ name: 'Электроэрозионный станок №1', time: '3 часа' },
		],
		storage: [
			{ storage: 'Ряд № 2 полка №7', product: 'Цемент 5 шт' },
			{ storage: 'Ряд № 5 полка №2', product: 'Краска 1 шт' },
			{ storage: 'Ряд № 3 полка №4', product: 'Гвозди 200 шт' },
			{ storage: 'Ряд № 1 полка №1', product: 'Кирпич 30 шт' },
			{ storage: 'Ряд № 4 полка №6', product: 'Шурупы 150 шт' },
			{ storage: 'Ряд № 6 полка №3', product: 'Пена монтажная 12 шт' },
			{ storage: 'Ряд № 2 полка №5', product: 'Плитка 20 шт' },
			{ storage: 'Ряд № 7 полка №2', product: 'Лак 3 шт' },
			{ storage: 'Ряд № 5 полка №8', product: 'Клей строительный 10 шт' },
			{ storage: 'Ряд № 3 полка №9', product: 'Профиль алюминиевый 7 шт' },
		],
		acceptance: [
			{ gate: 'Вход B-1', count: '2 машины' },
			{ gate: 'Вход G-3', count: '5 машин' },
			{ gate: 'Вход A-2', count: '1 машина' },
			{ gate: 'Вход C-4', count: '3 машины' },
			{ gate: 'Вход D-5', count: '4 машины' },
			{ gate: 'Вход E-1', count: '6 машин' },
			{ gate: 'Вход F-2', count: '2 машины' },
			{ gate: 'Вход H-3', count: '7 машин' },
			{ gate: 'Вход J-6', count: '1 машина' },
			{ gate: 'Вход K-7', count: '3 машины' },
		],
		cashier: [
			{ name: 'Касса №12', time: '11 часов' },
			{ name: 'Касса №4', time: '6 часов' },
		],
	}

	const getCurrentColumns = (path: string): Column[] => {
		const match = Object.entries(columnsMap).find(([key]) =>
			path.startsWith(key)
		)
		return match ? match[1] : []
	}

	const getCurrentData = (path: string): Column[] => {
		const match = Object.entries(dataMap).find(([key]) => path.startsWith(key))
		return match ? match[1] : []
	}

	return (
		<>
			{incidentId && (
				<ReadIncidentModal
					incidentId={incidentId}
					isModalOpen={isReadModalOpen}
					handleCancel={closeReadModal}
					handleOk={handleReadModalOk}
				/>
			)}

			{incidentId && (
				<CreateIncidentModal
					incidentId={incidentId}
					isModalOpen={isCreateModalOpen}
					handleOk={handleCreateModalOk}
				/>
			)}

			{dataSource && (
				<MilitaryPersonnelListModal
					closeModal={closeModal}
					isModalOpen={modalOpen}
					summary={{
						all_users: dataSource?.users,
						attendances: dataSource?.attendances,
						late: dataSource?.attendances?.filter((item: any) => item.is_late),
						missings: dataSource?.missings,
					}}
					openedFrom='dashboard'
				/>
			)}

			{dataSource && (
				<TransportModal
					isOpen={transportOpen}
					dataSource={dataSource}
					onClose={() => setTransportOpen(false)}
				/>
			)}

			{/* <PageHeader
				extra={<Time />}
				ghost={false}
				style={{
					margin: '-25px -25px 25px -25px',

					borderBottom: '1px solid #e6ebf1',
				}}
				subTitle='Общий список инцидентов произошедших на территории'
				title={
					<Typography.Text
						className='font-weight-semibold'
						style={{ fontSize: '16px' }}
					>
						Список инцидентов
					</Typography.Text>
				}
			/> */}

			<IncidentModal
				incident={selectedIncident}
				isOpen={isIncidentModalOpen}
				onClose={onClose}
			/>

			<Row gutter={[16]} align='stretch'>
				<Col span={12} style={{ display: 'flex', flexDirection: 'column' }}>
					<Card
						style={{
							flex: 1,
							display: 'flex',
							flexDirection: 'column',
							border: 0,
							boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
						}}
						title={
							<div
								className='mb-3'
								style={{ display: 'flex', justifyContent: 'space-between' }}
							>
								<Typography.Title level={3} className='mt-1'>
									Камеры
								</Typography.Title>
								<Radio.Group
									value={cameraSize}
									onChange={(e: any) => setCameraSize(e.target.value)}
								>
									<Radio.Button value='Крупные значки'>
										<IconColumns1 className='mt-2' />
									</Radio.Button>
									<Radio.Button value='Средние значки'>
										<IconColumns2 className='mt-2' />
									</Radio.Button>
									<Radio.Button value='Маленькие значки'>
										<IconColumns3 className='mt-2' />
									</Radio.Button>
									<Radio.Button value='Очень маленькие значки'>
										<div
											style={{
												position: 'relative',
												background: 'white',
												zIndex: 10,
												display: 'flex',
												justifyContent: 'center',
												alignItems: 'center',
												gap: '0.25rem',
											}}
										>
											<IconColumns3
												style={{ position: 'absolute', top: 0, left: '6px' }}
												className='mt-2'
											/>
											<IconColumns3 className='mt-2 mr-2' />
										</div>
									</Radio.Button>
								</Radio.Group>
							</div>
						}
					>
						{isCamerasLoading ? (
							<div
								style={{
									position: 'absolute',
									top: 0,
									left: 0,
									width: '100%',
									height: '415px',
									backgroundColor: 'rgba(255, 255, 255, 0.8)',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									zIndex: 10,
								}}
							>
								<Spin size='large' />
							</div>
						) : (
							<>
								{cameras.length > 0 ? (
									<Row
										gutter={24}
										style={{ height: '400px', overflow: 'auto' }}
									>
										{cameras.map((camera, idx) => (
											<Col key={idx} {...getColProps()}>
												<CameraCard {...camera} />
											</Col>
										))}
									</Row>
								) : (
									<div
										style={{
											height: '415px',
											overflow: 'auto',
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center',
										}}
									>
										<NoData />
									</div>
								)}
							</>
						)}
					</Card>
				</Col>

				<Col span={12} style={{ display: 'flex', flexDirection: 'column' }}>
					<Card
						style={{
							flex: 1,
							display: 'flex',
							flexDirection: 'column',
							border: 0,
							boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
						}}
						bodyStyle={{padding:0}}
						title={
							[
								'working_hours',
								'storage',
								'acceptance',
								'cashier',
							].includes(currentPath.pathname.split('/')[2]) ? (
								<>
									<div style={{ padding: '0', margin: 0 }} >
										<Typography.Title level={3} style={{margin: 0}}>
											{tableTitle}
										</Typography.Title>
									</div>
								</>
							) :(null)
						}
					>
						<div
							style={{
								flex: 1,
								height: '415px',
								overflow: 'hidden',
								display: 'flex',
								flexDirection: 'column',
								gap: '1rem',
							}}
						>
							{isInitialLoading ? (
								<div
									style={{
										position: 'absolute',
										top: 0,
										left: 0,
										width: '100%',
										height: '100%',
										backgroundColor: 'rgba(255, 255, 255, 0.8)',
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										zIndex: 10,
									}}
								>
									<Spin size='large' />
								</div>
							) : (
								<>
									{[
										'working_hours',
										'storage',
										'acceptance',
										'cashier',
									].includes(currentPath.pathname.split('/')[2]) ? (
										<>
											<Table
												columns={getCurrentColumns(currentPath.pathname.split('/')[2])}
												dataSource={getCurrentData(currentPath.pathname.split('/')[2])}
												style={{padding:'20px'}}
											/>
										</>
									) : [
											'face_recognition_enter',
											'face_recognition_exit',
											'license_plate_recognition_enter',
											'license_plate_recognition_exit',
									  ].includes(currentPath.pathname.split('/')[2]) ? (
										<>
											<h4>
												{[
													'face_recognition_enter',
													'face_recognition_exit',
												].includes(currentPath.pathname.split('/')[2])
													? 'Сотрудники'
													: 'Машины'}
											</h4>

											<Row gutter={[14, 18]}>
												<Col xs={24} sm={12} md={12} xl={12}>
													<CustomCard
														extra={
															<CustomCardButton
																disabled={!dataSource}
																onClick={showModal}
															>
																Список
															</CustomCardButton>
														}
														title='По списку'
													>
														<div
															className='d-flex align-items-end justify-content-center'
															style={{
																padding: '12.5px 0',
															}}
														>
															<Spin spinning={isInitialLoading}>
																<h1
																	className='m-0'
																	style={{ fontSize: '32px', color: '#3E79F7' }}
																>
																	{dataSource?.users?.length}
																	{`  `}
																	<span
																		className='font-weight-normal'
																		style={{
																			fontSize: '20px',
																			color: '#1A3353',
																		}}
																	>
																		{[
																			'face_recognition_enter',
																			'face_recognition_exit',
																		].includes(currentPath.pathname.split('/')[2])
																			? 'человек'
																			: 'машин'}
																	</span>
																</h1>
															</Spin>
														</div>
													</CustomCard>
												</Col>

												<Col xs={24} sm={12} md={12} xl={12}>
													<CustomCard
														extra={
															<CustomCardButton
																// disabled={
																// 	!dataSource || dataSource.all_attendance.total_count === 0
																// }
																onClick={showModal}
															>
																Список
															</CustomCardButton>
														}
														title={
															[
																'face_recognition_enter',
																'face_recognition_exit',
															].includes(currentPath.pathname.split('/')[2])
																? 'На лицо'
																: 'На территории'
														}
													>
														<div
															className='d-flex align-items-end justify-content-center'
															style={{
																padding: '12.5px 0',
															}}
														>
															<Spin spinning={isInitialLoading}>
																<h1
																	className='m-0'
																	style={{ fontSize: '32px', color: '#3E79F7' }}
																>
																	{dataSource?.attendances?.length}
																	{`  `}
																	<span
																		className='font-weight-normal'
																		style={{
																			fontSize: '20px',
																			color: '#1A3353',
																		}}
																	>
																		{[
																			'face_recognition_enter',
																			'face_recognition_exit',
																		].includes(currentPath.pathname.split('/')[2])
																			? 'человек'
																			: 'машин'}
																	</span>
																</h1>
															</Spin>
														</div>
													</CustomCard>
												</Col>
											</Row>
											<div style={{ padding: '16px 24px', backgroundColor: '#fff' }}>
												<Typography.Title level={3} style={{ margin: 0 }}>
													{pathNameMap[currentSection] || 'Инциденты за последнюю неделю'}
												</Typography.Title>
											</div>
											<ReactApexChart
												options={options}
												series={dataSource.statistic}
												type='donut'
												height={300}
											/>
										</>
									) : (
										<div>
											<div
												style={{ display: 'flex', justifyContent: 'flex-end' }}
											>
												{[
													'license_plate_recognition_enter',
													'license_plate_recognition_exit',
												].includes(currentPath.pathname.split('/')[2]) && (
													<CustomCardButton
														disabled={!dataSource}
														onClick={() => setTransportOpen(true)}
													>
														Список
													</CustomCardButton>
												)}
											</div>
											<div id='chart' >
												<div style={{ padding: '16px 24px', backgroundColor: '#fff' }}>
													<Typography.Title level={3} style={{ margin: 0 }}>
														{pathNameMap[currentSection] || 'Инциденты за последнюю неделю'}
													</Typography.Title>
												  </div>
												<ReactApexChart
													options={{
													...state.options,
													chart: {
														...state.options.chart,
														toolbar: { show: false }, // скрыть иконку настроек (если не нужно)
													},
													xaxis: {
														...state.options.xaxis,
														labels: {
														style: {
															fontSize: '13px',
														},
														rotate: -15, // чуть повернуть, если не влезают
														},
													},
													yaxis: {
														labels: {
														style: {
															fontSize: '13px',
														},
														},
													},
													grid: {
														...state.options.grid,
														padding: {
														left: 10,
														right: 10,
														},
													},
													}}
													series={state.series}
													type="line"
													height={350}
													// style={{paddingLeft: '20px', paddingRight: '20px'}}
												/>
											</div>
											<div id='html-dist'></div>
										</div>
									)}
								</>
							)}
						</div>
					</Card>
				</Col>

				<Col span={12} style={{ display: 'flex', flexDirection: 'column' }}>
					<Card
						style={{
							flex: 1,
							display: 'flex',
							flexDirection: 'column',
							border: 0,
							boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
						}}
						title={
							<div
								className='mb-3'
								style={{ display: 'flex', justifyContent: 'space-between' }}
							>
								<Typography.Title level={3} className='mt-1'>
									Список инцидентов
								</Typography.Title>
								<Button
									className='mt-1'
									onClick={downloadExcel}
									type='primary'
									icon={<DownloadOutlined />}
									disabled={!dataSource.incidents.length}
								>
									Скачать отчет
								</Button>
							</div>
						}
					>
						<div
							style={{
								flex: 1,
								minHeight: '350px',
								overflow: 'auto',
								display: 'flex',
								justifyContent: 'center',
							}}
						>
							{isInitialLoading ? (
								<div
									style={{
										position: 'absolute',
										top: 0,
										left: 0,
										width: '100%',
										height: '100%',
										backgroundColor: 'rgba(255, 255, 255, 0.8)',
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										zIndex: 10,
									}}
								>
									<Spin size='large' />
								</div>
							) : dataSource.incidents.length > 0 ? (
								<LazyLoadedIncidentsList
									listWithImages={dataSource.incidents}
									setSelectedIncident={setSelectedIncident}
									setIsIncidentModalOpen={setIsIncidentModalOpen}
									hasMore={hasMore}
									loadMoreItems={loadMore}
									setDataSource={setDataSource}
								/>
							) : (
								<NoData />
							)}
						</div>
					</Card>
				</Col>
				<Col span={12} style={{ display: 'flex', flexDirection: 'column' }}>
					<Card
						style={{
							flex: 1,
							display: 'flex',
							flexDirection: 'column',
							border: 0,
							boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
						}}
					>
						{/* Выбор даты */}
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

						{/* Поиск по комментарию */}
						<div className='flex-column mb-3 ml-1'>
							<Input
								placeholder='Поиск по комментарию'
								style={{ borderRadius: '12px' }}
								value={tempSearchComment}
								onChange={e => setTempSearchComment(e.target.value)}
							/>
						</div>

						{/* Поиск по ID камеры */}
						{/* <div className='flex-column mb-3 ml-1'>
							<Input
								placeholder='Поиск по ID камеры'
								style={{ borderRadius: '12px' }}
								value={tempSearchCameraId}
								onChange={e => setTempSearchCameraId(e.target.value)}
							/>
						</div> */}
						{/* Поиск по ФИО */}
						{currentPath.pathname.split('/')[2] === 'face_recognition_enter' ||
						currentPath.pathname.split('/')[2] === 'face_recognition_exit' ? (
							<div className='flex-column mb-3 ml-1'>
								<Input
									placeholder='Поиск по ФИО'
									style={{ borderRadius: '12px' }}
									value={tempSearchCameraId}
									onChange={e => setTempSearchFio(e.target.value)}
								/>
							</div>
						) : (
							<></>
						)}

						{/* Выбор части */}
						<div className='flex-column mb-3 ml-1'>
							<Select
								placeholder={'Выберите часть'}
								style={{ width: '100%' }}
								value={selectedValue}
								onChange={selectChangeHendler}
							>
								<Select.Option value='all'>Все части</Select.Option>
								<Select.Option value={`${localStorage.getItem('me')}`}>
									{`${localStorage.getItem('organization_name')}`}
								</Select.Option>
								{childs.map((item: any) => (
									<Select.Option value={item.ip_addr}>
										{item?.name}
									</Select.Option>
								))}
							</Select>
						</div>
						{currentPath.pathname.split('/')[2] === 'service_table' && (
							<div className='flex-column mb-3 ml-1'>
								<Select
									placeholder={'Выберите часть'}
									style={{ width: '100%' }}
									value={selectedDesk !== null ? String(selectedDesk) : 'all'}
									onChange={selectDeskChangeHendler}
								>
									<Select.Option value='all'>Все столики</Select.Option>
									<Select.Option value='12'>12</Select.Option>
									<Select.Option value='16'>16</Select.Option>
								</Select>
							</div>
						)}
						{(currentPath.pathname.split('/')[2] === 'cashier' ||
							currentPath.pathname.split('/')[2] === 'checkout_lines') && (
							<div className='flex-column mb-3 ml-1'>
								<Select
									placeholder={'Выберите стол'}
									style={{ width: '100%' }}
									value={selectedDesk !== null ? String(selectedDesk) : 'all'}
									onChange={selectDCashierChangeHendler}
								>
									<Select.Option value='all'>Все кассы</Select.Option>
									<Select.Option value='12'>12</Select.Option>
									<Select.Option value='4'>4</Select.Option>
								</Select>
							</div>
						)}

						{/* Кнопки */}
						<div
							className='ml-1'
							style={{ display: 'flex', justifyContent: 'space-between' }}
						>
							<Button
								icon={<CloseOutlined />}
								type='link'
								onClick={() => {
									setCurrent(1)
									setDateFrom(undefined)
									setDateTo(undefined)
									setSearchComment(undefined)
									setSearchCameraId(undefined)
									setSearchFio(undefined)
									setSelectedChild(localStorage.getItem('me') || '')
									setDesk(null)
									setTempDateFrom(undefined)
									setTempDateTo(undefined)
									setTempSearchComment(undefined)
									setTempSearchCameraId(undefined)
									setTempSearchFio(undefined)
									setTempSelectedChild(localStorage.getItem('me') || '')

									setSelectedValue('all') // Сбрасываем Select
									selectChangeHendler('all')
									fetchIncidents(1)
								}}
							>
								Сбросить фильтр
							</Button>
							<Button
								style={{ borderRadius: '12px' }}
								icon={<SearchOutlined />}
								type='primary'
								onClick={() => {
									updateFiltersAndFetch()
								}}
							>
								Поиск
							</Button>
						</div>
					</Card>
				</Col>
			</Row>
		</>
	)
}

export default Multi
