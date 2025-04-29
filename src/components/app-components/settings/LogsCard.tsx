import { Typography } from 'antd'

import { CustomCard } from '@/components/custom-components/CustomCard'
import useDebounce from '@/hooks/useDebounce'
import { LogsService } from '@/services/LogsService'
import { Select } from 'antd'
import moment from 'moment'
import { useCallback, useEffect, useState } from 'react'

import { CustomTable } from '@/components/custom-components/CustomTable'
import { NoData } from '@/components/util-components/NoData'
import { EmployeeService } from '@/services/EmployeeService'
import { EmployeeService as EmployeeServiceSettings } from '@/services/EmployeeServiceSettings'

export const LogsCard = () => {
	interface LogEntry {
		user_name: string;
		time: Date;
		action: string;
	}

	interface LogData {
		logs: LogEntry[];
		total_count: number;
	}


	const [current, setCurrent] = useState<number>(1)
	const [dataSource, setDataSource] = useState<LogData>({
		logs: [],
		total_count: 0,
	})
	const [users, setUsers] = useState<any>([])
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [pageSize, setPageSize] = useState<number>(10)
	const [isCurrent, setIsCurrent] = useState(false)
	const [selectedUser, setSelectedUser] = useState<any>('')
	const [childs, setChilds] = useState([])
	const [selectedChild, setSelectedChild] = useState('')

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

	const fetchDataSource = useCallback(async () => {
		setIsLoading(true)

		await LogsService.getLogs({
			query: {
				skip: (current - 1) * pageSize,
				limit: pageSize,
				current: isCurrent ? 1 : undefined,
				user_id: selectedUser ? selectedUser : undefined,
			},
		})
			.then(response => {
				const { data }: { data: LogData } = response

				const formattedData = {
					...data,
					logs: data.logs.map(log => ({
					...log,
					time: new Date(log.time), 
					})),
				};
				
				setDataSource(formattedData)
			})
			.finally(() => setIsLoading(false))
	}, [current, pageSize, isCurrent, selectedUser, selectedChild])

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

	useEffect(() => {
		fetchDataSource()
	}, [fetchDataSource])

	const columns = [
		{
			title: 'ФИО сотрудника',
			width: '25%',
			onCell: () => ({ style: { verticalAlign: 'top' } }),
			render: (_: string, record: any) => (
				<div className='d-flex'>
					<Typography.Text className='ml-2'>{record.user_name}</Typography.Text>
				</div>
			),
		},
		{
			dataIndex: 'action',
			key: 'action',
			title: 'Действие',
			width: '50%',
			ellipsis: false, 
			render: (text: string) => (
				<div style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>{text}</div>
			),
		},
		{
			dataIndex: 'datetime',
			title: 'Дата и время',
			render: (value: string) => moment(value).format('DD/MM/YYYY HH:mm:ss'),
			width: '25%',
		},
	]

	return (
		<div>
			<CustomCard
				extra={
					<div className='d-flex' style={{ gap: '1rem' }}>
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
							{childs.map(item => (
								<Select.Option value={item.ip_addr}>{item?.name}</Select.Option>
							))}
						</Select>
						<Select
							style={{ width: '13rem' }}
							placeholder='Все'
							onChange={user => {
								setCurrent(1)
								setSelectedUser(user)
								if(user === 'all'){
									setSelectedUser('')
								}
							}}
						>
							<Select.Option value='all'>Все</Select.Option>
							{users.map(user => (
								<Select.Option key={user.user_id} value={user.user_id}>
									{user?.surname} {`  `}
									{user?.name}
								</Select.Option>
							))}
						</Select>
					</div>
				}
				title='Список логов'
			>
				{!isLoading && dataSource.totalCount === 0 ? (
					<NoData />
				) : (
					<CustomTable
						columns={columns}
						current={current}
						dataSource={dataSource.logs}
						loading={isLoading}
						pageSize={pageSize}
						total={dataSource.total_count}
						setCurrent={setCurrent}
						setPageSize={setPageSize}
					/>
				)}
			</CustomCard>
		</div>
	)
}
