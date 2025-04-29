import { Drawer } from 'antd';
import { useSelector, useDispatch } from 'react-redux';

import { ArrowLeftOutlined } from '@ant-design/icons';

import { NAV_TYPE_SIDE } from '@/constants/ThemeConstant';
import { MenuContent } from '@/components/layout-components/MenuContent';
import { Logo } from '@/components/layout-components/Logo';
import { Flex } from '@/components/shared-components/Flex';
import { RootState } from '@/store';
import { onMobileNavChange } from '@/store/slices/themeSlice';
import { NavItem } from '@/types/custom';

type Props = {
    hideGroupTitle?: boolean;
    routeInfo: NavItem | null;
};

export const MobileNav = ({ routeInfo, hideGroupTitle }: Props) => {
    const dispatch = useDispatch();

    const { sideNavTheme, mobileNav } = useSelector((state: RootState) => state.theme);

    const menuContentProps = { sideNavTheme, routeInfo, hideGroupTitle };

    const onClose = () => {
        dispatch(onMobileNavChange(false));
    };

    return (
        <Drawer placement='left' closable={false} onClose={onClose} open={mobileNav} bodyStyle={{ padding: 5 }}>
            <Flex flexDirection='column' className='h-100'>
                <Flex justifyContent='between' alignItems='center'>
                    <Logo mobileLogo />
                    {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
                    <div className='nav-close' onClick={onClose}>
                        <ArrowLeftOutlined />
                    </div>
                </Flex>
                <div className='mobile-nav-menu'>
                    <MenuContent type={NAV_TYPE_SIDE} {...menuContentProps} />
                </div>
            </Flex>
        </Drawer>
    );
};
