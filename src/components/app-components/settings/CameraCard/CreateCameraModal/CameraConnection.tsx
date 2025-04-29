import { Alert, Button, Form, Input, Modal, Spin, Typography } from 'antd'
import {
	ChangeEvent,
	Dispatch,
	SetStateAction,
	useEffect,
	useState,
} from 'react'

import { ExclamationCircleOutlined } from '@ant-design/icons'

import { StreamService } from '@/services/StreamService'
import { CameraCreate } from '@/types/custom'

type Props = {
	camera: CameraCreate
	handleChange: (event: ChangeEvent<HTMLInputElement>) => void
	onClose: () => void
	setCamera: Dispatch<SetStateAction<CameraCreate>>
	setStep: Dispatch<SetStateAction<number>>
	setCameraId: Dispatch<SetStateAction<number>>
	cameraId: number | string | null
}

export const CameraConnection = ({
	camera,
	handleChange,
	onClose,
	setCamera,
	setStep,
	setCameraId,
	cameraId
}: Props) => {
	const [isConnected, setIsConnected] = useState<boolean>(true)
	const [isDisabled, setIsDisabled] = useState<boolean>(true)
	const [isLoading, setIsLoading] = useState<boolean>(false)

	const handleCheck = async () => {
		setIsLoading(true)

		await StreamService.checkStream({
			ip: camera.ipAddress.split(`:`)[0],
			port: camera.ipAddress.split(`:`)[1],
			username: camera.username || '',
			password: camera.password || '',
		})
			.then(response => {
				setCameraId(response.data.camera_id)
			})
			.finally(() => setIsLoading(false))
	}

	useEffect(() => {
		setIsDisabled(
			camera.ipAddress === '' ||
				camera.password === '' ||
				camera.username === ''
		)
	}, [camera])

	useEffect(() => {
		if (typeof cameraId == 'string') {
			setIsLoading(true)
			StreamService.startStream({
				camera_id: cameraId,
			})
				.then(response => {
					if (response.status == 200) {
						setCamera(prev => ({ ...prev, cameraId }))
						setStep(2)
					}
				})
				.catch((e) => {
					StreamService.deleteCamera(cameraId)
				})
				.finally(() => setIsLoading(false))
		}
	}, [cameraId])

	return (
		<>
			<Spin spinning={isLoading}>
				<div
					className='d-flex flex-column'
					style={{
						gap: '1.5rem',
					}}
				>
					{isConnected ? (
						<Typography.Text className='text-muted'>
							Пожалуйста, введите необходимую информацию для настройки
							подключения к камере.
						</Typography.Text>
					) : (
						<Alert
							message='Соединение с камерой не установлено. Пожалуйста, проверьте корректность введенных данных и попробуйте повторить попытку позднее.'
							type='error'
						/>
					)}

					<div
						className='d-flex flex-column'
						style={{
							gap: '1rem',
						}}
					>
						<Form.Item className='mb-0' label='IP-адрес' required>
							<Input
								name='ipAddress'
								onChange={handleChange}
								value={camera.ipAddress}
							/>
						</Form.Item>

						<Form.Item className='mb-0' label='Логин' required>
							<Input
								name='username'
								onChange={handleChange}
								value={camera.username}
							/>
						</Form.Item>

						<Form.Item className='mb-0' label='Пароль' required>
							<Input
								name='password'
								onChange={handleChange}
								value={camera.password}
							/>
						</Form.Item>
					</div>
				</div>
			</Spin>

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
					disabled={isDisabled || localStorage.getItem('ROLE') !== 'superadmin'}
					loading={isLoading}
					onClick={handleCheck}
					style={{ marginLeft: '8px' }}
					type='primary'
				>
					{!isConnected ? 'Повторить попытку' : 'Продолжить'}
				</Button>
			</div>
		</>
	)
}
