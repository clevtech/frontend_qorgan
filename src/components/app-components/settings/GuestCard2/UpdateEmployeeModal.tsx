import {
	Button,
	Form,
	Input,
	Modal,
	Typography,
	Upload,
	notification,
} from 'antd'
import { ChangeEvent, useEffect, useState } from 'react'

import { LoadingOutlined, PlusOutlined } from '@ant-design/icons'

import { MODAL_WIDTH } from '@/constants/LayoutConstant'
import { EmployeeService } from '@/services/EmployeeServiceSettings'
import { EmployeeUpdate } from '@/types/custom'

import type { UploadChangeParam } from 'antd/es/upload'
import type { RcFile, UploadFile, UploadProps } from 'antd/es/upload/interface'

type Props = {
	employee: any
	isOpen: boolean
	fetchDataSource: () => Promise<void>
	onClose: () => void
}

export const UpdateEmployeeModal = ({
	employee: employeeIn,
	isOpen,
	fetchDataSource,
	onClose,
}: Props) => {
	const [employee, setEmployee] = useState<EmployeeUpdate>({})
	const [isLoading, setIsLoading] = useState<boolean>(false)

	const uploadButton = (
		<div>
			{isLoading ? <LoadingOutlined /> : <PlusOutlined />}
			<div className='ant-upload-text'>Загрузить</div>
		</div>
	)

	const handleImageChange: UploadProps['onChange'] = (
		info: UploadChangeParam<UploadFile>
	) => {
		if (info.file.status === 'uploading') {
			setIsLoading(true)
			getBase64(info.file.originFileObj as RcFile, url => {
				setIsLoading(false)

				setEmployee(prev => ({
                    user_id: prev.user_id ?? '',
                    name: prev.name ?? '',
                    surname: prev.surname ?? '',
                    phone_number: prev.phone_number ?? '',
					img_path: url,
				}))
			})

			return
		}
	}

	const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
		const { name, value } = event.target

		setEmployee(prev => ({
            user_id: prev.user_id ?? '',
			name: prev.name ?? '',
			surname: prev.surname ?? '',
			fathername: prev.fathername ?? '',
			img_path: prev.img_path ?? '',
			[name]: value,
		}))
	}

	const handleUpdate = async () => {
		await EmployeeService.updateEmployeesById(
			{
				path: {
					id: employee.user_id,
				},
			},
			{
				...employee,
			}
		)
			.then(() => {
				notification.success({
					message: 'Успешно',
					description: 'Гость успешно отредактирован',
				})
			})
			.finally(() => {
				fetchDataSource()

				onClose()
			})
	}

	useEffect(() => {
		setEmployee(employeeIn)
	}, [employeeIn])

	return (
		<Modal
			footer={null}
			onCancel={onClose}
			open={isOpen}
			title={
				<Typography.Text className='font-size-base font-weight-semibold'>
					Редактировать гостя
				</Typography.Text>
			}
			width={MODAL_WIDTH / 1.25}
		>
			<Form autoComplete='off' layout='vertical'>
				<div className='d-flex' style={{ gap: '1rem' }}>
					<div>
						<Upload
							beforeUpload={handleUpload}
							onChange={handleImageChange}
							listType='picture-card'
							multiple={false}
							name='file'
							maxCount={1}
							showUploadList={false}
						>
							{employee?.img_path?.slice(0, 4) !== 'face' ? (
								<img
									src={employee.img_path}
									alt='Фото'
									style={{ width: '100%', borderRadius: '8px' }}
								/>
							) : employee.avatar === '' ? (
								uploadButton
							) : (
								<img
									src={"data:image/png;base64," + employee.avatar}
									alt='Фото'
									style={{ width: '100%', borderRadius: '8px' }}
								/>
							)}
						</Upload>
					</div>

					<div
						className='d-flex flex-column'
						style={{ width: 'calc(100% - 110px - 1rem)', gap: '0.5rem' }}
					>
						<Form.Item
							className='mb-0'
							label='Имя'
							required
							rules={[
								{
									required: true,
									message: 'Заполните имя',
								},
							]}
						>
							<Input
								name='name'
								onChange={handleInputChange}
								value={employee.name}
							/>
						</Form.Item>

						<Form.Item
							className='mb-0'
							label='Фамилия '
							required
							rules={[
								{
									required: true,
									message: 'Заполните фамилию',
								},
							]}
						>
							<Input
								name='surname'
								onChange={handleInputChange}
								value={employee.surname}
							/>
						</Form.Item>

						<Form.Item className='mb-0' label='Отчество'>
							<Input
								name='fathername'
								onChange={handleInputChange}
								value={employee.fathername ?? ''}
							/>
						</Form.Item>
					</div>
				</div>

				<div
					className='d-flex justify-content-end'
					style={{
						padding: '10px 16px',
						margin: '24px -24px -24px -24px',

						borderTop: '1px solid #e6ebf1',
					}}
				>
					<Button onClick={onClose}>Отменить</Button>
					<Button
						disabled={
							(!employee.name || !employee.surname) || localStorage.getItem('ROLE') !== 'superadmin'
						}
						onClick={handleUpdate}
						style={{ marginLeft: '8px' }}
						type='primary'
						htmlType='submit'
					>
						Сохранить
					</Button>
				</div>
			</Form>
		</Modal>
	)
}

const handleUpload = (file: RcFile) => {
	const isCorrectFormat =
		file.type === 'image/jpg' ||
		file.type === 'image/jpeg' ||
		file.type === 'image/png'

	if (!isCorrectFormat) {
		notification.error({
			description: 'Можно загружать только .png/.jpeg/.jpg файлы!',
			message: 'Ошибка',
		})
	}
	return isCorrectFormat
}

const getBase64 = (img: RcFile, callback: (url: string) => void) => {
	const reader = new FileReader()

	reader.addEventListener('load', () => callback(reader.result as string))
	reader.readAsDataURL(img)
}
