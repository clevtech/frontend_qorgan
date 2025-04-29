import { Typography } from 'antd'

import {GuestCard2} from '@/components/app-components/settings/GuestCard2'
import { CustomPageHeader } from '@/components/custom-components/CustomPageHeader'

const Guest2 = () => {
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
				<GuestCard2 />
			</div>
		</>
	)
}

export default Guest2
