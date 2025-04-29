import { Layout } from 'antd';
import { connect } from 'react-redux';

import { MenuContent } from '@/components/layout-components/MenuContent';
import { SIDE_NAV_WIDTH, SIDE_NAV_DARK, NAV_TYPE_SIDE } from '@/constants/ThemeConstant';
import { RootState } from '@/store';
import { NavItem } from '@/types/custom';

const { Sider } = Layout;

const mapStateToProps = (state: RootState) => ({
    navCollapsed: state.theme.navCollapsed,
    sideNavTheme: state.theme.sideNavTheme,
});

type PropsFromRedux = ReturnType<typeof mapStateToProps>;

type Props = {
    hideGroupTitle?: boolean;
    routeInfo: NavItem | null;
} & PropsFromRedux;

export const SideNav = connect(mapStateToProps)((props: Props) => {
    return (
        <Sider
            className={`side-nav ${props.sideNavTheme === SIDE_NAV_DARK ? 'side-nav-dark' : ''}`}
            collapsed={props.navCollapsed}
            width={SIDE_NAV_WIDTH}
            style={{ overflow: 'auto', height: `calc(100vh - 70px)`, position: 'fixed', left: 0, overflowX:'clip' }}
        >
            <MenuContent type={NAV_TYPE_SIDE} {...props} />
        </Sider>
    );
});
