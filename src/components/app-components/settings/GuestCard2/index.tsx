import { Avatar, Divider, notification, Select, Typography } from 'antd'
import { useCallback, useEffect, useState } from 'react'

import { PlusCircleOutlined, UserOutlined } from '@ant-design/icons'

import { CustomActionButton } from '@/components/custom-components/CustomActionButton'
import { CustomCard } from '@/components/custom-components/CustomCard'
import { CustomCardButton } from '@/components/custom-components/CustomCardButton'
import { CustomTable } from '@/components/custom-components/CustomTable'
import { NoData } from '@/components/util-components/NoData'
import { API_BASE_URL } from '@/configs/AppConfig'
import { EmployeeService } from '@/services/EmployeeService'
import { EmployeeService as EmployeeServiceSettings } from '@/services/EmployeeServiceSettings'
import { EmployeeRead, EmployeesRead } from '@/types/custom'
import axios from 'axios'
import { CreateEmployeeModal } from './CreateEmployeeModal'
import { UpdateEmployeeModal } from './UpdateEmployeeModal'

export const GuestCard2 = () => {
	const [current, setCurrent] = useState<number>(1)
	const [dataSource, setDataSource] = useState<EmployeesRead>({
		total_count: 0,
		users: [],
	})
	const [employee, setEmployee] = useState<any>()
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [pageSize, setPageSize] = useState<number>(10)
	const [childs, setChilds] = useState([])
	const [selectedChild, setSelectedChild] = useState('')
	const [isCurrent, setIsCurrent] = useState(false)

	const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false)
	const [isUpdateModalOpen, setIsUpdateModalOpen] = useState<boolean>(false)

	const fetchDataSource = useCallback(async () => {
		setIsLoading(true)

		await EmployeeServiceSettings.getEmployees({
			query: {
				skip: (current - 1) * pageSize,
				limit: pageSize,
				is_guest: true,
				current: isCurrent ? 1 : undefined
			},
		})
			.then(response => {
				const { data }: { data: EmployeesRead } = response

				setDataSource(data)
			})
			.finally(() => setIsLoading(false))
	}, [current, pageSize, selectedChild, isCurrent])

	useEffect(() => {
		EmployeeService.getEmployeesChild({
			query: {},
		}).then(response => {
			const { data }: { data: any } = response

			setChilds(data)
		})
	}, [])

	const deleteEmployee = async (id: string) => {
		await EmployeeService.deleteEmployeesById({
			path: { id: id },
		})
			.then(() => {
				notification.success({
					message: 'Успех',
					description: 'Гость успешно удален',
				})
			})
			.finally(() => fetchDataSource())
	}

	useEffect(() => {
		fetchDataSource()
	}, [fetchDataSource])

	const columns = [
		{
			title: 'ФИО гостя',
			render: (_: string, record: EmployeeRead) => (
				<div className='d-flex align-items-center'>
					<Avatar
						icon={<UserOutlined />}
						src={'data:image/png;base64, ' + record?.photo_base64}
					/>{' '}
					<Typography.Text className='ml-2'>{record?.surname}</Typography.Text>
					<Typography.Text className='ml-2'>{record?.name}</Typography.Text>
				</div>
			),
			sorter: (a: EmployeeRead, b: EmployeeRead) =>
				a.fullName.localeCompare(b.fullName),
		},
		{
			title: 'Действия',
			key: 'actions',
			width: 242,
			render: (_: string, record: any) => (
				<div>
					{record.me_ip === localStorage.getItem('selected')
						?
						<div style={{display:'flex', gap:'10px', alignItems:'center'}}>
							<CustomActionButton
								onClick={() => {
									setEmployee(record)

									setIsUpdateModalOpen(true)
								}}
							>
								Редактировать
							</CustomActionButton>
							<Divider type='vertical' />
							<CustomActionButton
								danger
								disabled={localStorage.getItem('ROLE') !== 'superadmin'}
								onClick={() => deleteEmployee(record.user_id)}
							>
								Удалить
							</CustomActionButton>
						</div>
						:
						<p>Редактирование недоступно</p>
					}
				</div>
			),
		},
	]

	const selectChangeHendler = value => {
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
			<CreateEmployeeModal
				isOpen={isCreateModalOpen}
				onClose={() => setIsCreateModalOpen(false)}
				fetchDataSource={fetchDataSource}
			/>

			{employee && (
				<UpdateEmployeeModal
					employee={employee}
					isOpen={isUpdateModalOpen}
					fetchDataSource={fetchDataSource}
					onClose={() => setIsUpdateModalOpen(false)}
				/>
			)}

			<div>
				<CustomCard
					extra={
						<div style={{display: 'flex', gap: '1rem'}} >
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
									<Select.Option value={item.ip_addr}>
										{item?.name}
									</Select.Option>
								))}
							</Select>
							<CustomCardButton
								onClick={() => {
									setIsCreateModalOpen(true)
								}}
							>
								<PlusCircleOutlined />
								Добавить гостя
							</CustomCardButton>
						</div>
					}
					title='Список гостей'
				>
					{!isLoading && dataSource.totalCount === 0 ? (
						<NoData />
					) : (
						<CustomTable
							columns={columns}
							current={current}
							dataSource={dataSource.users}
							loading={isLoading}
							pageSize={pageSize}
							total={dataSource.total_count}
							setCurrent={setCurrent}
							setPageSize={setPageSize}
						/>
					)}
				</CustomCard>
			</div>
		</>
	)
}
