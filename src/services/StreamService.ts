import fetch from '@/api/FetchInterceptor'
import { API_BASE_URL } from '@/configs/AppConfig'

import { HttpMethods } from '@/types/custom.ts'
import { components } from '@/types/generated.ts'
import { ACCESS_TOKEN } from '@/constants/AuthConstant'
import axios from 'axios'

export const 	StreamService = {
	createOffer: (data: components['schemas']['VideoStreamModelCreate']) =>
		fetch({
			url: '/video_stream/offer/',
			method: HttpMethods.POST,
			data: data,
		}),

	checkStream: (data: unknown) =>
		fetch({
			url: '/recorder/',
			method: HttpMethods.POST,
			data: data,
		}),

	startStream: (data: unknown) =>
		fetch({
			url: `/recorder/start/${data.camera_id}`,
			method: HttpMethods.POST,
			data: data,
		}),
	streamCamera: (id: string) =>
		axios.get(`${API_BASE_URL}/streamer/camera/${id}`, {
							headers: {
								Authorization: localStorage.getItem(ACCESS_TOKEN)
									? `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`
									: undefined,
							},
		}),

	deleteCamera: (id: string) =>
		axios.delete(`${API_BASE_URL}/recorder/${id}`, {
							headers: {
								Authorization: localStorage.getItem(ACCESS_TOKEN)
									? `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`
									: undefined,
							},
		}),
}
