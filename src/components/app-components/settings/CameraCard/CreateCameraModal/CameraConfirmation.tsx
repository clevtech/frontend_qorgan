import { Alert, Button, Modal } from 'antd'
import { Dispatch, SetStateAction } from 'react'

import { ExclamationCircleOutlined } from '@ant-design/icons'

import { CameraCreate } from '@/types/custom'

import imageFallback from '@/assets/imageFallback-16-9.png'
import { API_BASE_URL } from '@/configs/AppConfig'

type Props = {
	camera: CameraCreate
	onClose: () => void
	setCamera: Dispatch<SetStateAction<CameraCreate>>
	setStep: Dispatch<SetStateAction<number>>
}

export const CameraConfirmation = ({
	camera,
	onClose,
	setCamera,
	setStep,
}: Props) => {
	return (
		<>
			<div
				className='d-flex flex-column'
				style={{
					gap: '1.5rem',
				}}
			>
				<Alert
					message='Соединение успешно установлено. Продолжайте, убедившись, что выбрали нужную камеру, далее, настройте функциональность.'
					type='success'
				/>

				<img
					alt={`Preview from camera linked to IP-address: ${camera.ipAddress}`}
					src={
						camera.cameraId
							? `${API_BASE_URL}/streamer/stream/${camera.cameraId}`
							: imageFallback
					}
					style={{
						borderRadius: '0.625rem',
					}}
				/>
			</div>

			<div
				className='d-flex justify-content-end'
				style={{
					padding: '10px 16px',
					margin: '24px -24px -24px -24px',

					borderTop: '1px solid #e6ebf1',
				}}
			>
				<Button
					onClick={() => {
						Modal.confirm({
							cancelText: 'Нет',
							content: 'Все введенные данные будут утеряны.',
							icon: <ExclamationCircleOutlined />,
							okText: 'Да',
							okType: 'danger',
							title: 'Вы уверены, что хотите закрыть окно?',
							onOk: () => {
								onClose()

								setCamera({
									ipAddress: '',
									modules: [],
									name: '',
									password: '',
									previewPath: '',
									status: false,
									username: '',
								})
								setStep(1)
							},
						})
					}}
				>
					Отменить
				</Button>
				<Button
					disabled={localStorage.getItem('ROLE') !== 'superadmin'}
					onClick={() => {
						setStep(prev => prev + 1)
					}}
					style={{ marginLeft: '8px' }}
					type='primary'
				>
					Продолжить
				</Button>
			</div>
		</>
	)
}
