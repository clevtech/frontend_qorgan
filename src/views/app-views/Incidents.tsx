import { QorganService } from '@/services/QorganService'
import { Button, Card, DatePicker, notification, Table, Typography } from 'antd'
import { saveAs } from 'file-saver'
import moment from 'moment'
import { useEffect, useState } from 'react'
import * as XLSX from 'xlsx'

import type { TableColumnsType } from 'antd'

const Incidents = () => {
	const [mode, setMode] = useState<'auto' | 'manual' | 'off'>('auto')
	const [data, setData] = useState<any[]>([])
	const [loading, setLoading] = useState<boolean>(false)
	const [modules, setModules] = useState<any>([])
	const [pagination, setPagination] = useState({
		current: 1,
		pageSize: 10,
		total: 0,
	})
	const [tempDateFrom, setTempDateFrom] = useState<string | undefined>(
		undefined
	)
	const [tempDateTo, setTempDateTo] = useState<string | undefined>(undefined)

	const columns = (() => {
		return [
			{
				dataIndex: 'direction',
				key: 'direction',
				title: 'Сектор',
				width: '25%',
			},
			{
				dataIndex: 'frequency',
				key: 'frequency',
				title: 'Частота дрона',
				width: '25%',
				render: (text: string | null) => (
					<span>{text ? text : 'Отсутствует'}</span>
				),
			},
			{
				dataIndex: 'power',
				key: 'power',
				title: 'Сила сигнала',
				width: '25%',
				render: (text: string | null) => (
					<span>{text ? text : 'Отсутствует'}</span>
				),
			},
			{
				dataIndex: 'datetime',
				key: 'datetime',
				title: 'Время',
				width: '25%',
				render: (createdAt: string) => (
					<Typography.Text>
						{moment(createdAt).format('DD/MM/YYYY HH:mm')}
					</Typography.Text>
				),
			},
		] as TableColumnsType<any>
	})()

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
				datefrom: tempDateFrom,
				dateto: tempDateTo,
			})
			setData(response.data.detections)
			setPagination(prev => ({
				...prev,
				total: response.data.total_count || 0,
			}))
		} catch (error) {
			notification.error({
				message: 'Ошибка при получении обнаружений',
				description:
					(error as Error).message ||
					'Не удалось загрузить данные обнаружений.',
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
				message: 'Ошибка при получении модулей',
				description:
					(error as Error).message || 'Не удалось загрузить данные модулей.',
			})
		}
	}

	useEffect(() => {
		fetchDetections(pagination.current, pagination.pageSize)
		fetchModules()
	}, [tempDateFrom, tempDateTo])

	const handleExport = () => {
		const worksheet = XLSX.utils.json_to_sheet(data)
		const workbook = XLSX.utils.book_new()
		XLSX.utils.book_append_sheet(workbook, worksheet, 'Detections')

		const excelBuffer = XLSX.write(workbook, {
			bookType: 'xlsx',
			type: 'array',
		})
		const blob = new Blob([excelBuffer], { type: 'application/octet-stream' })
		saveAs(blob, 'detections.xlsx')
	}

	return (
		<div style={{ height: '100%', width: '100%' }}>
			<Card style={{ height: '100%', width: '100%' }}>
				<div
					style={{
						marginBottom: '16px',
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
					}}
				>
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
					<Button type='primary' onClick={handleExport}>
						Скачать
					</Button>
				</div>
				<Table
					columns={columns}
					dataSource={data}
					loading={loading}
					pagination={{
						current: pagination.current,
						pageSize: pagination.pageSize,
						total: pagination.total,
					}}
					onChange={pagination => {
						setPagination(pagination)
						fetchDetections(pagination.current, pagination.pageSize)
					}}
				/>
			</Card>
		</div>
	)
}

export default Incidents
