import { Avatar, Modal, Radio, Table, Typography } from 'antd'
import { useState } from 'react'

type Props = {
	isModalOpen: boolean
	summary: any
	openedFrom: 'dashboard' | 'attendance'
	closeModal: any
}

export const MilitaryPersonnelListModal = ({
	isModalOpen,
	summary,
	closeModal,
}: Props) => {
	const [filterValue, setFilterValue] = useState<'a' | 'b' | 'c' | 'd'>('a')


	const columns = [
		{
			title: 'ФИО',
			render: (_: any, record: any) => (
				<div style={{ display: 'flex', alignItems: 'center', gap: '.6rem' }}>
					<Avatar src={'data:image/png;base64, ' + record.photo_base64} />
					<Typography>
						{record?.surname} {`  `} {record?.name}
					</Typography>
				</div>
			),
		},

	]

	const radioGroupOptions = [
		{
			label: `По списку (${summary?.all_users?.length ?? 0})`,
			value: 'a',
		},
		{
			label: `Опоздавшие (${summary?.late?.length ?? 0})`,
			value: 'c',
		},
		{
			label: `Отсутствующие (${summary?.missings?.length ?? 0})`,
			value: 'd',
		},
	]

	const filteredItems =
		filterValue === 'a'
			? summary.all_users
			: filterValue === 'c'
			? summary.attendances
			: summary.missings

	return (
		<Modal
			onCancel={closeModal}
			onOk={() => closeModal()}
			open={isModalOpen}
			title={`Список сотрудникoв`}
			width={'60%'}
		>
			<div className='d-flex justify-content-center'>
				<Radio.Group
					className='mb-3'
					value={filterValue}
					optionType='button'
					options={radioGroupOptions}
					onChange={e => {
						const { value } = e.target

						setFilterValue(value)
					}}
				/>
			</div>
			
			<Table columns={columns} dataSource={filteredItems} />
		</Modal>
	)
}
