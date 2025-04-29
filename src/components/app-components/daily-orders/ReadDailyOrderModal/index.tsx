import moment from 'moment';

import { Modal, Radio, Typography } from 'antd';
import { useCallback, useEffect, useState } from 'react';

import { IconArrowsExchange2 } from '@tabler/icons-react';

import { CustomTable } from '@/components/custom-components/CustomTable';
import { NoData } from '@/components/util-components/NoData';
import { ICON_SIZE, ICON_STROKE } from '@/constants/IconConstant';
import { MODAL_WIDTH } from '@/constants/LayoutConstant';
import { EmployeeService } from '@/services/EmployeeService';
import { WhitelistService } from '@/services/WhiteListService';
import { DailyOrderRead, EmployeeRead, WhiteListRead, WhiteListsRead } from '@/types/custom';
import { getNameInitials } from '@/utils/stringlib';

import type { TableColumnsType } from 'antd';

export type Props = {
    dailyOrder: DailyOrderRead;
    isOpen: boolean;
    onClose: () => void;
};

type ButtonType = 'duties' | 'checkpointDuties' | 'whitelist';

export const ReadDailyOrderModal = ({ dailyOrder, isOpen, onClose }: Props) => {
    const [checkpointDuties, setCheckpointDuties] = useState<EmployeeRead[]>([]);
    const [current, setCurrent] = useState<number>(1);
    const [dataSource, setDataSource] = useState<WhiteListsRead>({ totalCount: 0, whitelists: [] });
    const [duties, setDuties] = useState<EmployeeRead[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [pageSize, setPageSize] = useState<number>(10);
    const [selectedButton, setSelectedButton] = useState<ButtonType>('duties');

    const fetchData = useCallback(async () => {
        setIsLoading(true);

        Promise.all(
            [dailyOrder.dutyId, dailyOrder.dutyHelperId].map(async (id) => {
                const response = await EmployeeService.getEmployeesById({
                    path: {
                        id: id,
                    },
                });

                const { data } = response;

                return data;
            }),
        ).then((duties) => {
            setDuties(duties);
        });

        Promise.all(
            dailyOrder.checkpointDuties.map(async (id) => {
                const response = await EmployeeService.getEmployeesById({
                    path: {
                        id: id,
                    },
                });

                const { data } = response;

                return data;
            }),
        ).then((checkpointDuty) => {
            setCheckpointDuties(checkpointDuty);
        });

        WhitelistService.getWhitelists({
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

        setIsLoading(false);
    }, [dailyOrder.checkpointDuties, dailyOrder.dutyId, dailyOrder.dutyHelperId, current, pageSize]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const dutiesTableColumns = [
        {
            dataIndex: 'fullName',
            title: 'ФИО',
            render: (text: string) => getNameInitials(text),
        },
        {
            dataIndex: 'phoneNumber',
            title: 'Номер телефона',
        },
        {
            title: 'Статус дежурного',
            render: (_: string, employee: EmployeeRead) => {
                if (dailyOrder.dutyId === employee.id) {
                    return 'Дежурный по части';
                } else {
                    return 'Помощник дежурного';
                }
            },
        },
    ] as TableColumnsType<EmployeeRead>;

    const checkpointDutiesTableColumns = [
        {
            dataIndex: 'fullName',
            title: 'ФИО',
            render: (text: string) => getNameInitials(text),
        },
        {
            dataIndex: 'phoneNumber',
            title: 'Номер телефона',
        },
    ] as TableColumnsType<EmployeeRead>;

    const whitelistTableColumns = [
        {
            key: 'fullName',
            dataIndex: 'employeeFullName',
            title: 'ФИО',
            render: (text: string) => getNameInitials(text),
        },
        {
            key: 'datePeriod',
            dataIndex: 'datePeriod',
            title: 'Период отсутсвия',
            render: (_: string, record: WhiteListRead) => (
                <div
                    className='d-flex align-items-center'
                    style={{
                        gap: '0.5rem',
                    }}
                >
                    <Typography.Text>{moment(record.startDate).format('DD/MM/YYYY')}</Typography.Text>
                    <IconArrowsExchange2 color='#3e79f7' size={ICON_SIZE} stroke={ICON_STROKE} />
                    <Typography.Text>{moment(record.endDate).format('DD/MM/YYYY')}</Typography.Text>
                </div>
            ),
        },
        {
            key: 'reason',
            dataIndex: 'reason',
            title: 'Причина отсуствия',
        },
    ] as TableColumnsType<WhiteListRead>;

    return (
        <Modal title='Просмотр суточного приказа' open={isOpen} onCancel={onClose} footer={null} width={MODAL_WIDTH}>
            <div className='d-flex justify-content-center mb-3'>
                <Radio.Group value={selectedButton} onChange={(evt) => setSelectedButton(evt.target.value)}>
                    <Radio.Button value='duties'>Дежурные</Radio.Button>
                    <Radio.Button value='checkpointDuties'>КПП</Radio.Button>
                    <Radio.Button value='whitelist'>Отсутствующие</Radio.Button>
                </Radio.Group>
            </div>

            {selectedButton === 'duties' && (
                <CustomTable
                    bordered={true}
                    columns={dutiesTableColumns}
                    current={1}
                    dataSource={duties}
                    loading={isLoading}
                    pageSize={10}
                    setCurrent={() => {}}
                    setPageSize={() => {}}
                    total={2}
                />
            )}

            {selectedButton === 'checkpointDuties' &&
                (checkpointDuties.length > 0 ? (
                    <CustomTable
                        columns={checkpointDutiesTableColumns}
                        current={1}
                        dataSource={checkpointDuties}
                        loading={isLoading}
                        pageSize={10}
                        setCurrent={() => {}}
                        setPageSize={() => {}}
                        total={2}
                    />
                ) : (
                    <NoData />
                ))}

            {selectedButton === 'whitelist' &&
                (dataSource.whitelists.length > 0 ? (
                    <CustomTable
                        columns={whitelistTableColumns}
                        current={current}
                        dataSource={dataSource.whitelists}
                        loading={isLoading}
                        pageSize={pageSize}
                        setCurrent={setCurrent}
                        setPageSize={setPageSize}
                        total={dataSource.totalCount}
                    />
                ) : (
                    <NoData />
                ))}
        </Modal>
    );
};
