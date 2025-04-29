import {
	Button,
	Form,
	Input,
	InputRef,
	Modal,
	Typography,
	notification,
} from 'antd'
import { ChangeEvent, useEffect, useRef, useState } from 'react'

import { LoadingOutlined, PlusOutlined } from '@ant-design/icons'

import { MODAL_WIDTH } from '@/constants/LayoutConstant'
import { EmployeeService } from '@/services/EmployeeService'
import { EmployeeCreate } from '@/types/custom'

import type { UploadChangeParam } from 'antd/es/upload'
import type { RcFile, UploadFile, UploadProps } from 'antd/es/upload/interface'
import axios from 'axios'
import { API_BASE_URL } from '@/configs/AppConfig'

type Props = {
	isOpen: boolean
	fetchDataSource: () => Promise<void>
	onClose: () => void
	mode: 'parent' | 'child'
}

export const CreateGuestModal = ({
	isOpen,
	fetchDataSource,
	onClose,
	mode,
}: Props) => {
	const inputRef = useRef<InputRef>(null)

	const [guest, setGuest] = useState({
		name: '',
		ip_addr: '',
		lan: '',
	})

	const [imgPath, setImgPath] = useState<string>()
	const [isLoading, setIsLoading] = useState(false)


	const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
		const { name, value } = event.target

		setGuest(prev => ({
			...prev,
			[name]: value,
		}))
	}

	const handleCreate = async () => {
		const payload = {
			ip_addr: guest.ip_addr,
		};

		setIsLoading(true)

		try {
			if (mode === "parent") {
				await EmployeeService.createEmployeesParent(payload);
			} else {
				await EmployeeService.createEmployeesChild(payload);
			}

			notification.success({
				message: 'Успешно',
				description: 'Успешно создан',
			});

			fetchDataSource();
			setGuest({ name: '', ip_addr: '', lan: '' });
			setImgPath(undefined);
		} catch (error) {
			notification.error({
				message: 'Ошибка',
				description: 'Не удалось создать объект',
			});
			setGuest({ name: '', ip_addr: '', lan: '' });
		} finally {
			setIsLoading(false)
			onClose();
		}
	};


	return (
		<Modal
			footer={null}
			onCancel={() => {
				onClose()

				setGuest({
					name: '',
					ip_addr: '',
					lan: '',
				})
			}}
			open={isOpen}
			title={
				<Typography.Text className='font-size-base font-weight-semibold'>
					Добавление { mode == "parent" ? "материнского" : "дочернего" } объекта
				</Typography.Text>
			}
			width={MODAL_WIDTH / 1.25}
		>
			<Form autoComplete='off' layout='vertical'>
				<div className='d-flex' style={{ gap: '1rem' }}>
					<div
						className='m-3 d-flex flex-column'
						style={{ width: 'calc(100% - 20px - 1rem)', gap: '0.5rem' }}
					>
						<Typography>Ниже введите данные для добавления объекта</Typography>
						{/* <Form.Item
							className='mb-0'
							label='Название'
							required
							rules={[
								{
									required: true,
									message: 'Заполните название',
								},
							]}
						>
							<Input
								name='name'
								placeholder='Вг.№1,с.Ескельдинский...'
								onChange={handleInputChange}
								value={guest.name}
							/>
						</Form.Item> */}

						<Form.Item
							className='mb-0'
							label='IP адрес'
							required
							rules={[
								{
									required: true,
									message: 'Заполните  IP адрес',
								},
							]}
						>
							<Input
								name='ip_addr'
								onChange={handleInputChange}
								placeholder='192.168.0.141'
								value={guest.ip_addr ?? ''}
								ref={inputRef}
							/>
						</Form.Item>

						{/* <Form.Item
							className='mb-0'
							label='Адрес'
							required
							rules={[
								{
									required: true,
									message: 'Заполните адрес',
								},
							]}
						>
							<Input
								name='lan'
								onChange={handleInputChange}
								placeholder='51.12471 с.ш. 71.42905 в.д.'
								value={guest.lan ?? ''}
								ref={inputRef}
							/>
						</Form.Item> */}
					</div>
				</div>

				<div
					className='d-flex justify-content-end'
					style={{
						padding: '10px 16px',
						margin: '24px 0px -24px -24px',
					}}
				>
					<Button

						onClick={() => {
							onClose()

						}}
					>
						Отменить
					</Button>
					<Button
						onClick={handleCreate}
						style={{ marginLeft: '8px' }}
						type='primary'
						htmlType='submit'
						disabled={localStorage.getItem('ROLE') !== 'superadmin'}
					>
						{isLoading
							? 
							<LoadingOutlined></LoadingOutlined>
							:
							<p style={{color:'white'}}>Добавить</p>
						}
						
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
