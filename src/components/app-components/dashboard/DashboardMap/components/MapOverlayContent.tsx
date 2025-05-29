import drone from '@/assets/drone.png'
import { Tooltip } from 'antd'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useMap } from 'react-leaflet'
import useWebSocket from 'react-use-websocket'
import { centerKazakhstan } from '../constants/mapConstants'

const getDroneStyle = (angleDeg: number, distance: number) => {
	const offset = ((distance - 100) / 900) * 615 // можно подогнать под твою карту
	return {
		position: 'absolute' as const,
		left: '50%',
		bottom: '-7%',
		transform: `
			translate(-50%, -50%)
			rotate(${angleDeg}deg)
			translateY(-${offset}px)
			rotate(${-angleDeg}deg)
		`,
		width: '5%',
	}
}

const getTitleStyle = (angleDeg: number, distance: number) => {
	const offset = ((distance - 100) / 900) * 615 // можно подогнать под твою карту
	return {
		position: 'absolute' as const,
		left: '54.5%',
		bottom: '9%',
		transform: `
			translate(-50%, -50%)
			rotate(${angleDeg}deg)
			translateY(-${offset}px)
			rotate(${-angleDeg}deg)
		`,
		width: '15%',
	}
}

const MapOverlayContent = () => {
	const map = useMap()
	const overlayPane = map.getPanes().overlayPane
	const [position, setPosition] = useState<{ x: number; y: number }>({
		x: -20,
		y: -20,
	})

	const [modules, setModules] = useState<any>([])

	const [moduleStates, setModuleStates] = useState<
		{ direction: number; status: number }[]
	>([])

	const [scale, setScale] = useState(1)

	const { lastMessage } = useWebSocket(
		`ws://${window.location.hostname}:8080/ws/statuses/`,
		{
			onOpen: () => console.log('WebSocket connection opened'),
			onClose: () => console.log('WebSocket connection closed'),
			onError: event => console.error('WebSocket error:', event),
			shouldReconnect: () => true,
			reconnectAttempts: 10,
			reconnectInterval: 3000,
		}
	)

	useEffect(() => {
		if (lastMessage?.data) {
			try {
				const incoming = JSON.parse(lastMessage.data)
				console.log(incoming.statuses)
				setModuleStates(incoming.statuses)
			} catch (err) {
				console.error('Ошибка при парсинге WebSocket-сообщения:', err)
			}
		}
	}, [lastMessage])

	useEffect(() => {
		const update = () => {
			const point = map.latLngToContainerPoint(centerKazakhstan)
			setPosition({ x: point.x, y: point.y })
			const currentZoom = map.getZoom()
			const baseZoom = 13
			const scale = Math.pow(2, currentZoom - baseZoom)
			setScale(scale)
		}
		update()
		map.on('zoomend moveend', update)
		return () => {
			map.off('zoomend moveend', update)
		}
	}, [map])

	const getDronePosition = (num: number, angle: number) => {
		const found = moduleStates.find(m => m.direction === num)
		console.log(found)
		if (found && found.distance) {
			return (
				<div>
					<h2 style={getTitleStyle(angle, found.distance)}>
						БПЛА:{' '}
						{Number.parseInt(found.distance) < 100
							? `<100 м`
							: Number.parseInt(found.distance)}{' '}
						м
					</h2>
					<img
						src={drone}
						style={getDroneStyle(angle, found.distance)} // 0.5 = 50% дистанции
					/>
				</div>
			)
		}
		return null
	}

	const renderModuleTooltip = (direction: number, pathElement: JSX.Element) => {
		const module = modules.find((m: any) => m.direction === direction)
		if (!module) return pathElement

		const tooltipContent = (
			<div>
				<div>
					<strong>{module.name}</strong>
				</div>
				<div>Угол: {module.angle}°</div>
				<div>Коорд: {module.coordinates?.join(', ')}</div>
				<div>Частоты: {module.frequencies?.[0]?.join(', ')}</div>
			</div>
		)

		return <Tooltip title={tooltipContent}>{pathElement}</Tooltip>
	}

	const getFillColor = (direction: number) => {
		console.log(moduleStates)
		const found = moduleStates.find(m => m.direction === direction)
		if (!found) return '#AAC5FF' // отсутствует
		if (found.status === 0) return '#407BFF' // в наличии
		if (found.status === 1) return '#D63604' // включен
		return '#AAC5FF'
	}

	return createPortal(
		<div
			style={{
				position: 'absolute',
				left: position.x,
				top: position.y,
				transform: `translate(-50%, -50%) scale(${scale})`,
				zIndex: 1000,
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'flex-end',
				height: '50dvh',
			}}
		>
			Первый дрон
			{getDronePosition(0, -65)}
			{getDronePosition(1, -21)}
			{getDronePosition(2, 25)}
			{getDronePosition(3, 70)}
			<svg
				width={1745}
				height={738}
				viewBox='0 0 1745 1496'
				fill='none'
				xmlns='http://www.w3.org/2000/svg'
				style={{
					transform: 'scale(0.3)',
					transformOrigin: 'center',
					marginBottom: '37rem',
					marginRight: '10rem',
				}}
			>
				{renderModuleTooltip(
					0,
					<path
						d='M 434.272 1009.76 C 322.045 1121.99 256.799 1272.76 251.814 1431.4 L 875.506 1451 L 434.272 1009.76 Z'
						fill={getFillColor(0)}
						fillOpacity={0.41}
					/>
				)}
				{renderModuleTooltip(
					1,
					<path
						d='M 875.506 826.999 C 716.795 826.999 564.045 887.476 448.349 996.122 L 875.506 1451 L 875.506 826.999 Z'
						fill={getFillColor(1)}
						fillOpacity={0.41}
					/>
				)}
				{renderModuleTooltip(
					2,
					<path
						d='M 1316.74 1009.76 C 1204.52 897.538 1053.74 832.292 895.106 827.307 L 875.506 1451 L 1316.74 1009.76 Z'
						fill={getFillColor(2)}
						fillOpacity={0.41}
					/>
				)}
				{renderModuleTooltip(
					3,
					<path
						d='M 1499.51 1451 C 1499.51 1291.12 1438.14 1137.34 1328.06 1021.38 L 875.506 1451 L 1499.51 1451 Z'
						fill={getFillColor(3)}
						fillOpacity={0.41}
					/>
				)}
			</svg>
		</div>,
		overlayPane
	)
}

export default MapOverlayContent
