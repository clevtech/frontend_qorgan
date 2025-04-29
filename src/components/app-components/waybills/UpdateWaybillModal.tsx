import moment from 'moment';

import { DatePicker, Form, Input, Modal, Select, Spin, Typography } from 'antd';
import { ChangeEvent, useCallback, useEffect, useState } from 'react';

import { TransportService } from '@/services/TransportService';
import { TransportRead, TransportsRead, WaybillRead, WaybillUpdate } from '@/types/custom';
import { WaybillsService } from '@/services/WaybillsService';

type Props = {
    isOpen: boolean;
    waybill: WaybillRead;
    onClose: () => void;
};

function getUniqueById(arr: TransportRead[]) {
    const seenIds = new Set();

    const res = arr.filter((item) => {
        if (seenIds.has(item.id)) {
            return false;
        } else {
            seenIds.add(item.id);
            return true;
        }
    });

    return res;
}

export const UpdateWaybillModal = (props: Props) => {
    const { isOpen, waybill, onClose } = props;

    const [updated, setUpdated] = useState<WaybillUpdate>();

    const [hasMore, setHasMore] = useState<boolean>(true);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [skip, setSkip] = useState<number>(0);
    const [transports, setTransports] = useState<TransportRead[]>([]);

    const fetchData = useCallback(async () => {
        setIsLoading(true);

        await TransportService.getTransports({
            query: {
                skip: skip,
                limit: 10,
                govNumber: searchTerm,
            },
        })
            .then((response) => {
                const { data }: { data: TransportsRead } = response;

                setTransports((prev) => getUniqueById([...(prev ?? []), ...data.transports]));

                if (data.transports.length === 0) {
                    setHasMore(false);
                }
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [skip, searchTerm]);

    const handleInfiniteScroll = () => {
        if (!isLoading && hasMore) {
            setSkip((prev) => prev + 1);
        }
    };

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;

        setUpdated((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSearch = (value: string) => {
        setTransports([]);
        setHasMore(true);
        setSearchTerm(value);
        setSkip(0);
    };

    const handleSubmit = async () => {
        await WaybillsService.updateWaybills(
            {
                path: { id: waybill.id },
            },
            {
                numberWaybill: updated?.numberWaybill,
                transportId: updated?.transportId,
                dateOfArrival: new Date(updated?.dateOfArrival ?? '').toISOString(),
                dateOfDeparture: new Date(updated?.dateOfDeparture ?? '').toISOString(),
                comment: updated?.comment,
            },
        )
            .then((response) => {
                console.log(response.data);
            })
            .finally(() => {
                onClose();

                setUpdated({});
            });
    };

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        setUpdated(waybill);
    }, [waybill]);

    if (!updated) return null;

    return (
        <Modal
            onCancel={() => {
                onClose();

                setHasMore(true);
                setIsLoading(false);
                setSearchTerm('');
                setSkip(0);
                setTransports([]);
            }}
            onOk={handleSubmit}
            open={isOpen}
            title={<Typography.Text className='font-size-base'>Редактировать путевой лист</Typography.Text>}
        >
            <Form layout='vertical'>
                <Form.Item label='Номер путевого листа'>
                    <Input name='numberWaybill' onChange={handleInputChange} value={updated.numberWaybill} />
                </Form.Item>

                <Form.Item label='Гос. номер'>
                    <Select
                        showSearch
                        placeholder='Введите номер гос. транспорта'
                        optionFilterProp='children'
                        notFoundContent={isLoading ? <Spin size='small' /> : null}
                        filterOption={false}
                        onSearch={handleSearch}
                        onPopupScroll={(e) => {
                            const { target } = e;

                            if (
                                (target as Element).scrollTop + (target as Element).clientHeight >=
                                (target as Element).scrollHeight
                            ) {
                                handleInfiniteScroll();
                            }
                        }}
                        onChange={(transportId) => {
                            setUpdated((prev) => ({
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

                <Form.Item label='Период разрешения'>
                    <DatePicker.RangePicker
                        defaultValue={[moment(waybill.dateOfDeparture), moment(waybill.dateOfArrival)]}
                        style={{ width: '100%' }}
                        onChange={(_, dateString) => {
                            setUpdated((prev) => ({
                                ...prev,
                                dateOfDeparture: dateString[0],
                                dateOfArrival: dateString[1],
                            }));
                        }}
                    />
                </Form.Item>

                <Form.Item className='mb-0' label='Комментарий'>
                    <Input
                        // value={waybill.comment}
                        onChange={(evt) => {
                            setUpdated((prev) => ({
                                ...prev,
                                comment: evt.target.value,
                            }));
                        }}
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
};
