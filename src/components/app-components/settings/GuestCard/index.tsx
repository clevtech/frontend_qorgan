import { DashboardMap } from '@/components/app-components/dashboard/DashboardMap/components/DashboardMap'
import { Button, Card, Col, Divider, Image, Input, notification, Row, Typography } from 'antd'
import { useCallback, useEffect, useState } from 'react'

import { ACCESS_TOKEN } from '@/constants/AuthConstant'
import { PlusCircleOutlined } from '@ant-design/icons'

import logo from ''
import { CustomCard } from '@/components/custom-components/CustomCard'
import { CustomCardButton } from '@/components/custom-components/CustomCardButton'
import { CustomTable } from '@/components/custom-components/CustomTable'
import { NoData } from '@/components/util-components/NoData'
import { API_BASE_URL } from '@/configs/AppConfig'
import { EmployeeService } from '@/services/EmployeeService'

import axios from 'axios'
import { CreateGuestModal } from './CreateGuestModal'
import fetch from '@/api/FetchInterceptor'
import { HttpMethods } from '@/types/custom'
import { CustomActionButton } from '@/components/custom-components/CustomActionButton'
import EditSettingsModal from './EditSettingsModal'

axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem(
	ACCESS_TOKEN
)}`

const GuestCard = () => {
	const [current, setCurrent] = useState<number>(1)
	const [dataParent, setDataParent] = useState<any>([])
	const [dataCild, setDataChild] = useState<any>([])
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [pageSize, setPageSize] = useState<number>(10)
	const [mode, setMode] = useState<'parent' | 'child'>('parent')
	const [editMe, setEditMe] = useState<boolean>(false)
	const [me, setMe] = useState<any>(null)
	const [address, setAddress] = useState<string>('')
	const [searchParent, setSearchParent] = useState('')
	const [searchChild, setSearchChild] = useState('')

	const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false)
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [editingRecord, setEditingRecord] = useState(null);

	const handleEdit = (record) => {
		setEditingRecord(record);
		setIsEditModalOpen(true);
		setEditMe(true)
	};

	const handleSaveIp = (newIp) => {
		if (editingRecord) {
			if (mode === 'parent') {
				updateParent(editingRecord.ip_addr, newIp);
			} else {
				updateChild(editingRecord.ip_addr, newIp);
			}
		}
		setIsEditModalOpen(false);
	};

	const updateParent = async (id: string, newIp: string) => {
		await EmployeeService.updateEmployeesParent(id, { ip_addr: newIp })
			.then(() => {
				notification.success({
					message: 'Успех',
					description: 'IP-адрес родителя успешно обновлен',
				});
				fetchDataSource();
			})
			.catch(() => {
				notification.error({
					message: 'Ошибка',
					description: 'Не удалось обновить IP-адрес',
				});
			});
	};

	const updateChild = async (id: string, newIp: string) => {
		await EmployeeService.updateEmployeesChild(id, { ip_addr: newIp })
			.then(() => {
				notification.success({
					message: 'Успех',
					description: 'IP-адрес ребенка успешно обновлен',
				});
				fetchDataSource();
			})
			.catch(() => {
				notification.error({
					message: 'Ошибка',
					description: 'Не удалось обновить IP-адрес',
				});
			});
	};


	// useEffect(() => {
	// 	fetch({
	// 		url: '/global/me',
	// 		method: HttpMethods.GET,
	// 	})
	// 		.then(res => {
	// 			if (res.status === 200) {
	// 				setMe(res.data)
	// 				localStorage.setItem('organization_name', `${res?.data.name}`)
	// 			}
	// 		})
	// 		.catch(() => localStorage.setItem('organization_name', `1234`))
	// }, [])

	const fetchDataSource = useCallback(async () => {
		setIsLoading(true)

		await EmployeeService.getEmployeesParent({
			query: {
				skip: current - 1,
				limit: pageSize,
				role: 'guest',
			},
		})
			.then(response => {
				const { data }: { data: any } = response

				setDataChild(data)
			})
			.finally(() => setIsLoading(false))

		await EmployeeService.getEmployeesChild({
			query: {
				skip: current - 1,
				limit: pageSize,
				role: 'guest',
			},
		})
			.then(response => {
				const { data }: { data: any } = response

				setDataParent(data)
			})
			.finally(() => setIsLoading(false))
	}, [current, pageSize])

	useEffect(() => {
		fetchDataSource()
	}, [fetchDataSource])

	const changeMeHandler = () => {
		if (!address.trim()) {
			fetch({
				url: '/global/me',
				method: HttpMethods.POST,
				data: me,
			})
				.then(() => fetch({ url: '/global/me', method: HttpMethods.GET }))
				.then(res => {
					if (res.status === 200) {
						setMe(res.data);
						localStorage.setItem('organization_name', `${res?.data.name}`);
					}
				})
				.catch(e => localStorage.setItem('organization_name', `1234`));

			return;
		}

		const [lat, long] = address.split(/[,\s]+/).map(coord => parseFloat(coord));

		fetch({
			url: '/global/me',
			method: HttpMethods.POST,
			data: { ...me, lat, long },
		})
			.then(() => fetch({ url: '/global/me', method: HttpMethods.GET }))
			.then(res => {
				if (res.status === 200) {
					setMe(res.data);
					localStorage.setItem('organization_name', `${res?.data.name}`);
				}
			})
	};

	const deleteParent = async (id: string) => {
		await EmployeeService.deleteEmployeesParent(id)
			.then(() => {
				notification.success({
					message: 'Успех',
					description: 'Сотрудник успешно удален',
				})
			})
			.finally(() => fetchDataSource())
	}

	const deleteChild = async (id: string) => {
		await EmployeeService.deleteEmployeesChild(id)
			.then(() => {
				notification.success({
					message: 'Успех',
					description: 'Сотрудник успешно удален',
				})
			})
			.finally(() => fetchDataSource())
	}

	const columns = (isParentTable: boolean) => [
		{
			dataIndex: 'ip_addr',
			key: 'ip_addr',
			title: 'IP',
		},
		{
			title: 'Название',
			dataIndex: 'name',
			key: 'name',
			width: 242,
		},
		{
			title: 'Адрес',
			render: (_: any, record: any) => {
				return (
					<div>
						{_?.lat} c.ш.
						{`  `}
						{_?.long} в.д.
					</div>
				)
			},
		},
		{
			title: 'Действие',
			render: (_: any, record: any) => {
				return (
					<div style={{display:'flex', gap:'5px', alignItems:'center'}}>
						{/* <a href={`http://${_.ip_addr}`} target='_blank'>
							Подробнее
						</a> */}
						<CustomActionButton
							onClick={() =>
								handleEdit(record)
							}
						>
							Редактировать
						</CustomActionButton>

						<Divider type='vertical' />

						<CustomActionButton
							danger
							disabled={localStorage.getItem('ROLE') !== 'superadmin'}
							onClick={() =>
								isParentTable
									? deleteParent(record.ip_addr)
									: deleteChild(record.ip_addr)
							}
						>
							Удалить
						</CustomActionButton>
					</div>
				)
			},
		},
	]

	const filteredParents = dataParent.filter(
		(item: any) =>
			item?.name?.toLowerCase().includes(searchParent.toLowerCase())
	)

	const filteredChilds = dataCild.filter((item: any) =>
		item.name.toLowerCase().includes(searchChild.toLowerCase())
	)

	return (
		<div>
			<EditSettingsModal
				isOpen={isEditModalOpen}
				onClose={() => setIsEditModalOpen(false)}
				onSave={handleSaveIp}
				initialIp={editingRecord?.ip_addr}
			/>
			<Typography.Title level={4}>Данные об объекте</Typography.Title>

			<CreateGuestModal
				isOpen={isCreateModalOpen}
				onClose={() => setIsCreateModalOpen(false)}
				fetchDataSource={fetchDataSource}
				mode={mode}
			/>

			<Row gutter={[16, 16]}>
				<Col span={12}>
					<Card style={{ height: '100%', display: 'flex', flexDirection: 'column', padding:'20px' }}>
					<Row style={{ gap: '15px', alignItems: 'center', margin:0,  }}>
						<Image style={{ height: '50px', width: '50px', border: 0 }} />
						<Input
						disabled={!editMe}
						style={{ flex: 1, width: '100%' }}
						placeholder="Название"
						value={me?.name}
						onChange={(e: any) =>
							setMe(prev => ({
							...prev,
							name: e.target.value,
							}))
						}
						/>
					</Row>

					<Typography.Title level={5} style={{ marginTop: '1rem' }}>IP-адрес:</Typography.Title>
					<Input
						disabled={!editMe}
						value={me?.ip_addr}
						placeholder="192.168.1.106"
						onChange={(e: any) =>
						setMe(prev => ({
							...prev,
							ip_addr: e.target.value,
						}))
						}
					/>

					<Typography.Title level={5} style={{ marginTop: '1rem' }}>Адрес:</Typography.Title>
					<Input
						disabled={!editMe}
						value={editMe ? address : (me?.lat && me?.long ? `${me.lat}, ${me.long}` : '')}
						placeholder="51.2345, 71.1234"
						onChange={(e: any) => setAddress(e.target.value)}
					/>

					<div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '10px', flexWrap: 'wrap' }}>
						{editMe ? (
						<>
							<Button onClick={() => {
								setEditMe(false)
								setAddress(me?.lat && me?.long ? `${me.lat}, ${me.long}` : '');
								}}>Отменить</Button>
							<Button 
								type="primary" 
								onClick={() => { changeMeHandler(); setEditMe(false); }}
								disabled={localStorage.getItem('ROLE') !== 'superadmin'}
								>
							Сохранить
							</Button>
						</>
						) : (
						<Button onClick={() => {
							setEditMe(true)
							setAddress(me?.lat && me?.long ? `${me.lat}, ${me.long}` : '');
						}}>Редактировать</Button>
						)}
					</div>
					</Card>
				</Col>

				<Col span={12}>
					<CustomCard title='Карта'>
						<DashboardMap data={[...dataCild, ...dataParent]} />
					</CustomCard>
				</Col>
				</Row>

			<Row gutter={[16, 16]} className='mt-4'>
				<Col span={12}>
					<CustomCard
						title='Данные о материнских объектах'
						extra={
							<CustomCardButton
								icon={<PlusCircleOutlined />}
								onClick={() => {
									setMode('parent')
									setIsCreateModalOpen(true)
								}}
								disabled={localStorage.getItem('ROLE') !== 'superadmin'}
							>
								Добавить материнский объект
							</CustomCardButton>
						}
					>
						{!isLoading && dataParent.totalCount === 0 ? (
							<NoData />
						) : (
							<>
								<div
									className='d-inline-flex mb-3 align-items-center'
									style={{ gap: '8px' }}
								>
									<div className='mt-2 d-flex'>
										<Input
											placeholder='Поиск'
											value={searchParent}
											onChange={e => setSearchParent(e.target.value)}
										/>
										<Button className='ml-1'>Поиск</Button>
									</div>
								</div>
								<CustomTable
									columns={columns(true)}
									current={current}
									dataSource={filteredChilds}
									loading={isLoading}
									pageSize={pageSize}
									setCurrent={setCurrent}
									setPageSize={setPageSize}
								/>
							</>
						)}
					</CustomCard>
				</Col>
				<Col span={12}>
					<CustomCard
						title='Данные о дочерних объектах'
						extra={
							<CustomCardButton
								icon={<PlusCircleOutlined />}
								onClick={() => {
									setMode('child')
									setIsCreateModalOpen(true)
								}}
								disabled={localStorage.getItem('ROLE') !== 'superadmin'}
							>
								Добавить дочерний объект
							</CustomCardButton>
						}
					>
						{!isLoading && dataCild.totalCount === 0 ? (
							<NoData />
						) : (
							<>
								<div
									className='d-inline-flex mb-3 align-items-center'
									style={{ gap: '8px' }}
								>
									<div className='mt-2 d-flex align-items-center'>
										<Input
											placeholder='Поиск'
											value={searchParent}
											onChange={e => setSearchParent(e.target.value)}
										/>
										<Button className='ml-1'>Поиск</Button>
									</div>
								</div>
								<CustomTable
									columns={columns(false)}
									current={current}
									dataSource={filteredParents}
									loading={isLoading}
									pageSize={pageSize}
									setCurrent={setCurrent}
									setPageSize={setPageSize}
								/>
							</>
						)}
					</CustomCard>
				</Col>
			</Row>
		</div>
	)
}

export default GuestCard
