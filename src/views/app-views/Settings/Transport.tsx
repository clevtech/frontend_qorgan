import { Typography } from 'antd'

import TransportCard from '@/components/app-components/settings/TransportCard'
import { CustomPageHeader } from '@/components/custom-components/CustomPageHeader'

const Transport = () => {
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
				<TransportCard />
			</div>
		</>
	)
}

export default Transport
