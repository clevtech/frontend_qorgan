import drone from '@/assets/drone.png'
import 'leaflet/dist/leaflet.css'
import { useEffect, useState } from 'react'
import { MapContainer, SVGOverlay, TileLayer, useMap } from 'react-leaflet'
import { centerKazakhstan } from '../constants/mapConstants'

import useWebSocket from 'react-use-websocket'

const MapResizer = ({ visible }: { visible: boolean }) => {
	const map = useMap()
	useEffect(() => {
		if (visible) {
			setTimeout(() => {
				map.invalidateSize()
			}, 300)
		}
	}, [visible, map])
	return null
}

export const DashboardMap = (props: any) => {
	const [socketUrl, setSocketUrl] = useState(
		props.switched
			? `wss://${window.location.hostname}/backend/ws/statuses_demo/`
			: `wss://${window.location.hostname}/backend/ws/statuses/`
	)
	const [boundsKazakhstan, setBoundsKazakhstan] = useState<
		[[number, number], [number, number]]
	>([
		[centerKazakhstan.lat - 0.09, centerKazakhstan.lng - 0.15],
		[centerKazakhstan.lat + 0.2288888, centerKazakhstan.lng + 0.1492341],
	])
	const { data = [], zoom = 4, data: selectedRow = null } = props
	const [modules, setModules] = useState<any>([])

	const heigth = selectedRow ? 490 : 870
	const [moduleStates, setModuleStates] = useState<any>({})

	// let groupedData1 = data.map(item => {
	// 	return {
	// 		lat: item?.lat ?? 0,
	// 		lng: item?.long ?? 0,
	// 		url: 'http://' + item.ip_addr,
	// 	}
	// })

	useEffect(() => {
		if (selectedRow) {
			setSocketUrl(`wss://${window.location.hostname}/backend/`)
		} else {
			setSocketUrl(
				props.switched
					? `wss://${window.location.hostname}/backend/ws/statuses_demo/`
					: `wss://${window.location.hostname}/backend/ws/statuses/`
			)
		}
	}, [props.switched, selectedRow])

	const { lastMessage } = useWebSocket(socketUrl, {
		onOpen: () => console.log('WebSocket connection opened'),
		onClose: () => console.log('WebSocket connection closed'),
		onError: event => console.error('WebSocket error:', event),
		shouldReconnect: () => true,
		reconnectAttempts: 10,
		reconnectInterval: 3000,
	})

	useEffect(() => {
		if (lastMessage?.data) {
			try {
				const incoming = JSON.parse(lastMessage.data)
				setModuleStates( props.switch ? incoming.statuses : incoming )
			} catch (err) {
				console.error('Ошибка при парсинге WebSocket-сообщения:', err)
			}
		}
	}, [lastMessage])

	const renderModuleTooltip = (direction: number, pathElement: JSX.Element) => {
		const module = modules.find((m: any) => m.direction === direction)

		// Центр SVG, соответствующий centerKazakhstan
		const centerX = 233
		const centerY = 242

		const textLabel = module ? (
			<text
				x={centerX}
				y={centerY + direction * 15}
				fontSize='8'
				fill='white'
				stroke='black'
				strokeWidth='0.5'
				textAnchor='middle'
			>
				{module.name}
			</text>
		) : null

		return (
			<g>
				{pathElement}
				{textLabel}
			</g>
		)
	}

	const getFillColor = (direction: number) => {
		if (selectedRow) {
			if (selectedRow.direction === direction) {
				return '#D63604'
			} else {
				return '#AAC5FF'
			}
		}

		const found = moduleStates?.statuses?.find(
			(m: any) => m.direction === direction
		)
		if (!found) return '#AAC5FF'
		if (found.status === 1) return '#D63604'
		if (found.status === 0) return '#407BFF'
		return '#AAC5FF'
	}

	const renderDrone = (distance: number, direction: number) => {
		const centerX = 233
		const centerY = 242
		const maxRadius = 238

		const t = distance / 1000
		const r = t * maxRadius

		const angleByDirection: Record<number, number> = {
			0: 25,
			1: 68,
			2: 113,
			3: 156,
		}

		const angle = angleByDirection[direction] ?? 0
		const rad = (angle * Math.PI) / 180
		const x = centerX + r * Math.cos(rad)
		const y = centerY + r * Math.sin(rad)

		return (
			<>
				<text
					x={x + 10}
					y={y - 5}
					fontSize='5'
					fill='black'
					stroke='black'
					strokeWidth='0.4'
					textAnchor='middle'
				>
					БПЛА: {Math.round(distance)}
				</text>
				<image href={drone} x={x} y={y} width='20' height='20' />
			</>
		)
	}


	return (
		<div style={{ position: 'relative' }}>
			<MapContainer
				// bounds={boundsKazakhstan}
				center={centerKazakhstan}
				zoom={zoom}
				minZoom={false ? 13 : 14}
				maxBounds={boundsKazakhstan}
				maxBoundsViscosity={0}
				// zoom={false}
				style={{ height: `${heigth}px`, borderRadius: 10 }}
			>
				<TileLayer url='/tiles/{z}/{x}/{y}.png' opacity={1} />
				<MapResizer visible={true} />
				<SVGOverlay
					bounds={
						false
							? [
									[centerKazakhstan.lat - 0.1, centerKazakhstan.lng - 0.1],
									[centerKazakhstan.lat + 0.05, centerKazakhstan.lng + 0.18],
							  ]
							: [
									[centerKazakhstan.lat - 0.075, centerKazakhstan.lng - 0.075],
									[centerKazakhstan.lat + 0.075, centerKazakhstan.lng + 0.075],
							  ]
					}
				>
					<svg
						xmlns='http://www.w3.org/2000/svg'
						viewBox='0 0 484.188 495.572'
						style={{
							transform: 'scale(0.3) rotate(-73deg)',
							transformOrigin: 'center',
							pointerEvents: 'auto',
						}}
					>
						{renderModuleTooltip(
							3,
							<path
								d='M 242.832 419.064 C 242.832 356.993 219.006 297.291 176.269 252.271 L 0.573 419.064 L 242.832 419.064 Z'
								fill={getFillColor(3)}
								fillOpacity={0.41}
								style={{
									strokeWidth: 1,
									transformOrigin: '121.703px 335.667px 0px',
									pointerEvents: 'auto',
								}}
								transform='matrix(-1, 0, 0, -1, 0, 0)'
							/>
						)}
						{renderModuleTooltip(
							2,
							<path
								d='M 242.832 323.106 C 199.266 279.538 140.728 254.207 79.142 252.271 L 71.532 494.409 L 242.832 323.106 Z'
								fill={getFillColor(2)}
								fillOpacity={0.41}
								style={{
									strokeWidth: 1,
									transformOrigin: '157.183px 373.339px 0px',
									pointerEvents: 'auto',
								}}
								transform='matrix(-1, 0, 0, -1, 0, 0)'
							/>
						)}
						{renderModuleTooltip(
							1,
							<path
								d='M 408.667 252.271 C 347.053 252.271 287.747 275.75 242.831 317.93 L 408.667 494.528 L 408.667 252.271 Z'
								fill={getFillColor(1)}
								fillOpacity={0.41}
								style={{
									strokeWidth: 1,
									transformOrigin: '325.75px 373.399px 0px',
									pointerEvents: 'auto',
								}}
								transform='matrix(-1, 0, 0, -1, 0, 0)'
							/>
						)}
						{renderModuleTooltip(
							0,
							<path
								d='M 313.674 252.273 C 270.104 295.844 244.771 354.378 242.832 415.966 L 484.974 423.576 L 313.674 252.273 Z'
								fill={getFillColor(0)}
								fillOpacity={0.41}
								style={{
									strokeWidth: 1,
									transformOrigin: '363.903px 337.923px 0px',
									pointerEvents: 'auto',
								}}
								transform='matrix(-1, 0, 0, -1, 0, 0)'
							/>
						)}
						{moduleStates?.statuses?.map((mod: any, i: number) =>
							mod.distance != undefined && mod.status === 1
								? renderDrone(mod.distance, mod.direction)
								: null
						)}
						{selectedRow &&
							renderDrone(selectedRow.distance, selectedRow.direction)}
					</svg>
				</SVGOverlay>
			</MapContainer>
		</div>
	)
}



