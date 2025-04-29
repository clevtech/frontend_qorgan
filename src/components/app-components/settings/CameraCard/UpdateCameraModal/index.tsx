import { Form, Modal, notification } from 'antd'
import { ChangeEvent, useEffect, useState } from 'react'

import { ExclamationCircleOutlined } from '@ant-design/icons'

import { MODAL_WIDTH } from '@/constants/LayoutConstant'
import { IncidentsService } from '@/services/IncidentsService'
import { CameraRead } from '@/types/custom'

import { CamerasService } from '@/services/CamerasService'
import { AreaSelection } from './AreaSelection'
import { ModuleSelection } from './ModuleSelection'
import { NameConfirmation } from './NameConfirmation'

type Props = {
	camera: CameraRead
	isOpen: boolean
	fetchDataSource: () => Promise<void>
	onClose: () => void
}

export const UpdateCameraModal = ({
	camera: cameraIn,
	isOpen,
	fetchDataSource,
	onClose,
}: Props) => {
	const [camera, setCamera] = useState<any>(cameraIn)
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [step, setStep] = useState<number>(1)
	const [incidentTypes, setIncidentTypes] = useState<any>(null)
	const [filteredModules, setFilteredModules] = useState([])

	const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
		const { name, value } = event.target

		setCamera(prev => ({
			...prev,
			[name]: value,
		}))
	}

	useEffect(() => {
		IncidentsService.getIncidentsTypes({}).then(response => {
			if (response.status == 200) {
				setIncidentTypes(response.data.types)
			}
		})
	}, [])

	const handleUpdate = async () => {
		setIsLoading(true)

		await CamerasService.updateCameraById(
			{
				path: {
					id: camera.camera_id,
				},
			},
			{
				...camera,
			}
		)
			.then(() => {
				notification.success({
					description: 'Камера успешно создана',
					message: 'Успех',
				})
			})
			.finally(() => {
				setIsLoading(false)

				onClose()
				setStep(1)
				setCamera({
					ipAddress: '',
					modules: [],
					name: '',
					password: '',
					previewPath: '',
					status: false,
					username: '',
				})

				fetchDataSource()
			})
	}

	useEffect(() => {
		setCamera(cameraIn)
	}, [cameraIn])

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
			open={isOpen}
			title={'Настройка камеры'}
			width={MODAL_WIDTH}
		>
			<Form autoComplete='off' layout='vertical'>
				{step === 1 && (
					<ModuleSelection
						camera={camera}
						onClose={onClose}
						setCamera={setCamera}
						filteredModules={filteredModules}
						setStep={setStep}
					/>
				)}

				{step === 2 && (
					<AreaSelection
						camera={camera}
						setCamera={setCamera}
						setStep={setStep}
						filteredModules={filteredModules}
					/>
				)}

				{step === 3 && (
					<NameConfirmation
						camera={camera}
						isLoading={isLoading}
						handleChange={handleChange}
						handleUpdate={handleUpdate}
						setStep={setStep}
					/>
				)}
			</Form>
		</Modal>
	)
}
