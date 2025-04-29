import moment from 'moment';

import { Button, Divider, PageHeader, TableColumnsType, Typography } from 'antd';
import { useCallback, useEffect, useState } from 'react';

import { Time } from '@/components/shared-components/Time';
import { WaybillRead, WaybillsRead } from '@/types/custom';
import { WaybillsService } from '@/services/WaybillsService';
import { getNameInitials } from '@/utils/stringlib';
import { NoData } from '@/components/util-components/NoData';
import { CustomTable } from '@/components/custom-components/CustomTable';
import { CustomTableButton } from '@/components/custom-components/CustomTableButton';
import { CustomCard } from '@/components/custom-components/CustomCard';
import { CreateWaybillModal } from '@/components/app-components/waybills/CreateWaybillModal';
import { ReadWaybillModal } from '@/components/app-components/waybills/ReadWaybillModal';
import { UpdateWaybillModal } from '@/components/app-components/waybills/UpdateWaybillModal';

const { Text } = Typography;

const Waybills = () => {
    const [current, setCurrent] = useState<number>(1);
    const [waybill, setWaybill] = useState<WaybillRead>();
    const [dataSource, setDataSource] = useState<WaybillsRead>({ totalCount: 0, items: [] });
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [pageSize, setPageSize] = useState<number>(10);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
    const [isReadModalOpen, setIsReadModalOpen] = useState<boolean>(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState<boolean>(false);

    const fetchDataSource = useCallback(async () => {
        setIsLoading(true);

        await WaybillsService.getWaybills({
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
            dataIndex: 'numberWaybill',
            key: 'numberWaybill',
            title: 'Номер приказа',
            sorter: (a: WaybillRead, b: WaybillRead) => a.numberWaybill.localeCompare(b.numberWaybill),
        },
        {
            dataIndex: 'signerFullName',
            key: 'signerFullName',
            title: 'Заполнил',
            sortDirections: ['ascend', 'descend'],
            render: (text: string) => getNameInitials(text),
            sorter: (a: WaybillRead, b: WaybillRead) => a.signerFullName.localeCompare(b.signerFullName),
        },
        {
            dataIndex: 'transportName',
            key: 'transportName',
            sortDirections: ['ascend', 'descend'],
            title: 'Марка',
            sorter: (a: WaybillRead, b: WaybillRead) => a.transportName.localeCompare(b.transportName),
        },
        {
            dataIndex: 'transportGovNumber',
            key: 'transportGovNumber',
            sortDirections: ['ascend', 'descend'],
            title: 'Номер транспорта',
            sorter: (a: WaybillRead, b: WaybillRead) => a.transportName.localeCompare(b.transportName),
        },
        {
            dataIndex: 'dateOfArrival',
            key: ['dateOfArrival', 'dateOfDeparture'],
            title: 'Период разрешения',
            sortDirections: ['ascend', 'descend'],
            render: (_: string, record: WaybillRead) => (
                <Text>
                    {moment(record.dateOfDeparture).format('DD/MM/YYYY')} –{' '}
                    {moment(record.dateOfArrival).format('DD/MM/YYYY')}
                </Text>
            ),
            sorter: (a: WaybillRead, b: WaybillRead) =>
                new Date(a.dateOfArrival).getTime() - new Date(b.dateOfArrival).getTime(),
        },
        {
            key: 'actions',
            title: 'Действия',
            width: '18%',
            render: (_: string, record: WaybillRead) => (
                <div>
                    <Button
                        className='py-0 px-2'
                        onClick={() => {
                            setWaybill(record);

                            setIsReadModalOpen(true);
                        }}
                        style={{
                            height: 'auto',
                        }}
                        type='link'
                    >
                        Просмотреть
                    </Button>
                    <Divider type='vertical' />
                    <Button
                        className='py-0 px-2'
                        danger
                        onClick={() => {
                            setWaybill(record);

                            setIsUpdateModalOpen(true);
                        }}
                        style={{
                            height: 'auto',
                        }}
                        type='link'
                    >
                        Редактировать
                    </Button>
                </div>
            ),
        },
    ] as TableColumnsType<WaybillRead>;

    return (
        <>
            <PageHeader
                extra={<Time />}
                ghost={false}
                style={{
                    margin: '-25px -25px 25px -25px',

                    borderBottom: '1px solid #e6ebf1',
                }}
                subTitle='Путевые листы'
                title={
                    <Typography.Text className='font-weight-semibold' style={{ fontSize: '16px' }}>
                        Заполнение путевых листов
                    </Typography.Text>
                }
            />

            <CreateWaybillModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />

            {waybill && (
                <ReadWaybillModal
                    isOpen={isReadModalOpen}
                    onClose={() => setIsReadModalOpen(false)}
                    waybill={waybill}
                />
            )}

            {waybill && (
                <UpdateWaybillModal
                    isOpen={isUpdateModalOpen}
                    onClose={() => setIsUpdateModalOpen(false)}
                    waybill={waybill}
                />
            )}

            <CustomCard
                title='Список путевых листов'
                extra={
                    <CustomTableButton
                        onClick={() => {
                            setIsCreateModalOpen(true);
                        }}
                    >
                        Заполнить новый путевой лист
                    </CustomTableButton>
                }
            >
                {dataSource.totalCount > 0 ? (
                    <>
                        <CustomTable
                            bordered
                            columns={columns}
                            current={current}
                            dataSource={dataSource.items}
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

export default Waybills;
