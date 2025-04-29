import { MODAL_WIDTH } from '@/constants/LayoutConstant'
import { TransportTrackingRead } from '@/types/custom'
import { Modal, Table, TableColumnsType, Typography } from 'antd'

import moment from 'moment'

type Props = {
	isOpen: boolean
	onClose: () => void
	dataSource?: any
}

export const TransportModal = (props: Props) => {
	const { isOpen, onClose, dataSource } = props
	const { attendances } = dataSource
	const currentPath = location.pathname

	const inColumns = [
		{
			dataIndex: 'plate',
			title: 'Гос. номер',
			render: (text: any) => {
				return <Typography>{text.toUpperCase()}</Typography>
			},
		},
		{
			dataIndex: 'model',
			title: 'Марка',
		},
		{
			dataIndex: 'organization',
			title: 'Организация',
		},
		{
			dataIndex: 'dateOfDeparture',
			title: 'Дата въезда',
			render: (value: string) => moment(value).format('DD/MM/YYYY'),
		},
	] as TableColumnsType<TransportTrackingRead>

	const outColumns = [
		{
			dataIndex: 'plate',
			title: 'Гос. номер',
		},
		{
			dataIndex: 'model',
			title: 'Марка',
		},
		{
			dataIndex: 'organization',
			title: 'Организация',
		},
		{
			dataIndex: 'datetime',
			title: 'Дата и время последнего выезда',
			render: (value: string) => moment(value).format('DD/MM/YYYY'),
		},
	] as TableColumnsType<TransportTrackingRead>

	return (
		<Modal
			onCancel={onClose}
			onOk={onClose}
			open={isOpen}
			title={
				<Typography.Text className='font-size-base'>
					Список транспорта
				</Typography.Text>
			}
			width={MODAL_WIDTH}
		>
			<Table
				columns={
					currentPath.split('/')[2] == 'license_plate_recognition_exit'
						? outColumns
						: inColumns
				}
				dataSource={attendances}
			/>
		</Modal>
	)
}
