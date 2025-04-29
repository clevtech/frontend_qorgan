import { Button, Form, Input, Modal, Typography, notification } from 'antd';
import { ChangeEvent, useEffect, useState } from 'react';

import { MODAL_WIDTH } from '@/constants/LayoutConstant';
import { TransportService } from '@/services/TransportService';
import { TransportCreate } from '@/types/custom';

type Props = {
    isOpen: boolean;
    fetchDataSource: () => Promise<void>;
    onClose: () => void;
};

export const CreateTransportModal = ({ isOpen, fetchDataSource, onClose }: Props) => {
    const [transport, setTransport] = useState<TransportCreate>({
        plate: '',
        model: '',
        organization: ''
    });

    const [isDisabled, setIsDisabled] = useState<boolean>(true);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;

        setTransport((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleCreate = async () => {
        setIsLoading(true);

        await TransportService.createTransport({
            ...transport,
        })
            .then(() => {
                notification.success({
                    message: 'Успешно',
                    description: 'Транспорт успешно создан',
                });
            })
            .finally(() => {
                setIsLoading(false);

                onClose();
                fetchDataSource();

                setTransport({
                    plate: '',
                    model: '',
                    organization: ''
                });
            });
    };

    useEffect(() => {
        setIsDisabled(Object.values(transport).some((value) => !value));
    }, [transport]);

    return (
        <Modal
            footer={null}
            onCancel={() => {
                onClose();

                setTransport({
                    plate: '',
                    model: '',
                    organization: '',
                });
            }}
            open={isOpen}
            title={
                <Typography.Text className='font-size-base font-weight-semibold'>
                    Добавить новый транспорт
                </Typography.Text>
            }
            width={MODAL_WIDTH / 1.25}
        >
            <Form autoComplete='off' layout='vertical'>
                <div className='d-flex flex-column' style={{ gap: '0.5rem' }}>
                    <Form.Item
                        className='mb-0'
                        label='Государственный номер'
                        required
                        rules={[
                            {
                                required: true,
                                message: 'Заполните государственный номер транспорта',
                            },
                        ]}
                    >
                        <Input name='plate' onChange={handleInputChange} value={transport.plate} />
                    </Form.Item>

                    <Form.Item
                        className='mb-0'
                        label='Марка'
                        required
                        rules={[
                            {
                                required: true,
                                message: 'Заполните марку транспорта',
                            },
                        ]}
                    >
                        <Input name='model' onChange={handleInputChange} value={transport.model} />
                    </Form.Item>

                    <Form.Item
                        className='mb-0'
                        label='Организация'
                        required
                        rules={[
                            {
                                required: true,
                                message: 'Заполните организацию транспорта',
                            },
                        ]}
                    >
                        <Input name='organization' onChange={handleInputChange} value={transport.organization} />
                    </Form.Item>
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
                            onClose();

                            setTransport({
                                plate: '',
                                model: '',
                                organization: ''
                            });
                        }}
                    >
                        Отменить
                    </Button>
                    <Button
                        disabled={isDisabled || localStorage.getItem('ROLE') !== 'superadmin'}
                        htmlType='submit'
                        loading={isLoading}
                        onClick={handleCreate}
                        style={{ marginLeft: '8px' }}
                        type='primary'
                    >
                        Добавить
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};
