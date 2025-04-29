import moment from 'moment'

import {
	Button,
	Card,
	DatePicker,
	PageHeader,
	Radio,
	Select,
	Tabs,
	TabsProps,
	Typography,
} from 'antd'
import { useEffect, useState } from 'react'

import {
	CloseCircleFilled,
	LoginOutlined,
	LogoutOutlined,
} from '@ant-design/icons'
import axios from 'axios'

import { EntranceTab } from '@/components/app-components/checkpoint/EntranceTab'
import { ExitTab } from '@/components/app-components/checkpoint/ExitTab'
import { Time } from '@/components/shared-components/Time'
import { EmployeeService } from '@/services/EmployeeService'

const { Text } = Typography

const Checkpoint = () => {
	const [formattedDate, setFormattedDate] = useState<string | undefined>(
		moment(new Date()).format('YYYY-MM-DD')
	)
	const [childs, setChilds] = useState([])
	const [selectedChild, setSelectedChild] = useState('')
	const [isCurrent, setIsCurrent] = useState(false)

	useEffect(() => {
		EmployeeService.getEmployeesChild({
			query: {},
		}).then(response => {
			const { data }: { data: any } = response

			setChilds(data)
		})
	}, [])

	const [filterValue, setFilterValue] = useState<
		'employee' | 'guest' | undefined
	>()
	const [item, setItem] = useState('entrance')

	const items: TabsProps = [
		{
			label: (
				<Text>
					<LoginOutlined /> Вход
				</Text>
			),
			key: 'entrance',
			children: ``,
		},
		{
			label: (
				<Text>
					<LogoutOutlined /> Выход
				</Text>
			),
			key: 'exit',
			children: ``,
		},
	]

	const selectChangeHendler = (value: any) => {
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

	const handleClick = (evt: any) => {
		setFilterValue(undefined)
		evt.target.blur()
	}

	const downloadExcel = async () => {
		axios
			.get(
				`http://${localStorage.getItem('selected')}:8080/attendance/excel/`,
				{
					responseType: 'blob',
					params: {
						limit: 1000,
						current: isCurrent ? 1 : 0,
						user_type: filterValue,
						time_from: moment(formattedDate).toISOString(),
						time_till: moment(formattedDate).add(1, 'days').toISOString(),
					},
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
	}

	return (
		<>
			<PageHeader
				extra={<Time />}
				ghost={false}
				style={{
					margin: '-25px -25px 25px -25px',

					borderBottom: '1px solid #e6ebf1',
				}}
				subTitle='Зарегистрированные лица, прошедшие контрольный пункт'
				title={
					<Typography.Text
						className='font-weight-semibold'
						style={{ fontSize: '16px' }}
					>
						Контрольно-пропускной пункт
					</Typography.Text>
				}
			/>

			<Card
				className='px-3'
				extra={
					<>
						<DatePicker
							defaultValue={moment(formattedDate)}
							onChange={(_, dateString) => {
								setFormattedDate(dateString)
							}}
						/>
					</>
				}
				title={
					<div className='d-flex align-items-center' style={{ gap: '0.5rem' }}>
						<Radio.Group
							value={filterValue}
							onChange={evt => setFilterValue(evt.target.value)}
						>
							<Radio.Button value='employee' onClick={handleClick}>
								<Text className='font-weight-normal'>Сотрудник</Text>
							</Radio.Button>
							<Radio.Button value='guest' onClick={handleClick}>
								<Text className='font-weight-normal'>Гость</Text>
							</Radio.Button>
						</Radio.Group>
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
						<div className='d-inline-flex flex-column'>
							<div style={{ marginTop: '0rem' }}>
								<Button onClick={downloadExcel}>Скачать</Button>
							</div>
						</div>
						{filterValue ? (
							<Button
								icon={
									<CloseCircleFilled
										onMouseEnter={e => {
											e.currentTarget.style.color = '#c9ced1'
										}}
										onMouseLeave={evt => {
											evt.currentTarget.style.color = '#d0d4d7'
										}}
										style={{ color: '#d0d4d7' }}
									/>
								}
								onClick={() => {
									setFilterValue(undefined)
								}}
								type='link'
							/>
						) : null}
					</div>
				}
			>
				<Tabs
					defaultActiveKey={'entrance'}
					items={items}
					onChange={e => setItem(e)}
				/>
				{item == 'entrance' ? (
					<EntranceTab
						dateOfPass={formattedDate}
						filterValue={{
							filterValue: filterValue,
							child: selectedChild,
							isCurrent: isCurrent,
							formattedDate: formattedDate,
						}}
					/>
				) : (
					<ExitTab
						dateOfPass={formattedDate}
						filterValue={{
							filterValue: filterValue,
							child: selectedChild,
							isCurrent: isCurrent,
							formattedDate: formattedDate,
						}}
					/>
				)}
			</Card>
		</>
	)
}

export default Checkpoint
