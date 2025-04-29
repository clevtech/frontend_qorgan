import {
	Button,
	Col,
	Collapse,
	Form,
	Input,
	Modal,
	Row,
	Select,
	TimePicker,
	Typography,
} from 'antd'
import { useEffect, useState } from 'react'

import {
	CheckCircleOutlined,
	ExclamationCircleOutlined,
	WarningOutlined,
} from '@ant-design/icons'

import { IncidentsService } from '@/services/IncidentsService.ts'

import { API_BASE_URL } from '@/configs/AppConfig'

import imageFallback from '@/assets/imageFallback-16-9.png'

type Props = {
	camera: any
	onClose: () => void
	setCamera: any
	setStep: any
	filteredModules: any
}

export const ModuleSelection = ({
	camera,
	onClose,
	setCamera,
	filteredModules,
	setStep,
}: Props) => {
	const [isDisabled, setIsDisabled] = useState<boolean>(true)
	const [incidentTypes, setIncidentTypes] = useState<any>(null)

	useEffect(() => {
		if (camera.modules) {
			setIsDisabled(
				camera.modules?.length === 0 ||
					camera.modules?.some(module => {
						return (
							(module?.name === 'crowd' && !module?.countOfPeople) ||
							(module?.name === 'duty' && module?.time_to_trigger == 10)
						)
					})
			)
		}
	}, [camera])

	useEffect(() => {
		IncidentsService.getIncidentsTypes({}).then(response => {
			if (response.status == 200) {
				setIncidentTypes(response.data.types)
			}
		})
	}, [])

	const { RangePicker } = TimePicker

	return (
		<>
			<div
				className='d-flex flex-column'
				style={{
					gap: '1.5rem',
				}}
			>
				<Typography.Text className='text-muted'>
					Пожалуйста, выберите одну или несколько из доступных функций.
				</Typography.Text>

				<Row gutter={[16, 16]}>
					<Col xs={12}>
						<img
							alt={`Preview from camera linked to`}
							src={
								camera.camera_id
									? `${API_BASE_URL}/streamer/stream/${camera.camera_id}`
									: imageFallback
							}
							style={{
								width: '100%',
								borderRadius: '0.625rem',
							}}
						/>
					</Col>

					<Col xs={12}>
						<div
							className='d-flex flex-column'
							style={{
								width: '100%',
							}}
						>
							<Form.Item>
								<Select
									mode='multiple'
									onChange={value => {
										setCamera({
											...camera,
											modules: value.map(v => {
												return JSON.parse(v)
											}),
										})
									}}
									options={incidentTypes?.map((type: any) => ({
										value: JSON.stringify(type),
										label: `Распознавание – ${type?.ru_name}`,
									}))}
									placeholder='Выберите модули'
									value={camera.modules?.map(module => JSON.stringify(module))}
								/>
							</Form.Item>

							{camera.modules && camera.modules.length > 0 && (
								<Collapse defaultActiveKey={[]}>
									{camera.modules.map((module, idx) => (
										<Collapse.Panel
											extra={
												module.count_people_needed === true ||
												(module.time_to_trigger_needed === true &&
													!module.countOfPeople) ? (
													<WarningOutlined
														style={{ color: '#F5222D', fontSize: '16px' }}
													/>
												) : (
													<CheckCircleOutlined
														style={{ color: '#52C41A', fontSize: '16px' }}
													/>
												)
											}
											header={incidentTypes?.map(m => {
												if (module?.ru_name === m.ru_name) {
													return `Распознавание – ${m.ru_name}`
												}
											})}
											key={idx + 1}
										>
											{module.count_people_needed === true ? (
												<Form.Item
													className='mb-0'
													label='Допустимое кол-во рядом стоящих людей:'
													required
												>
													<Input
														onChange={e => {
															setCamera(prev => ({
																...prev,
																modules: (prev.modules || []).map(module =>
																	module.count_people_needed === true
																		? {
																				...module,
																				countOfPeople: parseInt(e.target.value),
																		  }
																		: module
																),
															}))
														}}
														value={
															(camera.modules || [])
																.filter(
																	module => module.count_people_needed === true
																)
																.map(module => module.countOfPeople)
																.shift() || 0
														}
													/>
												</Form.Item>
											) : module.time_to_trigger_needed === true ? (
												<Form.Item
													className='mb-0'
													label='Время реагирования:'
													required
												>
													<TimePicker
														style={{ width: '100%' }}
														onChange={(e, value) => {
															function timeToMilliseconds(
																time: string
															): number {
																const [hours, minutes, seconds] = time
																	.split(':')
																	.map(Number)

																if (
																	isNaN(hours) ||
																	isNaN(minutes) ||
																	isNaN(seconds) ||
																	hours < 0 ||
																	minutes < 0 ||
																	seconds < 0 ||
																	minutes >= 60 ||
																	seconds >= 60
																) {
																	throw new Error(
																		'Invalid time format. Use HH:mm:ss'
																	)
																}

																return (
																	(hours * 3600 + minutes * 60 + seconds) * 1000
																)
															}
															if (value) {
																setCamera(prev => ({
																	...prev,
																	modules: (prev.modules || []).map(module =>
																		module.time_to_trigger_needed === true
																			? {
																					...module,
																					time_to_trigger:
																						timeToMilliseconds(value),
																			  }
																			: module
																	),
																}))
															} else {
																setCamera(prev => ({
																	...prev,
																	modules: (prev.modules || []).map(module =>
																		module.time_to_trigger_needed === true
																			? {
																					...module,
																					time_to_trigger: 10,
																			  }
																			: module
																	),
																}))
															}
														}}
														// value={
														// 	(camera.modules || [])
														// 		.filter(
														// 			module => module.time_to_trigger_needed === true
														// 		)
														// 		.map(module => module.time_to_trigger)
														// 		.shift() || 0
														// }
													/>
												</Form.Item>
											) : (
												<Typography.Text className='text-muted'></Typography.Text>
											)}
											<Form.Item
												className='mb-0'
												label='Период отслеживания:'
												required
											>
												<RangePicker
													placeholder={['с', 'по']}
													style={{ width: '100%' }}
													onChange={(e, value) => {
														if (value) {
															setCamera(prev => ({
																...prev,
																modules: (prev.modules || []).map(modulee => {
																	if (
																		module.incident_type ==
																		modulee.incident_type
																	) {
																		return {
																			...modulee,
																			working_hours_start: value[0],
																			working_hours_end: value[1],
																		}
																	} else {
																		return module
																	}
																}),
															}))
														}
													}}
													// value={
													// 	(camera.modules || [])
													// 		.filter(
													// 			module => module.time_to_trigger_needed === true
													// 		)
													// 		.map(module => module.time_to_trigger)
													// 		.shift() || 0
													// }
												/>
											</Form.Item>
										</Collapse.Panel>
									))}
								</Collapse>
							)}
						</div>
					</Col>
				</Row>
			</div>

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
					onClick={() => {
						if (filteredModules.length === 0) {
							setStep(prev => prev + 2)
						} else {
							setStep(prev => prev + 1)
						}
					}}
					style={{ marginLeft: '8px' }}
					type='primary'
				>
					Продолжить
				</Button>
			</div>
		</>
	)
}
