import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { ACCESS_TOKEN, REFRESH_TOKEN } from '@/constants/AuthConstant'
import { AuthService } from '@/services/AuthService'

export const initialState = {
	access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL2V4YW1wbGUuYXV0aDAuY29tLyIsImF1ZCI6Imh0dHBzOi8vYXBpLmV4YW1wbGUuY29tL2NhbGFuZGFyL3YxLyIsInN1YiI6InVzcl8xMjMiLCJpYXQiOjE0NTg3ODU3OTYsImV4cCI6MTQ1ODg3MjE5Nn0.CA7eaHjIHz5NxeIJoFK9krqaeZrPLwmMmgI_XiQiIkQ',
	loading: false,
	message: '',
	redirect: '/',
	showMessage: false,
	role: '',
}

export const refreshToken = createAsyncThunk(
	'auth/refresh',
	async (data: { refresh_token: string }, { rejectWithValue }) => {
		try {
			const response = await AuthService.refresh_token(data)
			const { access_token } = response.data

			localStorage.setItem(ACCESS_TOKEN, access_token)
			return access_token
		} catch (error) {
			window.location.href = 	'/'
			return rejectWithValue(error.response?.data?.message || '')
		}
	}
)

export const signIn = createAsyncThunk(
	'auth/login',
	async (data: { username: string; password: string }, { rejectWithValue }) => {
		try {
			const response = await AuthService.signIn(data)
			const { access_token, refresh_token, role, surname, name, fathername } = response.data

			localStorage.setItem(ACCESS_TOKEN, access_token)
			localStorage.setItem(REFRESH_TOKEN, refresh_token)
			localStorage.setItem('ROLE', role)
			localStorage.setItem('USER_FULL_NAME', `${surname} ${name} ${fathername}`)

			return { access_token, refresh_token, role }
		} catch (error) {
			return rejectWithValue(error.response?.data?.message || 'Ошибка авторизации')
		}
	}
)

const authSlice = createSlice({
	name: 'auth',
	initialState,
	reducers: {
		onHideAuthMessage: state => {
			state.message = ''
			state.showMessage = false
		},
		onLoading: state => {
			state.loading = true
		},
		onShowAuthMessage: (state, action) => {
			state.message = action.payload
			state.showMessage = true
			state.loading = false
		},
		onSignOut: state => {
			state.loading = false
			state.access_token = null
			state.role = ''
			state.redirect = '/'

			// Очистка токенов при выходе
			localStorage.removeItem(ACCESS_TOKEN)
			localStorage.removeItem(REFRESH_TOKEN)
			localStorage.removeItem('ROLE')
			localStorage.removeItem('USER_FULL_NAME')
		},
	},
	extraReducers: builder => {
		builder
			.addCase(signIn.pending, state => {
				state.loading = true
			})
			.addCase(signIn.fulfilled, (state, action) => {
				const { access_token, role } = action.payload
				state.role = role
				state.loading = false
				state.redirect = '/'
				state.access_token = access_token
			})
			.addCase(signIn.rejected, (state, action) => {
				state.message = action.payload || 'Неверное имя пользователя или пароль'
				state.showMessage = true
				state.loading = false
			})
			.addCase(refreshToken.fulfilled, (state, action) => {
				state.access_token = action.payload
			})
			.addCase(refreshToken.rejected, state => {
				// Если обновление токена не удалось → разлогиниваем пользователя
				state.access_token = null
				state.role = ''
				state.redirect = '/'

				localStorage.removeItem(ACCESS_TOKEN)
				localStorage.removeItem(REFRESH_TOKEN)
				localStorage.removeItem('ROLE')
				localStorage.removeItem('USER_FULL_NAME')
			})
	},
})

export const { onHideAuthMessage, onShowAuthMessage, onLoading, onSignOut } = authSlice.actions

export default authSlice.reducer
