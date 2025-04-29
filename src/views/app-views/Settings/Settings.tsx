import { Typography, Row, Col } from 'antd';

// import { ActiveUsersCard } from '@/components/app-components/settings/ActiveUsersCard';
import { LogsCard } from '@/components/app-components/settings/LogsCard';
import CameraCard from '@/components/app-components/settings/CameraCard';
// import { EmployeeCard } from '@/components/app-components/settings/EmployeeCard';
import GuestCard from '@/components/app-components/settings/GuestCard';
// import TransportCard from '@/components/app-components/settings/TransportCard';
import { CustomPageHeader } from '@/components/custom-components/CustomPageHeader';

const Settings = () => {
    return (
        <>
            <CustomPageHeader
                title={
                    <Typography.Text className='font-weight-semibold' style={{ fontSize: '16px' }}>
                        Настройки
                    </Typography.Text>
                }
                subTitle='Списки системы, журналы'
            />

            <div className='d-flex flex-column' style={{ gap: '1.5rem' }}>
                {/* <ActiveUsersCard />

                <EmployeeCard /> */}

                <GuestCard />

                {/* <TransportCard /> */}

                <CameraCard />

                <LogsCard />
            </div>
        </>
    );
};

export default Settings;
