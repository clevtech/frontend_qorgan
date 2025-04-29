import { connect } from 'react-redux';

import { MenuContent } from '@/components/layout-components/MenuContent';
import { NAV_TYPE_TOP } from '@/constants/ThemeConstant';
import { RootState } from '@/store';
import { NavItem } from '@/types/custom';

import utils from '@/utils';

const mapStateToProps = (state: RootState) => ({
    topNavColor: state.theme.topNavColor,
});

type PropsFromRedux = ReturnType<typeof mapStateToProps>;

type Props = {
    routeInfo: NavItem | null;
} & PropsFromRedux;

export const TopNav = connect(mapStateToProps)((props: Props) => {
    return (
        <div
            className={`top-nav ${utils.getColorContrast(props.topNavColor)}`}
            style={{ backgroundColor: props.topNavColor }}
        >
            <div className='top-nav-wrapper'>
                <MenuContent type={NAV_TYPE_TOP} {...props} />
            </div>
        </div>
    );
});
