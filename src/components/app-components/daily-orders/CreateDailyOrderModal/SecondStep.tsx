import moment from 'moment';

import { Form, Select, Typography } from 'antd';
import { Dispatch, SetStateAction } from 'react';

import { DailyOrderCreate, EmployeeRead } from '@/types/custom';

type Props = {
    allEmployees: EmployeeRead[];
    dailyOrder: DailyOrderCreate;
    selectedEmployees: string[];
    setDailyOrder: Dispatch<SetStateAction<DailyOrderCreate>>;
    setSelectedEmployees: Dispatch<SetStateAction<string[]>>;
};

export const SecondStep = ({
    dailyOrder,
    selectedEmployees,
    setDailyOrder,
    setSelectedEmployees,
    allEmployees,
}: Props) => {
    const handleSelectChange = (value: string, role: string) => {
        if (dailyOrder[role] !== '') {
            setSelectedEmployees((prev) => prev.filter((val) => val !== dailyOrder[role]));
        }
        setSelectedEmployees((prev) => Array.from(new Set([...prev, value])));
        setDailyOrder((prev) => ({ ...prev, [role]: value }));
    };

    const renderOptions = allEmployees.map((option) => (
        <Select.Option key={option.id} value={option.id} disabled={selectedEmployees.includes(option.id)}>
            {option.fullName}
        </Select.Option>
    ));

    return (
        <div
            className='d-flex flex-column'
            style={{
                gap: '1.5rem',
            }}
        >
            <Typography.Text>
                {`Пожалуйста, предоставьте имена сотрудников, которые заступят на дежурство ${moment(new Date())
                    .add(1, 'd')
                    .format('DD/MM/YYYY')}.`}
            </Typography.Text>

            <div className='d-flex flex-column' style={{ gap: '0.5rem' }}>
                <Form.Item className='mb-0' label='Дежурный по части' name='dutyId' required>
                    <Select onChange={(value) => handleSelectChange(value, 'dutyId')}>{renderOptions}</Select>
                </Form.Item>

                <Form.Item className='mb-0' label='Помощник дежурного по части' name='dutyHelperId' required>
                    <Select onChange={(value) => handleSelectChange(value, 'dutyHelperId')}>{renderOptions}</Select>
                </Form.Item>
            </div>
        </div>
    );
};
