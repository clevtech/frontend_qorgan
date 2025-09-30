import drone from '@/assets/drone.png'
import { WEBSOCKET_BASE_URL } from '@/configs/AppConfig'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { Protocol } from 'pmtiles'
import { useEffect, useRef, useState } from 'react'
import useWebSocket from 'react-use-websocket'

interface Module {
	angle: number
	coordinates: number[]
	frequencies: string[]
	name: string
}

interface Object {
	angle: number
	latitude: number
	longitude: number
	modules: Module[]
	name: string
}

interface MapKZProps {
	isSwitched?: boolean
	selectedRow?: any
	zoom?: number
	objects?: Object[]
	focusObject?: Object | null
}

export default function MapKZ({
	isSwitched = false,
	selectedRow = null,
	objects = [],
	focusObject = null,
}: MapKZProps) {
	const ref = useRef<HTMLDivElement>(null)
	const mapRef = useRef<maplibregl.Map | null>(null)
	const [moduleStates, setModuleStates] = useState<any>({})
	const [currentMode, setCurrentMode] = useState<'demo' | 'production'>(
		isSwitched ? 'demo' : 'production'
	)

	// WebSocket URL configuration
	const [socketUrl, setSocketUrl] = useState(
		isSwitched
			? `${WEBSOCKET_BASE_URL}/backend/ws/statuses_demo/`
			: `${WEBSOCKET_BASE_URL}/backend/ws/statuses/`
	)

	// WebSocket connection
	const { lastMessage } = useWebSocket(socketUrl, {
		onOpen: () => {},
		onClose: () => {},
		onError: event => console.error('WebSocket error:', event),
		shouldReconnect: () => true,
		reconnectAttempts: 10,
		reconnectInterval: 3000,
	})

	// Handle WebSocket messages
	useEffect(() => {
		if (lastMessage?.data) {
			try {
				const incoming = JSON.parse(lastMessage.data)
				setModuleStates(incoming)

				// Обновляем зоны на основе WebSocket данных
				updateZonesFromWebSocketData(incoming)
			} catch (err) {
				console.error('Ошибка при парсинге WebSocket-сообщения:', err)
			}
		}
	}, [lastMessage])

	// Update socket URL when props change
	useEffect(() => {
		const newMode = isSwitched ? 'demo' : 'production'
		setCurrentMode(newMode)

		if (selectedRow) {
			setSocketUrl(`${WEBSOCKET_BASE_URL}/backend/`)
		} else {
			const newUrl = isSwitched
				? `${WEBSOCKET_BASE_URL}/backend/ws/statuses_demo/`
				: `${WEBSOCKET_BASE_URL}/backend/ws/statuses/`
			setSocketUrl(newUrl)
		}
	}, [isSwitched, selectedRow])

	// Функция для создания дрона для конкретного объекта
	const createDroneForObject = (mod: any, objectIndex: number) => {
		// Определяем центр для позиционирования дрона
		let centerX, centerY
		let objectAngle = 0 // Угол поворота объекта

		if (objects.length > 0 && objects[objectIndex]) {
			centerX = objects[objectIndex].longitude
			centerY = objects[objectIndex].latitude
			objectAngle = objects[objectIndex].angle || 0
		} else {
			// Демо режим - центр Казахстана
			centerX = 71.43
			centerY = 51.16
			objectAngle = 0
		}

		const droneEl = document.createElement('div')
		droneEl.className = 'drone-marker'
		droneEl.style.backgroundImage = `url(${drone})`
		droneEl.style.width = '20px'
		droneEl.style.height = '20px'
		droneEl.style.backgroundSize = 'contain'
		droneEl.style.backgroundRepeat = 'no-repeat'
		droneEl.style.cursor = 'pointer'

		// Вычисляем позицию дрона относительно центра
		const maxRadius = 0.05 // в градусах

		const t = mod.distance / 5000
		const r = t * maxRadius

		const angleByDirection: Record<number, number> = {
			0: -60, // Центр зоны 0 (0° + 90°) / 2
			1: -150, // Центр зоны 1 (90° + 180°) / 2
			2: -240, // Центр зоны 2 (180° + 270°) / 2
			3: -330, // Центр зоны 3 (270° + 360°) / 2
		}

		const baseAngle = angleByDirection[mod.direction] ?? 0
		// Применяем поворот объекта к углу дрона
		const angle = baseAngle + objectAngle
		const rad = (angle * Math.PI) / 180
		const lng = centerX + r * Math.cos(rad)
		const lat = centerY + r * Math.sin(rad)

		new maplibregl.Marker(droneEl).setLngLat([lng, lat]).addTo(mapRef.current!)
	}

	// Функция для обновления дронов на карте
	const updateDronesOnMap = (incoming: any) => {
		if (!mapRef.current) {
			return
		}

		// Проверяем готовность карты разными способами
		const isMapReady =
			mapRef.current.isStyleLoaded() ||
			mapRef.current.loaded() ||
			mapRef.current.areTilesLoaded()

		if (!isMapReady) {
			// Продолжаем выполнение, так как иногда карта работает даже если isStyleLoaded() возвращает false
		}

		// Удаляем существующие маркеры дронов
		const existingMarkers = document.querySelectorAll('.drone-marker')
		existingMarkers.forEach(marker => marker.remove())

		// Проверяем, что есть данные о статусах
		if (!incoming?.statuses) {
			return
		}

		// Добавляем дронов из WebSocket данных для каждого объекта
		incoming.statuses.forEach((mod: any) => {
			if (mod.distance != undefined && mod.status === 1) {
				// Если objectIndex не указан, создаем дрона для всех объектов
				if (mod.objectIndex !== undefined) {
					// Создаем дрона для конкретного объекта
					createDroneForObject(mod, mod.objectIndex)
				} else {
					// Создаем дрона для всех объектов
					objects.forEach((_, objIndex) => {
						createDroneForObject(mod, objIndex)
					})

					// Если нет объектов, создаем дрона для демо режима
					if (objects.length === 0) {
						createDroneForObject(mod, 0)
					}
				}
			}
		})

		// Добавляем выбранного дрона
		if (selectedRow) {
			// Если objectIndex не указан, используем первый объект (для демо режима)
			const objectIndex =
				selectedRow.objectIndex !== undefined ? selectedRow.objectIndex : 0

			// Определяем центр для позиционирования дрона
			let centerX, centerY
			let objectAngle = 0 // Угол поворота объекта

			if (objects.length > 0 && objects[objectIndex]) {
				centerX = objects[objectIndex].longitude
				centerY = objects[objectIndex].latitude
				objectAngle = objects[objectIndex].angle || 0
			} else {
				// Демо режим - центр Казахстана
				centerX = 71.43
				centerY = 51.16
				objectAngle = 0
			}

			const droneEl = document.createElement('div')
			droneEl.className = 'drone-marker selected'
			droneEl.style.backgroundImage = `url(${drone})`
			droneEl.style.width = '40px'
			droneEl.style.height = '40px'
			droneEl.style.backgroundSize = 'contain'
			droneEl.style.backgroundRepeat = 'no-repeat'
			droneEl.style.cursor = 'pointer'
			droneEl.style.border = '2px solid red'

			const maxRadius = 0.05

			const t = selectedRow.distance / 1000
			const r = t * maxRadius

			const angleByDirection: Record<number, number> = {
				0: 45, // Центр зоны 0 (0° + 90°) / 2
				1: 135, // Центр зоны 1 (90° + 180°) / 2
				2: 225, // Центр зоны 2 (180° + 270°) / 2
				3: 315, // Центр зоны 3 (270° + 360°) / 2
			}

			const baseAngle = angleByDirection[selectedRow.direction] ?? 0
			// Применяем поворот объекта к углу дрона
			const angle = baseAngle + objectAngle
			const rad = (angle * Math.PI) / 180
			const lng = centerX + r * Math.cos(rad)
			const lat = centerY + r * Math.sin(rad)

			new maplibregl.Marker(droneEl)
				.setLngLat([lng, lat])
				.addTo(mapRef.current!)
		}
	}

	// Функция для обновления зон на основе WebSocket данных
	const updateZonesFromWebSocketData = (incoming: any) => {
		if (!mapRef.current || !mapRef.current.isStyleLoaded()) return

		// Функция для создания полукруговой зоны с учетом поворота объекта
		const createSemicircleZone = (
			startAngle: number,
			endAngle: number,
			centerLng: number,
			centerLat: number,
			objectAngle: number = 0
		) => {
			const points = []
			const radius = 0.01 // радиус в градусах
			const numPoints = 20 // количество точек для создания плавной дуги

			// Начинаем с центра
			points.push([centerLng, centerLat])

			// Создаем дугу от startAngle до endAngle с учетом поворота объекта
			for (let i = 0; i <= numPoints; i++) {
				const angle = startAngle + (endAngle - startAngle) * (i / numPoints)
				// Применяем поворот объекта к углу зоны
				const rotatedAngle = angle + objectAngle
				const rad = (rotatedAngle * Math.PI) / 180
				const lng = centerLng + radius * Math.cos(rad)
				const lat = centerLat + radius * Math.sin(rad)
				points.push([lng, lat])
			}

			// Замыкаем полукруг - добавляем прямую линию от конечной точки до центра
			points.push([centerLng, centerLat])

			return points
		}

		// Создаем новый GeoJSON с обновленными цветами
		const createUpdatedZonesGeoJSON = () => {
			const allZones: any[] = []

			// Если нет объектов, создаем демо зоны
			if (objects.length === 0) {
				const demoCenterLng = 71.43
				const demoCenterLat = 51.16

				for (let direction = 0; direction < 4; direction++) {
					const startAngle = direction * 45
					const endAngle = (direction + 1) * 45

					// Находим статус для этой зоны
					const status = incoming?.statuses?.find(
						(s: any) => s.direction === direction
					)

					// Определяем цвет зоны
					let zoneColor = '#AAC5FF' // По умолчанию синий
					if (status) {
						if (status.status === 1) {
							zoneColor = '#D63604' // Красный - активен
						} else if (status.status === 0) {
							zoneColor = '#407BFF' // Синий - неактивен
						}
					}

					allZones.push({
						type: 'Feature' as const,
						properties: {
							direction,
							name: `Зона ${direction}`,
							objectIndex: 0,
							objectName: 'Demo Object',
							zoneColor, // Добавляем цвет в свойства
						},
						geometry: {
							type: 'Polygon' as const,
							coordinates: [
								createSemicircleZone(
									startAngle,
									endAngle,
									demoCenterLng,
									demoCenterLat,
									0 // Демо объект без поворота
								),
							],
						},
					})
				}
			} else {
				// Создаем зоны для всех объектов
				objects.forEach((obj, objIndex) => {
					for (let direction = 0; direction < 4; direction++) {
						const startAngle = direction * 45
						const endAngle = (direction + 1) * 45

						// Находим статус для этой зоны
						let status = null

						if (incoming?.statuses) {
							status = incoming.statuses.find((s: any) => {
								if (s.objectIndex !== undefined) {
									return s.objectIndex === objIndex && s.direction === direction
								}
								return s.direction === direction
							})
						}

						// Определяем цвет зоны
						let zoneColor = '#AAC5FF' // По умолчанию синий
						if (status) {
							if (status.status === 1) {
								zoneColor = '#D63604' // Красный - активен
							} else if (status.status === 0) {
								zoneColor = '#407BFF' // Синий - неактивен
							}
						}

						allZones.push({
							type: 'Feature' as const,
							properties: {
								direction,
								name: `Зона ${direction}`,
								objectIndex: objIndex,
								objectName: obj.name,
								zoneColor, // Добавляем цвет в свойства
							},
							geometry: {
								type: 'Polygon' as const,
								coordinates: [
									createSemicircleZone(
										startAngle,
										endAngle,
										obj.longitude,
										obj.latitude,
										obj.angle || 0 // Используем угол объекта
									),
								],
							},
						})
					}
				})
			}

			return {
				type: 'FeatureCollection' as const,
				features: allZones,
			}
		}

		// Обновляем источник данных
		const updatedZonesGeoJSON = createUpdatedZonesGeoJSON()
		const source = mapRef.current!.getSource(
			'zones'
		) as maplibregl.GeoJSONSource
		if (source) {
			source.setData(updatedZonesGeoJSON)
		}

		// Дроны обновляются через useEffect при изменении moduleStates
	}

	useEffect(() => {
		const protocol = new Protocol()
		// @ts-ignore
		maplibregl.addProtocol('pmtiles', protocol.tile)

		// Создаем GeoJSON для полукруговых зон для всех объектов
		const radius = 0.05 // радиус в градусах
		const numPoints = 20 // количество точек для создания плавной дуги

		// Функция для создания полукруговой зоны для конкретного объекта с учетом поворота
		const createSemicircleZone = (
			startAngle: number,
			endAngle: number,
			centerLng: number,
			centerLat: number,
			objectAngle: number = 0
		) => {
			const points = []

			// Начинаем с центра
			points.push([centerLng, centerLat])

			// Создаем дугу от startAngle до endAngle с учетом поворота объекта
			for (let i = 0; i <= numPoints; i++) {
				const angle = startAngle + (endAngle - startAngle) * (i / numPoints)
				// Применяем поворот объекта к углу зоны
				const rotatedAngle = angle + objectAngle
				const rad = (rotatedAngle * Math.PI) / 180
				const lng = centerLng + radius * Math.cos(rad)
				const lat = centerLat + radius * Math.sin(rad)
				points.push([lng, lat])
			}

			// Замыкаем полукруг - добавляем прямую линию от конечной точки до центра
			points.push([centerLng, centerLat])

			return points
		}

		// Создаем зоны для всех объектов
		const createZonesForAllObjects = () => {
			const allZones: any[] = []

			// Если нет объектов, создаем зоны для демо режима (центр Казахстана)
			if (objects.length === 0) {
				const demoCenterLng = 71.43
				const demoCenterLat = 51.16

				for (let direction = 0; direction < 4; direction++) {
					const startAngle = direction * 45
					const endAngle = (direction + 1) * 45

					allZones.push({
						type: 'Feature',
						properties: {
							direction,
							name: `Зона ${direction}`,
							objectIndex: 0,
							objectName: 'Demo Object',
						},
						geometry: {
							type: 'Polygon',
							coordinates: [
								createSemicircleZone(
									startAngle,
									endAngle,
									demoCenterLng,
									demoCenterLat,
									0 // Демо объект без поворота
								),
							],
						},
					})
				}
			} else {
				objects.forEach((obj, objIndex) => {
					// Создаем 4 зоны для каждого объекта
					for (let direction = 0; direction < 4; direction++) {
						const startAngle = direction * 45
						const endAngle = (direction + 1) * 45

						allZones.push({
							type: 'Feature',
							properties: {
								direction,
								name: `Зона ${direction}`,
								objectIndex: objIndex,
								objectName: obj.name,
							},
							geometry: {
								type: 'Polygon',
								coordinates: [
									createSemicircleZone(
										startAngle,
										endAngle,
										obj.longitude,
										obj.latitude,
										obj.angle || 0 // Используем угол объекта
									),
								],
							},
						})
					}
				})
			}

			return {
				type: 'FeatureCollection',
				features: allZones,
			}
		}

		const zonesGeoJSON = createZonesForAllObjects()

		// минимальный style JSON
		const style: any = {
			version: 8,
			sources: {
				kz: {
					type: 'vector',
					url: 'pmtiles:///maps/kazakhstan.pmtiles',
				},
				zones: {
					type: 'geojson',
					data: zonesGeoJSON,
				},
			},
			layers: [
				{
					id: 'background',
					type: 'background',
					paint: { 'background-color': '#ddeeff' },
				},
				{
					id: 'landcover',
					type: 'fill',
					source: 'kz',
					'source-layer': 'landcover',
					paint: { 'fill-color': '#eae8e4' },
				},
				{
					id: 'water',
					type: 'fill',
					source: 'kz',
					'source-layer': 'water',
					paint: { 'fill-color': '#a0c8f0' },
				},
				{
					id: 'landuse',
					type: 'fill',
					source: 'kz',
					'source-layer': 'landuse',
					paint: { 'fill-color': '#dfd8c8' },
				},
				{
					id: 'roads',
					type: 'line',
					source: 'kz',
					'source-layer': 'transportation',
					paint: { 'line-color': '#888', 'line-width': 1 },
				},
				{
					id: 'buildings',
					type: 'fill',
					source: 'kz',
					'source-layer': 'building',
					paint: { 'fill-color': '#c0c0c0' },
				},
				{
					id: 'boundaries',
					type: 'line',
					source: 'kz',
					'source-layer': 'boundary',
					paint: { 'line-color': '#000', 'line-width': 0.5 },
				},
				// Зоны как слои карты
				{
					id: 'zones-fill',
					type: 'fill',
					source: 'zones',
					paint: {
						'fill-color': ['get', 'zoneColor'],
						'fill-opacity': 0.4,
					},
				},
				{
					id: 'zones-stroke',
					type: 'line',
					source: 'zones',
					paint: {
						'line-color': '#000',
						'line-width': 1,
					},
				},
			],
		}

		// Glyphs/sprite are required for symbol layers; temporarily removing labels.

		const map = new maplibregl.Map({
			container: ref.current!,
			style,
			center: [71.43, 51.16],
			zoom: 5,
		})

		// Сохраняем ссылку на карту
		mapRef.current = map

		map.on('error', e => {
			console.error('MapLibre error:', e?.error || e)
		})

		map.addControl(
			new maplibregl.AttributionControl({
				compact: true,
				customAttribution: '© OpenStreetMap contributors',
			})
		)

		// Функция для добавления объектов на карту (только зоны, без маркеров)
		const addObjectsToMap = () => {
			// Удаляем существующие маркеры объектов
			const existingObjectMarkers = document.querySelectorAll('.object-marker')
			existingObjectMarkers.forEach(marker => marker.remove())

			// Объекты теперь отображаются только через зоны, маркеры не нужны
		}

		// Функция для добавления дронов на карту
		const addDronesToMap = () => {
			// Удаляем существующие маркеры дронов
			const existingMarkers = document.querySelectorAll('.drone-marker')
			existingMarkers.forEach(marker => marker.remove())

			// Добавляем дронов из WebSocket данных для каждого объекта
			moduleStates?.statuses?.forEach((mod: any) => {
				if (mod.distance != undefined && mod.status === 1) {
					// Если objectIndex не указан, используем первый объект (для демо режима)
					const objectIndex =
						mod.objectIndex !== undefined ? mod.objectIndex : 0

					// Определяем центр для позиционирования дрона
					let centerX, centerY
					let objectAngle = 0 // Угол поворота объекта

					if (objects.length > 0 && objects[objectIndex]) {
						centerX = objects[objectIndex].longitude
						centerY = objects[objectIndex].latitude
						objectAngle = objects[objectIndex].angle || 0
					} else {
						// Демо режим - центр Казахстана
						centerX = 71.43
						centerY = 51.16
						objectAngle = 0
					}

					const droneEl = document.createElement('div')
					droneEl.className = 'drone-marker'
					droneEl.style.backgroundImage = `url(${drone})`
					droneEl.style.width = '20px'
					droneEl.style.height = '20px'
					droneEl.style.backgroundSize = 'contain'
					droneEl.style.backgroundRepeat = 'no-repeat'
					droneEl.style.cursor = 'pointer'

					// Вычисляем позицию дрона относительно центра
					const maxRadius = 0.05 // в градусах

					const t = mod.distance / 5000
					const r = t * maxRadius

					const angleByDirection: Record<number, number> = {
						0: 45, // Центр зоны 0 (0° + 90°) / 2
						1: 135, // Центр зоны 1 (90° + 180°) / 2
						2: 225, // Центр зоны 2 (180° + 270°) / 2
						3: 315, // Центр зоны 3 (270° + 360°) / 2
					}

					const baseAngle = angleByDirection[mod.direction] ?? 0
					// Применяем поворот объекта к углу дрона
					const angle = baseAngle + objectAngle
					const rad = (angle * Math.PI) / 180
					const lng = centerX + r * Math.cos(rad)
					const lat = centerY + r * Math.sin(rad)

					new maplibregl.Marker(droneEl).setLngLat([lng, lat]).addTo(map)
				}
			})

			// Добавляем выбранного дрона
			if (selectedRow) {
				// Если objectIndex не указан, используем первый объект (для демо режима)
				const objectIndex =
					selectedRow.objectIndex !== undefined ? selectedRow.objectIndex : 0

				// Определяем центр для позиционирования дрона
				let centerX, centerY
				let objectAngle = 0 // Угол поворота объекта

				if (objects.length > 0 && objects[objectIndex]) {
					centerX = objects[objectIndex].longitude
					centerY = objects[objectIndex].latitude
					objectAngle = objects[objectIndex].angle || 0
				} else {
					// Демо режим - центр Казахстана
					centerX = 71.43
					centerY = 51.16
					objectAngle = 0
				}

				const droneEl = document.createElement('div')
				droneEl.className = 'drone-marker selected'
				droneEl.style.backgroundImage = `url(${drone})`
				droneEl.style.width = '20px'
				droneEl.style.height = '20px'
				droneEl.style.backgroundSize = 'contain'
				droneEl.style.backgroundRepeat = 'no-repeat'
				droneEl.style.cursor = 'pointer'
				droneEl.style.border = '2px solid red'

				const maxRadius = 0.05

				const t = selectedRow.distance / 1000
				const r = t * maxRadius

				const angleByDirection: Record<number, number> = {
					0: 45, // Центр зоны 0 (0° + 90°) / 2
					1: 135, // Центр зоны 1 (90° + 180°) / 2
					2: 225, // Центр зоны 2 (180° + 270°) / 2
					3: 315, // Центр зоны 3 (270° + 360°) / 2
				}

				const baseAngle = angleByDirection[selectedRow.direction] ?? 0
				// Применяем поворот объекта к углу дрона
				const angle = baseAngle + objectAngle
				const rad = (angle * Math.PI) / 180
				const lng = centerX + r * Math.cos(rad)
				const lat = centerY + r * Math.sin(rad)

				new maplibregl.Marker(droneEl).setLngLat([lng, lat]).addTo(map)
			}
		}

		// Добавляем объекты и дронов при загрузке карты
		map.on('load', () => {
			addObjectsToMap()
			addDronesToMap()
		})

		// Обновляем стили зон после загрузки карты
		map.on('load', () => {})

		return () => {
			map.remove()
			mapRef.current = null
		}
	}, [objects])

	// Обновляем зоны при изменении состояния модулей
	useEffect(() => {
		if (moduleStates && Object.keys(moduleStates).length > 0) {
			updateZonesFromWebSocketData(moduleStates)
		}
	}, [moduleStates, selectedRow, objects])

	// Обновляем дронов при изменении состояния модулей
	useEffect(() => {
		if (
			moduleStates &&
			Object.keys(moduleStates).length > 0 &&
			mapRef.current
		) {
			// Проверяем готовность карты разными способами
			const isMapReady =
				mapRef.current.isStyleLoaded() ||
				mapRef.current.loaded() ||
				mapRef.current.areTilesLoaded()

			if (isMapReady) {
				updateDronesOnMap(moduleStates)
			} else {
				// Пробуем обновить дронов даже если карта "не готова"
				updateDronesOnMap(moduleStates)
			}
		}
	}, [moduleStates, selectedRow, objects])

	// Обновляем дронов при изменении данных
	useEffect(() => {
		if (mapRef.current) {
			if (mapRef.current.isStyleLoaded()) {
				// Удаляем существующие маркеры дронов
				const existingMarkers = document.querySelectorAll('.drone-marker')
				existingMarkers.forEach(marker => marker.remove())

				// Добавляем дронов из WebSocket данных для каждого объекта
				moduleStates?.statuses?.forEach((mod: any) => {
					if (mod.distance != undefined && mod.status === 1) {
						// Если objectIndex не указан, используем первый объект (для демо режима)
						const objectIndex =
							mod.objectIndex !== undefined ? mod.objectIndex : 0

						// Определяем центр для позиционирования дрона
						let centerX, centerY
						if (objects.length > 0 && objects[objectIndex]) {
							centerX = objects[objectIndex].longitude
							centerY = objects[objectIndex].latitude
						} else {
							// Демо режим - центр Казахстана
							centerX = 71.43
							centerY = 51.16
						}

						const droneEl = document.createElement('div')
						droneEl.className = 'drone-marker'
						droneEl.style.backgroundImage = `url(${drone})`
						droneEl.style.width = '20px'
						droneEl.style.height = '20px'
						droneEl.style.backgroundSize = 'contain'
						droneEl.style.backgroundRepeat = 'no-repeat'
						droneEl.style.cursor = 'pointer'

						// Вычисляем позицию дрона относительно центра
						const maxRadius = 0.05 // в градусах

						const t = mod.distance / 5000
						const r = t * maxRadius

						const angleByDirection: Record<number, number> = {
							0: 45, // Центр зоны 0 (0° + 90°) / 2
							1: 135, // Центр зоны 1 (90° + 180°) / 2
							2: 225, // Центр зоны 2 (180° + 270°) / 2
							3: 315, // Центр зоны 3 (270° + 360°) / 2
						}

						const baseAngle = angleByDirection[mod.direction] ?? 0
						// Применяем поворот объекта к углу дрона
						const objectAngle =
							objects.length > 0 && objects[objectIndex]
								? objects[objectIndex].angle || 0
								: 0
						const angle = baseAngle + objectAngle
						const rad = (angle * Math.PI) / 180
						const lng = centerX + r * Math.cos(rad)
						const lat = centerY + r * Math.sin(rad)

						new maplibregl.Marker(droneEl)
							.setLngLat([lng, lat])
							.addTo(mapRef.current!)
					}
				})

				// Добавляем выбранного дрона
				if (selectedRow) {
					// Если objectIndex не указан, используем первый объект (для демо режима)
					const objectIndex =
						selectedRow.objectIndex !== undefined ? selectedRow.objectIndex : 0

					// Определяем центр для позиционирования дрона
					let centerX, centerY
					if (objects.length > 0 && objects[objectIndex]) {
						centerX = objects[objectIndex].longitude
						centerY = objects[objectIndex].latitude
					} else {
						// Демо режим - центр Казахстана
						centerX = 71.43
						centerY = 51.16
					}

					const droneEl = document.createElement('div')
					droneEl.className = 'drone-marker selected'
					droneEl.style.backgroundImage = `url(${drone})`
					droneEl.style.width = '40px'
					droneEl.style.height = '40px'
					droneEl.style.backgroundSize = 'contain'
					droneEl.style.backgroundRepeat = 'no-repeat'
					droneEl.style.cursor = 'pointer'
					droneEl.style.border = '2px solid red'

					const maxRadius = 0.05

					const t = selectedRow.distance / 1000
					const r = t * maxRadius

					const angleByDirection: Record<number, number> = {
						0: 45, // Центр зоны 0 (0° + 90°) / 2
						1: 135, // Центр зоны 1 (90° + 180°) / 2
						2: 225, // Центр зоны 2 (180° + 270°) / 2
						3: 315, // Центр зоны 3 (270° + 360°) / 2
					}

					const baseAngle = angleByDirection[selectedRow.direction] ?? 0
					// Применяем поворот объекта к углу дрона
					const objectAngle =
						objects.length > 0 && objects[objectIndex]
							? objects[objectIndex].angle || 0
							: 0
					const angle = baseAngle + objectAngle
					const rad = (angle * Math.PI) / 180
					const lng = centerX + r * Math.cos(rad)
					const lat = centerY + r * Math.sin(rad)

					new maplibregl.Marker(droneEl)
						.setLngLat([lng, lat])
						.addTo(mapRef.current!)
				}
			}
		}
	}, [moduleStates, selectedRow, objects])

	// Обновляем объекты при изменении массива objects (только зоны)
	useEffect(() => {
		if (mapRef.current && mapRef.current.isStyleLoaded()) {
			// Удаляем существующие маркеры объектов
			const existingObjectMarkers = document.querySelectorAll('.object-marker')
			existingObjectMarkers.forEach(marker => marker.remove())

			// Объекты отображаются только через зоны, маркеры не нужны
		}
	}, [objects])

	// Центрируем карту на объекте при изменении focusObject
	useEffect(() => {
		if (focusObject && mapRef.current) {
			mapRef.current.flyTo({
				center: [focusObject.longitude, focusObject.latitude],
				zoom: 14,
				duration: 1000,
			})
		}
	}, [focusObject])

	return (
		<div style={{ position: 'relative' }}>
			{/* Индикатор режима */}
			<div
				style={{
					position: 'absolute',
					top: '10px',
					right: '10px',
					zIndex: 1000,
					background: currentMode === 'demo' ? '#ff6b35' : '#4caf50',
					color: 'white',
					padding: '8px 16px',
					borderRadius: '20px',
					fontSize: '12px',
					fontWeight: 'bold',
					boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
				}}
			>
				{currentMode === 'demo' ? 'DEMO РЕЖИМ' : 'PRODUCTION РЕЖИМ'}
			</div>

			<div ref={ref} style={{ height: '80vh', width: '100%' }} />
		</div>
	)
}
