import { IncidentsService } from '@/services/IncidentsService'
import { Button, Card, Spin, Tag, Typography, Image } from 'antd'
import React, { useCallback, useEffect, useState } from 'react'
import { FixedSizeList as List } from 'react-window'

const { Text } = Typography

interface IncidentProps {
	listWithImages: any[]
	setSelectedIncident: (incident: any) => void
	setDataSource: (updateFn: (prevData: any) => any) => void
	setIsIncidentModalOpen: (isOpen: boolean) => void
	hasMore: boolean
	loadMoreItems: () => Promise<void> // Функция должна возвращать Promise
}

const LazyLoadedIncidentsList: React.FC<IncidentProps> = ({
	listWithImages,
	setSelectedIncident,
	setDataSource,
	setIsIncidentModalOpen,
	hasMore,
	loadMoreItems,
}) => {
	const [visibleItems, setVisibleItems] = useState(20)
	const [isLoading, setIsLoading] = useState(false)
	const [prevLength, setPrevLength] = useState(listWithImages.length) // Запоминаем длину списка

	// Следим за изменениями listWithImages
	useEffect(() => {
		if (listWithImages.length > prevLength) {
			setIsLoading(false) // Отключаем загрузку только после появления новых данных
			setPrevLength(listWithImages.length) // Обновляем запомненную длину списка
		}
	}, [listWithImages.length, prevLength])

	// Функция подгрузки новых элементов
	const onItemsRendered = useCallback(
		async ({ visibleStopIndex }) => {
			if (
				hasMore &&
				visibleStopIndex >= listWithImages.length - 1 &&
				!isLoading
			) {
				setIsLoading(true) // Устанавливаем флаг загрузки перед запросом
				await loadMoreItems() // Загружаем данные (асинхронно)
			}
		},
		[hasMore, listWithImages.length, loadMoreItems, isLoading]
	)

	const fetchIncidentDetails = async (incidentId: number) => {
		try {
			const response = await IncidentsService.getIncidentsById({
				path: { id: incidentId },
			})

			setSelectedIncident(response.data) // Устанавливаем данные инцидента
			setIsIncidentModalOpen(true) // Открываем модалку

			// Обновляем `is_new` у этого инцидента в списке
			setDataSource(prevData => ({
				...prevData,
				incidents: prevData.incidents.map(incident =>
					incident.incident_id === incidentId
						? { ...incident, is_new: false }
						: incident
				),
			}))
		} catch (error) {
			console.error('Ошибка при получении деталей инцидента:', error)
		}
	}

	const IncidentRow = React.memo(({ index, style }) => {
		if (index >= listWithImages.length) return null

		const incident = listWithImages[index]
		return (
			<div style={style}>
				<Card
					key={incident.incident_id}
					style={{ width: '100%', marginBottom: '10px', border: 0 }}
					bodyStyle={{ padding: 0, marginTop: 0}}
				>
					<div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
						<Image
							src={`data:image/webp;base64,${incident.incident_base64}`}
							style={{
								width: '100px',
								height: '100px',
								borderRadius: '1rem',
								objectFit: 'cover',
							}}
							alt={`Incident ${incident.incident_id}`}
						/>
						<div style={{ flex: 1 }}>
							<Text strong>{incident.full_name}</Text>
							<div>
								<Text strong>Камера: </Text>
								<Text>№ {incident.camera_name}</Text>
							</div>
							<div>
								<Text strong>Дата и время: </Text>
								<Text>
									{new Date(incident.createdAt).toLocaleString('ru-RU')}
								</Text>
							</div>
						</div>
						<div
							style={{
								display: 'flex',
								flexDirection: 'column',
								gap: '10px',
								alignItems: 'end',
							}}
						>
							{incident.is_new && (
								<Tag
									style={{
										display: 'inline-block',
										margin: '0',
										padding: '2px 5px 2px 5px',
										lineHeight: '1',
										borderRadius: '7px',
										border: '1px solid #FFA39E',
										fontWeight: '400',
									}}
									color='red'
								>
									Новое
								</Tag>
							)}
							<Button
								type='primary'
								onClick={() => {
									setSelectedIncident({
										...incident,
										preview: `data:image/webp;base64,${incident.incident_base64}`,
									})
									setIsIncidentModalOpen(true)
									fetchIncidentDetails(incident.incident_id)
								}}
							>
								Подробнее
							</Button>
						</div>
					</div>
				</Card>
			</div>
		)
	})

	return (
		<div style={{ height: '400px', width: '100%', position: 'relative' }}>
			{/* Основной список */}
			<List
				height={400}
				itemCount={listWithImages.length}
				itemSize={120}
				width='100%'
				onItemsRendered={({ visibleStopIndex }) =>
					onItemsRendered({ visibleStopIndex })
				}
			>
				{IncidentRow}
			</List>

			{/* Оверлей загрузки */}
			{isLoading && (
				<div
					style={{
						position: 'absolute',
						bottom: 0,
						left: 0,
						width: '100%',
						height: '50px',
						backgroundColor: 'rgba(255, 255, 255, 0.8)',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						zIndex: 10,
					}}
				>
					<Spin size='large' />
				</div>
			)}
		</div>
	)
}

export default LazyLoadedIncidentsList
