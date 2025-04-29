import { Card, Dropdown, Popover, Space, Spin, Typography } from 'antd'
import { useRef, useState } from 'react'

import {
	IconAlertTriangle,
	IconPlayerPauseFilled,
	IconPlayerPlayFilled,
} from '@tabler/icons-react'

import { ReadCameraModal } from '@/components/app-components/cameras/ReadCameraModal'
import './style.css'

import { CamerasService } from '@/services/CamerasService'

import { SettingFilled } from '@ant-design/icons'

export const CameraCard = (camera: unknown) => {
	const [isReadModalOpen, setIsReadModalOpen] = useState(false)
	const [preview, setPreview] = useState('')
	const [showPlay, setShowPlay] = useState(false)
	const [startStream, setStartStream] = useState(false)
	const imgRef = useRef<string | null>(null)
	const [isPreviewLoading, setIsPreviewLoading] = useState(false)
	const [isCameraWathcLoading, setIsCameraWathcLoading] = useState(false)
	const [initialSelectedIp, setInitialSelectedIp] = useState<string | null>(
		null
	)
	const [isHovered, setIsHovered] = useState(false);

	const cameraWatchAction = (action: number) => {
		setIsCameraWathcLoading(true)

		if (action === 1) {
			const currentSelected = localStorage.getItem('selected')
			if (!initialSelectedIp) {
				setInitialSelectedIp(currentSelected) // Сохраняем старый IP
			}
			localStorage.setItem('selected', camera?.server_ip) // Меняем IP на IP камеры
		} else if (action === 0 && initialSelectedIp) {
			localStorage.setItem('selected', initialSelectedIp) // Возвращаем старый IP
			setInitialSelectedIp(null) // Сбрасываем состояние
		}

		CamerasService.watchCamera({
			camera_id: camera?.camera_id,
			query: { action },
		})
			.then(response => {
				const { data } = response
				setPreview(data?.preview_base64)
			})
			.finally(() => setIsCameraWathcLoading(false))
	}

	const deleteHendler = () => {
		CamerasService.deleteCameraById({ id: camera?.camera_id }).then(
			response => {
				if (response.status === 200) {
					window.location.reload()
				}
			}
		)
	}

	return (
		<>
			<ReadCameraModal
				camera={camera}
				isModalOpen={isReadModalOpen}
				handleCancel={() => {
					cameraWatchAction(0)
					setIsReadModalOpen(false)
					setIsPreviewLoading(true)
					CamerasService.getCamerasPreview({
						id: camera?.camera_id,
						server_ip: camera?.server_ip,
					}).then(response => {
						const { data } = response
						setPreview(data?.preview_base64)
						setIsPreviewLoading(false)
					})
				}}
			/>

			<Card
				size='small'
				style={{
					border: 0,
					backgroundImage: isPreviewLoading
						? 'none'
						: !startStream
						? `url(data:image/jpeg;base64,${camera?.preview_base64})`
						: `url(http://${camera?.server_ip}:8080/streamer/stream/${camera?.camera_id})`,
					backgroundSize: 'cover',
					borderRadius: '1rem',
					boxShadow: isHovered
					? '0 0 12px rgba(114, 46, 209, 0.3)' // фиолетовое свечение
					: '0 4px 16px rgba(0, 0, 0, 0.04)',
					transform: isHovered ? 'scale(1.005)' : 'scale(1)',
					transition: 'box-shadow 0.2s ease-in-out, transform 0.3s ease-in-out',
				}}
				onMouseEnter={() => setIsHovered(true)}
				onMouseLeave={() => setIsHovered(false)}
			>
				<div style={{ display: 'flex', justifyContent: 'flex-end' }}>
					{localStorage.getItem('ROLE') !== 'employee' && (
						<Dropdown
							disabled={localStorage.getItem('ROLE') !== 'superadmin'}
							menu={{
								items: [
									{
										key: '1',
										danger: true,
										label: <span onClick={deleteHendler} >удалить</span>,
									},
								],
							}}
						>
							<span
								style={{
									color: 'white',
									padding: '6px',
									borderRadius: '50%',
									display: 'inline-flex',
									alignItems: 'center',
									justifyContent: 'center',
									cursor: 'pointer',
								}}
							>
								<SettingFilled style={{ fontSize: '20px', color: 'white', }} />
							</span>
						</Dropdown>
					)}
				</div>
				<div
					style={{
						position: 'relative',
					}}
					onMouseEnter={evt => {
						evt.currentTarget.style.cursor = 'pointer'
						setShowPlay(true)
					}}
					onMouseLeave={evt => {
						setShowPlay(false)
					}}
					onDoubleClick={() => {
						setIsReadModalOpen(true)
						cameraWatchAction(1)
					}}
				>
					<div
						id='background'
						style={{
							width: '100%',
							paddingTop: '60%',
							backgroundColor: 'transparent',
							backgroundSize: 'cover',
							borderRadius: '4px',
							boxShadow: camera?.status
								? 'inset 0 0 0 1000px rgba(0, 0, 0, 0)'
								: 'inset 0 0 0 1000px rgba(0, 0, 0, 0.85)',
						}}
					>
						{isPreviewLoading && (
							<div
								style={{
									position: 'absolute',
									top: 0,
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
						)}
						{camera?.status === 'inactive' && (
							<Popover content='Камера неактивна'>
								<IconAlertTriangle
									color='#ffd666'
									style={{
										position: 'absolute',
										top: '50%',
										left: '50%',
										transform: 'translate(-50%, -50%)',
									}}
									size={62}
									stroke={1.5}
								/>
							</Popover>
						)}
					</div>
					<div
						style={{
							position: 'absolute',
							top: '50%',
							left: '50%',
							transform: 'translate(-50%, -50%)',
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							gap: '4px',
							pointerEvents: 'auto',
							zIndex: 20,
							opacity: showPlay ? 1 : 0,
							transition: 'opacity 0.3s ease-in-out',
						}}
					>
						{startStream ? (
							<div>
								<IconPlayerPauseFilled
									className='play-icon'
									size={63}
									style={{ filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5))' }}
									onClick={() => {
										cameraWatchAction(0)
										setStartStream(false)

										CamerasService.getCamerasPreview({
											id: camera?.camera_id,
											server_ip: camera?.server_ip,
										}).then(response => {
											const { data } = response
											setPreview(data?.preview_base64)
										})
									}}
								/>
							</div>
						) : (
							<div>
								<IconPlayerPlayFilled
									className='play-icon'
									size={63}
									style={{ filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5))' }}
									onClick={() => {
										cameraWatchAction(1)
										setStartStream(true)
									}}
								/>
							</div>
						)}
					</div>
				</div>
			</Card>
			<div style={{ minHeight: '28px', margin: '-15px 0px 15px 0px' }}>
				<Typography.Text
					style={{ fontSize: '16px', fontWeight: 500, color: 'black' }}
				>
					{camera.server_name && camera.server_name}: {camera?.name}
				</Typography.Text>
			</div>

		</>
	)
}
