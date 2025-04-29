import { DatePicker, Form, Input, Modal, Select, Spin, Typography } from 'antd';
import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import moment from 'moment';

import { TransportService } from '@/services/TransportService';
import { WaybillsService } from '@/services/WaybillsService';
import { EmployeeRead, EmployeesRead, TransportRead, TransportsRead } from '@/types/custom';
import { EmployeeService } from '@/services/EmployeeService';

type Props = {
    isOpen: boolean;
    onClose: () => void;
};

function getUniqueById<T>(arr: T[]): T[] {
    const seenIds: string[] = [];

    const res = arr.filter((item) => {
        if (typeof item !== 'object' || item == null || !('id' in item) || typeof item.id !== 'string') {
            return false;
        }
        if (!seenIds.includes(item.id)) {
            seenIds.push(item.id);
            return true;
        }
        return false;
    });

    return res;
}

export const CreateWaybillModal = (props: Props) => {
    const { isOpen, onClose } = props;

    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [transportsHasMore, transportsSetHasMore] = useState<boolean>(true);
    const [transportsSearchTerm, transportsSetSearchTerm] = useState('');
    const [transportsSkip, setTransportsSkip] = useState<number>(0);
    const [transports, setTransports] = useState<TransportRead[]>([]);

    const [employeesHasMore, setEmployeesHasMore] = useState<boolean>(true);
    const [employeesSearchTerm, setEmployeesSearchTerm] = useState('');
    const [employeesSkip, setEmployeesSkip] = useState<number>(0);
    const [employees, setEmployees] = useState<EmployeeRead[]>([]);

    const [waybill, setWaybill] = useState({
        numberWaybill: '',
        transportId: '',
        dateOfDeparture: new Date().toISOString(),
        dateOfArrival: new Date().toISOString(),
        comment: '',
        driverId: '',
    });

    const fetchTransportsData = useCallback(async () => {
        setIsLoading(true);

        await TransportService.getTransports({
            query: {
                skip: transportsSkip,
                limit: 10,
                ...(transportsSearchTerm !== '' && { govNumber: transportsSearchTerm }),
            },
        })
            .then((response) => {
                const { data }: { data: TransportsRead } = response;

                setTransports((prev) => getUniqueById([...prev, ...data.transports]));

                if (data.transports.length === 0) {
                    transportsSetHasMore(false);
                }
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [transportsSkip, transportsSearchTerm]);

    const fetchEmployeesData = useCallback(async () => {
        setIsLoading(true);

        await EmployeeService.getEmployees({
            query: {
                skip: employeesSkip,
                limit: 10,
                role: 'employee',
                ...(employeesSearchTerm !== '' && { fullName: employeesSearchTerm }),
            },
        })
            .then((response) => {
                const { data }: { data: EmployeesRead } = response;

                setEmployees((prev) => getUniqueById([...prev, ...data.employees]));

                if (data.employees.length === 0) {
                    setEmployeesHasMore(false);
                }
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [employeesSkip, employeesSearchTerm]);

    const handleTransportsInfiniteScroll = () => {
        if (!isLoading && transportsHasMore) {
            setTransportsSkip((prev) => prev + 1);
        }
    };

    const handleEmployeesInfiniteScroll = () => {
        if (!isLoading && employeesHasMore) {
            setEmployeesSkip((prev) => prev + 1);
        }
    };

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;

        setWaybill((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleTransportSearch = (value: string) => {
        setTransports([]);
        transportsSetHasMore(true);
        transportsSetSearchTerm(value);
        setTransportsSkip(0);
    };

    const handleEmployeeSearch = (value: string) => {
        setEmployees([]);
        setEmployeesHasMore(true);
        setEmployeesSearchTerm(value);
        setEmployeesSkip(0);
    };

    const handleSubmit = async () => {
        await WaybillsService.createWaybills({
            ...waybill,
        })
            .then((response) => {
                console.log(response.data);
            })
            .finally(() => {
                onClose();

                setWaybill({
                    numberWaybill: '',
                    transportId: '',
                    dateOfDeparture: new Date().toISOString(),
                    dateOfArrival: new Date().toISOString(),
                    comment: '',
                    driverId: '',
                });
            });
    };

    useEffect(() => {
        fetchEmployeesData();
        fetchTransportsData();
    }, [fetchEmployeesData, fetchTransportsData]);

    return (
        <Modal
            okText='Создать'
            onCancel={() => {
                onClose();

                setWaybill({
                    numberWaybill: '',
                    transportId: '',
                    dateOfDeparture: new Date().toISOString(),
                    dateOfArrival: new Date().toISOString(),
                    comment: '',
                    driverId: '',
                });
            }}
            onOk={() => {
                handleSubmit();

                onClose();

                setWaybill({
                    numberWaybill: '',
                    transportId: '',
                    dateOfDeparture: new Date().toISOString(),
                    dateOfArrival: new Date().toISOString(),
                    comment: '',
                    driverId: '',
                });
            }}
            open={isOpen}
            title={<Typography.Text className='font-size-base'>Заполнить путевой лист.</Typography.Text>}
        >
            <Form layout='vertical'>
                <Form.Item required label='Номер путевого листа'>
                    <Input name='numberWaybill' onChange={handleInputChange} value={waybill.numberWaybill} />
                </Form.Item>

                <Form.Item required label='Гос. номер'>
                    <Select
                        showSearch
                        placeholder='Введите номер гос. транспорта'
                        optionFilterProp='children'
                        notFoundContent={isLoading ? <Spin size='small' /> : null}
                        filterOption={false}
                        onSearch={handleTransportSearch}
                        onPopupScroll={(e) => {
                            const { target } = e;

                            if (
                                (target as Element).scrollTop + (target as Element).clientHeight >=
                                (target as Element).scrollHeight
                            ) {
                                handleTransportsInfiniteScroll();
                            }
                        }}
                        onChange={(transportId) => {
                            setWaybill((prev) => ({
                                ...prev,
                                transportId,
                            }));
                        }}
                    >
                        {transports.map((item, idx) => (
                            <Select.Option key={idx} value={item.id}>
                                {item.govNumber}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item required label='Водитель'>
                    <Select
                        showSearch
                        placeholder='Введите имя водителя'
                        optionFilterProp='children'
                        notFoundContent={isLoading ? <Spin size='small' /> : null}
                        filterOption={false}
                        onSearch={handleEmployeeSearch}
                        onPopupScroll={(e) => {
                            const { target } = e;

                            if (
                                (target as Element).scrollTop + (target as Element).clientHeight >=
                                (target as Element).scrollHeight
                            ) {
                                handleEmployeesInfiniteScroll();
                            }
                        }}
                        onChange={(driverId) => {
                            setWaybill((prev) => ({
                                ...prev,
                                driverId,
                            }));
                        }}
                    >
                        {employees.map((item, idx) => (
                            <Select.Option key={idx} value={item.id}>
                                {item.fullName}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item required label='Период разрешения'>
                    <DatePicker.RangePicker
                        style={{ width: '100%' }}
                        onChange={(_, dateString) => {
                            setWaybill((prev) => ({
                                ...prev,
                                dateOfDeparture: new Date(dateString[0]).toISOString(),
                                dateOfArrival: new Date(dateString[1]).toISOString(),
                            }));
                        }}
                        value={[moment(waybill.dateOfDeparture), moment(waybill.dateOfArrival)]}
                    />
                </Form.Item>

                <Form.Item required className='mb-0' label='Комментарий'>
                    <Input
                        onChange={(evt) => {
                            setWaybill((prev) => ({
                                ...prev,
                                comment: evt.target.value,
                            }));
                        }}
                        value={waybill.comment}
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
};
