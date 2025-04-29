import { Form, Modal, Select, Spin, Typography } from 'antd';
import { useEffect, useState } from 'react';

import { IntlMessage } from '@/components/util-components/IntlMessage';
import { DailyOrdersService } from '@/services/DailyOrdersService';
import { EmployeeService } from '@/services/EmployeeService';
import { components } from '@/types/generated';

type DailyOrdersList = components['schemas']['DailyOrderDetailsOut'];
type EmployeeList = components['schemas']['EmployeeListOut'];

type ActiveUsersModalProps = {
    isModalOpen: boolean;
    closeModal: () => void;
};

export const ActiveUsersModal = ({ isModalOpen, closeModal }: ActiveUsersModalProps) => {
    const [form] = Form.useForm();

    const [dailyOrders, setDailyOrders] = useState<DailyOrdersList>();
    const [employees, setEmployees] = useState<EmployeeList>();
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        setIsLoading(true);

        const sendRequests = async () => {
            await DailyOrdersService.getDailyOrders({
                query: {
                    skip: 0,
                    limit: 10,
                },
            }).then((response) => {
                const { data }: { data: DailyOrdersList } = response;

                setDailyOrders(data);
            });

            await EmployeeService.getEmployees({
                query: {
                    skip: 0,
                    limit: 100,
                    role: 'employee',
                },
            }).then((response) => {
                if (response.data) {
                    const { data }: { data: EmployeeList } = response;

                    setEmployees(data);

                    setIsLoading(false);
                }
            });
        };

        sendRequests();
    }, []);

    const handleOk = async () => {
        const values = form.getFieldsValue();

        await DailyOrdersService.updateDailyOrders(
            {
                path: { id: values.numberLetters },
            },
            {
                signerId: values.dutyUser,
                signerHelperId: values.assistantDutyUser,
            },
        );

        closeModal();
    };

    return (
        <Modal
            title={<IntlMessage id={'settings.modal.title.activityUser'} />}
            open={isModalOpen}
            okText={<IntlMessage id={'save'} />}
            cancelText={<IntlMessage id={'cancel'} />}
            onCancel={closeModal}
            onOk={handleOk}
            width={572}
        >
            <Spin spinning={isLoading}>
                <Typography.Text>Пожалуйста, измените имена сотрудников, которые заступят на дежурство</Typography.Text>

                <div className={'mt-3'}>
                    <Form form={form} layout={'vertical'}>
                        <Form.Item
                            label='Номер приказа'
                            name={'numberLetters'}
                            rules={[
                                {
                                    required: true,
                                    message: <IntlMessage id={'form.required'} />,
                                },
                            ]}
                            required
                        >
                            <Select
                                options={dailyOrders?.items.map((item) => ({
                                    value: item.id,
                                    label: item.govNumber,
                                }))}
                            />
                        </Form.Item>

                        <Form.Item
                            label={<IntlMessage id={'settings.modal.activityUser.question.dutyUser'} />}
                            name={'dutyUser'}
                            rules={[
                                {
                                    required: true,
                                    message: <IntlMessage id={'form.required'} />,
                                },
                            ]}
                            required
                        >
                            <Select
                                options={employees?.employees.map((item) => ({
                                    value: item.id,
                                    label: item.fullName,
                                }))}
                            />
                        </Form.Item>

                        <Form.Item
                            label={<IntlMessage id={'settings.modal.activityUser.question.assistantDutyUser'} />}
                            name={'assistantDutyUser'}
                            rules={[
                                {
                                    required: true,
                                    message: <IntlMessage id={'form.required'} />,
                                },
                            ]}
                            required
                        >
                            <Select
                                options={employees?.employees.map((item) => ({
                                    value: item.id,
                                    label: item.fullName,
                                }))}
                            />
                        </Form.Item>
                    </Form>
                </div>
            </Spin>
        </Modal>
    );
};
