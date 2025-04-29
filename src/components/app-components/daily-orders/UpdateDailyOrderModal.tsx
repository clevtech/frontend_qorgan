import { Avatar, Button, Col, DatePicker, Form, Modal, Row, Select, Table, Typography } from 'antd';
import { IntlMessage } from '@/components/util-components/IntlMessage';
import { useEffect, useState } from 'react';
import { components } from '@/types/generated.ts';
import { useForm } from 'antd/es/form/Form';
import { EmployeeService } from '@/services/EmployeeService.ts';
import moment from 'moment/moment';
import { DailyOrdersService } from '@/services/DailyOrdersService.ts';
import { WhitelistService } from '@/services/WhitelistService.ts';
import { getDailyOrders } from '@/store/slices/documentationSlice.ts';
import { useAppDispatch } from '@/components/app-components/waybills/modal/EditWaybillModal.tsx';

const { Text, Title } = Typography;

export type Props = {
    isOpen: boolean;
    onClose: () => void;
    record: components['schemas']['DailyOrderOut'] | undefined;
};

export const UpdateDailyOrderModal = ({ isOpen, onClose, record }: Props) => {
    const [form] = useForm();
    const [step, setStep] = useState<number>(1);
    const [employee, setEmployee] = useState<components['schemas']['EmployeeDetailsOut']>();
    const [userIntercedingData, setUserIntercedingData] = useState<components['schemas']['DailyWhiteListUser'][]>([]);
    const [userPresent, setUserPresent] = useState<string>();
    const [dateStart, setDateStart] = useState<string>();
    const [dateEnd, setDateEnd] = useState<string>();
    const [absentUser, setAbsentUser] = useState<components['schemas']['WhiteListOut'][]>([]);
    const [userAbsent, setUserAbsent] = useState<string>();
    const [oldWhiteList, setOldWhiteList] = useState<components['schemas']['WhiteListOut'][]>([]);
    const [deleteWhitelist, setdeleteWhitelist] = useState<string[]>([]);
    const [status, setStatus] = useState<'В отпуске' | 'По рапорту' | 'На больничном'>('В отпуске');
    const [duty, setDuty] = useState<string>('');
    const [dutyHelper, setDutyHelper] = useState<string>('');

    const [loading, setLoading] = useState<boolean>(false);
    const dispatch = useAppDispatch();

    const handleCancel = () => {
        setStep(1);
        onClose();
    };

    const handleOk = async () => {
        if (step < 3) {
            setStep(step + 1);
        } else if (step === 3) {
            if (record?.id) {
                await DailyOrdersService.updateDailyOrders(
                    {
                        path: { id: record?.id },
                    },
                    {
                        govNumber: record.govNumber,
                        // @ts-expect-error it is string
                        dateOfSign: moment() as string,
                        // @ts-expect-error it is string
                        onDate: moment().clone().add(1, 'day'),
                        signerId: duty !== '' ? duty : record.signerId,
                        signerHelperId: dutyHelper !== '' ? dutyHelper : record.signerHelperId,
                        whiteList: userIntercedingData.map((item) => item.id),
                    },
                );
                const filterAbsentUser = absentUser.filter((item) => !oldWhiteList.some((old) => item.id === old.id));
                filterAbsentUser.map(async (item) => {
                    await WhitelistService.createWhitelist({
                        employeeId: item.employeeId,
                        startDate: item.startDate,
                        endDate: item.endDate,
                        reason: item.reason,
                    });
                });
                deleteWhitelist.map(async (item) => {
                    await WhitelistService.deleteWhitelist({
                        path: { id: item },
                    });
                });
                dispatch(
                    getDailyOrders({
                        query: {
                            skip: 0,
                            limit: 10,
                        },
                    }),
                );
                setStep(1);
                onClose();
            }
        }
    };

    useEffect(() => {
        const funcRequests = async () => {
            await EmployeeService.getEmployees({
                query: {
                    skip: 0,
                    limit: 100,
                },
            }).then((responce) => {
                if (responce.data) {
                    setEmployee(responce.data);
                }
            });
        };
        void funcRequests();
    }, []);

    useEffect(() => {
        if (record && step === 2) {
            setLoading(true);
            DailyOrdersService.getWhitelistsByDailyOrderId({
                path: { id: record?.id },
            }).then((responce) => {
                if (responce.data) {
                    setLoading(false);
                    setUserIntercedingData(responce.data);
                }
            });
        } else if (step === 3) {
            setLoading(true);
            WhitelistService.getWhitelists({
                query: {
                    skip: 0,
                    limit: 100,
                },
            }).then((responce) => {
                if (responce.data) {
                    setLoading(false);
                    setAbsentUser(responce.data.items);
                    setOldWhiteList(responce.data.items);
                }
            });
        }
    }, [isOpen, step]);

    useEffect(() => {
        const funcRequests = async () => {
            await EmployeeService.getEmployees({
                query: {
                    skip: 0,
                    limit: 100,
                },
            }).then((responce) => {
                if (responce.data) {
                    setEmployee(responce.data);
                }
            });
        };

        void funcRequests();
    }, [isOpen]);

    useEffect(() => {
        if (record) {
            form.setFieldsValue({
                duty: {
                    value: record.signerId,
                    label: record.signerFullName,
                },
                dutyHelper: {
                    value: record.signerHelperId,
                    label: record.signerHelperFullName,
                },
            });
        }
    }, [isOpen]);

    const addPeopleInterceding = () => {
        const data = employee?.items.find((item) => item.id === userPresent);
        if (data) {
            const item = {
                id: data.id,
                fullName: data.fullName,
                imgPath: data.imgPath || '',
            };
            const updatedArray = [...userIntercedingData, item];
            setUserIntercedingData(updatedArray);
        }
    };
    const statuses = ['В отпуске', 'По рапорту', 'На больничном'];

    const column = [
        {
            title: 'ФИО',
            dataIndex: 'fullName',
            key: 'fullName',
            render: (_: string, record: components['schemas']['DailyWhiteListUser']) => (
                <>
                    <Avatar src={record.imgPath} /> <>{record.fullName}</>
                </>
            ),
        },
        {
            title: 'Действия',
            dataIndex: 'detail',
            key: 'detail',
            render: (_: string, record: components['schemas']['DailyWhiteListUser']) => (
                <>
                    <Button
                        type={'link'}
                        danger
                        disabled={localStorage.getItem('ROLE') !== 'superadmin'}
                        onClick={() =>
                            setUserIntercedingData(userIntercedingData.filter((item) => item.id !== record.id))
                        }
                    >
                        Удалить запись
                    </Button>
                </>
            ),
        },
    ];
    const columnAbsentUser = [
        {
            title: 'ФИО',
            dataIndex: 'fullName',
            key: 'fullName',
            render: (_: string, record: components['schemas']['WhiteListOut']) => (
                <>
                    <Avatar src={record.imgPath} /> <>{record.employeeFullName}</>
                </>
            ),
        },
        {
            title: 'Период отсутсвия',
            dataIndex: 'dateRange',
            key: 'dateRange',
            render: (_: string, record: components['schemas']['WhiteListOut']) => (
                <>
                    {moment(record.startDate).format('DD/MM/YYYY')}-{moment(record.endDate).format('DD/MM/YYYY')}
                </>
            ),
        },
        {
            title: 'Причина отсуствия',
            dataIndex: 'reason',
            key: 'reason',
        },
        {
            title: 'Действия',
            dataIndex: 'detail',
            key: 'detail',
            render: (_: string, record: components['schemas']['WhiteListOut']) => (
                <>
                    <Button type={'link'} danger onClick={() => handleDelWhiteList(record)} disabled={localStorage.getItem('ROLE') !== 'superadmin'}>
                        Удалить запись
                    </Button>
                </>
            ),
        },
    ];

    const handleDelWhiteList = (record: components['schemas']['WhiteListOut']) => {
        if (oldWhiteList.find((old) => old.id === record.id)) {
            const updateDelWhiteList = [...deleteWhitelist, record.id];
            setdeleteWhitelist(updateDelWhiteList);
        }
        setAbsentUser(absentUser?.filter((item) => item.id !== record.id));
    };

    const addPeopleAbsent = () => {
        const users = employee?.items.find((item) => item.id === userAbsent);
        const randomNumber = Math.floor(Math.random());
        if (users) {
            const data = {
                id: randomNumber.toString(),
                employeeFullName: users.fullName || '',
                imgPath: users.imgPath || '',
                employeeId: users?.id || '',
                startDate: dateStart || '',
                endDate: dateEnd || '',
                reason: status,
                createdAt: '2023-10-11T00:00:00',
                updatedAt: '2023-10-11T00:00:00',
            };
            if (data) {
                const updatedArray = [...absentUser, data];
                setAbsentUser(updatedArray);
            }
        }
    };

    return (
        <Modal
            title='Редактирование суточного приказа'
            open={isOpen}
            okText={step === 3 ? 'Сохранить' : <IntlMessage id={'continue'} />}
            cancelText={<IntlMessage id={'cancel'} />}
            onCancel={handleCancel}
            onOk={handleOk}
            width={'50%'}
        >
            <Form form={form} layout={'vertical'}>
                {step === 1 ? (
                    <>
                        <Text>
                            Пожалуйста, по надобности, измените имена сотрудников, которые заступят на дежурство
                        </Text>
                        <br />
                        <br />
                        <Form.Item label={'Дежурный по части'} name={'duty'} required>
                            <Select
                                options={employee?.items.map((item) => ({
                                    value: item.id,
                                    label: item.fullName,
                                }))}
                                onChange={(e) => {
                                    setDuty(e);
                                }}
                            />
                        </Form.Item>
                        <Form.Item label={'Помощник дежурного по части'} name={'dutyHelper'} required>
                            <Select
                                options={employee?.items.map((item) => ({
                                    value: item.id,
                                    label: item.fullName,
                                }))}
                                onChange={(e) => setDutyHelper(e)}
                            />
                        </Form.Item>
                    </>
                ) : step === 2 ? (
                    <>
                        <Title level={5}>Заполните форму сотрудников заступающих в КПП</Title>
                        <Row gutter={16}>
                            <Col xs={18}>
                                <Select
                                    options={employee?.items.map((item) => ({
                                        value: item.id,
                                        label: item.fullName,
                                    }))}
                                    onChange={(e) => setUserPresent(e)}
                                    style={{ width: '100%' }}
                                />
                            </Col>
                            <Col xs={6}>
                                <Button
                                    type={'primary'}
                                    disabled={userIntercedingData.length === 5 || localStorage.getItem('ROLE') !== 'superadmin'}
                                    onClick={() => addPeopleInterceding()}
                                >
                                    Добавить
                                </Button>
                            </Col>
                        </Row>
                        <Table columns={column} dataSource={userIntercedingData} loading={loading} />
                    </>
                ) : (
                    step === 3 && (
                        <>
                            <Form.Item label={'Заполните форму отсутствующих'}>
                                <Row gutter={16}>
                                    <Col xs={6}>
                                        <Select
                                            options={employee?.items.map((item) => ({
                                                value: item.id,
                                                label: item.fullName,
                                            }))}
                                            onChange={(e) => setUserAbsent(e)}
                                        />
                                    </Col>
                                    <Col xs={6}>
                                        <Select
                                            options={
                                                statuses &&
                                                statuses.map((item) => ({
                                                    value: item,
                                                    label: item,
                                                }))
                                            }
                                            onChange={(e) => setStatus(e)}
                                        />
                                    </Col>
                                    <Col xs={6}>
                                        <DatePicker.RangePicker
                                            onChange={(dates) => {
                                                const startDate = dates?.[0];
                                                const endDate = dates?.[1];
                                                if (startDate && endDate) {
                                                    setDateStart(startDate.format());
                                                    setDateEnd(endDate.format());
                                                }
                                            }}
                                        />
                                    </Col>
                                    <Col xs={6}>
                                        <Button type={'primary'} onClick={() => addPeopleAbsent()} disabled={localStorage.getItem('ROLE') !== 'superadmin'}>
                                            Добавить
                                        </Button>
                                    </Col>
                                </Row>
                            </Form.Item>
                            <Table columns={columnAbsentUser} dataSource={absentUser} loading={loading} />
                        </>
                    )
                )}
            </Form>
        </Modal>
    );
};
