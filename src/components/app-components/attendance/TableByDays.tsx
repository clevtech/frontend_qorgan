import moment from 'moment'

import { DatePicker, Select, Space, Typography, Button } from 'antd'
import { memo, useEffect, useState } from 'react'

import { MilitaryPersonnelListModal } from '@/components/app-components/attendance/MilitaryPersonnelListModal'
import { CustomTable } from '@/components/custom-components/CustomTable'
import { AttendanceService } from '@/services/AttendanceService'
import { SummaryRead } from '@/types/custom'
import { ACCESS_TOKEN } from '@/constants/AuthConstant'
import axios from 'axios'

import { EmployeeService } from '@/services/EmployeeService'
import type { TableColumnsType } from 'antd'

export const TableByDays = memo(() => {
	const [current, setCurrent] = useState<number>(1)
	const [dataSource, setDataSource] = useState<any>({
		attendances: [],
		total_count: 0,
	})
	const [dateFrom, setDateFrom] = useState<string>()
	const [dateTo, setDateTo] = useState<string>()
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
	const [pageSize, setPageSize] = useState<number>(10)
	const [summary, setSummary] = useState<SummaryRead>()

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

	useEffect(() => {
		setIsLoading(true)

		AttendanceService.getAttendanceByDays({
			query: {
				skip: (current - 1) * pageSize,
				limit: pageSize,
				start_date: dateFrom ?? undefined,
				end_date: dateTo ?? undefined,
				current: isCurrent ? 1 : undefined,
			},
		})
			.then(response => {
				const { data } = response

				setDataSource(data)
			})
			.finally(() => setIsLoading(false))
	}, [current, dateFrom, dateTo, pageSize, selectedChild, isCurrent])

	const columns = [
		{
			dataIndex: '_id',
			sortDirections: ['ascend', 'descend'],
			title: 'Дата',
			width: '25%',
			render: (date: string) => (
				<Typography.Text>{moment(date).format('DD/MM/YYYY')}</Typography.Text>
			),
		},
		{
			dataIndex: 'attendance_count',
			sortDirections: ['ascend', 'descend'],
			title: 'На лицо',
			width: '25%',
			render: (text: any) => <Typography.Text>{text} человек</Typography.Text>,
		},
		{
			dataIndex: 'late_count',
			sortDirections: ['ascend', 'descend'],
			title: 'Опоздание',
			width: '25%',
			render: (text: number) => (
				<Typography.Text>{text} человек</Typography.Text>
			),
		},
		{
			dataIndex: 'absent_count',
			sortDirections: ['ascend', 'descend'],
			title: 'Отсутствующие',
			width: '25%',
			render: (text: number) => (
				<Typography.Text>{text} человек</Typography.Text>
			),
		},
		// {
		//     key: 'actions',
		//     sortDirections: ['ascend', 'descend'],
		//     title: 'Действие',
		//     width: '10%',
		//     render: (summary: SummaryRead) => (
		//         <CustomActionButton
		//             onClick={() => {
		//                 setSummary(summary);
		//                 setIsModalOpen(true);
		//             }}
		//         >
		//             Подробнее
		//         </CustomActionButton>
		//     ),
		// },
	] as TableColumnsType<SummaryRead>

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
						skip: (current - 1) * pageSize,
						limit: 1000,
						start_date: dateFrom ?? undefined,
						end_date: dateTo ?? undefined,
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
			{summary && (
				<MilitaryPersonnelListModal
					isModalOpen={isModalOpen}
					summary={summary}
					closeModal={() => setIsModalOpen(false)}
					openedFrom='attendance'
				/>
			)}

			<div className='d-inline-flex flex-column m-2 '>
				<Typography.Text className='ml-2'>
					Поиск за период времени
				</Typography.Text>
				<div className='m-2'>
					<DatePicker.RangePicker
						className='mr-2'
						onChange={(_, dateString) => {
							setDateFrom(dateString[0])
							setDateTo(dateString[1])
						}}
					/>
					<Space.Compact>
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
					</Space.Compact>
					<div className='d-inline-flex flex-column ml-2'>
						<div style={{ marginTop: '0rem' }}>
							<Button onClick={downloadExcel}>Скачать</Button>
						</div>
					</div>
				</div>
			</div>

			<CustomTable
				columns={columns}
				current={current}
				dataSource={dataSource.attendances}
				loading={isLoading}
				pageSize={pageSize}
				setCurrent={setCurrent}
				setPageSize={setPageSize}
				total={dataSource.total_count}
			/>
		</>
	)
})
