import { LogsCard } from '@/components/app-components/settings/LogsCard'
import { CustomPageHeader } from '@/components/custom-components/CustomPageHeader'
import useDebounce from '@/hooks/useDebounce'
import { LogsService } from '@/services/LogsService'
import { Typography } from 'antd'
import { useCallback, useState } from 'react'

const Logs = () => {


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
				subTitle='Списки действей пользователей'
			/>

			<div className='d-flex flex-column' style={{ gap: '1.5rem' }}>
				<LogsCard />
			</div>
		</>
	)
}

export default Logs
