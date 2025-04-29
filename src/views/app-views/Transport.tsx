import { CustomTable } from '@/components/custom-components/CustomTable'
import { Time } from '@/components/shared-components/Time'
import { IncidentsService } from '@/services/IncidentsService'
import { IncidentRead, IncidentsRead } from '@/types/custom'
import { components } from '@/types/generated'
import {
	Badge,
	Button,
	Card,
	Col,
	DatePicker,
	Image,
	Input,
	Modal,
	PageHeader,
	Row,
	Select,
	Typography,
} from 'antd'
import moment from 'moment'
import { useCallback, useEffect, useState } from 'react'

import type { TableColumnsType } from 'antd'
import { useForm } from 'antd/es/form/Form'

const incidentTypes: components['schemas']['IncidentType'][] = [
	'Блокирование камеры',
	'Несанкционированный вход',
	'Камера',
	'Несанкционированный вход (КХО)',
	'Несанкционированный выход',
	'Пост дневального',
	'Толпа',
	'Человек в лежащем положении',
	'Продолжительное нахождение военнослужащего в помещении',
	'Суточный приказ',
]

const Transport = () => {
	const [current, setCurrent] = useState<number>(1)
	const [dataSource, setDataSource] = useState<IncidentsRead>({
		incidents: [],
		totalCount: 0,
	})
	const [dateFrom, setDateFrom] = useState<string>()
	const [searchComment, setSearchComment] = useState<string>()
	const [searchCameraId, setSearchCameraId] = useState<string>()
	const [searchType, setSearchType] = useState<string>()
	const [dateTo, setDateTo] = useState<string>()
	const [incidentId, setIncidentId] = useState<string>()
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false)
	const [isReadModalOpen, setIsReadModalOpen] = useState<boolean>(false)
	const [pageSize, setPageSize] = useState<number>(10)
	const [checkbox, setCheckbox] = useState<boolean | null>(null)
	const [incidentType, setIncidentType] = useState<string>('')

	const [filter, setFilter] = useState<any>('all')
	const [childNames, setChildNames] = useState<any>([])
	const [filteredDataSource, setFilteredDataSource] = useState<any>({
		incidents: [],
		totalCount: 0,
	})

	useEffect(() => {
		if (dataSource.incidents.length !== 0) {
			setChildNames(
				dataSource.incidents.map((item: any) => {
					if (item.is_child) {
						return item.child_name
					}
				})
			)

			switch (filter) {
				case 'all':
					setFilteredDataSource({
						incidents: dataSource.incidents,
						totalCount: dataSource.totalCount,
					})
					break
				case 'childs':
					setFilteredDataSource({
						incidents: dataSource.incidents.filter(item => item.is_child),
						totalCount: dataSource.totalCount,
					})
					break
				case 'mine':
					setFilteredDataSource(
						dataSource.incidents.filter(item => !item.is_child)
					)
					break
				default:
					setFilteredDataSource({
						incidents: dataSource.incidents.filter(
							item => item.child_name == filter
						),
						totalCount: dataSource.totalCount,
					})
			}
		}
	}, [filter, dataSource])

	const [form] = useForm()
	const [formSecond] = useForm()

	const closeReadModal = () => setIsReadModalOpen(false)
	const closeCreateModal = () => setIsCreateModalOpen(false)

	const openCreateModal = () => setIsCreateModalOpen(true)
	const openReadModal = () => setIsReadModalOpen(true)

	const handleCreateModalOk = async () => {
		await fetchIncidents()

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

	const fetchIncidents = useCallback(async () => {
		setIsLoading(true)

		await IncidentsService.getIncidents({
			query: {
				skip: current - 1,
				limit: pageSize,
				date_from: dateFrom ? dateFrom : undefined,
				date_to: dateTo ? dateTo : undefined,
				comment: searchComment ? searchComment : undefined,
				camera_id: searchCameraId ? searchCameraId : undefined,
				name: searchType ? searchType : undefined,
			},
		})
			.then(response => {
				const { data }: { data: IncidentsRead } = response

				setDataSource(data)
			})
			.finally(() => setIsLoading(false))
	}, [
		current,
		dateFrom,
		dateTo,
		pageSize,
		searchComment,
		searchCameraId,
		searchType,
	])

	useEffect(() => {
		fetchIncidents()
		fetchIncidentsTypes()
	}, [fetchIncidents])

	const handleSearch = async () => {
		const check = checkbox !== null && {
			isFavourite: checkbox,
		}
		let json

		if (incidentType !== '') {
			json = {
				typeOfIncident: incidentType,
			}
		}

		await IncidentsService.getIncidents({
			query: {
				skip: current - 1,
				limit: pageSize,
				date_from: dateFrom ? dateFrom : undefined,
				date_to: dateTo ? dateTo : undefined,
				...check,
				...json,
			},
		})
			.then(response => {
				const { data }: { data: IncidentsRead } = response

				setDataSource(data)
			})
			.finally(() => setIsLoading(false))
	}

	const columns = [
		{
			dataIndex: 'incident_id',
			key: 'incident_id',
			sortDirections: ['ascend', 'descend'],
			title: 'ID инцидента',
			width: '10%',
			sorter: (a: IncidentRead, b: IncidentRead) => {
				return (a.incidentNumber as number) - (b.incidentNumber as number)
			},
		},
		{
			dataIndex: 'ru_name',
			key: 'ru_name',
			title: 'Тип инцидента',
			width: '30%',
			render: (text: string | null) => {
				return <span>{text ? text : 'Отсутствует'}</span>
			},
		},
		{
			dataIndex: 'child_name',
			key: 'ru_name',
			title: 'Организация',
			width: '30%',
			render: (text: string | null) => {
				return (
					<span>
						{text ? text : `${localStorage.getItem('organization_name')}`}
					</span>
				)
			},
		},
		{
			dataIndex: 'createdAt',
			key: 'createdAt',
			sortDirections: ['ascend', 'descend'],
			title: 'Дата',
			width: '20%',
			render: (createdAt: string) => (
				<Typography.Text>
					{moment(createdAt).format('DD/MM/YYYY')}
				</Typography.Text>
			),
			sorter: (a: IncidentRead, b: IncidentRead) => {
				return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
			},
		},
		{
			dataIndex: 'camera_id',
			key: 'camera_id',
			title: 'Камера',
			width: '25%',
		},
		{
			dataIndex: 'createdAt',
			key: 'createdAt',
			sortDirections: ['ascend', 'descend'],
			title: 'Время инцидента',
			width: '20%',
			render: (createdAt: string) => (
				<Typography.Text>
					{moment.utc(createdAt).local().format('HH:mm')}
				</Typography.Text>
			),
			sorter: (a: IncidentRead, b: IncidentRead) => {
				return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
			},
		},
		{
			dataIndex: ['createdAt', 'responseTime'],
			key: 'responseTime',
			sortDirections: ['ascend', 'descend'],
			title: 'Время реагирования',
			width: '15%',
			render: (_: string, incident: IncidentRead) => {
				const startTimeMoment = moment(incident.createdAt)
				const endTimeMoment = moment(incident.responseTime)

				const duration = moment.duration(endTimeMoment.diff(startTimeMoment))

				const minutes = Math.floor(duration.asMinutes())

				const badgeColor =
					minutes < 0
						? '#000'
						: minutes <= 5
						? 'green'
						: minutes <= 10
						? 'yellow'
						: 'red'

				if (minutes < 0) {
					return (
						<div>
							<Badge color={badgeColor} />
							<Typography.Text className='ml-2 font-weight-semibold'>
								Неправильный расчет
							</Typography.Text>
						</div>
					)
				}

				return incident.responseTime !== null ? (
					<div>
						<Badge color='green' />
						<Typography.Text className='ml-2'>{`${moment(
							incident.responseTime
						).format('HH:mm')} (${minutes} мин)`}</Typography.Text>
					</div>
				) : (
					<div>
						<Badge color={badgeColor} />
						<Typography.Text className='ml-2 font-weight-semibold'>
							Не отреагировано
						</Typography.Text>
					</div>
				)
			},
			sorter: (a: IncidentRead, b: IncidentRead) => {
				const startTimeMomentA = moment(a.createdAt)
				const endTimeMomentA = moment(a.responseTime)

				const durationA = moment.duration(endTimeMomentA.diff(startTimeMomentA))

				const minutesA = Math.floor(durationA.asMinutes())

				const startTimeMomentB = moment(b.createdAt)
				const endTimeMomentB = moment(b.responseTime)

				const durationB = moment.duration(endTimeMomentB.diff(startTimeMomentB))

				const minutesB = Math.floor(durationB.asMinutes())

				if (a.responseTime !== null && b.responseTime !== null) {
					return minutesA - minutesB
				} else {
					return minutesA.toString().localeCompare(minutesB.toString())
				}
			},
		},
		{
			key: 'action',
			title: 'Действие',
			width: '10%',
			render: (_: string, incident: IncidentRead) => (
				<div>
					<Button
						className='py-0 px-0'
						onClick={() => {
							if (incident.comment === null) {
								setIncidentId(incident.incident_id)
								openCreateModal()
							} else {
								setIncidentId(incident.incident_id)
								openReadModal()
							}
						}}
						style={{
							height: 'auto',
						}}
						type='link'
					>
						Подробнее
					</Button>
				</div>
			),
		},
	] as TableColumnsType<IncidentRead>

	return (
		<>
			<Modal
				title='Добавить транспорт'
				open={isCreateModalOpen}
				onOk={closeCreateModal}
				onCancel={closeCreateModal}
			>
				<Typography>Ниже введите данные для добавления транспорта</Typography>
				<div className='mt-3'>
					<Typography.Title level={5}>Государственный номер</Typography.Title>
					<Input placeholder='Государственный номер по формат' />
				</div>
				<div className='mt-3'>
					<Typography.Title level={5}>Марка</Typography.Title>
					<Input placeholder='УАЗ-469' />
				</div>
			</Modal>

			<Modal
				title='Название объекта (if child): Название камеры:'
				open={isCreateModalOpen}
				onOk={closeCreateModal}
				onCancel={closeCreateModal}
			>
				<Row>
					<Col>
						<div>
							<Typography.Title level={4}>Фото машины</Typography.Title>
							<Image height={150} width={300} />
						</div>
						<div className='mt-2' >
							<Typography.Title level={4}>Фото номера</Typography.Title>
							<Image height={150} width={300} />
						</div>
					</Col>
					<Col>2</Col>
				</Row>
			</Modal>

			<PageHeader
				extra={<Time />}
				ghost={false}
				style={{
					margin: '-25px -25px 25px -25px',

					borderBottom: '1px solid #e6ebf1',
				}}
				subTitle='Общий список посещаемости сотрудников'
				title={
					<Typography.Text
						className='font-weight-semibold'
						style={{ fontSize: '16px' }}
					>
						Транспорт
					</Typography.Text>
				}
			/>

			<Card className='mt-3'>
				<div
					className='d-inline-flex flex-column mr-2 p-3'
					style={{ width: '11rem' }}
				>
					<Typography.Text>Выбрать объект</Typography.Text>

					<div className='mt-2'>
						<Select
							style={{ width: '100%' }}
							placeholder='Поиск'
							onChange={(value: string) => setSearchType(value)}
						>
							{incidentTypes?.map(
								(item: components['schemas']['IncidentType']) => (
									<Select.Option key={item} value={item}>
										{item}
									</Select.Option>
								)
							)}
						</Select>
					</div>
				</div>
				<div className='d-inline-flex flex-column mb-3 ml-1 mr-2'>
					<Typography.Text>Поиск гос номеру</Typography.Text>

					<div className='mt-2 '>
						<Input
							placeholder='Поиск'
							onBlur={(e: any) => setSearchComment(e?.target?.value)}
						/>
					</div>
				</div>
				<div className='d-inline-flex flex-column mb-3'>
					<Typography.Text>Поиск за период времени</Typography.Text>

					<div className='mt-2'>
						<DatePicker.RangePicker
							className='mr-2'
							onChange={(_, dateString) => {
								setDateFrom(dateString[0])
								setDateTo(dateString[1])
							}}
						/>
					</div>
				</div>

				<div
					className='d-inline-flex flex-column mb-3'
					style={{ marginLeft: '37%' }}
				>
					<Typography.Text>{`  `}</Typography.Text>
					<div className='mt-3'>
						<Button type='primary' onClick={openCreateModal} >
							Добавить транспорт
						</Button>
					</div>
				</div>

				<CustomTable
					columns={columns}
					current={current}
					dataSource={filteredDataSource.incidents}
					loading={isLoading}
					pageSize={pageSize}
					setCurrent={setCurrent}
					setPageSize={setPageSize}
					total={filteredDataSource.total_count}
				/>
			</Card>
		</>
	)
}

export default Transport
