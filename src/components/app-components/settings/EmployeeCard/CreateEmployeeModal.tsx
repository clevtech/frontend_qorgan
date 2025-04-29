import {
	Button,
	Form,
	Input,
	InputRef,
	Modal,
	notification,
	Select,
	Typography,
	Upload,
} from 'antd'
import { ChangeEvent, useRef, useState } from 'react'

import { LoadingOutlined, PlusOutlined } from '@ant-design/icons'

import { MODAL_WIDTH } from '@/constants/LayoutConstant'
import { EmployeeCreate } from '@/types/custom'

import { EmployeeService } from '@/services/EmployeeServiceSettings'
import type { UploadChangeParam } from 'antd/es/upload'
import type { RcFile, UploadFile, UploadProps } from 'antd/es/upload/interface'

const getBase64 = (img: RcFile, callback: (url: string) => void) => {
	const reader = new FileReader()

	reader.addEventListener('load', () => callback(reader.result as string))
	reader.readAsDataURL(img)
}

type Props = {
	isOpen: boolean
	fetchDataSource: () => Promise<void>
	onClose: () => void
}

export const CreateEmployeeModal = ({
	isOpen,
	fetchDataSource,
	onClose,
}: Props) => {
	const inputRef = useRef<InputRef>(null)

	const [employee, setEmployee] = useState<EmployeeCreate>({
		name: '',
		surname: '',
		fathername: '',
		role: undefined,
		img_path: '',
	})

	const [imgPath, setImgPath] = useState<string>()
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
					...prev,
					img_path: url,
				}))
			})

			return
		}
	}

	// const formatPhoneNumber = (input: string) => {
	//     // Remove non-numeric characters
	//     const cleaned = input.replace(/\D/g, '');
	//     // Check if the number is valid
	//     if (cleaned.length !== 11) {
	//         return input; // Return input as is if it's not a valid phone number
	//     }
	//     // Format the number as +7 (xxx) xxx-xx-xx
	//     const formatted = `+7 (${cleaned.substring(1, 4)}) ${cleaned.substring(4, 7)}-${cleaned.substring(
	//         7,
	//         9,
	//     )}-${cleaned.substring(9, 11)}`;
	//     return formatted;
	// };

	const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
		const { name, value } = event.target
		setEmployee(prev => ({
			...prev,
			[name]: value,
		}))
	}

	type RoleType =
		| 'employee'
		| 'guest'
		| 'administrator'
		| 'duty'
		| 'dutyHelper'
		| 'superadmin'
		| undefined
	const handleRoleChange = (value: RoleType) => {
		setEmployee(prev => ({
			...prev,
			role: value,
		}))
	}

	const employeeRoles: { value: RoleType; label: string }[] = [
		{ value: 'employee', label: 'Сотрудник' },
		{ value: 'administrator', label: 'Администратор' },
		{ value: 'superadmin', label: 'Супер администратор' },
	]

	const handleCreate = async () => {
		await EmployeeService.createEmployees({
			...employee,
			imgPath: imgPath,
		})
			.then(() => {
				notification.success({
					message: 'Успешно',
					description: 'Сотрудник успешно создан',
				})
			})
			.finally(() => {
				fetchDataSource()

				onClose()

				setEmployee({})
				setImgPath(undefined)
			})
	}

	return (
		<Modal
			footer={null}
			onCancel={() => {
				onClose()

				setEmployee({})
			}}
			open={isOpen}
			title={
				<Typography.Text className='font-size-base font-weight-semibold'>
					Добавить нового сотрудника
				</Typography.Text>
			}
			width={MODAL_WIDTH / 1.25}
		>
			<Form autoComplete='off' layout='vertical'>
				<div className='d-flex' style={{ gap: '1rem' }}>
					<div>
						<Upload
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
									src={'data:image/png;base64,' + employee.avatar}
									alt='avatar111'
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

						<Form.Item className='mb-0' label='Отчество'>
							<Input
								name='fathername'
								onChange={handleInputChange}
								value={employee.fathername ?? ''}
							/>
						</Form.Item>
						<Form.Item className='mb-0' label='Должность'>
							<Input
								name='rank'
								onChange={handleInputChange}
								value={employee.rank ?? ''}
							/>
						</Form.Item>
						{localStorage.getItem('ROLE') === 'superadmin' && (
							<Form.Item
								className='mb-0'
								label='Роль'
								required
								rules={[
									{
										required: true,
										message: 'Заполните имя',
									},
								]}
							>
								<Select
									name='role'
									value={employee.role ?? ''}
									onChange={handleRoleChange}
									options={employeeRoles}
								/>
							</Form.Item>
						)}
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
					<Button
						onClick={() => {
							onClose()

							setEmployee({})
						}}
					>
						Отменить
					</Button>
					<Button
						disabled={!employee.name || !employee.surname || !employee.role}
						onClick={handleCreate}
						style={{ marginLeft: '8px' }}
						type='primary'
						htmlType='submit'
					>
						Добавить
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
