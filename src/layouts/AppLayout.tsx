import { Grid, Layout, Modal, Typography, notification } from 'antd';
import { ReactElement, Suspense, useEffect, useState } from 'react';
import { connect, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';

import navigationConfig from '@/configs/NavigationConfig';
import utils from '@/utils';

import { CreateIncidentModal } from '@/components/app-components/incidents/CreateIncidentModal';
import { HeaderNav } from '@/components/layout-components/HeaderNav';
import { MobileNav } from '@/components/layout-components/MobileNav';
import { SideNav } from '@/components/layout-components/SideNav';
import { TopNav } from '@/components/layout-components/TopNav';
import { Loading } from '@/components/shared-components/Loading';
import { WEBSOCKET_BASE_URL } from '@/configs/AppConfig';
import {
    DIR_LTR,
    DIR_RTL,
    NAV_TYPE_SIDE,
    NAV_TYPE_TOP,
    SIDE_NAV_COLLAPSED_WIDTH,
    SIDE_NAV_WIDTH,
} from '@/constants/ThemeConstant';
import { useWebSocket } from '@/utils/hooks/useWebSocket';
import { RootState } from '@/store';
import './index.css';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { incidentNameToDescriptionMap } from '@/types/custom';

const NOTIFICATION_DURATION = 60 * 10;
const NOTIFICATION_PLACEMENT = 'bottomRight';
const NOTIFICATION_STYLE = {
    background: '#222222f2',
    borderTop: '4px solid #FC5555',
};

const mapStateToProps = (state: RootState) => {
    const { direction, locale, navCollapsed, navType } = state.theme;

    return { direction, locale, navCollapsed, navType };
};

type PropsFromRedux = ReturnType<typeof mapStateToProps>;

type Props = {
    children: ReactElement;
} & PropsFromRedux;

type incidentModalTypes = {
    open: boolean;
    incidentType: string;
    time: string;
};

const AppLayout = connect(mapStateToProps)((props: Props) => {
    const { access_token } = useSelector((state: RootState) => state.auth);
    const { jsonMessage } = useWebSocket(`${WEBSOCKET_BASE_URL}/notifications/${access_token}/`);
    const [incidentModal, setIncidentModal] = useState<incidentModalTypes>({
        open: false,
        incidentType: '',
        time: '',
    });

    // assets/warning
    const [audio] = useState(
        new Audio('https://ucompa.ru/audio/20/zvuki_pozharnoi_sireny__signalizatsii_i_trevogi_MWD.mp3'),
    );

    // assets/yellow
    const [warningAudio] = useState(
        new Audio('https://ucompa.ru/audio/31/zvuki_dlia_otpugivaniia_krys_i_myshei_Shv.mp3'),
    );

    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    const location = useLocation();

    const isNavSide = props.navType === NAV_TYPE_SIDE;
    const isNavTop = props.navType === NAV_TYPE_TOP;

    const currentRouteInfo = utils.getRouteInfo(navigationConfig, location.pathname);
    const screens = utils.getBreakPoint(Grid.useBreakpoint());

    const isMobile = screens.length === 0 ? false : !screens.includes('lg');

    const getLayoutGutter = () => {
        if (isNavTop || isMobile) {
            return 0;
        }

        return props.navCollapsed ? SIDE_NAV_COLLAPSED_WIDTH : SIDE_NAV_WIDTH;
    };

    const getLayoutDirectionGutter = () => {
        if (props.direction === DIR_LTR) {
            return { paddingLeft: getLayoutGutter() };
        }
        if (props.direction === DIR_RTL) {
            return { paddingRight: getLayoutGutter() };
        }
        return { paddingLeft: getLayoutGutter() };
    };

    const handleRespond = () => setIsModalOpen(false);

    const warningIncidents = [
        'Несанкционированный вход (КХО)',
        'Человек в лежащем положении',
        'Драка',
        'Несанкционированный вход',
    ];

    const showModal = () => {
        setIsModalOpen(true);
    };

    useEffect(() => {
        const handleEnded = () => {
            audio.currentTime = 0;
            audio.play();
        };

        audio.addEventListener('ended', handleEnded);
        return () => {
            audio.removeEventListener('ended', handleEnded);
        };
    }, [audio]);

    useEffect(() => {
        const handleEnded = () => {
            warningAudio.currentTime = 0;
            warningAudio.play();
        };

        warningAudio.addEventListener('ended', handleEnded);
        return () => {
            warningAudio.removeEventListener('ended', handleEnded);
        };
    }, [warningAudio]);

    useEffect(() => {
        if (jsonMessage && warningIncidents.includes(jsonMessage.data.typeOfIncident)) {
            const date = new Date(jsonMessage.data.createdAt);
            const hours = date.getHours();
            const atDay = hours > 8 && hours < 18;
            const isKHO =
                jsonMessage.data.typeOfIncident === 'Несанкционированный вход (КХО)' ||
                jsonMessage.data.typeOfIncident === 'Несанкционированный вход';

            if (isKHO && !atDay) audio.play();
            else warningAudio.play();
        }
    }, [audio, jsonMessage, warningAudio]);

    useEffect(() => {
        if (jsonMessage !== null && !warningIncidents.includes(jsonMessage.data.typeOfIncident)) {
            const { type, data } = jsonMessage;

            if (type === 'incident_created') {
                notification.warning({
                    description: (
                        <div className='font-size-sm'>
                            <Typography.Text style={{ color: '#3e79f7' }}>
                                {data.cameraName ?? 'Камера'}
                            </Typography.Text>
                            <Typography.Text className='text-white-50'>
                                {` – ${incidentNameToDescriptionMap[data.typeOfIncident].toLowerCase()}`}
                            </Typography.Text>
                        </div>
                    ),
                    duration: NOTIFICATION_DURATION,
                    message: (
                        <Typography.Text className='font-size-base font-weight-semibold text-white'>
                            {data.typeOfIncident}
                        </Typography.Text>
                    ),
                    placement: NOTIFICATION_PLACEMENT,
                    style: NOTIFICATION_STYLE,
                    onClose: () => {
                        showModal();
                    },
                });
            }
        }
    }, [jsonMessage]);

    useEffect(() => {
        if (jsonMessage && warningIncidents.includes(jsonMessage.data.typeOfIncident)) {
            const date = new Date(jsonMessage.data.createdAt);
            const hours = date.getHours();
            const atDay = hours > 8 && hours < 18;
            const isKHO =
                jsonMessage.data.typeOfIncident === 'Несанкционированный вход (КХО)' ||
                jsonMessage.data.typeOfIncident === 'Несанкционированный вход';

            setIncidentModal({
                open: true,
                incidentType: jsonMessage.data.typeOfIncident,
                time: isKHO ? (atDay ? '' : 'night') : '',
            });
        }
    }, [jsonMessage]);

    return (
        <div
            role='button'
            tabIndex={0}
            onClick={() => {
                setIncidentModal({ open: false, incidentType: '', time: '' });
                incidentModal.open && setIsModalOpen(true);
                audio.pause();
                warningAudio.pause();
            }}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    incidentModal.open && setIsModalOpen(true);
                    setIncidentModal({ open: false, incidentType: '', time: '' });
                    audio.pause();
                    warningAudio.pause();
                }
            }}
        >
            {jsonMessage && (
                <CreateIncidentModal
                    incidentId={jsonMessage.data.id}
                    isModalOpen={isModalOpen}
                    handleOk={handleRespond}
                    warning
                />
            )}
            <Modal
                width={544}
                open={incidentModal.open}
                footer={null}
                className={
                    warningIncidents.includes(incidentModal.incidentType) ? `modal-incident${incidentModal.time}` : ''
                }
            >
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: '40px 0',
                    }}
                >
                    <ExclamationCircleOutlined style={{ color: '#FF4D4F', fontSize: '64px' }} />
                    <Typography.Text
                        style={{
                            fontSize: '30px',
                            fontWeight: '500',
                            lineHeight: '40px',
                        }}
                    >
                        Произошел инцидент!
                    </Typography.Text>
                    <Typography.Text
                        style={{
                            fontSize: '24px',
                            lineHeight: '32px',
                            textAlign: 'center',
                        }}
                    >
                        Нажмите любую кнопку для продолжения.
                    </Typography.Text>
                </div>
            </Modal>

            <>
                <Layout>
                    <HeaderNav isMobile={isMobile} />
                    {isNavTop && !isMobile ? <TopNav routeInfo={currentRouteInfo} /> : null}
                    <Layout className='app-container'>
                        {/* {isNavSide && !isMobile ? <SideNav routeInfo={currentRouteInfo} /> : null} */}
                        <Layout className='app-layout'>
                            <div className={`app-content ${isNavTop ? 'layout-top-nav' : ''}`}>
                                <Layout.Content>
                                    <Suspense fallback={<Loading cover='content' />}>{props.children}</Suspense>
                                </Layout.Content>
                            </div>
                        </Layout>
                    </Layout>
                    {isMobile && <MobileNav routeInfo={currentRouteInfo} />}
                </Layout>
            </>
        </div>
    );
});

export default AppLayout;
