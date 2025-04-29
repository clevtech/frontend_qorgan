import { Button, Typography } from 'antd'
import {
	Dispatch,
	SetStateAction,
	useCallback,
	useEffect,
	useState,
} from 'react'

import {
	Area,
	Line,
	Point,
} from '@/components/util-components/canvas/canvas.interface'
import {
	CameraCreate,
	CameraModuleCreate,
	cameraModulesMap,
} from '@/types/custom'

import Canvas from '@/components/util-components/canvas/Canvas'

import imageFallback from '@/assets/imageFallback-16-9.png'
import { API_BASE_URL } from '@/configs/AppConfig'

type AreaSelectionProps = {
	camera: CameraCreate
	filteredModules: CameraModuleCreate[]
	setCamera: Dispatch<SetStateAction<CameraCreate>>
	setStep: Dispatch<SetStateAction<number>>
}

type CanvasEditorProps = {
	camera: CameraCreate
	coordinates: Point[]
	currentModule: CameraModuleCreate
	setCoordinates: Dispatch<SetStateAction<Point[]>>
	setIsDisabled: Dispatch<SetStateAction<boolean>>
}

export const AreaSelection = ({
	camera,
	filteredModules,
	setCamera,
	setStep,
}: AreaSelectionProps) => {
	const [coordinates, setCoordinates] = useState<Point[]>([])
	const [currentModuleIndex, setCurrentModuleIndex] = useState(0)
	const [isDisabled, setIsDisabled] = useState<boolean>(true)

	const currentModule = filteredModules?.[currentModuleIndex]

	const handlePrevious = () => {
		if (camera.modules) {
			if (currentModuleIndex === 0) {
				setStep(prev => prev - 1)
			}

			if (currentModuleIndex > 0) {
				setCurrentModuleIndex(currentModuleIndex - 1)
			}
		}
	}

	const handleChange = useCallback(() => {
		function getMinMaxCoords(points: any) {
			return points.reduce(
				(acc: any, point: any) => {
					return {
						minX: Math.min(acc.minX, point.x),
						maxX: Math.max(acc.maxX, point.x),
						minY: Math.min(acc.minY, point.y),
						maxY: Math.max(acc.maxY, point.y),
					}
				},
				{
					minX: Infinity,
					maxX: -Infinity,
					minY: Infinity,
					maxY: -Infinity,
				}
			)
		}

		const { minX, maxX, minY, maxY } = getMinMaxCoords(coordinates)

		setCamera(prev => ({
			...prev,
			modules: (prev.modules || []).map(module =>
				module.module === currentModule?.module
					? {
							...module,
							mask_lefttop_x: minX,
							mask_lefttop_y: minY,
							mask_rightbottom_x: maxX,
							mask_rightbottom_y: maxY,
					  }
					: module
			),
		}))
	}, [coordinates, currentModule?.module, setCamera])

	const handleNext = () => {
		if (filteredModules && filteredModules.length > 0) {
			if (currentModuleIndex < filteredModules.length - 1) {
				setCurrentModuleIndex(currentModuleIndex + 1)
			} else {
				setStep(prev => prev + 1)
			}

			handleChange()
		}
	}

	return (
		<>
			{currentModule && (
				<>
					<div className='d-flex flex-column' style={{ gap: '1rem' }}>
						<Typography.Text>
							Выберите область для функции
						</Typography.Text>

						<CanvasEditor
							camera={camera}
							coordinates={coordinates}
							currentModule={currentModule}
							setCoordinates={setCoordinates}
							setIsDisabled={setIsDisabled}
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
						<Button onClick={handlePrevious}>Назад</Button>
						<Button
							disabled={isDisabled && localStorage.getItem('ROLE') !== 'superadmin'}
							onClick={handleNext}
							style={{ marginLeft: '8px' }}
							type='primary'
						>
							Продолжить
						</Button>
					</div>
				</>
			)}
		</>
	)
}

const CanvasEditor = ({
	camera,
	coordinates,
	currentModule,
	setCoordinates,
	setIsDisabled,
}: CanvasEditorProps) => {
	const [areaPoints, setAreaPoints] = useState<Point[]>([])
	const [areas, setAreas] = useState<Area[]>([])
	const [currentLine, setCurrentLine] = useState<Line | null>(null)
	const [lines, setLines] = useState<Line[]>([])

	const reset = useCallback(() => {
		setAreaPoints([])
		setAreas([])
		setCoordinates([])
		setCurrentLine(null)
		setLines([])
	}, [setCoordinates])

	useEffect(() => {
		setIsDisabled(coordinates.length >= 4 ? false : true)
	}, [coordinates, setIsDisabled])

	useEffect(() => {
		reset()
	}, [currentModule, reset])

	return (
		<Canvas
			areaPoints={areaPoints}
			areas={areas}
			currentLine={currentLine}
			lines={lines}
			imageUrl={
				camera.camera_id
					? `${API_BASE_URL}/streamer/stream/${camera.camera_id}`
					: imageFallback
			}
			setAreaPoints={setAreaPoints}
			setAreas={setAreas}
			setCoordinates={setCoordinates}
			setCurrentLine={setCurrentLine}
			setLines={setLines}
		/>
	)
}
