import { Typography } from 'antd'

import { EmployeeCard } from '@/components/app-components/settings/EmployeeCard'
import { CustomPageHeader } from '@/components/custom-components/CustomPageHeader'

const Employee = () => {
	return (
		<>
			<CustomPageHeader
				title={
					<Typography.Text
						className='font-weight-semibold'
						style={{ fontSize: '16px' }}
					>
						Настройки
					</Typography.Text>
				}
				subTitle='Списки системы, журналы'
			/>

			<div className='d-flex flex-column' style={{ gap: '1.5rem' }}>
				<EmployeeCard />
			</div>
		</>
	)
}

export default Employee
