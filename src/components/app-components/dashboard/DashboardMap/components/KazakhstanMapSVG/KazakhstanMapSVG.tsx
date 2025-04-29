import { regions } from '../../constants/mapConstants';
import './KazakhstanMapSVG.css';

function KazakhstanMapSVG() {
    return (
        <svg
            viewBox='24.961 13.689 496.208 272.714'
            className='region'
            style={{ zIndex: '999', fill: 'none', border: 'none!important' }}
        >
            {regions.map((region, i) => (
                <path
                    key={`${region.status}-${region.region}-${i}`}
                    fill='#ffffff00'
                    d={region.path}
                    stroke='#0552b5'
                    strokeLinejoin='round'
                    className='region'
                    
                    strokeWidth='1px'
                />
            ))}
        </svg>
    );
}

export default KazakhstanMapSVG;
