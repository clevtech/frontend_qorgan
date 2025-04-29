import moment from 'moment'

import Incidents from '@/views/app-views/Incidents'
import {
	Avatar,
	Badge,
	Button,
	Col,
	DatePicker,
	Image,
	Modal,
	Row,
	Select,
	Spin,
	Table,
	Typography,
} from 'antd'
import { useEffect, useState } from 'react'

import { Link } from 'react-router-dom'

import { MilitaryPersonnelListModal } from '@/components/app-components/attendance/MilitaryPersonnelListModal'
import { DashboardMap } from '@/components/app-components/dashboard/DashboardMap/components/DashboardMap'
import { CustomCard } from '@/components/custom-components/CustomCard'
import { CustomCardButton } from '@/components/custom-components/CustomCardButton'
import { CustomPageHeader } from '@/components/custom-components/CustomPageHeader'
import { Time } from '@/components/shared-components/Time'
import { PlusCircleOutlined } from '@ant-design/icons'
// import { WEBSOCKET_BASE_URL } from '@/configs/AppConfig';
import { TransportModal } from '@/components/app-components/dashboard/TransportModal'
import { AttendanceService } from '@/services/AttendanceService'
import { DashboardService } from '@/services/DashboardService'
import { EmployeeService } from '@/services/EmployeeService'

const { Text } = Typography

const DATE_FORMAT = 'YYYY-MM-DD'
const MAX_VISIBLE_ITEMS = 3

const Dashboard = () => {
	// const { accessToken } = useSelector((state: RootState) => state.auth);

	const [current, setCurrent] = useState<number>(1)
	const [dataSource, setDataSource] = useState<any>({
		all_users: [],
		all_attendance: [],
		exit_transports: [],
		enter_transports: [],
	})
	const [formattedDate, setFormattedDate] = useState<string>(
		moment(new Date()).format(DATE_FORMAT)
	)
	const [isLoadingUsers, setIsLoadingUsers] = useState<boolean>(false)
	const [isLoadingAttendance, setIsLoadingAttendance] = useState<boolean>(false)
	const [isLoadingExit, setIsLoadingExit] = useState<boolean>(false)
	const [isLoadingEnter, setIsLoadingEnter] = useState<boolean>(false)
	const [lateList, setLateList] = useState<any>([])

	const [militaryUnitName, setMilitaryUnitName] = useState<string>()
	const [pageSize, setPageSize] = useState<number>(999999999)
	const [, setLate] = useState(null)
	const [openLateModal, setOpenLateModal] = useState(false)

	const [dataParent, setDataParent] = useState<any>([])
	const [dataCild, setDataChild] = useState<any>([])

	const [isModalOpen, setIsModalOpen] = useState(false)
	const [isTransportModalOpen, setIsTransportModalOpen] =
		useState<boolean>(false)

	const [childs, setChilds] = useState([])
	const [selectedChild, setSelectedChild] = useState('')
	const [isCurrent, setIsCurrent] = useState(false)

	const closeModal = () => setIsModalOpen(false)

	const showModal = () => setIsModalOpen(true)

	useEffect(() => {
		setIsLoadingUsers(true)

		// all_users
		DashboardService.getDashboard({
			query: {
				date: formattedDate ?? undefined,
				limit: pageSize,
				current: isCurrent ? 1 : undefined,
			},
		})
			.then(response => {
				const { data }: { data: any } = response

				setDataSource((prev: any) => ({
					...prev,
					all_users: data,
				}))
			})
			.finally(() => {
				setIsLoadingUsers(false)
			})

		setIsLoadingAttendance(true)
		// all_attendance
		DashboardService.getDashboardAttandance({
			query: {
				date: formattedDate ?? undefined,
				current: isCurrent ? 1 : undefined,
			},
		})
			.then(response => {
				const { data }: { data: any } = response

				setDataSource((prev: any) => ({
					...prev,
					all_attendance: data,
				}))
			})
			.finally(() => {
				setIsLoadingAttendance(false)
			})

		setIsLoadingExit(true)
		// exit_transports
		DashboardService.getExitTransports({
			query: {
				date: formattedDate ?? undefined,
				current: isCurrent ? 1 : undefined,
			},
		})
			.then(response => {
				const { data }: { data: any } = response

				setDataSource((prev: any) => ({
					...prev,
					exit_transports: data,
				}))
			})
			.finally(() => {
				setIsLoadingExit(false)
			})

		setIsLoadingEnter(true)
		// enter_transports
		DashboardService.getEnterTransports({
			query: {
				date: formattedDate ?? undefined,
				current: isCurrent ? 1 : undefined,
			},
		})
			.then(response => {
				const { data }: { data: any } = response

				setDataSource((prev: any) => ({
					...prev,
					enter_transports: data,
				}))
			})
			.finally(() => {
				setIsLoadingEnter(false)
			})

		AttendanceService.getAttendanceByDaysDetails({
			limit: 5,
			current: isCurrent ? 1 : undefined,
		}).then(response => {
			const { data }: { data: any } = response

			setLateList(data)
		})
	}, [current, formattedDate, pageSize, selectedChild, isCurrent])

	useEffect(() => {
		EmployeeService.getEmployeesChild({
			query: {},
		}).then(response => {
			const { data }: { data: any } = response

			setChilds(data)
		})
	}, [])

	const selectChangeHendler = (value: string) => {
		setCurrent(1)
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

	return (
		<>
			<Modal
				open={openLateModal}
				onCancel={() => setOpenLateModal(false)}
				onOk={() => setOpenLateModal(false)}
				width={900}
			>
				<Image height={400} width={500} />
			</Modal>

			{dataSource && (
				<MilitaryPersonnelListModal
					closeModal={closeModal}
					isModalOpen={isModalOpen}
					summary={dataSource}
					openedFrom='dashboard'
				/>
			)}

			{dataSource && (
				<TransportModal
					isOpen={isTransportModalOpen}
					dataSource={dataSource}
					onClose={() => setIsTransportModalOpen(false)}
				/>
			)}

			<CustomPageHeader
				extra={
					<div className='d-flex align-items-center' style={{ gap: '.6rem' }}>
						<Time />
						<Select
							placeholder={'Выберите часть'}
							style={{ width: '10rem' }}
							defaultValue='all'
							onChange={selectChangeHendler}
						>
							<Select.Option value='all'>Все</Select.Option>
							<Select.Option value={`${localStorage.getItem('me')}`}>
								{`${localStorage.getItem('organization_name')}`}
							</Select.Option>
							{childs.map((item: any) => (
								<Select.Option value={item.ip_addr}>{item?.name}</Select.Option>
							))}
						</Select>
						<DatePicker
							className='ml-3'
							defaultValue={moment(formattedDate)}
							onChange={(_, dateString) => {
								if (dateString !== '') {
									setFormattedDate(dateString)
								} else {
									const today = moment(new Date()).format(DATE_FORMAT)

									setFormattedDate(today)
								}
							}}
							value={moment(formattedDate)}
						/>
					</div>
				}
				subTitle={
					<p className='m-0'>{militaryUnitName ? militaryUnitName : ''}</p>
				}
				title={
					<Typography.Text
						className='font-weight-semibold'
						style={{ fontSize: '16px' }}
					>
						Общие данные
					</Typography.Text>
				}
			/>

			<div style={{ display: 'flex', gap: '1rem' }}>
				<div style={{ flex: 1 }}>
					<h4>🪖 Сотрудники</h4>

					<Row gutter={[14, 18]}>
						<Col xs={24} sm={12} md={12} xl={12}>
							<CustomCard
								extra={
									<CustomCardButton
										disabled={!dataSource || dataSource.all_users.length === 0}
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
									<Spin spinning={isLoadingUsers}>
										<h1
											className='m-0'
											style={{ fontSize: '32px', color: '#3E79F7' }}
										>
											{dataSource?.all_users.total_count
												? `${dataSource.all_users.total_count} `
												: '0 '}
											<span
												className='font-weight-normal'
												style={{ fontSize: '20px', color: '#1A3353' }}
											>
												человек
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
										disabled={
											!dataSource || dataSource.all_attendance.total_count === 0
										}
										onClick={showModal}
									>
										Список
									</CustomCardButton>
								}
								title='На лицо'
							>
								<div
									className='d-flex align-items-end justify-content-center'
									style={{
										padding: '12.5px 0',
									}}
								>
									<Spin spinning={isLoadingAttendance}>
										<h1
											className='m-0'
											style={{ fontSize: '32px', color: '#3E79F7' }}
										>
											{dataSource?.all_attendance.total_count
												? `${dataSource.all_attendance.total_count} `
												: '0 '}
											<span
												className='font-weight-normal'
												style={{ fontSize: '20px', color: '#1A3353' }}
											>
												человек
											</span>
										</h1>
									</Spin>
								</div>
							</CustomCard>
						</Col>
					</Row>
				</div>
				<div style={{ flex: 1 }}>
					<h4>🚛 Транспорт</h4>

					<Row gutter={[14, 18]}>
						<Col xs={24} sm={12} md={12} xl={12}>
							<CustomCard
								extra={
									<CustomCardButton
										disabled={
											!dataSource || dataSource.all_users.total_count === 0
										}
										onClick={() => setIsTransportModalOpen(true)}
									>
										Список
									</CustomCardButton>
								}
								title='Выезд'
							>
								<div
									className='d-flex align-items-end justify-content-center'
									style={{
										padding: '12.5px 0',
									}}
								>
									<Spin spinning={isLoadingEnter}>
										<h1
											className='m-0'
											style={{ fontSize: '32px', color: '#3E79F7' }}
										>
											{dataSource?.exit_transports.total_count
												? `${dataSource.exit_transports.total_count} `
												: '0 '}
											<span
												className='font-weight-normal'
												style={{ fontSize: '20px', color: '#1A3353' }}
											>
												авто
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
										disabled={!dataSource || dataSource.arrivedCount === 0}
										onClick={() => setIsTransportModalOpen(true)}
									>
										Список
									</CustomCardButton>
								}
								title='На базе'
							>
								<div
									className='d-flex align-items-end justify-content-center'
									style={{
										padding: '12.5px 0',
									}}
								>
									<Spin spinning={isLoadingExit}>
										<h1
											className='m-0'
											style={{ fontSize: '32px', color: '#3E79F7' }}
										>
											{dataSource?.enter_transports.total_count
												? `${dataSource.enter_transports.total_count} `
												: '0 '}
											<span
												className='font-weight-normal'
												style={{ fontSize: '20px', color: '#1A3353' }}
											>
												авто
											</span>
										</h1>
									</Spin>
								</div>
							</CustomCard>
						</Col>
					</Row>
				</div>
			</div>

			<div>
				<h4>⚠️ Инциденты</h4>

				<Row
					gutter={12}
					style={{
						flexWrap: 'wrap',
					}}
				>
					<Col span={12}>
						<CustomCard
							title={`Опоздавшие - ${lateList.total_count} чел.`}
							extra={
								<CustomCardButton
									disabled={
										!dataSource || dataSource.all_attendance.total_count === 0
									}
									onClick={showModal}
								>
									Список
								</CustomCardButton>
							}
						>
							<Table
								columns={[
									{
										title: 'Сотрудник',
										render: (data: any) => {
											return (
												<div
													className='d-flex'
													style={{ alignItems: 'center', gap: '0.5rem' }}
												>
													<Avatar
														src={`data:image/png;base64,` + data.photo_base64}
													/>
													<Typography>
														{' '}
														{data.surname} {`  `} {data.name} {`  `}{' '}
														{data.fathername}
													</Typography>
												</div>
											)
										},
									},
									{
										title: 'Статус',
										render: (data: any) => {
											return (
												<div
													className='d-flex'
													style={{ alignItems: 'center', gap: '0.5rem' }}
												>
													<Badge status='warning' />
													Прибыл: {moment(data.datetime).format('HH:mm')}
												</div>
											)
										},
									},
									{
										key: 'action',
										title: 'Действие',
										width: '10%',
										render: (_: any) => (
											<div>
												<Button
													className='py-0 px-0'
													onClick={() => {
														setLate(_)
														setOpenLateModal(true)
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
								]}
								pagination={{ pageSize: 5 }}
								dataSource={lateList.attendances}
							/>
						</CustomCard>
					</Col>
					<Col span={12}>
						<CustomCard
							title={'Инциденты за сегодня - 00 шт.'}
							extra={
								<Link to='/app/incidents'>
									<CustomCardButton>Список</CustomCardButton>
								</Link>
							}
						>
							<Incidents onlyTable />
						</CustomCard>
					</Col>
				</Row>
			</div>

			<div>
				<h4>🇰🇿 Просмотр по карте</h4>

				<Row
					gutter={12}
					style={{
						flexWrap: 'wrap',
					}}
				>
					<Col span={24}>
						<CustomCard
							title={'Карта военных частей'}
							// extra={
							// 	<Button
							// 		icon={<PlusCircleOutlined />}
							// 		type='primary'
							// 		onClick={showModal}
							// 	>
							// 		Добавить военную часть
							// 	</Button>
							// }
						>
							<DashboardMap data={[...dataCild, ...dataParent]}  zoom={5} heigth={570} />
						</CustomCard>
					</Col>
				</Row>
			</div>
		</>
	)
}

export default Dashboard
