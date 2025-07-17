import { API_BASE_URL } from '@/configs/AppConfig'
import { ACCESS_TOKEN, REFRESH_TOKEN } from '@/constants/AuthConstant'
import { store } from '@/store'
import { onSignOut, refreshToken } from '@/store/slices/authSlice'
import { notification } from 'antd'
import axios from 'axios'

const TOKEN_PAYLOAD_KEY = 'Authorization'

const service = axios.create({
	baseURL: API_BASE_URL,
	timeout: 50000,
})

let isRefreshing = false
let failedQueue: any[] = [] // Очередь запросов, ожидающих новый токен

const processQueue = (error: any, token: string | null = null) => {
	failedQueue.forEach(prom => {
		if (token) {
			prom.resolve(token)
		} else {
			prom.reject(error)
		}
	})
	failedQueue = []
}

service.interceptors.request.use(
	config => {
		const access_token = localStorage.getItem(ACCESS_TOKEN)
		if (access_token) {
			config.headers[TOKEN_PAYLOAD_KEY] = `Bearer ${access_token}`
		}
		return config
	},
	error => {
		notification.error({
			message: 'Ошибка при отправке запроса',
			description: error.message,
		})
		return Promise.reject(error)
	}
)

service.interceptors.response.use(
	response => response,
	async error => {
		const originalRequest = error.config
		const status = error.response?.status

		// Если ошибка 400 или 403, просто показываем уведомление и возвращаем ошибку
		if (status === 400 || status === 403) {
			notification.error({
				message: 'Ошибка запроса',
				description: error.response?.data?.message || 'Некорректный запрос',
			})
			return Promise.reject(error)
		}

		// Если ошибка 401 (неавторизован), пробуем обновить токен
		if (status === 401 && !originalRequest._retry) {
			originalRequest._retry = true

			if (isRefreshing) {
				// Если уже идет обновление токена, ждем завершения
				return new Promise((resolve, reject) => {
					failedQueue.push({ resolve, reject })
				})
					.then(token => {
						originalRequest.headers[TOKEN_PAYLOAD_KEY] = `Bearer ${token}`
						return service(originalRequest)
					})
					.catch(err => Promise.reject(err))
			}

			isRefreshing = true

			try {
				const refresh_token = localStorage.getItem(REFRESH_TOKEN)

				if (!refresh_token) {
					throw new Error('Отсутствует refresh_token')
				}

				const { payload: new_access_token } = await store.dispatch(
					refreshToken({ refresh_token })
				)

				if (new_access_token) {
					localStorage.setItem(ACCESS_TOKEN, new_access_token)
					axios.defaults.headers.common[
						TOKEN_PAYLOAD_KEY
					] = `Bearer ${new_access_token}`
					originalRequest.headers[
						TOKEN_PAYLOAD_KEY
					] = `Bearer ${new_access_token}`

					// Обрабатываем очередь запросов
					processQueue(null, new_access_token)
					return service(originalRequest)
				} else {
					throw new Error('Ошибка при обновлении токена')
				}
			} catch (err) {
				processQueue(err, null)
				store.dispatch(onSignOut())
				localStorage.removeItem(ACCESS_TOKEN)
				localStorage.removeItem(REFRESH_TOKEN)
				return Promise.reject(err)
			} finally {
				isRefreshing = false
			}
		}

		notification.error({
			message: 'Ошибка при получении ответа',
			description:
				error.response?.data?.message || 'Не удалось загрузить данные',
		})

		return Promise.reject(error)
	}
)

export default service
