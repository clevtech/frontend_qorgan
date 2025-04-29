import fetch from '@/api/FetchInterceptor'
import { API_BASE_URL } from '@/configs/AppConfig'

import { HttpMethods } from '@/types/custom'
import { components, paths } from '@/types/generated'
import { ACCESS_TOKEN } from '@/constants/AuthConstant'
import axios from 'axios'

export const CamerasService = {
	createCamera: (data: any) =>
		fetch({
			url: `/recorder/${data.cameraId}`,
			method: HttpMethods.PUT,
			data: {
				...data,
				camera_id: data.cameraId,
				cameraId: undefined,
				ipAddress: undefined,
				ip: data.ipAddress.split(`:`)[0],
				port: data.ipAddress.split(`:`)[1]
					? data.ipAddress.split(`:`)[1]
					: '554',
			},
		}),

	getCameras: (params: paths['/api/camera/']['get']['parameters']) =>
		fetch({
			url: `http://${localStorage.getItem('selected') }:8080/recorder/`,
			method: HttpMethods.GET,
			params: params.query,
		}),

	getCamerasPreview: (params: unknown) =>
		axios.get(`http://${params.server_ip}:8080/streamer/preview/${params.id}`, {
							headers: {
								Authorization: localStorage.getItem(ACCESS_TOKEN)
									? `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`
									: undefined,
							},
		}),

	getCameraById: (params: paths['/camera/{id}/']['get']['parameters']) =>
		fetch({
			url: `/recorder/${params.path.id}/`,
			method: HttpMethods.GET,
			params: params.path,
		}),

	updateCameraById: (
		params: any,
		data: components['schemas']['CameraUpdate']
	) =>
		fetch({
			url: `/recorder/${params.path.id}`,
			method: HttpMethods.PUT,
			data: data,
		}),

	deleteCameraById: (params: unknown) =>
		fetch({
			url: `/recorder/${params.id}`,
			method: HttpMethods.DELETE,
		}),
		watchCamera: (params: any) =>
			fetch({
				url: `http://${localStorage.getItem('selected')}:8080/recorder/watch/${params.camera_id}`,
				method: HttpMethods.GET,
				params: params.query,
			}),
}
