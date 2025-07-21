import { lazy } from 'react'

import { APP_PREFIX_PATH, AUTH_PREFIX_PATH } from '@/configs/AppConfig'

export const publicRoutes = [
	{
		key: 'sign-in',
		path: `${AUTH_PREFIX_PATH}/sign-in`,
		component: lazy(() => import('@/views/auth-views/SignIn')),
	},
	{
		key: 'reg-2fa',
		path: `${AUTH_PREFIX_PATH}/reg-2fa`,
		component: lazy(() => import('@/views/auth-views/Register2FA')),
	},	
]

export const protectedRoutes = [
	// {
	// 	key: 'attendance',
	// 	path: `${APP_PREFIX_PATH}/attendance`,
	// 	component: lazy(() => import('@/views/app-views/Attendance')),
	// },
	// {
	// 	key: 'cameras',
	// 	path: `${APP_PREFIX_PATH}/cameras`,
	// 	component: lazy(() => import('@/views/app-views/Cameras')),
	// },
	// {
	// 	key: 'checkpoint',
	// 	path: `${APP_PREFIX_PATH}/checkpoint`,
	// 	component: lazy(() => import('@/views/app-views/Checkpoint')),
	// },
	// {
	// 	key: 'dailyOrders',
	// 	path: `${APP_PREFIX_PATH}/daily-orders`,
	// 	component: lazy(() => import('@/views/app-views/DailyOrders')),
	// },
	// {
	// 	key: 'dashboard',
	// 	path: `${APP_PREFIX_PATH}/dashboard`,
	// 	component: lazy(() => import('@/views/app-views/Dashboard')),
	// },
	{
		key: 'incidents',
		path: `${APP_PREFIX_PATH}/incidents`,
		component: lazy(() => import('@/views/app-views/Incidents')),
	},
		{
		key: 'map',
		path: `${APP_PREFIX_PATH}/map`,
		component: lazy(() => import('@/views/app-views/Map')),
	},
	// {
	// 	key: 'transport',
	// 	path: `${APP_PREFIX_PATH}/transport`,
	// 	component: lazy(() => import('@/views/app-views/Transport')),
	// },
	// {
	// 	key: 'transport-settings',
	// 	path: `${APP_PREFIX_PATH}/transport-settings`,
	// 	component: lazy(() => import('@/views/app-views/Settings/Transport')),
	// },
	// {
	// 	key: 'waybills',
	// 	path: `${APP_PREFIX_PATH}/waybills`,
	// 	component: lazy(() => import('@/views/app-views/Waybills')),
	// },
	// {
	// 	key: 'employees',
	// 	path: `${APP_PREFIX_PATH}/employees`,
	// 	component: lazy(() => import('@/views/app-views/Settings/Employee')),
	// },
	// {
	// 	key: 'logs',
	// 	path: `${APP_PREFIX_PATH}/logs`,
	// 	component: lazy(() => import('@/views/app-views/Settings/Logs')),
	// },
	// {
	// 	key: 'guests',
	// 	path: `${APP_PREFIX_PATH}/guests`,
	// 	component: lazy(() => import('@/views/app-views/Settings/Guest2')),
	// },
	// {
	// 	key: 'cameras-settings',
	// 	path: `${APP_PREFIX_PATH}/cameras-settings`,
	// 	component: lazy(() => import('@/views/app-views/Settings/Cameras')),
	// },
	// {
	// 	key: 'global-settings',
	// 	path: `${APP_PREFIX_PATH}/global-settings`,
	// 	component: lazy(() => import('@/views/app-views/Settings/Guest')),
	// },
	// {
	// 	key: 'lying',
	// 	path: `${APP_PREFIX_PATH}/lying`,
	// 	component: lazy(() => import('@/views/app-views/Multi')),
	// },
	// {
	// 	key: 'crowd',
	// 	path: `${APP_PREFIX_PATH}/crowd`,
	// 	component: lazy(() => import('@/views/app-views/Multi')),
	// },
	// {
	// 	key: 'duty',
	// 	path: `${APP_PREFIX_PATH}/duty`,
	// 	component: lazy(() => import('@/views/app-views/Multi')),
	// },
	// {
	// 	key: 'restricted_entry',
	// 	path: `${APP_PREFIX_PATH}/restricted_entry`,
	// 	component: lazy(() => import('@/views/app-views/Multi')),
	// },
	// {
	// 	key: 'camera_block',
	// 	path: `${APP_PREFIX_PATH}/camera_block`,
	// 	component: lazy(() => import('@/views/app-views/Multi')),
	// },
	// {
	// 	key: 'face_recognition_enter',
	// 	path: `${APP_PREFIX_PATH}/face_recognition_enter`,
	// 	component: lazy(() => import('@/views/app-views/Multi')),
	// },
	// {
	// 	key: 'license_plate_recognition_enter',
	// 	path: `${APP_PREFIX_PATH}/license_plate_recognition_enter`,
	// 	component: lazy(() => import('@/views/app-views/Multi')),
	// },
	// {
	// 	key: 'violence',
	// 	path: `${APP_PREFIX_PATH}/violence`,
	// 	component: lazy(() => import('@/views/app-views/Multi')),
	// },
	// {
	// 	key: 'fire',
	// 	path: `${APP_PREFIX_PATH}/fire`,
	// 	component: lazy(() => import('@/views/app-views/Multi')),
	// },
	// {
	// 	key: 'repair_car',
	// 	path: `${APP_PREFIX_PATH}/repair_car`,
	// 	component: lazy(() => import('@/views/app-views/Incidents')),
	// },
	// {
	// 	key: 'thermo_zone',
	// 	path: `${APP_PREFIX_PATH}/thermo_zone`,
	// 	component: lazy(() => import('@/views/app-views/Multi')),
	// },
	// {
	// 	key: 'working_hours',
	// 	path: `${APP_PREFIX_PATH}/working_hours`,
	// 	component: lazy(() => import('@/views/app-views/Multi')),
	// },
	// {
	// 	key: 'storage',
	// 	path: `${APP_PREFIX_PATH}/storage`,
	// 	component: lazy(() => import('@/views/app-views/Multi')),
	// },
	// {
	// 	key: 'acceptance',
	// 	path: `${APP_PREFIX_PATH}/acceptance`,
	// 	component: lazy(() => import('@/views/app-views/Multi')),
	// },
	// {
	// 	key: 'service_table',
	// 	path: `${APP_PREFIX_PATH}/service_table`,
	// 	component: lazy(() => import('@/views/app-views/Multi')),
	// },
	// {
	// 	key: 'people_map',
	// 	path: `${APP_PREFIX_PATH}/people_map`,
	// 	component: lazy(() => import('@/views/app-views/Multi')),
	// },
	// {
	// 	key: 'cashier',
	// 	path: `${APP_PREFIX_PATH}/cashier`,
	// 	component: lazy(() => import('@/views/app-views/Multi')),
	// },
	// {
	// 	key: 'checkout_lines',
	// 	path: `${APP_PREFIX_PATH}/checkout_lines`,
	// 	component: lazy(() => import('@/views/app-views/Multi')),
	// },
]
