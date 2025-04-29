import { Button, Form, Input, Modal, Typography, Upload, notification } from 'antd';
import { ChangeEvent, useEffect, useState } from 'react';

import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';

import { IP_ADDRESS } from '@/configs/AppConfig';
import { MODAL_WIDTH } from '@/constants/LayoutConstant';
import { EmployeeService } from '@/services/EmployeeService';
import { EmployeeRead, EmployeeUpdate } from '@/types/custom';

import type { UploadChangeParam } from 'antd/es/upload';
import type { RcFile, UploadFile, UploadProps } from 'antd/es/upload/interface';

type Props = {
    guest: EmployeeRead;
    isOpen: boolean;
    fetchDataSource: () => Promise<void>;
    onClose: () => void;
};

export const UpdateGuestModal = ({ guest: guestIn, isOpen, fetchDataSource, onClose }: Props) => {
    const [guest, setGuest] = useState<EmployeeUpdate>({});
    const [isDisabled, setIsDisabled] = useState<boolean>(true);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const uploadButton = (
        <div>
            {isLoading ? <LoadingOutlined /> : <PlusOutlined />}
            <div className='ant-upload-text'>Загрузить</div>
        </div>
    );

    const handleImageChange: UploadProps['onChange'] = (info: UploadChangeParam<UploadFile>) => {
        if (info.file.status === 'uploading') {
            setIsLoading(true);

            return;
        }

        if (info.file.status === 'done') {
            getBase64(info.file.originFileObj as RcFile, (url) => {
                setIsLoading(false);

                setGuest((prev) => ({
                    ...prev,
                    imgPath: url,
                }));
            });
        }
    };

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;

        setGuest((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleUpdate = async () => {
        await EmployeeService.updateEmployeesById(
            {
                path: {
                    id: guestIn.id,
                },
            },
            {
                ...guest,
            },
        )
            .then(() => {
                notification.success({
                    message: 'Успешно',
                    description: 'Сотрудник успешно отредактирован',
                });
            })
            .finally(() => {
                fetchDataSource();

                onClose();
            });
    };

    useEffect(() => {
        setGuest(guestIn);
    }, [guestIn]);

    useEffect(() => {
        setIsDisabled(Object.values(guest).some((value) => !value));
    }, [guest]);

    return (
        <Modal
            footer={null}
            onCancel={onClose}
            open={isOpen}
            title={
                <Typography.Text className='font-size-base font-weight-semibold'>
                    Редактировать гостя
                </Typography.Text>
            }
            width={MODAL_WIDTH / 1.25}
        >
            <Form autoComplete='off' layout='vertical'>
                <div className='d-flex' style={{ gap: '1rem' }}>
                    <div>
                        <Upload
                            action={`http://${IP_ADDRESS}/upload-image/`}
                            beforeUpload={handleUpload}
                            onChange={handleImageChange}
                            listType='picture-card'
                            multiple={false}
                            name='file'
                            maxCount={1}
                            showUploadList={false}
                        >
                            {guest.imgPath ? (
                                <img src={guest.imgPath} alt='avatar' style={{ width: '100%', borderRadius: '8px' }} />
                            ) : (
                                uploadButton
                            )}
                        </Upload>
                    </div>

                    <div className='d-flex flex-column' style={{ width: 'calc(100% - 110px - 1rem)', gap: '0.5rem' }}>
                        <Form.Item
                            className='mb-0'
                            label='ФИО сотрудника'
                            required
                            rules={[
                                {
                                    required: true,
                                    message: 'Заполните ФИО сотрудника',
                                },
                            ]}
                        >
                            <Input name='fullName' onChange={handleInputChange} value={guest.fullName} />
                        </Form.Item>

                        <Form.Item
                            className='mb-0'
                            label='Отчество'
                        >
                            <Input name='fathername' onChange={handleInputChange} value={guest.fathername ?? ''} />
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
                    <Button onClick={onClose}>Отменить</Button>
                    <Button
                        disabled={isDisabled || localStorage.getItem('ROLE') !== 'superadmin'}
                        onClick={handleUpdate}
                        style={{ marginLeft: '8px' }}
                        type='primary'
                        htmlType='submit'
                    >
                        Сохранить
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

const handleUpload = (file: RcFile) => {
    const isCorrectFormat = file.type === 'image/jpg' || file.type === 'image/jpeg' || file.type === 'image/png';

    if (!isCorrectFormat) {
        notification.error({
            description: 'Можно загружать только .png/.jpeg/.jpg файлы!',
            message: 'Ошибка',
        });
    }
    return isCorrectFormat;
};

const getBase64 = (img: RcFile, callback: (url: string) => void) => {
    const reader = new FileReader();

    reader.addEventListener('load', () => callback(reader.result as string));
    reader.readAsDataURL(img);
};
