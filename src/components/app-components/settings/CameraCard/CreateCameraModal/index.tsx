import { Form, Modal, notification } from 'antd'
import { ChangeEvent, useEffect, useState } from 'react'

import { ExclamationCircleOutlined } from '@ant-design/icons'

import { MODAL_WIDTH } from '@/constants/LayoutConstant'
import { CameraModuleCreate } from '@/types/custom'

import { CamerasService } from '@/services/CamerasService'
import { IncidentsService } from '@/services/IncidentsService'
import { AreaSelection } from './AreaSelection'
import { CameraConfirmation } from './CameraConfirmation'
import { CameraConnection } from './CameraConnection'
import { ModuleSelection } from './ModuleSelection'
import { NameConfirmation } from './NameConfirmation'
import { StreamService } from '@/services/StreamService'

type Props = {
	isOpen: boolean
	fetchDataSource: () => Promise<void>
	onClose: () => void
}

export const CreateCameraModal = ({
	isOpen,
	fetchDataSource,
	onClose,
}: Props) => {
	const [camera, setCamera] = useState<any>({
		type: null,
		camera_id: '',
		name: '',
		modules: [],
		status: true,
		ip: '',
		port: null,
		username: '',
		password: '',
	})
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [step, setStep] = useState<number>(1)
	const [incidentTypes, setIncidentTypes] = useState<any>(null)
	const [cameraId, setCameraId] = useState<any>(null)
	const [filteredModules, setFilteredModules] = useState<CameraModuleCreate[]>(
		[]
	)

	useEffect(() => {
		IncidentsService.getIncidentsTypes({}).then(response => {
			if (response.status == 200) {
				setIncidentTypes(response.data.types)
			}
		})
	}, [])

	const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
		const { name, value } = event.target

		setCamera(prev => ({
			...prev,
			[name]: value,
		}))
	}

	const handleCreate = async () => {
		setIsLoading(true)

		await CamerasService.createCamera({
			...camera,
		})
			.then(() => {
				notification.success({
					description: 'Камера успешно создана',
					message: 'Успех',
				})
			})
			.finally(() => {
				setIsLoading(false)

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

				fetchDataSource()
			})
			setCameraId(null)
	}

	useEffect(() => {
		setFilteredModules(
			(camera.modules &&
				camera.modules.filter(module => {
					const matchingModule = incidentTypes?.find(
						camModule => camModule.ru_name === module.ru_name
					)

					return matchingModule ? matchingModule.mask_needed : false
				})) ||
				[]
		)
	}, [camera])

	const closeModalHandler = () => {
		if (cameraId) {
			StreamService.deleteCamera(cameraId)
		}
		setCamera({
			ipAddress: '',
			modules: [],
			name: '',
			password: '',
			previewPath: '',
			status: false,
			username: '',
		})
		setCameraId(null)
		onClose()
		setStep(1)
	};

	return (
		<Modal
			footer={null}
			onCancel={() => {
				Modal.confirm({
					cancelText: 'Нет',
					content: 'Все введенные данные будут утеряны.',
					icon: <ExclamationCircleOutlined />,
					okText: 'Да',
					okType: 'danger',
					title: 'Вы уверены, что хотите закрыть окно?',
					onOk: closeModalHandler
				})
			}}
			open={isOpen}
			title={step <= 2 ? 'Соединение с камерой' : 'Настройка камеры'}
			width={MODAL_WIDTH}
		>
			<Form autoComplete='off' layout='vertical'>
				{step === 1 && (
					<CameraConnection
						camera={camera}
						handleChange={handleChange}
						onClose={onClose}
						setCamera={setCamera}
						setStep={setStep}
						setCameraId={setCameraId}
						cameraId={cameraId}
					/>
				)}

				{step === 2 && (
					<CameraConfirmation
						camera={camera}
						onClose={onClose}
						setCamera={setCamera}
						setStep={setStep}
					/>
				)}

				{step === 3 && (
					<ModuleSelection
						camera={camera}
						filteredModules={filteredModules}
						onClose={onClose}
						setCamera={setCamera}
						setStep={setStep}
					/>
				)}

				{step === 4 && (
					<AreaSelection
						camera={camera}
						filteredModules={filteredModules}
						setCamera={setCamera}
						setStep={setStep}
					/>
				)}

				{step === 5 && (
					<NameConfirmation
						camera={camera}
						isLoading={isLoading}
						handleChange={handleChange}
						handleCreate={handleCreate}
						setStep={setStep}
					/>
				)}
			</Form>
		</Modal>
	)
}
