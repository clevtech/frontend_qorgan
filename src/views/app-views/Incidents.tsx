import { Card, Typography, Button, Radio, Table } from 'antd'
import moment from 'moment'

import type { TableColumnsType } from 'antd'

const Incidents = () => {
	// const [current, setCurrent] = useState<number>(1)
	// const [incidentTypes, setIncidentTypes] = useState<unknown[]>([])
	// const [dataSource, setDataSource] = useState<IncidentsRead>({
	// 	incidents: [],
	// 	totalCount: 0,
	// })
	// const [isLoading, setIsLoading] = useState<boolean>(false)
	// const [pageSize, setPageSize] = useState<number>(10)
	// const [isRepairCar, setIsRepairCar] = useState<any>(
	// 	window.location.pathname === '/app/repair_car' ? 'repair_car' : undefined
	// )

	// useEffect(() => {
	// 	if (window.location.pathname == '/app/repair_car') {
	// 		setIsRepairCar('repair_car')
	// 	} else {
	// 		setIsRepairCar(undefined)
	// 	}
	// }, [window.location.pathname])

	// const fetchIncidents = useCallback(
	// 	async () => {
	// 		setIsLoading(true)
	// 		await IncidentsService.getIncidents({
	// 			query: {
	// 				skip: (current - 1) * pageSize,
	// 				limit: pageSize,
	// 			},
	// 		})
	// 			.then(response => {
	// 				const { data }: { data: IncidentsRead } = response
	// 				setDataSource(data)
	// 			})
	// 			.finally(() => setIsLoading(false))
	// 	},
	// 	[
	// 		current,
	// 		pageSize,
	// 	]
	// )

	// useEffect(() => {
	// 	const loadData = async () => {
	// 		setIsLoading(true)
	// 		try {
	// 			if (window.location.pathname == '/app/repair_car') {
	// 				await fetchIncidents()
	// 			} else {
	// 				await fetchIncidents()
	// 			}
	// 		} finally {
	// 			setIsLoading(false)
	// 		}
	// 	}
	// 	loadData()
	// }, [fetchIncidents, window.location.pathname])

	const columns = [
		{
			dataIndex: 'organization',
			key: 'organization',
			title: 'Сектор',
			width: '50%',
			render: (text: string | null) => {
				return <span>{text ? text : 'Отсутствует'}</span>
			},
		},
		{
			dataIndex: 'createdAt',
			key: 'createdAt',
			title: 'Время',
			width: '50%',
			render: (createdAt: string) => (
				<Typography.Text>
					{moment(createdAt).format('DD/MM/YYYY HH:mm')}
				</Typography.Text>
			),
		},
	] as TableColumnsType<any>

	const fakeData = Array.from({ length: 25 }, (_, index) => ({
		key: index,
		organization: `Сектор ${index + 1}`,
		createdAt: moment().subtract(index, 'days').toISOString(),
	}))

	return (
		<Card>
			<div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
				<Radio.Group defaultValue="auto">
					<Radio value="auto">Автоматическое</Radio>
					<Radio value="manual">Вручную</Radio>
					<Radio value="off">Выкл</Radio>
				</Radio.Group>
				<Button
					type="primary"
					onClick={() => {
						// Пока ничего не делает
					}}
				>
					Скачать
				</Button>
			</div>
			<Table
				columns={columns}
				dataSource={fakeData}
				pagination={{
					pageSize: 10,
					total: 25,
				}}
				loading={false}
			/>
		</Card>
	)
}

export default Incidents
