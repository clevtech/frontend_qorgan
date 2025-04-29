import moment from 'moment';
import { Divider, PageHeader, Typography } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import { CreateDailyOrderModal } from '@/components/app-components/daily-orders/CreateDailyOrderModal';
import { ReadDailyOrderModal } from '@/components/app-components/daily-orders/ReadDailyOrderModal';import { CustomCard } from '@/components/custom-components/CustomCard';
import { CustomTable } from '@/components/custom-components/CustomTable';
import { CustomActionButton } from '@/components/custom-components/CustomActionButton';
import { CustomTableButton } from '@/components/custom-components/CustomTableButton';
import { Time } from '@/components/shared-components/Time';
import { NoData } from '@/components/util-components/NoData';
import { DailyOrdersService } from '@/services/DailyOrdersService';
import { DailyOrderRead, DailyOrdersRead } from '@/types/custom';
import { getNameInitials } from '@/utils/stringlib';

import type { TableColumnsType } from 'antd';

const DailyOrders = () => {
    const [current, setCurrent] = useState<number>(1);
    const [dailyOrder, setDailyOrder] = useState<DailyOrderRead>();
    const [dataSource, setDataSource] = useState<DailyOrdersRead>({ totalCount: 0, dailyOrders: [] });
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [pageSize, setPageSize] = useState<number>(10);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
    const [isReadModalOpen, setIsReadModalOpen] = useState<boolean>(false);

    const fetchDataSource = useCallback(async () => {
        setIsLoading(true);

        await DailyOrdersService.getDailyOrders({
            query: {
                skip: current - 1,
                limit: pageSize,
            },
        })
            .then((response) => {
                const { data } = response;

                setDataSource(data);
            })
            .finally(() => setIsLoading(false));
    }, [current, pageSize]);

    useEffect(() => {
        fetchDataSource();
    }, [fetchDataSource]);

    const columns = [
        {
            key: 'orderNumber',
            dataIndex: 'orderNumber',
            title: 'Номер приказа',
            sorter: (a: DailyOrderRead, b: DailyOrderRead) => parseInt(a.orderNumber) - parseInt(b.orderNumber),
        },
        {
            key: 'dateOfSign',
            dataIndex: 'dateOfSign',
            sortDirections: ['ascend', 'descend'],
            title: 'Дата заполнения',
            render: (dateOfSign: string) => (
                <Typography.Text>{moment(dateOfSign).format('DD/MM/YYYY')}</Typography.Text>
            ),
            sorter: (a: DailyOrderRead, b: DailyOrderRead) =>
                new Date(a.dateOfSign).getTime() - new Date(b.dateOfSign).getTime(),
        },
        {
            dataIndex: 'onDate',
            key: 'onDate',
            sortDirections: ['ascend', 'descend'],
            title: 'На число',
            render: (onDate: string) => <Typography.Text>{moment(onDate).format('DD/MM/YYYY')}</Typography.Text>,
            sorter: (a: DailyOrderRead, b: DailyOrderRead) =>
                new Date(a.onDate).getTime() - new Date(b.onDate).getTime(),
        },
        {
            dataIndex: 'signerFullName',
            key: 'signerFullName',
            sortDirections: ['ascend', 'descend'],
            title: 'Заполнил',
            render: (text: string) => getNameInitials(text),
            sorter: (a: DailyOrderRead, b: DailyOrderRead) => a.signerFullName.localeCompare(b.signerFullName),
        },
        {
            key: 'actions',
            title: 'Действия',
            width: '20%',
            render: (_: string, dailyOrder: DailyOrderRead) => (
                <div>
                    <CustomActionButton
                        onClick={() => {
                            setDailyOrder(dailyOrder);

                            setIsReadModalOpen(true);
                        }}
                    >
                        Просмотреть
                    </CustomActionButton>
                    <Divider type='vertical' />
                    <CustomActionButton
                        danger={true}
                        disabled={
                            moment(dailyOrder.dateOfSign).format('DD/MM/YYYY') !==
                            moment(new Date()).format('DD/MM/YYYY')
                        }
                        onClick={() => {
                            setDailyOrder(dailyOrder);

                        }}
                    >
                        Редактировать
                    </CustomActionButton>
                </div>
            ),
        },
    ] as TableColumnsType<DailyOrderRead>;

    return (
        <>
            <CreateDailyOrderModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />

            {dailyOrder && (
                <>
                    <ReadDailyOrderModal
                        dailyOrder={dailyOrder}
                        isOpen={isReadModalOpen}
                        onClose={() => setIsReadModalOpen(false)}
                    />

                </>
            )}

            <PageHeader
                extra={<Time />}
                ghost={false}
                style={{
                    margin: '-25px -25px 25px -25px',

                    borderBottom: '1px solid #e6ebf1',
                }}
                subTitle='Заполнение суточного приказа'
                title='Суточные приказы'
            />

            <CustomCard
                title='Список суточных приказов'
                extra={
                    <CustomTableButton
                        onClick={() => {
                            setIsCreateModalOpen(true);
                        }}
                    >
                        Заполнить новый приказ
                    </CustomTableButton>
                }
            >
                {dataSource.totalCount > 0 ? (
                    <>
                        <CustomTable
                            bordered
                            columns={columns}
                            current={current}
                            dataSource={dataSource.dailyOrders}
                            loading={isLoading}
                            pageSize={pageSize}
                            total={dataSource.totalCount}
                            setCurrent={setCurrent}
                            setPageSize={setPageSize}
                        />
                    </>
                ) : (
                    <NoData />
                )}
            </CustomCard>
        </>
    );
};

export default DailyOrders;
