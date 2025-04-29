import { Empty, Spin, Tag } from 'antd'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { CustomTable } from '@/components/custom-components/CustomTable'
import { API_BASE_URL } from '@/configs/AppConfig'
import { AppDispatch, RootState } from '@/store'
import { getFaceCheckpoints } from '@/store/slices/faceCheckpointSlice'
import { Form, Input, InputNumber, Popconfirm, Typography } from 'antd'
import axios from 'axios'
import moment from 'moment'
import { ReadModal } from './ReadModal'
import { ACCESS_TOKEN } from '@/constants/AuthConstant'


type Props = {
	dateOfPass: string | undefined
	filterValue: {
		filterValue:'employee' | 'guest' | undefined
		child: string | undefined
		isCurrent: boolean
	}
	formattedDate: string
}

const EditableCell = ({
	editing,
	dataIndex,
	title,
	inputType,
	record,
	index,
	children,
	...restProps
}: any) => {
	const inputNode = inputType === 'number' ? <InputNumber /> : <Input />



	return (
		<td {...restProps}>
			{editing ? (
				<Form.Item
					name={dataIndex}
					style={{ margin: 0 }}
					rules={[
						{
							required: true,
							message: `Введите ${title}!`,
						},
					]}
				>
					{inputNode}
				</Form.Item>
			) : (
				children
			)}
		</td>
	)
}

export const EntranceTab = (props: Props) => {
	const dispatch = useDispatch<AppDispatch>()
	const [form] = Form.useForm()
	const [editingKey, setEditingKey] = useState('')
	const [modalOpen, setModalOpen] = useState(false)
	const [id, setId] = useState('')
	const [pageSize, setPageSize] = useState(9)
	const [listWithAvatars, setListWithAvatars] = useState<any[]>([])

	const { isLoading, data } = useSelector(
		(state: RootState) => state.faceCheckpoint.entrance
	)

	const total = data?.total_count
	const {filterValue, child, isCurrent} = props.filterValue

	const [current, setCurrent] = useState<number>(1)

	useEffect(() => {
		dispatch(
			getFaceCheckpoints({
				query: {
					skip: (current - 1) * pageSize,
					limit: pageSize,
					type: 1,
					user_type: filterValue ? filterValue : undefined,
					current: isCurrent ? 1 : undefined,
					typeOfPass: 'Вход',
					// time_from: moment(props.formattedDate).toISOString(),
					// time_till: moment(props.formattedDate).add(1, 'days').toISOString()
				},
			})
		)
	}, [current, props.dateOfPass, props.filterValue, dispatch, pageSize])

	const columns = [
		{
			dataIndex: 'datetime',
			key: 'datetime',
			sortDirections: ['ascend', 'descend'],
			title: 'Время входа',
			width: '10%',
			render: (createdAt: string) => (
				<Typography.Text>
					{moment(createdAt).format('DD/MM/YYYY')}
				</Typography.Text>
			),
		},
		{
			dataIndex: 'photo_base64',
			key: 'photo_base64',
			title: '',
			width: '5%',
			render: (photo_base64: string) => {
				return (
					<img
						src={'data:image/png;base64, ' + photo_base64	}
						alt='Фото'
						style={{ width: 50, height: 50, borderRadius: 50 }}
					/>
				)
			},
		},
		{
			dataIndex: 'name',
			key: 'name',
			title: 'Имя',
			width: '20%',
			editable: true,
		},
		{
			dataIndex: 'surname',
			key: 'surname',
			title: 'Фамилия',
			width: '20%',
			editable: true,
		},
		{
			dataIndex: 'department',
			key: 'department',
			title: 'Департамент',
			width: '20%',
			editable: true,
		},	
		{
			dataIndex: 'entrance_name',
			key: 'entrance_name',
			sortDirections: ['ascend', 'descend'],
			title: 'Места входа',
			width: '20%',
			render: (createdAt: string) => (
				<Typography.Text>{createdAt}</Typography.Text>
			),
		},
		{
			title: 'Статус',
			render: (data: any) => {
				const { is_absent, is_late } = data

				if (is_absent) {
					return <Tag color='error'>Отсутсвует</Tag>
				}

				if (is_late) {
					return <Tag color='warning'>Опоздал</Tag>
				}

				if (!is_late && !is_absent) {
					return <Tag color='success'>Прибыл</Tag>
				}
			},
		},
		{
			key: 'action',
			title: 'Действие',
			width: '25%',
			render: (_: any, record: any) => {
				const editable = isEditing(record)
				return (
					<>
						{editable ? (
							<span>
								<Typography.Link
									onClick={() => save(record.key)}
									disabled={localStorage.getItem('ROLE') !== 'superadmin'}
									style={{ marginInlineEnd: 12 }}
								>
									Сохранить
								</Typography.Link>
								<Popconfirm title='Sure to cancel?' onConfirm={cancel}>
									<a style={{ color: '#FF4D4F' }}>Отменить</a>
								</Popconfirm>
							</span>
						) : (
							<>
								<Typography.Link
									disabled={editingKey !== ''}
									onClick={() => {
										setId(record)
										setModalOpen(true)
									}}
									className='mr-3'
								>
									Подробнее
								</Typography.Link>
								<Typography.Link
									disabled={editingKey !== ''}
									onClick={() => edit(record)}
								>
									Изменить
								</Typography.Link>
							</>
						)}
					</>
				)
			},
		},
	]

	const isEditing = (record: any) => record.attendance_id === editingKey

	const edit = (record: any) => {
		form.setFieldsValue({ name: '', surname: '', ...record })
		setId(record)
		setEditingKey(record.attendance_id)
	}

	const cancel = () => {
		setEditingKey('')
	}

	const changeItemHandler = async (item: any) => {
		axios.patch(API_BASE_URL + '/attendance/' + id?.attendance_id, {
			...item,
				headers: {
					Authorization: localStorage.getItem(ACCESS_TOKEN)
						? `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`
						: undefined,
				},
		})
	}

	const save = async (key: React.Key) => {
		try {
			const row = await form.validateFields()

			const newData = [...listWithAvatars]
			const index = newData.findIndex(item => key === item.key)
			if (index) {
				const item = newData[index]
				newData.splice(index, 1, {
					...item,
					...row,
				})
					changeItemHandler(row)
					dispatch(
						getFaceCheckpoints({
							query: {
								skip: (current - 1) * pageSize,
								limit: pageSize,
								type: 1,
								user_type: filterValue ? filterValue : undefined,
								current: isCurrent ? 1 : undefined,
								typeOfPass: 'Вход',
								// time_from: moment(props.formattedDate).toISOString(),
								// time_till: moment(props.formattedDate).add(1, 'days').toISOString()
							},
						})
					)
				setEditingKey('')
			} else {
				newData.push(row)
				dispatch(
					getFaceCheckpoints({
						query: {
							skip: (current - 1) * pageSize,
							limit: pageSize,
							type: 1,
							user_type: filterValue ? filterValue : undefined,
							current: isCurrent ? 1 : undefined,
							typeOfPass: 'Вход',
							// time_from: moment(props.formattedDate).toISOString(),
							// time_till: moment(props.formattedDate).add(1, 'days').toISOString()
						},
					})
				)
				setEditingKey('')
			}
		} catch (errInfo) {
			console.log('Validate Failed:', errInfo)
		}
	}

  const mergedColumns: any['columns'] = columns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record: any) => ({
        record,
        inputType: col.dataIndex === 'age' ? 'number' : 'text',
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });

	return (
		<div>
			<Spin spinning={isLoading}>
				{data?.attendances && total > 0 ? (
					<Form form={form} component={false}>
						<CustomTable
							columns={mergedColumns}
							current={current}
							dataSource={data?.attendances}
							loading={isLoading}
							pageSize={pageSize}
							setCurrent={setCurrent}
							setPageSize={setPageSize}
							total={total || 0}
							components={{
								body: { cell: EditableCell },
							}}
						/>
					</Form>
				) : (
					<Empty className='mt-5' image={Empty.PRESENTED_IMAGE_SIMPLE} />
				)}
				<ReadModal
					incidentId={id}
					isModalOpen={modalOpen}
					setModalOpen={setModalOpen}
				/>
			</Spin>
		</div>
	)
}
