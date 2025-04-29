import { Suspense, lazy, memo } from 'react'
import { useSelector } from 'react-redux'

import { Loading } from '@/components/shared-components/Loading'
import { Spin } from 'antd'
import { RootState } from '@/store'
import { Views } from '@/views'

const AppLayout = lazy(() => import('@/layouts/AppLayout'))
const AuthLayout = lazy(() => import('@/layouts/AuthLayout'))

export const Layouts = memo(() => {
	const { access_token } = useSelector((state: RootState) => state.auth)
	const { blankLayout } = useSelector((state: RootState) => state.theme)

	const Layout = access_token && !blankLayout ? AppLayout : AuthLayout

	return (
		<Suspense fallback={<Spin />}>
			<Layout>
				<Views />
			</Layout>
		</Suspense>
	)
})
