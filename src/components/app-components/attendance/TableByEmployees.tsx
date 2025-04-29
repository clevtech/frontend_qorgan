import { Col, DatePicker, Row, Select, Space, Tag, Typography, Button } from 'antd'
import { memo, useEffect, useState } from 'react'

import { LatenessAndAbsenceModal } from '@/components/app-components/attendance/LatenessAndAbsenceModal'
import { CustomTable } from '@/components/custom-components/CustomTable'
import { NoData } from '@/components/util-components/NoData'
import { EmployeeService } from '@/services/EmployeeService'
import { EmployeeService as EmployeeServiceSettings} from '@/services/EmployeeServiceSettings'
import { AttendanceRead } from '@/types/custom'
import type { TableColumnsType } from 'antd'
import axios from 'axios'
import moment from 'moment'
import { ACCESS_TOKEN } from '@/constants/AuthConstant'


export const TableByEmployees = memo(() => {
	const [current, setCurrent] = useState<number>(1)
	const [dataSource, setDataSource] = useState<any>({
		attendances: [],
		attendance_count: 0,
	})
	const [users, setUsers] = useState<any>([])
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
	const [pageSize, setPageSize] = useState<number>(10)
	const [selectedUser, setSelectedUser] = useState<any>('')
	const [record, setRecord] = useState<AttendanceRead>()
	const [dateRange, setDateRange] = useState({
		to: '',
		from: '',
	})

	const [childs, setChilds] = useState([])
	const [selectedChild, setSelectedChild] = useState('')
	const [isCurrent, setIsCurrent] = useState(false)

	const closeModal = () => setIsModalOpen(false)
	const openModal = () => setIsModalOpen(true)

	useEffect(() => {
		fetchUsers()

				EmployeeService.getEmployeesChild({
					query: {},
				}).then(response => {
					const { data }: { data: any } = response
		
					setChilds(data)
				})
	}, [])

	const fetchUsers = async () => {
		setIsLoading(true)

		await EmployeeServiceSettings.getEmployees({
			id: selectedUser,
			query: {
				skip: (current - 1) * pageSize,
				limit: 9999,
				is_guest: false,
			},
		})
			.then(response => {
				const { data }: { data: any } = response

				setUsers(data.users)
			})
			.finally(() => setIsLoading(false))
	}

	const fetchDataSource = async () => {
		setIsLoading(true)
		axios
			.get(
				`http://${localStorage.getItem(
					'selected'
				)}:8080/attendance_dashboard/${selectedUser}`,
				{
					params: {
						skip: current - 1,
						limit: pageSize,
						start_date: dateRange.from ? dateRange.from : undefined,
						end_date: dateRange.to ? dateRange.to : undefined,
						current: isCurrent ? 1 : undefined,
					},
					headers: {
						Authorization: localStorage.getItem(ACCESS_TOKEN)
							? `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`
							: undefined,
					}
				}
			)
			.then(response => {
				const { data }: { data: any } = response

				setDataSource(data)
			})
			.finally(() => setIsLoading(false))
	}

	useEffect(() => {
		if (selectedUser) {
			fetchDataSource()
		}
	}, [selectedUser, dateRange.to, dateRange.from, selectedChild, isCurrent])

	const columns = [
		{
			dataIndex: 'datetime',
			sortDirections: ['ascend', 'descend'],
			title: 'Дата',
			render: (date: string) => (
				<Typography.Text>{moment(date).format('DD.MM.YYYY')}</Typography.Text>
			),
			sorter: (a: AttendanceRead, b: AttendanceRead) =>
				a.fullName.localeCompare(b.fullName),
		},
		{
			sortDirections: ['ascend', 'descend'],
			title: 'Статус',
			render: (data: any) => {
				const { is_absent, is_late } = data

				if (is_absent) {
					return <Tag color='error'>Отсутсвует</Tag>
				}

				if (is_late) {
					return <Tag color='warning'>Опоздал</Tag>
				}

				if (!is_late && !is_absent) {
					return <Tag color='success'>Прибыл</Tag>
				}
			},
			sorter: (a: AttendanceRead, b: AttendanceRead) =>
				a.monthLateCount - b.monthLateCount,
		},
		{
			dataIndex: 'entrance_type',
			sortDirections: ['ascend', 'descend'],
			title: 'Событие',
			render: (num: number) => (
				<Typography>{num ? 'Вошел' : 'Вышел'}</Typography>
			),
		},
	] as TableColumnsType<AttendanceRead>

	const selectChangeHendler = (value: any) => {
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

	const downloadExcel = async () => {
		setIsLoading(true)

		axios
			.get(
				`http://${localStorage.getItem(
					'selected'
				)}:8080/attendance_dashboard/excel/`,
				{
					responseType: 'blob',
					params: {
						skip: current - 1,
						limit: 1000,	
						start_date: dateRange.from ? dateRange.from : undefined,
						end_date: dateRange.to ? dateRange.to : undefined,
						current: isCurrent ? 1 : 0,
					},
					headers: {
						Authorization: localStorage.getItem(ACCESS_TOKEN)
							? `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`
							: undefined,
					}
				}
			)
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

	return (
		<>
			{record && (
				<LatenessAndAbsenceModal
					isModalOpen={isModalOpen}
					record={record}
					closeModal={closeModal}
				/>
			)}

			{true ? (
				<>
					<Row style={{ display: 'flex', margin: '1rem', gap: '1rem' }}>
						<Col>
							<Space.Compact>
								<Select
									style={{ width: '13rem' }}
									placeholder='Какимжан Алихан'
									onChange={user => {
										setCurrent(1)
										setSelectedUser(user)
									}}
								>
									{users.map(user => (
										<Select.Option key={user.user_id} value={user.user_id}>
											{user?.surname} {`  `}
											{user?.name}
										</Select.Option>
									))}
								</Select>
							</Space.Compact>
						</Col>
						<Col>
							<Space.Compact>
								<DatePicker.RangePicker
									onChange={arr => {
										setDateRange({
											from: moment(arr?.[0]).format('YYYY-MM-DD'),
											to: moment(arr?.[0]).format('YYYY-MM-DD'),
										})
									}}
									style={{ width: '25rem' }}
								/>
							</Space.Compact>
							<Space.Compact>
								<Select
									placeholder={'Выберите часть'}
									style={{ width: '10rem', marginLeft: '1.2rem' }}
									defaultValue='all'
									onChange={selectChangeHendler}
								>
									<Select.Option value='all'>Все</Select.Option>
									<Select.Option value={`${localStorage.getItem('me')}`}>
										{`${localStorage.getItem('organization_name')}`}
									</Select.Option>
									{childs.map((item: any) => (
										<Select.Option value={item.ip_addr}>
											{item?.name}
										</Select.Option>
									))}
								</Select>
							</Space.Compact>
						</Col>
						<Col>
							<div className='d-inline-flex flex-column'>
								<div style={{ marginTop: '0rem' }}>
									<Button onClick={downloadExcel}>Скачать</Button>
								</div>
							</div>
						</Col>
					</Row>
					<Row>
						<Col>
							<Typography.Text className='ml-3'>
								На лицо: {dataSource?.attendance_count}
							</Typography.Text>
						</Col>
						<Col>
							<Typography.Text className='ml-3'>
								Опозданий: {dataSource?.late_count}
							</Typography.Text>
						</Col>
						<Col>
							<Typography.Text className='ml-3'>
								Отсутствует: {dataSource?.absent_count}
							</Typography.Text>
						</Col>
					</Row>
					<CustomTable
						columns={columns}
						current={current}
						dataSource={dataSource?.attendances}
						loading={isLoading}
						pageSize={pageSize}
						setCurrent={setCurrent}
						setPageSize={setPageSize}
						total={dataSource?.total_count}
					/>
				</>
			) : (
				<NoData />
			)}
		</>
	)
})
