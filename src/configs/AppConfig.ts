import {
	DIR_LTR,
	NAV_TYPE_SIDE,
	SIDE_NAV_LIGHT,
} from '@/constants/ThemeConstant'

// export const IP_ADDRESS = '192.168.1.172:8008';
// current ip address
export const IP_ADDRESS = window.location.hostname + ':8008'

export const APP_NAME = 'UmAI Army Safety'

export const API_BASE_URL = 'http://' + window.location.hostname + ':8080'

// export const API_BASE_URL = 'http://192.168.1.249:8080'

export const WEBSOCKET_BASE_URL = `ws://${IP_ADDRESS}/ws`

export const APP_PREFIX_PATH = '/app'
export const AUTH_PREFIX_PATH = '/auth'

export const AUTHENTICATED_ENTRY = `${APP_PREFIX_PATH}/incidents`
export const UNAUTHENTICATED_ENTRY = '/sign-in'

export const REDIRECT_URL_KEY = 'redirect'

export const THEME_CONFIG = {
	navCollapsed: true,
	sideNavTheme: SIDE_NAV_LIGHT,
	locale: 'ru',
	navType: NAV_TYPE_SIDE,
	topNavColor: '#3e82f7',
	headerNavColor: '',
	mobileNav: false,
	currentTheme: 'light',
	direction: DIR_LTR,
	blankLayout: false,
}
