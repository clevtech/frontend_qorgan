import robotoRegular from '../../../../public/font/Roboto-Regular.ttf';
import robotoBold from '../../../../public/font/Roboto-Bold.ttf';
import { API_BASE_URL } from '@/configs/AppConfig'
import { IncidentsService } from '@/services/IncidentsService'
import {
	CalendarOutlined,
	ClockCircleOutlined,
	VideoCameraOutlined,
} from '@ant-design/icons'
import fontkit from '@pdf-lib/fontkit'
import { Button, Modal, Typography, Spin } from 'antd'
import axios from 'axios'
import { PDFDocument, rgb } from 'pdf-lib'
import printJS from 'print-js'
import { useEffect, useState } from 'react'

type IncidentModalProps = {
	incident: {
		id: string
		title: string
		camera: string
		datetime: string
		isNew: boolean
		avatar: any
		createdAt: string
		camera_name: string
		ru_name: string
	} | null
	isOpen: boolean
	onClose: () => void
}

export const IncidentModal = ({
	incident,
	isOpen,
	onClose,
}: IncidentModalProps) => {
	const [photo, setPhoto] = useState<unknown | undefined>(null)
	const [videoPath, setVideoPath] = useState<string | undefined>(undefined)
	const [showControls, setShowControls] = useState(false);

	const [frames, setFrames] = useState([])
	const [disabled, setDisabled] = useState(false)
	const [loading, setLoading] = useState(false)

	useEffect(() => {

	}, [incident]) // При изменении incident обновляем фото и видео

	useEffect(() => {
		setDisabled(true)
		setLoading(true)
		if (Object.keys(incident).length) {
			if(incident.incidentImgPath){
				axios
				.get(
					API_BASE_URL +
						'files_api/get_jpg/' +
						incident?.incidentImgPath?.slice(9)
				)
				.then(response => setPhoto(response.data.base64))
			}
			// Обновляем видео
			if (typeof incident.incidentVideoPath === 'string') {
				setVideoPath(
					API_BASE_URL +
						'/files_api/get_video' +
						incident.incidentVideoPath.slice(5)
				)
			} else {
				setVideoPath(undefined) // Если видео нет
			}
		}
		// if (isOpen) {
		// 	IncidentsService.getIncidentsForPDF({ id: incident.incident_id })
		// 		.then(response => {
		// 			setFrames(response.data.frames)
		// 			setDisabled(false)
		// 			setLoading(false)
		// 		})
		// 		.catch(() => {
		// 			setDisabled(true)
		// 			setLoading(false)
		// 		})
		// }
	}, [isOpen])

	// const handlePrint = async () => {
	// 	if (!frames || frames.length === 0) {
	// 		console.warn('Нет данных для печати');
	// 		return;
	// 	}

	// 	const pdfDoc = await PDFDocument.create();
	// 	pdfDoc.registerFontkit(fontkit);
	// 	const pageWidth = 595.28;
	// 	const pageHeight = 841.89;
	// 	const margin = 50;

	// 	const fontBytes = await fetch(robotoRegular).then(res => res.arrayBuffer());
	// 	const boldFontBytes = await fetch(robotoBold).then(res => res.arrayBuffer());

	// 	const font = await pdfDoc.embedFont(fontBytes);
	// 	const boldFont = await pdfDoc.embedFont(boldFontBytes);

	// 	const page = pdfDoc.addPage([pageWidth, pageHeight]);

	// 	// Верхний блок текста
	// 	const textX = margin;
	// 	let currentY = pageHeight - margin;

	// 	page.drawText(`Инцидент: ${incident?.ru_name}`, {
	// 		x: textX + 180,
	// 		y: currentY,
	// 		size: 18,
	// 		font: boldFont,
	// 		color: rgb(0, 0, 0),
	// 	});

	// 	currentY -= 24;
	// 	page.drawText(`Организация: ${incident?.organization}`, {
	// 		x: textX + 260,
	// 		y: currentY - 10,
	// 		size: 14,
	// 		font,
	// 		color: rgb(0.2, 0.2, 0.2),
	// 	});

	// 	currentY -= 20;
	// 	page.drawText(`Камера: ${incident?.camera_name}`, {
	// 		x: textX + 260,
	// 		y: currentY - 10,
	// 		size: 14,
	// 		font,
	// 		color: rgb(0.2, 0.2, 0.2),
	// 	});

	// 	currentY -= 20;
	// 	page.drawText(`Дата: ${new Date(incident?.createdAt).toLocaleDateString('ru-RU')}`, {
	// 		x: textX + 260,
	// 		y: currentY - 10,
	// 		size: 14,
	// 		font,
	// 		color: rgb(0.2, 0.2, 0.2),
	// 	});

	// 	currentY -= 20;
	// 	page.drawText(`Время: ${new Date(incident?.createdAt).toLocaleTimeString('ru-RU', {
	// 		hour: '2-digit',
	// 		minute: '2-digit',
	// 	})}`, {
	// 		x: textX + 260,
	// 		y: currentY - 10,
	// 		size: 14,
	// 		font,
	// 		color: rgb(0.2, 0.2, 0.2),
	// 	});

	// 	// Отступ перед фото
	// 	currentY -= 40;

	// 	let imageY = currentY;
	// 	const maxWidth = pageWidth - 2 * margin;

	// 	// for (const frame of frames) {
	// 	// 	const base64 = frame.replace(/^data:image\/(jpeg|jpg);base64,/, '');
	// 	// 	const imgBytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
	// 	// 	const image = await pdfDoc.embedJpg(imgBytes);

	// 	// 	const scale = maxWidth / image.width;
	// 	// 	const scaled = image.scale(scale * 0.5);

	// 	// 	imageY -= scaled.height;

	// 	// 	page.drawImage(image, {
	// 	// 		x: margin,
	// 	// 		y: imageY + 110,
	// 	// 		width: scaled.width,
	// 	// 		height: scaled.height,
	// 	// 	});

	// 	// 	imageY -= 10; // Отступ между изображениями
	// 	// }

	// 	const pdfBytes = await pdfDoc.save();
	// 	const blob = new Blob([pdfBytes], { type: 'application/pdf' });
	// 	const blobUrl = URL.createObjectURL(blob);
	// 	printJS({ printable: blobUrl, type: 'pdf' });
	// }

	if (!incident) return null

	return (
		<Modal
			title={
				<div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
					<Typography.Text strong>№ {incident.camera_name}</Typography.Text>
					<Typography.Text type='secondary'>{incident.ru_name}</Typography.Text>
				</div>
			}
			open={isOpen}
			onCancel={onClose}
			footer={[
				// <Button key='submit' onClick={handlePrint} disabled={disabled} >
				// 	{ loading ? <Spin/> : disabled ? 'Ошибка при получении данных' : 'Печать PDF' }
				// </Button>,
				<Button key='submit' type='primary' onClick={onClose}>
					Продолжить
				</Button>,
			]}
			width={700} // Увеличиваем ширину модалки
		>
			<div style={{ display: 'flex', gap: '20px' }}>

				<div style={{ flex: '1 1 100%' }}>
					{videoPath ? (
						<video
							key={videoPath} // Важный момент: React будет заново рендерить видео
							loop
							controls={showControls}
							poster={`data:image/png;base64, ${incident.incident_base64}`}
							style={{ borderRadius: '8px', width: '100%' }}
							onCanPlay={() => setShowControls(true)} // или onLoadedData
						>
							<source src={videoPath} type='video/mp4' />
						</video>
					) : (
						<Typography.Text>Нет видео</Typography.Text>
					)}
				</div>

				{/* Блок с текстовой информацией справа */}
				<div
					style={{
						flex: '1 1 60%',
						display: 'flex',
						flexDirection: 'column',
						gap: '10px',
						justifyContent: 'space-evenly',
					}}
				>
					<div>
						<Typography.Text strong>
							<VideoCameraOutlined /> Камера:{' '}
						</Typography.Text>
						<Typography.Text>№ {incident.camera_name}</Typography.Text>
					</div>
					<div>
						<Typography.Text strong>
							<CalendarOutlined /> Дата:{' '}
						</Typography.Text>
						<Typography.Text>
							{new Date(incident.createdAt).toLocaleDateString('ru-RU')}
						</Typography.Text>
					</div>
					<div>
						<Typography.Text strong>
							<ClockCircleOutlined /> Время:{' '}
						</Typography.Text>
						<Typography.Text>
							{new Date(incident.createdAt).toLocaleTimeString('ru-RU', {
								hour: '2-digit',
								minute: '2-digit',
							})}
						</Typography.Text>
					</div>
				</div>
			</div>
		</Modal>
	)
}
