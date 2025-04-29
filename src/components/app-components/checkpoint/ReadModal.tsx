import { Divider, Modal, Typography, Image } from 'antd'
import { useEffect, useState } from 'react'

import {
	IconCalendarTime,
	IconClock,
	IconVideo,
	IconAlertCircle 
} from '@tabler/icons-react'
import moment from 'moment'

import { ICON_SIZE, ICON_STROKE } from '@/constants/IconConstant'
// import imageFallback from '@/assets/imageFallback-1-1.png';
import imageFallback from '@/assets/imageFallback-1-1.png'
import { FaceCheckpointsService } from '@/services/FaceCheckpointsService'

import { API_BASE_URL } from '@/configs/AppConfig'
import { MODAL_WIDTH } from '@/constants/LayoutConstant'
import axios from 'axios'
import { FieldWrapper } from './FieldWrapper'

type ReadIncidentModalProps = {
	incidentId: string
	isModalOpen: boolean
	setModalOpen: any
}

export const ReadModal = ({
	incidentId,
	isModalOpen,
	setModalOpen,
}: ReadIncidentModalProps) => {
	const [photo, setPhoto] = useState<unknown | undefined>(null)

	useEffect(() => {
		if (incidentId) {
			axios
				.get(
					API_BASE_URL +
						'/files_api/get_jpg/' +
						incidentId?.visit_image
				)
				.then(response => {
					const { data }: { data: unknown } = response

					setPhoto(data.base64)
				})
		}
	}, [incidentId])

	return (
		<Modal
			onOk={() => setModalOpen(false)}
			onCancel={() => setModalOpen(false)}
			open={isModalOpen}
			title={
				<Typography.Text className='font-size-base'>
					{`Инцидент ${incidentId}`} –{' '}
				</Typography.Text>
			}
			width={800}
		>
			<div
				className='d-flex align-items-start'
				style={{
					gap: '1rem',
				}}
			>
				<Image
					fallback={imageFallback}
					preview={false}
					src={incidentId ? `data:image/png;base64, ${photo}` : ''}
					style={{
						borderRadius: '8px',
					}}
					height='50%'
				/>
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
							<span>Камера: {incidentId?.attendance_id}</span>
						</Typography.Text>
					</FieldWrapper>

					<Divider className='my-2' />

					<FieldWrapper>
						<IconCalendarTime size={ICON_SIZE} stroke={ICON_STROKE} />

						<Typography.Text>
							{`Дата: ${moment(incidentId?.datetime).format('DD.MM.YYYY')}`}
						</Typography.Text>
					</FieldWrapper>
					<Divider className='my-2' />
					<FieldWrapper>
						<IconClock size={ICON_SIZE} stroke={ICON_STROKE} />

						<Typography.Text>
							{`Время: ${moment(incidentId?.datetime).format('hh:mm')}`}
						</Typography.Text>
					</FieldWrapper>
					<Divider className='my-2' />
					<FieldWrapper>
						<IconAlertCircle size={ICON_SIZE} stroke={ICON_STROKE} />

						<Typography.Text>
							{`Cтатус: ${incidentId?.type ? 'Прибыл' : 'Опоздал'}`}

							
						</Typography.Text>
					</FieldWrapper>
					


				</div>
			</div>
		</Modal>
	)
}
