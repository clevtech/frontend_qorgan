import 'leaflet/dist/leaflet.css'
import { MapContainer, SVGOverlay, TileLayer } from 'react-leaflet'
import {
	boundsKazakhstan,
	centerKazakhstan,
	tileLayerUrl,
} from '../constants/mapConstants'
import { groupedData } from '../constants/markers'
import KazakhstanMapSVG from './KazakhstanMapSVG/KazakhstanMapSVG'
import { MapMarker } from './MapMarker/MapMarker'

export const DashboardMap = ({ data = [], zoom = 4, heigth = 370 }) => {

	let groupedData1 = data.map(item => {
		return {
			lat: item?.lat ?? 0,
			lng: item?.long ?? 0,
			url: 'http://' + item.ip_addr,
		}
	})
	return (
		<MapContainer
			bounds={boundsKazakhstan}
			center={centerKazakhstan}
			zoom={zoom}
			minZoom={4}
			maxBounds={boundsKazakhstan}
			maxBoundsViscosity={1.0}
			style={{ height: `${heigth}px`, borderRadius: 10, background: '#fff' }}
		>
			<TileLayer url={tileLayerUrl} opacity={0} />
			<SVGOverlay bounds={boundsKazakhstan}>
				<KazakhstanMapSVG />
			</SVGOverlay>
			<div>
				{groupedData1?.map(data => <MapMarker key={data.url} data={data} />)}
			</div>
		</MapContainer>
	)
}
