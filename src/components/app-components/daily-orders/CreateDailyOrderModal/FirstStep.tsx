import { Form, Input, Typography } from 'antd';
import { Dispatch, SetStateAction } from 'react';

import { DailyOrderCreate } from '@/types/custom';

type Props = {
    setDailyOrder: Dispatch<SetStateAction<DailyOrderCreate>>;
};

export const FirstStep = ({ setDailyOrder }: Props) => {
    return (
        <div
            className='d-flex flex-column'
            style={{
                gap: '1.5rem',
            }}
        >
            <Typography.Text>
                Пожалуйста, укажите номер приказа для продолжения заполнения суточного приказа.
            </Typography.Text>

            <Form.Item className='mb-0' label='Номер приказа' name='orderNumber' required>
                <Input
                    onChange={(e) => {
                        setDailyOrder((prev) => ({
                            ...prev,
                            orderNumber: e.target.value,
                        }));
                    }}
                />
            </Form.Item>
        </div>
    );
};
