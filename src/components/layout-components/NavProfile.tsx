import jwtDecode from 'jwt-decode'

import { Button, Typography } from 'antd'
import { FC, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { ACCESS_TOKEN, REFRESH_TOKEN } from '@/constants/AuthConstant'
import { RootState } from '@/store'
import { onSignOut } from '@/store/slices/authSlice.ts'
import { LogoutOutlined } from '@ant-design/icons'
import { Notifications } from './Notifications'

export const NavProfile: FC<{ data?: unknown }> = ({ data }) => {
	const { access_token } = useSelector((state: RootState) => state.auth)

	const [account, setAccount] = useState({ fullName: '', role: '' })
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const dispatch = useDispatch()
	useEffect(() => {
		setIsLoading(true)

		if (access_token) {
			const decoded = jwtDecode(access_token) as {
				fullName: string
				role: string
			}

			const { fullName, role } = decoded

			setAccount({ fullName, role })
		}

		setIsLoading(false)
	}, [access_token])

	return (
		<div>
			{/* {!isLoading && account && (
				<>
					<Typography.Text className='mr-3 font-weight-semibold'>
						{data.ip_addr}
					</Typography.Text>
				</>
			)} */}
			{/* <Notifications /> */}
			<Button
				icon={<LogoutOutlined />}
				onClick={() => {
					dispatch(onSignOut())

					localStorage.removeItem(ACCESS_TOKEN)
					localStorage.removeItem(REFRESH_TOKEN)
					localStorage.removeItem('ROLE')
					localStorage.removeItem('USER_FULL_NAME')
				}}
				type='text'
			/>
		</div>
	)
}
