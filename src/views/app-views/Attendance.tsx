import { Card, Typography } from 'antd';
import { useState } from 'react';

import { Footer } from '@/components/app-components/attendance/Footer';
import { TableByEmployees } from '@/components/app-components/attendance/TableByEmployees';
import { TableByDays } from '@/components/app-components/attendance/TableByDays';
import { CustomPageHeader } from '@/components/custom-components/CustomPageHeader';

const Attendance = () => {
    const [tableType, setTableType] = useState<'days' | 'employees'>('days');

    return (
        <>
            <CustomPageHeader
                title={
                    <Typography.Text className='font-weight-bold' style={{ fontSize: '16px' }}>
                        Посещаемость
                    </Typography.Text>
                }
                subTitle='Общий список посещаемости сотрудников'
                footer={<Footer setTableType={setTableType} />}
            />
            <Card className='mt-3'>{tableType == 'days' ? <TableByDays /> : <TableByEmployees />}</Card>
        </>
    );
};

export default Attendance;
