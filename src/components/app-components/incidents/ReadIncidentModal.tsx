import { Button, Divider, Modal, Typography } from 'antd'
import { useEffect, useState } from 'react'

import {
	IconCalendarTime,
	IconClock,
	IconMessage,
	IconVideo,
	IconAlertCircle
} from '@tabler/icons-react'
import moment from 'moment'

import { ICON_SIZE, ICON_STROKE } from '@/constants/IconConstant'
import { IncidentsService } from '@/services/IncidentsService'
import imageFallback from '@/assets/imageFallback-1-1.png'

import { API_BASE_URL } from '@/configs/AppConfig'
import { MODAL_WIDTH } from '@/constants/LayoutConstant'
import axios from 'axios'
import { FieldWrapper } from './FieldWrapper'

type ReadIncidentModalProps = {
	incidentId: string
	isModalOpen: boolean
	handleCancel: () => void
	handleOk: () => void
}

export const ReadIncidentModal = ({
	incidentId,
	isModalOpen,
	handleCancel,
	handleOk,
}: ReadIncidentModalProps) => {
	const [incident, setIncident] = useState<unknown | undefined>()
	const [photo, setPhoto] = useState<unknown | undefined>(null)
	// const [video, setVideo] = useState<unknown | undefined>(null)
	const [videoUrl, setVideoUrl] = useState<string>(''); // Храним URL видео

	useEffect(() => {
		if (incident?.incidentVideoPath) {
			setVideoUrl(API_BASE_URL + '/files_api/get_video' + incident.incidentVideoPath.slice(5));
		} else {
			setVideoUrl(''); // Сбрасываем, если видео нет
		}
	}, [incident]); // Обновляется при смене инцидента

	useEffect(() => {
		IncidentsService.getIncidentsById({
			path: {
				id: incidentId,
			},
		}).then(response => {
			const { data }: { data: unknown } = response

			setIncident(data)
		})
	}, [incidentId])

	// useEffect(() => {
	// 	if (incident) {
	// 		axios
	// 			.get(
	// 				API_BASE_URL +
	// 					'files_api/get_jpg/' +
	// 					incident?.incidentImgPath?.slice(9)
	// 			)
	// 			.then(response => {
	// 				const { data }: { data: unknown } = response

	// 				setPhoto(data.base64)
	// 			})
	// 	}
	// }, [incident])


	return (
		<Modal
			footer={
				<Button
					type='primary'
					onClick={() => {

						handleOk()
					}}
				>
					ОК
				</Button>
			}
			onCancel={() => {
				setIncident(undefined)

				handleCancel()
			}}
			open={isModalOpen}
			title={
				<Typography.Text className='font-size-base'>
					{`Инцидент ${incidentId}`} –{' '}
					{/* {incident?.typeOfIncident.toLowerCase()} */}
				</Typography.Text>
			}
			width={MODAL_WIDTH}
		>
			<div
				className='d-flex align-items-start'
				style={{
					gap: '1rem',
				}}
			>
				{incident && (
					<video
						key={incident.incident_id} // Форсируем ререндер
						loop
						controls
						poster={`data:image/webp;base64,${incident.incident_base64}`} // Подставляем превью
						style={{
						borderRadius: '8px',
						}}
						width="80%"
					>
						{videoUrl && <source src={videoUrl} type="video/mp4" />}
					</video>
					)}


				{/* <Image
					fallback={imageFallback}
					preview={false}
					src={photo ? `data:image/png;base64, ${photo}` : ''}
					style={{
						borderRadius: '8px',
					}}
					width='50%'
				/> */}
				{/* <Image
					fallback={imageFallback}
					preview={false}
					src={video ? `data:image/png;base64, ${video}` : ""}
					style={{
						borderRadius: '8px',
					}}
					width='50%'
				/> */}{' '}
				<div
					className='my-2'
					style={{
						width: '50%',
					}}
				>
					<FieldWrapper>
						<IconVideo size={ICON_SIZE} stroke={ICON_STROKE} />

						<Typography.Text>
							{' '}
							<span>Тип инцидента: {incident?.ru_name}</span> 
						</Typography.Text>
					</FieldWrapper>

					<Divider className='my-2' />

					<FieldWrapper>
						<IconCalendarTime size={ICON_SIZE} stroke={ICON_STROKE} />

						<Typography.Text>
							{`Дата: ${moment(incident?.createdAt).format('DD.MM.YYYY')}`}
						</Typography.Text>
					</FieldWrapper>
					<Divider className='my-2' />
					<FieldWrapper>
						<IconClock size={ICON_SIZE} stroke={ICON_STROKE} />

						<Typography.Text>
							{`Время: ${moment(incident?.createdAt).format('hh:mm')}`}
						</Typography.Text>
					</FieldWrapper>
					<Divider className='my-2' />
					<FieldWrapper>
						<IconAlertCircle size={ICON_SIZE} stroke={ICON_STROKE} />
					<Typography.Text>
									{`Отреагировал: ${incident?.who_reacted}`}
								</Typography.Text>
					</FieldWrapper>

					{incident?.responseTime !== null && (
						<>
							<Divider className='my-2' />

							<FieldWrapper>
								<IconClock size={ICON_SIZE} stroke={ICON_STROKE} />

								<Typography.Text>
									{`Время реагирования: ${moment(incident?.responseTime).format(
										'hh:mm'
									)}`}
								</Typography.Text>
							</FieldWrapper>
						</>
					)}

					{incident?.comment !== null && (
						<>
							<Divider className='my-2' />

							<FieldWrapper>
								<IconMessage size={ICON_SIZE} stroke={ICON_STROKE} />

								<Typography.Text>{`Комментарий: ${incident?.comment}`}</Typography.Text>
							</FieldWrapper>
						</>
					)}
				</div>
			</div>
		</Modal>
	)
}
