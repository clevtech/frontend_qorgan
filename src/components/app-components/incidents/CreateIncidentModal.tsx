import moment from 'moment'

import {
	Button,
	Divider,
	Form,
	Input,
	Modal,
	Typography,
	notification,
} from 'antd'
import axios from 'axios'
import { useEffect, useState } from 'react'

import { API_BASE_URL } from '@/configs/AppConfig'
import { IconCalendarTime, IconVideo } from '@tabler/icons-react'

import { ICON_SIZE, ICON_STROKE } from '@/constants/IconConstant'
import { IncidentsService } from '@/services/IncidentsService'

import imageFallback from '@/assets/imageFallback-1-1.png'
import { MODAL_WIDTH } from '@/constants/LayoutConstant'
import { ClockCircleOutlined } from '@ant-design/icons'
import { FieldWrapper } from './FieldWrapper'

type CreateIncidentModalProps = {
	incidentId: string
	isModalOpen: boolean
	handleOk: () => void
	warning?: boolean
	closeModal: () => void
}

export const CreateIncidentModal = ({
	incidentId,
	isModalOpen,
	handleOk,
	closeModal,
	warning,
}: CreateIncidentModalProps) => {
	const [form] = Form.useForm()

	const [incident, setIncident] = useState<unknown | undefined>()
	const [photo, setPhoto] = useState<unknown | undefined>(null)
	const [isDisabled, setIsDisabled] = useState<boolean>(true)

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

	const updateIncident = async () => {
		const comment = form.getFieldValue('comment')

		await IncidentsService.updateIncidents(
			{
				path: {
					id: incidentId,
				},
			},
			{
				comment: comment,
				who_reacted: `${localStorage.getItem('USER_FULL_NAME')}`,
			}
		)
			.then(response => {
				const { status } = response

				const acceptedStatuses = [200, 201]

				if (acceptedStatuses.includes(status)) {
					notification.success({
						message: 'Успешно',
						description: 'Инцидент успешно обработан',
					})
				}

				form.resetFields()

				setIsDisabled(true)
			})
			.catch(() => {
				notification.error({
					message: 'Ошибка',
					description: 'Произошла ошибка при обработке инцидента',
				})
			})
	}

	useEffect(() => {
		if (incident?.incidentImgPath) {
			axios
				.get(
					API_BASE_URL +
						'/files_api/get_jpg/' +
						incident?.incidentImgPath.split(`/`)[1]
				)
				.then(response => {
					const { data }: { data: unknown } = response

					setPhoto(data.base64)
				})
		}
	}, [incident])

	// if (warning) {
	//     if (!incident) return null;
	// } else {
	//     if (!incident || incident.comment !== null) return null;
	// }

	return (
		<Modal
			closable={true}
			onCancel={closeModal}
			title={null}
			footer={
				<Button
					disabled={isDisabled || localStorage.getItem('ROLE') !== 'superadmin'}
					onClick={async () => {
						await updateIncident()

						handleOk()

						setIncident(undefined)
					}}
					type='primary'
				>
					Реагировать
				</Button>
			}
			keyboard={true}
			maskClosable={true}
			onOk={handleOk}
			open={isModalOpen}
			// title={
			// 	<Typography.Text className='font-size-base'>
			// 		{/* {`Инцидент № ${incident?.incidentNumber}`} – {incident?.typeOfIncident.toLowerCase()} */}
			// 	</Typography.Text>
			// }
			width={MODAL_WIDTH}
			zIndex={9999}
		>
			<div
				className='d-flex align-items-start'
				style={{
					gap: '1rem',
					padding:'10px'
				}}
			>
				{incident && (
					<video
						autoPlay
						loop
						controls
						poster={
							incident?.incidentImgPath
								? `data:image/png;base64, ${photo}`
								: imageFallback
						}
						style={{
							borderRadius: '8px',
						}}
						width='80%'
					>
						{incident.incidentVideoPath?.split(`.`)[1] === 'mp4' && (
							<source
								src={
									typeof incident.incidentVideoPath == 'string'
										? API_BASE_URL +
										  '/files_api/get_video' +
										  incident?.incidentVideoPath?.slice(5)
										: ''
								}
								type='video/mp4'
							/>
						)}
					</video>
				)}

				{/* <Image
                    fallback={imageFallback}
                    preview={false}
                    src={incident.incidentImgPath ?? ''}
                    style={{
                        borderRadius: '8px',
                    }}
                    width='50%'
                /> */}

				<div
					className='my-2'
					style={{
						width: '50%',
					}}
				>
					<FieldWrapper>
						<IconVideo style={{ fontSize: `25px` }} stroke={ICON_STROKE} />

						<Typography.Text>
							Тип инцидента: {incident?.ru_name}
						</Typography.Text>
					</FieldWrapper>

					<Divider className='my-2' />

					<FieldWrapper>
						<IconCalendarTime
							style={{ fontSize: `25px` }}
							stroke={ICON_STROKE}
						/>

						<Typography.Text>
							Дата: {moment(incident?.createdAt).format('DD/MM/YYYY HH:mm')}
						</Typography.Text>
					</FieldWrapper>

					<Divider className='my-2' />

					<FieldWrapper>
						<ClockCircleOutlined style={{ fontSize: `${ICON_SIZE}px` }} />

						<Typography.Text>
							Время:{`  `}
							{moment(incident?.createdAt).format('HH:mm')}
						</Typography.Text>
					</FieldWrapper>
				</div>
			</div>

			<div className='mt-3'>
				<Form form={form} layout='vertical' onFinish={updateIncident}>
					<Form.Item
						className='mb-0'
						name='comment'
						label='Комментарий реагирования'
						rules={[
							{
								required: true,
								message: 'Комментарий обязателен (минимум 10 символов)',
								min: 10,
							},
						]}
					>
						<Input
							onChange={evt => {
								if (
									evt.target.value !== '' &&
									evt.target.value !== null &&
									evt.target.value.length >= 10
								) {
									setIsDisabled(false)
								} else {
									setIsDisabled(true)
								}
							}}
						/>
					</Form.Item>
				</Form>
			</div>
		</Modal>
	)
}
