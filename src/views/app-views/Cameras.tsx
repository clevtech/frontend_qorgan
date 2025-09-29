import { Col, Radio, Row, Select, Spin, Typography } from 'antd'
import { useEffect, useState } from 'react'

import { CameraCard } from '@/components/app-components/cameras/CameraCard'
import { NoData } from '@/components/util-components/NoData'
import { CamerasService } from '@/services/CamerasService'
import { EmployeeService } from '@/services/EmployeeService'
import { CamerasRead } from '@/types/custom'
import { IconColumns1, IconColumns2, IconColumns3 } from '@tabler/icons-react'
const Cameras = () => {
	const [dataSource, setDataSource] = useState<CamerasRead>([])

	const [childs, setChilds] = useState([])
	const [selectedChild, setSelectedChild] = useState('')
	const [isCurrent, setIsCurrent] = useState(false)
	const [isLoading, setIsLoading] = useState(false)
	const [caeraSize, setCameraSize] = useState('Маленькие значки')

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

		CamerasService.getCameras({
			query: {
				current: isCurrent ? 1 : undefined,
			},
		}).then(response => {
			const { data } = response

			setDataSource(data)
			setIsLoading(false)
		})
	}, [selectedChild, isCurrent])

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
	const getColProps = () => {
		switch (cameraSize) {
			case 'Крупные значки':
				return { xs: 24, sm: 12, xl: 24 } // Крупные значки: 1/4 ширины
			case 'Маленькие значки':
				return { xs: 24, sm: 12, xl: 8 } // Маленькие значки: 1/4 ширины
			case 'Очень маленькие значки':
				return { xs: 24, sm: 12, xl: 6 } // Маленькие значки: 1/4 ширины
			default:
				return { xs: 24, sm: 12, xl: 12 } // Средние значки: 1/4 ширины
		}
	}

	return (
		<div
			style={{
				height: '100%',
			}}
		>
			{/* <CustomPageHeader
				title={
					<div
						style={{
							display: 'flex',
							justifyContent: 'space-around',
							gap: '5%',
						}}
					>
						<Typography.Text
							className='font-weight-semibold'
							style={{ fontSize: '16px' }}
						>
							Просмотр камер
						</Typography.Text>
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

						<Radio.Group
							value={cameraSize}
							onChange={(e: any) => setCameraSize(e.target.value)}
						>
							<Radio.Button value='Крупные значки'>
								<IconColumns1 className='mt-2' />
							</Radio.Button>
							<Radio.Button value='Средние значки'>
								<IconColumns2 className='mt-2' />
							</Radio.Button>
							<Radio.Button value='Маленькие значки'>
								<IconColumns3 className='mt-2' />
							</Radio.Button>
							<Radio.Button value='Очень маленькие значки'>
								<div
									style={{
										position: 'relative',
										background: 'white',
										zIndex: 10,
										display: 'flex',
										justifyContent: 'center',
										alignItems: 'center',
										gap: '0.25rem',
									}}
								>
									<IconColumns3
										style={{ position: 'absolute', top: 0, left: '6px' }}
										className='mt-2'
									/>
									<IconColumns3 className='mt-2 mr-2' />
								</div>
							</Radio.Button>
						</Radio.Group>
					</div>
				}
			/> */}
			<Typography.Title
				className='font-weight-semibold'
				style={{ fontSize: '24px' }}
			>
				Просмотр камер
			</Typography.Title>

			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					gap: '1%',
				}}
			>
				<Select
					placeholder={'Выберите часть'}
					style={{ width: '10rem', border: '0' }}
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

				<Radio.Group
					value={cameraSize}
					onChange={(e: any) => setCameraSize(e.target.value)}
				>
					<Radio.Button value='Крупные значки'>
						<IconColumns1 className='mt-2' />
					</Radio.Button>
					<Radio.Button value='Средние значки'>
						<IconColumns2 className='mt-2' />
					</Radio.Button>
					<Radio.Button value='Маленькие значки'>
						<IconColumns3 className='mt-2' />
					</Radio.Button>
					<Radio.Button value='Очень маленькие значки'>
						<div
							style={{
								position: 'relative',
								background: 'white',
								zIndex: 10,
								display: 'flex',
								justifyContent: 'center',
								alignItems: 'center',
								gap: '0.25rem',
							}}
						>
							<IconColumns3
								style={{ position: 'absolute', top: 0, left: '6px' }}
								className='mt-2'
							/>
							<IconColumns3 className='mt-2 mr-2' />
						</div>
					</Radio.Button>
				</Radio.Group>
			</div>
			{isLoading ? (
				<div
					style={{
						position: 'absolute',
						left: 0,
						width: '100%',
						height: '100%',
						backgroundColor: 'rgba(255, 255, 255, 0.8)',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						zIndex: 10,
					}}
				>
					<Spin size='large' />
				</div>
			) : (
				<>
					{dataSource.length > 0 ? (
						<Row className='mt-3' gutter={24}>
							{dataSource.map((camera, idx) => (
								<Col key={idx} {...getColProps()}>
									<CameraCard {...camera} />
								</Col>
							))}
						</Row>
					) : (
						<NoData />
					)}
				</>
			)}
		</div>
	)
}

export default Cameras
