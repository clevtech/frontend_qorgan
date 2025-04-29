import { Typography } from 'antd'

import GuestCard from '@/components/app-components//GuestCard'
import { CustomPageHeader } from '@/components/custom-components/CustomPageHeader'

const Global = () => {
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
				<GuestCard />
			</div>
		</>
	)
}

export default Global
