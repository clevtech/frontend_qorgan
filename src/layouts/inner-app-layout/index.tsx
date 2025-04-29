import { Grid, Drawer } from 'antd';
import { FC, ReactNode, useState } from 'react';

import { MenuOutlined } from '@ant-design/icons';

import utils from 'utils';

const { useBreakpoint } = Grid;

type InnerAppLayoutProps = {
    border: boolean;
    mainContent: ReactNode;
    pageHeader: boolean;
    sideContent: ReactNode;
    sideContentGutter: boolean;
    sideContentWidth: number;
};

type SideContentMobileProps = {
    onSideContentClose: () => void;
    visible: boolean;
} & InnerAppLayoutProps;

type SideContentProps = InnerAppLayoutProps;

const SideContent: FC<SideContentProps> = (props) => {
    const { sideContent, sideContentWidth = 250, border } = props;
    return (
        <div className={`side-content ${border ? 'with-border' : ''}`} style={{ width: `${sideContentWidth}px` }}>
            {sideContent}
        </div>
    );
};

const SideContentMobile: FC<SideContentMobileProps> = (props) => {
    const { sideContent, visible, onSideContentClose } = props;
    return (
        <Drawer
            width={320}
            placement='left'
            closable={false}
            onClose={onSideContentClose}
            open={visible}
            bodyStyle={{ paddingLeft: 0, paddingRight: 0 }}
        >
            <div className='h-100'>{sideContent}</div>
        </Drawer>
    );
};

export const InnerAppLayout: FC<InnerAppLayoutProps> = (props) => {
    const { mainContent, pageHeader, sideContentGutter = true } = props;

    const [visible, setVisible] = useState(false);

    const isMobile = !utils.getBreakPoint(useBreakpoint()).includes('lg');

    const close = () => {
        setVisible(false);
    };

    const openSideContentMobile = () => {
        setVisible(true);
    };

    return (
        <div className='inner-app-layout'>
            {isMobile ? (
                <SideContentMobile visible={visible} onSideContentClose={close} {...props} />
            ) : (
                <SideContent {...props} />
            )}
            <div
                className={`main-content ${pageHeader ? 'has-page-header' : ''} ${
                    sideContentGutter ? 'gutter' : 'no-gutter'
                }`}
            >
                {isMobile ? (
                    <div className={`font-size-lg mb-3 ${!sideContentGutter ? 'pt-3 px-3' : ''}`}>
                        <MenuOutlined onClick={() => openSideContentMobile()} />
                    </div>
                ) : null}
                {mainContent}
            </div>
        </div>
    );
};
