import moment from 'moment';

import { Divider, Modal, Tag, Typography, notification } from 'antd';
import { useCallback, useEffect, useState } from 'react';

import { ExclamationCircleOutlined, PlusCircleOutlined } from '@ant-design/icons';

import { CustomActionButton } from '@/components/custom-components/CustomActionButton';
import { CustomCard } from '@/components/custom-components/CustomCard';
import { CustomCardButton } from '@/components/custom-components/CustomCardButton';
import { CustomTable } from '@/components/custom-components/CustomTable';
import { CamerasService } from '@/services/CamerasService.ts';
import { CameraRead, CamerasRead } from '@/types/custom';

import { CreateCameraModal } from './CreateCameraModal';
import { UpdateCameraModal } from './UpdateCameraModal';

import type { TableColumnsType } from 'antd';
import { useLocation } from 'react-router-dom';

const STATUSES = [
    { text: 'Активный', value: 'active' },
    { text: 'Неактивный', value: 'inactive' },
];

const STATUS_FILTER = STATUSES.map(({ text, value }) => {
    return { text, value };
});

const CameraCard = () => {
    const [camera, setCamera] = useState<CameraRead>();
    const [current, setCurrent] = useState<number>(1);
    const [dataSource, setDataSource] = useState<any>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [pageSize, setPageSize] = useState<number>(10);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState<boolean>(false);
    const location = useLocation();

    const fetchDataSource = useCallback(async () => {
        setIsLoading(true);

        await CamerasService.getCameras({
            query: {
                skip: current - 1,
                limit: pageSize,
            },
        })
            .then((response) => {
                const { data }: { data: CamerasRead } = response;
                setDataSource(data);
            })
            .finally(() => setIsLoading(false));
    }, [current, pageSize]);

    const deleteCamera = async (id: string) => {
        await CamerasService.deleteCameraById({
            id,
        })
            .then(() => {
                notification.success({
                    description: 'Камера успешно удалена',
                    message: 'Успех',
                });
            })
            .finally(() => fetchDataSource());
    };

    useEffect(() => {
        fetchDataSource();
    }, [location.pathname, fetchDataSource]);


    const columns = [
        {
            dataIndex: 'createdAt',
            key: 'createdAt',
            title: 'Дата регистрации',
            render: (text: string) => <Typography.Text>{moment(text).format('DD/MM/YYYY')}</Typography.Text>,
            sorter: (a: CameraRead, b: CameraRead) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        },
        {
            dataIndex: 'name',
            key: 'name',
            title: 'Наименование камеры',
        },
        {
            dataIndex: 'ip',
            key: 'ip',
            title: 'IP-адрес',
            render: (text: string) => <Typography.Text className='text-monospace'>{text}</Typography.Text>,
            sorter: (a: CameraRead, b: CameraRead) => a.ipAddress.localeCompare(b.ipAddress),
        },
        {
            dataIndex: 'updatedAt',
            key: 'updatedAt',
            title: 'Последние изменения',
            render: (text: string) => <Typography.Text>{moment(text).format('DD/MM/YYYY HH:mm')}</Typography.Text>,
            sorter: (a: CameraRead, b: CameraRead) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
        },
        {
            dataIndex: 'status',
            filters: STATUS_FILTER,
            key: 'status',
            title: 'Статус',
            render: (text: string) => (
                <Tag color={text !== 'inactive' ? 'success' : 'error'} style={{ borderRadius: '12px' }}>
                    {text !== 'inactive' ? 'Активный' : 'Неактивный'}
                </Tag>
            ),
            sorter: (a: CameraRead, b: CameraRead) => a.status.localeCompare(b.status),
            onFilter: (value: string, record: CameraRead) => record.status.indexOf(value) === 0,
        },
        {
            key: 'actions',
            title: 'Действия',
            width: 242,
            render: (_: string, record: CameraRead) => (
                <div>
                    <CustomActionButton
                        onClick={() => {
                            setCamera(record);
                            setIsUpdateModalOpen(true);
                        }}
                        // disabled={localStorage.getItem('ROLE') !== 'superadmin'}
                    >
                        Редактировать
                    </CustomActionButton>
                    <Divider type='vertical' />
                    {localStorage.getItem('ROLE') !== 'employee' && (
                        <CustomActionButton
                        danger
                        disabled={localStorage.getItem('ROLE') !== 'superadmin'}
                        onClick={() => {
                            Modal.confirm({
                                cancelText: 'Нет',
                                content: 'Камера будет удалена без возможности востановления.',
                                icon: <ExclamationCircleOutlined />,
                                okText: 'Да',
                                okType: 'danger',
                                title: 'Вы уверены, что хотите удалить эту камеру?',
                                onOk: () => {
                                    deleteCamera(record.camera_id);
                                },
                            });
                        }}
                    >
                        Удалить
                    </CustomActionButton>
                    )}
                </div>
            ),
        },
    ] as TableColumnsType<CameraRead>;

    return (
        <div>
            <Typography.Title level={4}>Настройка камер</Typography.Title>

            <CreateCameraModal
                isOpen={isCreateModalOpen}
                fetchDataSource={fetchDataSource}
                onClose={() => setIsCreateModalOpen(false)}
            />

            {camera && (
                <UpdateCameraModal
                    camera={camera}
                    isOpen={isUpdateModalOpen}
                    fetchDataSource={fetchDataSource}
                    onClose={() => setIsUpdateModalOpen(false)}
                />
            )}

            <CustomCard
                title='Список камер'
                extra={
                    <CustomCardButton
                        onClick={() => {
                            setIsCreateModalOpen(true);
                        }}
                    >
                        <PlusCircleOutlined />
                        Добавить камеру
                    </CustomCardButton>
                }
            >
                <CustomTable
                    columns={columns}
                    current={current}
                    dataSource={dataSource}
                    loading={isLoading}
                    pageSize={pageSize}
                    setCurrent={setCurrent}
                    setPageSize={setPageSize}
                    total={dataSource.totalCount}
                />
            </CustomCard>
        </div>
    );
};

export default CameraCard;
