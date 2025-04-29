import { Modal, Typography, Spin } from 'antd'
import { useEffect, useState } from 'react'

import { API_BASE_URL } from '@/configs/AppConfig'
import { CameraRead } from '@/types/custom'

type Props = {
	camera: CameraRead | undefined
	isModalOpen: boolean
	handleCancel: () => void
}

export const ReadCameraModal = (props: Props) => {
	const { camera, isModalOpen, handleCancel } = props
	const [loading, setLoading] = useState(true)
	const [streamUrl, setStreamUrl] = useState<string | null>(null)

	useEffect(() => {
		if (isModalOpen && camera) {
			setLoading(true) 
			setStreamUrl(`http://${localStorage.getItem('selected')}:8080/streamer/stream/${camera.camera_id}`)

			const timeout = setTimeout(() => setLoading(false), 3000)

			return () => clearTimeout(timeout) 
		} else {
			setStreamUrl(null)
			setLoading(true)
		}
	}, [isModalOpen, camera])

	if (!camera) return null

	return (
		<Modal
			footer={null}
			onCancel={handleCancel}
			open={isModalOpen}
			title={
				<div style={{ fontSize: '15px', fontWeight: 500 }}>
					<Typography.Text>{camera.server_name}: {camera.name}</Typography.Text>
					<Typography.Text className='text-monospace'>
						{camera.ipAddress}
					</Typography.Text>
				</div>
			}
			width={960}
		>
			{/* Показываем спиннер, пока поток "загружается" */}
			{loading && (
				<div
					style={{
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
						height: '300px',
					}}
				>
					<Spin size='large' />
				</div>
			)}

			{streamUrl && (
				<img
					id='mjpeg-stream'
					style={{
						width: '100%',
						display: loading ? 'none' : 'block', // Скрываем, пока идет загрузка
					}}
					src={streamUrl}
					alt='Camera Stream'
				/>
			)}
		</Modal>
	)
}
