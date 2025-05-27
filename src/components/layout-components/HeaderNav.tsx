import { Layout } from 'antd'
import { FC, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, Link } from 'react-router-dom'

import { Logo } from '@/components/layout-components/Logo'
import { NavProfile } from '@/components/layout-components/NavProfile'
import { ACCESS_TOKEN } from '@/constants/AuthConstant'

import {
	NAV_TYPE_TOP,
	SIDE_NAV_COLLAPSED_WIDTH,
	SIDE_NAV_WIDTH,
} from '@/constants/ThemeConstant'
import { RootState } from '@/store'
import {
	onMobileNavChange,
	onNavCollapsedChange,
} from '@/store/slices/themeSlice'

import { API_BASE_URL } from '@/configs/AppConfig'
import logo from '@/images/logo.png'
import utils from '@/utils'
import axios from 'axios'
import notext from '../../../public/images/notext.png'

const { Header } = Layout

export const HeaderNav: FC<{ isMobile: boolean }> = ({ isMobile }) => {
	const [, setSearchActive] = useState(false)
	const [title, setTitle] = useState('')
	const location = useLocation()

	const dispatch = useDispatch()

	const currentTheme = useSelector(
		(state: RootState) => state.theme.currentTheme
	)
	const headerNavColor = useSelector(
		(state: RootState) => state.theme.headerNavColor
	)
	const mobileNav = useSelector((state: RootState) => state.theme.mobileNav)
	const navCollapsed = useSelector(
		(state: RootState) => state.theme.navCollapsed
	)
	const navType = useSelector((state: RootState) => state.theme.navType)

	const onSearchClose = () => {
		setSearchActive(false)
	}

	// useEffect(() => {
	// 	axios
	// 		.get(API_BASE_URL + '/global/me', {
	// 			headers: {
	// 				Authorization: localStorage.getItem(ACCESS_TOKEN)
	// 					? `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`
	// 					: undefined,
	// 			},
	// 		})
	// 		.then(res => {
	// 			if (res.status == 200) {
	// 				setTitle(res.data)
	// 				localStorage.setItem('organization_name', `${res?.data.name}`)
	// 				localStorage.setItem('me', `${res.data.ip_addr}`)
	// 				localStorage.setItem('selected', `${res.data.ip_addr}`)
	// 			}
	// 		})
	// 		.catch(e => console.log(e))
	// }, [location.pathname])

	const onToggle = () => {
		if (!isMobile) {
			    dispatch(onNavCollapsedChange(!navCollapsed))
		} else {
			dispatch(onMobileNavChange(!mobileNav))
		}
	}

	const isNavTop = navType === NAV_TYPE_TOP ? true : false

	const mode = () => {
		if (!headerNavColor) {
			return utils.getColorContrast(
				currentTheme === 'dark' ? '#00000' : '#ffffff'
			)
		}
		return utils.getColorContrast(headerNavColor)
	}

	const navMode = mode()

	const getNavWidth = () => {
		if (isNavTop || isMobile) {
			return '0px'
		}
		if (navCollapsed) {
			return `${SIDE_NAV_COLLAPSED_WIDTH}px`
		} else {
			return `${SIDE_NAV_WIDTH}px`
		}
	}

	useEffect(() => {
		if (!isMobile) {
			onSearchClose()
		}
	})

	console.log(location.pathname)

	return (
		<Header
			className={`app-header ${navMode}`}
			style={{ backgroundColor: headerNavColor }}
		>
			<div className={`app-header-wrapper ${isNavTop ? 'layout-top-nav' : ''}`}>
				<Logo src={navCollapsed ? notext : logo} />
				<div className='nav' style={{ width: `calc(100% - ${getNavWidth()})`, display: 'flex', alignItems: 'center' }}>
					<div className='nav-left'>
						{/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
						<div
							className='d-flex align-items-center nav-item'
							onClick={onToggle}
						>
							{/* {navCollapsed || isMobile ? (
								<MenuUnfoldOutlined className='nav-icon' />
							) : (
								<MenuFoldOutlined className='nav-icon' />
							)} */}
						</div>
					</div>
							<h1 style={{ margin: 0, padding: 0, position: 'absolute', left: 16 }}>Beren Qorgan Antidrone</h1>
					<div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flex: 1 }}>
						<Link
							to="/app/map"
							style={{
								fontSize: '1.2rem',
								fontWeight: 500,
								color: location.pathname === '/app/map' ? '#1890ff' : '#000',
							}}
						>
							Карта
						</Link>
						<Link
							to="/app/incidents"
							style={{
								fontSize: '1.2rem',
								fontWeight: 500,
								color: location.pathname === '/app/incidents' ? '#1890ff' : '#000',
							}}
						>
							Инциденты
						</Link>
					</div>
					<div className='nav-right'>
						{/* <NavProfile data={title} /> */}
					</div>
				</div>
			</div>
		</Header>
	)
}
