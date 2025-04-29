import { Grid, Menu } from 'antd';
import { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { SIDE_NAV_LIGHT, NAV_TYPE_SIDE } from '@/constants/ThemeConstant';
import { RootState } from '@/store';
import { onMobileNavChange } from '@/store/slices/themeSlice';
import { AntdIcon, NavItem } from '@/types/custom';
import Icon from '@/components/util-components/Icon';
import navigationConfig from '@/configs/NavigationConfig';
import utils from '@/utils';
const { useBreakpoint } = Grid;

type MenuContentProps = {
    hideGroupTitle?: boolean;
    routeInfo: NavItem | null;
    type: string;
};

type MenuItemProps = {
    icon?: AntdIcon;
    path?: string | null;
    title: string;
};

const setDefaultOpen = (key: string | undefined) => {
    const keyList = ['safety', 'industry', 'commerce'];

    let keyString = '';

    if (key) {
        const arr = key.split('-');

        for (let index = 0; index < arr.length; index++) {
            const elm = arr[index];
            index === 0 ? (keyString = elm) : (keyString = `${keyString}-${elm}`);
            keyList.push(keyString);
        }
    }

    return keyList;
};

const MenuItem = (props: MenuItemProps) => {
    const dispatch = useDispatch();

    const isMobile = !utils.getBreakPoint(useBreakpoint()).includes('lg');

    const closeMobileNav = () => {
        if (isMobile) {
            dispatch(onMobileNavChange(false));
        }
    };
    return (
        <>
            {props.icon && <Icon type={props.icon} />}
            <span>{props.title}</span>
            {props.path && <Link onClick={closeMobileNav} to={props.path} />}
        </>
    );
};

const getSideNavMenuItem = (
    navItems: Array<NavItem>
): Array<{
    key: string;
    label: JSX.Element;
}> =>{
    // const { role } = useSelector((state: RootState) => state.auth)
    const role = localStorage.getItem('ROLE')

    return navItems
        .filter((navItem: NavItem) => navItem.role.includes(role))
        .map((navItem: NavItem) => {
            return {
                key: navItem.key,
                label: (
                    <MenuItem
                        title={navItem.title}
                        {...(navItem.isGroupTitle ? {} : { path: navItem.path, icon: navItem.icon })}
                    />
                ),
                ...(navItem.isGroupTitle ? { type: 'group' } : {}),
                ...(navItem.submenu && navItem.submenu.length > 0 ? { children: getSideNavMenuItem(navItem.submenu) } : {}),
            };
    });
}
const getTopNavMenuItem = (
    navItems: Array<NavItem>
): Array<{
    key: string;
    label: JSX.Element;
}> =>
    navItems.map((navItem: NavItem) => {
        return {
            key: navItem.key,
            label: (
                <MenuItem
                    title={navItem.title}
                    icon={navItem.icon}
                    {...(navItem.isGroupTitle ? {} : { path: navItem.path })}
                />
            ),
            ...(navItem.submenu && navItem.submenu.length > 0 ? { children: getTopNavMenuItem(navItem.submenu) } : {}),
        };
    });

const SideNavContent = (props: MenuContentProps) => {
    const { routeInfo, hideGroupTitle } = props;
    const { role } = useSelector((state: RootState) => state.auth)

    const sideNavTheme = useSelector((state: RootState) => state.theme.sideNavTheme);

    const menuItems = useMemo(() => getSideNavMenuItem(navigationConfig), [role]);

    return (
        <Menu
            mode='inline'
            theme={sideNavTheme === SIDE_NAV_LIGHT ? 'light' : 'dark'}
            style={{ height: '100%', borderRight: 0 }}
            defaultSelectedKeys={routeInfo?.key ? [routeInfo.key] : []}
            defaultOpenKeys={setDefaultOpen(routeInfo?.key)}
            className={hideGroupTitle ? 'hide-group-title' : ''}
            items={menuItems}
        />
    );
};

const TopNavContent = () => {
    const topNavColor = useSelector((state: RootState) => state.theme.topNavColor);

    const menuItems = useMemo(() => getTopNavMenuItem(navigationConfig), []);

    return <Menu mode='horizontal' style={{ backgroundColor: topNavColor }} items={menuItems} />;
};

export const MenuContent = (props: MenuContentProps) => {
    return props.type === NAV_TYPE_SIDE ? <SideNavContent {...props} /> : <TopNavContent />;
};
