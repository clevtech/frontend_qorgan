import { Divider, Typography, notification } from 'antd';
import { useCallback, useEffect, useState } from 'react';

import { PlusCircleOutlined } from '@ant-design/icons';
import { IconStarFilled } from '@tabler/icons-react';

import { CustomCard } from '@/components/custom-components/CustomCard';
import { CustomCardButton } from '@/components/custom-components/CustomCardButton';
import { CustomTable } from '@/components/custom-components/CustomTable';
import { CustomActionButton } from '@/components/custom-components/CustomActionButton';
import { NoData } from '@/components/util-components/NoData';
import { TransportService } from '@/services/TransportService';
import { TransportRead, TransportsRead } from '@/types/custom';

import { CreateTransportModal } from './CreateTransportModal';
import { UpdateTransportModal } from './UpdateTransportModal';

import type { TableColumnsType } from 'antd';

const TransportCard = () => {
    const [current, setCurrent] = useState<number>(1);
    const [dataSource, setDataSource] = useState<TransportsRead>({ total_count: 0, transports: [] });
    const [transport, setTransport] = useState<TransportRead>();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [pageSize, setPageSize] = useState<number>(10);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState<boolean>(false);
    const fetchDataSource = useCallback(async () => {
        setIsLoading(true);

        await TransportService.getTransports({
            query: {
                skip: (current - 1) * 10,
                limit: pageSize,
            },
        })
            .then((response) => {
                const { data }: { data: TransportsRead } = response;

                setDataSource(data);
            })
            .finally(() => setIsLoading(false));
    }, [current, pageSize]);

    const deleteTransport = async (id: string) => {
        await TransportService.deleteTransportById({
            path: { _id: id },
        })
            .then(() => {
                notification.success({
                    message: 'Успешно',
                    description: 'Транспорт успешно удален',
                });
            })
            .finally(() => fetchDataSource());
    };

    useEffect(() => {
        fetchDataSource();
    }, [fetchDataSource]);
    
    const columns = [
        {
            dataIndex: 'plate',
            key: 'plate',
            title: 'Гос. номер',
            render: (text: string) => (
                <div className='d-flex align-items-center' style={{ gap: '0.5rem' }}>
                    <Typography.Text
                        className='text-monospace'
                        style={{
                            letterSpacing: '1px',
                        }}
                    >
                        {text}
                    </Typography.Text>
                </div>
            ),
            sorter: (a: TransportRead, b: TransportRead) => a.plate.localeCompare(b.plate),
        },
        {
            dataIndex: 'model',
            key: 'model',
            title: 'Марка',
            sorter: (a: TransportRead, b: TransportRead) => a.organization.localeCompare(b.model),
        },
        {
            dataIndex: 'organization',
            key: 'organization',
            title: 'Организация',
            sorter: (a: TransportRead, b: TransportRead) => a.model.localeCompare(b.organization),
        },
        {
            key: 'actions',
            title: 'Действия',
            width: 242,
            render: (_: string, record: TransportRead) => (
                <>
                    <CustomActionButton
                        onClick={() => {
                            setTransport(record);

                            setIsUpdateModalOpen(true);
                        }}
                    >
                        Редактировать
                    </CustomActionButton>
                    <Divider type='vertical' />
                    <CustomActionButton danger onClick={() => deleteTransport(record._id)} disabled={localStorage.getItem('ROLE') !== 'superadmin'}>
                        Удалить
                    </CustomActionButton>
                </>
            ),
        },
    ] as TableColumnsType<TransportRead>;

    return (
        <div>
            <Typography.Title level={4}>Настройка транспорта</Typography.Title>

            <CreateTransportModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                fetchDataSource={fetchDataSource}
            />

            {transport && (
                <UpdateTransportModal
                    transport={transport}
                    isOpen={isUpdateModalOpen}
                    fetchDataSource={fetchDataSource}
                    onClose={() => setIsUpdateModalOpen(false)}
                />
            )}

            <CustomCard
                extra={
                    <CustomCardButton
                        onClick={() => {
                            setIsCreateModalOpen(true);
                        }}
                    >
                        <PlusCircleOutlined />
                        Добавить транспорт
                    </CustomCardButton>
                }
                title='Список транспорта'
            >
                {!isLoading && dataSource.totalCount === 0 ? (
                    <NoData />
                ) : (
                    <CustomTable
                        columns={columns}
                        current={current}
                        dataSource={dataSource.transports}
                        loading={isLoading}
                        pageSize={pageSize}
                        total={dataSource.total_count}
                        setCurrent={setCurrent}
                        setPageSize={setPageSize}
                    />
                )}
            </CustomCard>
        </div>
    );
};

export default TransportCard;
