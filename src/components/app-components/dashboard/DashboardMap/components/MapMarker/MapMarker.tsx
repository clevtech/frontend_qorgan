import { Marker, useMap } from 'react-leaflet';
import { SmallMilitaryOffice } from '../MapIcon/MapIcon';
import { FLY_DURATION } from '../../constants/timing';
import { MapMarkerData } from '../../types/MapMarkerData';

export interface MarkerProps {
    data: MapMarkerData;
}
export const MapMarker = ({ data }: MarkerProps) => {
    const map = useMap();

    const click = () => {
        map.flyTo([data.lat, data.lng], 8, {
            duration: FLY_DURATION,
            animate: true,
        });
        setTimeout(() => {
            const link = document.createElement('a');
            link.setAttribute('href', data.url);
            link.setAttribute('target', '_blank');
            link.click();
        }, FLY_DURATION * 1000);
    };

    return <Marker position={[data.lat, data.lng]} eventHandlers={{ click }} icon={SmallMilitaryOffice} />;
};
