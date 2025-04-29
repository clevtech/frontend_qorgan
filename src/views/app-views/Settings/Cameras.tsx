import { Typography } from 'antd'

import CameraCard from '@/components/app-components/settings/CameraCard'
import { CustomPageHeader } from '@/components/custom-components/CustomPageHeader'

const Cameras = () => {
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
				<CameraCard />
			</div>
		</>
	)
}

export default Cameras
