import moment from 'moment'

import { Button, Dropdown, Image, notification, Space, Typography } from 'antd'
import { useEffect, useRef, useState } from 'react'

import { BellOutlined } from '@ant-design/icons'

import { CreateIncidentModal } from '@/components/app-components/incidents/CreateIncidentModal'
import { IncidentsService } from '@/services/IncidentsService'
import { IncidentsRead } from '@/types/custom'

import imageFallback from '@/assets/imageFallback-1-1.png'

import type { MenuProps } from 'antd'

const close = () => {
	console.log(
		'Notification was closed. Either the close button was clicked or duration time elapsed.'
	)
}

export const Notifications = () => {
	const [dataSource, setIncidents] = useState<IncidentsRead>({
		totalCount: 0,
		incidents: [],
	})
	const [api, contextHolder] = notification.useNotification()
	const [incidentId, setIncidentId] = useState<string>()
	const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
	const intervalRef = useRef<NodeJS.Timeout | null>(null)

	const openNotification = (item: any) => {
		const key = `open${Date.now()}`
		const btn = (
			<Space>
				<Button type='primary' size='small' onClick={() => {
					setIncidentId(item.incident_id)

					openModal()
				}}>
					Открыть
				</Button>
			</Space>
		)
		api.open({
			message: `Инцидент: ${item.ru_name}.`,
			description:
				`Дата и время: ${moment(item.createdAt).format('DD/MM/YYYY HH:mm')}`,
			btn,
			key,
			onClose: close,
            placement: 'bottomRight'
		})
	}

	const fetchIncidents = async () => {
		const dateTo = moment().toISOString()
		const dateFrom = moment().subtract(30, 'seconds').toISOString()

		try {
			const response = await IncidentsService.getIncidents({
				query: {
					skip: 0,
					limit: 1,
					date_from: dateFrom,
					date_to: dateTo,
				},
			})

			setIncidents(response.data)
		} catch (error) {
			console.error('Ошибка при получении инцидентов:', error)
		}
	}

	useEffect(() => {
		// Запускаем первый запрос сразу
		fetchIncidents()

		// Устанавливаем интервал
		intervalRef.current = setInterval(fetchIncidents, 30 * 1000)

		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current)
			}
		}
	}, [])

    useEffect(() => {
        if (dataSource.incidents.length) {
            openNotification(dataSource.incidents[0])
        } 
    }, [dataSource])

	const closeModal = () => setIsModalOpen(false)
	const openModal = () => setIsModalOpen(true)

	const items: MenuProps['items'] =
		dataSource.incidents.length > 0
			? dataSource.incidents.map((incident, idx) => {
					return {
						key: incident.incident_id,
						label: (
							<div
								className='d-flex flex-column'
								onClick={() => {
									setIncidentId(incident.incident_id)

									openModal()
								}}
								onKeyDown={undefined}
								role='button'
								style={{
									gap: '0.5rem',
								}}
								tabIndex={idx}
							>
								<Typography.Text className='font-weight-semibold'>
									Инцидент № {incident.incident_id}: {incident.ru_name}
								</Typography.Text>

								<div
									className='d-flex align-items-center'
									style={{
										gap: '1rem',
									}}
								>
									<Image
										fallback={imageFallback}
										height={52}
										preview={false}
										src={incident.incidentImgPath ?? ''}
										style={{
											borderRadius: '8px',
										}}
										width={52}
									/>

									<div
										className='d-flex flex-column'
										style={{
											width: 'calc(100% - 52px - 1rem)',
										}}
									>
										<Typography.Text>
											Камера: {incident.camera_id}
										</Typography.Text>
										<Typography.Text>
											Дата и время:{' '}
											{moment(incident.createdAt).format('DD/MM/YYYY HH:mm')}
										</Typography.Text>
									</div>
								</div>
							</div>
						),
					}
			  })
			: [
					{
						key: '0',
						label: <Typography.Text>Нет уведомлений</Typography.Text>,
					},
			  ]

	return (
		<>
			{contextHolder}
			{incidentId && (
				<CreateIncidentModal
					incidentId={incidentId}
					isModalOpen={isModalOpen}
					handleOk={closeModal}
					closeModal={closeModal}
				/>
			)}

			<Dropdown
				arrow
				dropdownRender={menu => {
					return (
						<div
							style={{
								width: 'fit-content',
							}}
						>
							{menu}
						</div>
					)
				}}
				menu={{ items }}
				placement='bottomRight'
				trigger={['click']}
			>
				<Button className='mr-1' icon={<BellOutlined />} type='text' />
			</Dropdown>
		</>
	)
}
