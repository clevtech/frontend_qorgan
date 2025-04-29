import L from 'leaflet';
import capitalMilitaryOfficeIcon from '../../assets/MD.png';
import smallMilitaryOfficeIcon from '../../assets/MD.png';

const CapitalMilitaryOffice = new L.Icon({
    iconUrl: capitalMilitaryOfficeIcon,
    iconSize: new L.Point(40, 40),
    className: 'markerIcon',
});

const SmallMilitaryOffice = new L.Icon({
    iconUrl: smallMilitaryOfficeIcon,
    iconSize: new L.Point(20, 30),
    className: 'markerIcon',
});

export { CapitalMilitaryOffice, SmallMilitaryOffice };
