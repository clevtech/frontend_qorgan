import { ConfigProvider } from 'antd'
import { DirectionType } from 'antd/lib/config-provider'
import { useEffect } from 'react'
import { useSelector } from 'react-redux'

import { resources } from '@/lang'
import { Routes } from '@/routes'
import { RootState } from '@/store'
import { useBodyClass } from '@/utils/hooks/useBodyClass'

export const Views = () => {
	const { direction, locale } = useSelector((state: RootState) => state.theme)

	useBodyClass(`dir-${direction}`)

	useEffect(() => {
		if (window === undefined) {
			return
		}

		const root = window.document.documentElement

		root.setAttribute('dir', direction)
	}, [direction])

	return (
		<ConfigProvider
			direction={direction as DirectionType}
		
		>
			<Routes />
		</ConfigProvider>
	)
}
