import { Grid } from 'antd';
import { useSelector } from 'react-redux';
import logo from '../../../public/images/cleverest_technologies_logo.jpg'

// import { APP_NAME } from '@/configs/AppConfig';
import { NAV_TYPE_TOP, SIDE_NAV_COLLAPSED_WIDTH, SIDE_NAV_WIDTH } from '@/constants/ThemeConstant';
import { RootState } from '@/store';

import utils from '@/utils';

const { useBreakpoint } = Grid;

export const Logo = ({ mobileLogo, src }: { mobileLogo?: boolean, src?: string  }) => {
    const isMobile = !utils.getBreakPoint(useBreakpoint()).includes('lg');

    const navCollapsed = useSelector((state: RootState) => state.theme.navCollapsed);
    const navType = useSelector((state: RootState) => state.theme.navType);

    const getLogoWidthGutter = () => {
        const isNavTop = navType === NAV_TYPE_TOP ? true : false;

        if (isMobile && !mobileLogo) {
            return 0;
        }

        if (isNavTop) {
            return 'auto';
        }

        if (navCollapsed) {
            return `${SIDE_NAV_COLLAPSED_WIDTH}px`;
        } else {
            return `${SIDE_NAV_WIDTH}px`;
        }
    };

    const getLogoDisplay = () => {
        if (isMobile && !mobileLogo) {
            return 'd-none';
        } else {
            return 'logo';
        }
    };

    return (
        <div className={getLogoDisplay()} style={{ width: `${getLogoWidthGutter()}`, display:'flex', gap:'5px', alignItems: 'center', margin:0, marginLeft: navCollapsed ? '7px' : 0 , objectFit:'cover'}}>
            <img src={logo} style={{ width: '50px'}} />
            {/* {!navCollapsed && 
                <p style={{fontSize:'11px', color:'#2b235c', fontWeight:'600', margin:0, lineHeight:'1', marginTop:'0.9rem'}}>umai<br/>cloud<br/>services</p>
            } */}
        </div>
    );
};
