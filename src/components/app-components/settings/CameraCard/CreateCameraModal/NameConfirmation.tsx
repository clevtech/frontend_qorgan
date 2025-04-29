import { Button, Form, Input, Typography } from 'antd';
import { ChangeEvent, Dispatch, SetStateAction, useEffect, useState } from 'react';

import { CameraCreate } from '@/types/custom';

type Props = {
    camera: CameraCreate;
    isLoading: boolean;
    handleChange: (event: ChangeEvent<HTMLInputElement>) => void;
    handleCreate: () => void;
    setStep: Dispatch<SetStateAction<number>>;
};

export const NameConfirmation = ({ camera, isLoading, handleChange, handleCreate, setStep }: Props) => {
    const [isDisabled, setIsDisabled] = useState<boolean>(true);

    useEffect(() => {
        setIsDisabled(!camera.name);
    }, [camera]);

    return (
        <>
            <div
                className='d-flex flex-column'
                style={{
                    gap: '1.5rem',
                }}
            >
                <Typography.Text className='text-muted'>
                    Пожалуйста, укажите дополнительные атрибуты камеры
                </Typography.Text>

                <div
                    className='d-flex flex-column'
                    style={{
                        gap: '1rem',
                    }}
                >
                    <Form.Item className='mb-0' label='Наименование камеры' required>
                        <Input name='name' onChange={handleChange} value={camera.name} />
                    </Form.Item>
                </div>
            </div>

            <div
                className='d-flex justify-content-end'
                style={{
                    padding: '10px 16px',
                    margin: '24px -24px -24px -24px',

                    borderTop: '1px solid #e6ebf1',
                }}
            >
                <Button
                    onClick={() => {
                        setStep((prev) => prev - 1);
                    }}
                >
                    Назад
                </Button>
                <Button
                    disabled={isDisabled}
                    loading={isLoading}
                    onClick={handleCreate}
                    style={{ marginLeft: '8px' }}
                    type='primary'
                >
                    Создать камеру
                </Button>
            </div>
        </>
    );
};
