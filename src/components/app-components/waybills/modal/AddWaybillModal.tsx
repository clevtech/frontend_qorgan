import { useEffect, useState } from 'react';

import { DatePicker, Form, Input, Modal, Select, Typography } from 'antd';
import { useForm } from 'antd/es/form/Form';

import { Props } from '@/types/custom.ts';

import { IntlMessage } from '@/components/util-components/IntlMessage';
import { WaybillsService } from '@/services/WaybillsService.ts';
import { TransportService } from '@/services/TransportService.ts';
import { components } from '@/types/generated.ts';
import { EmployeeService } from '@/services/EmployeeService.ts';
import { AuthService } from '@/services/AuthService.ts';
// import { getWaybills } from '@/store/slices/documentationSlice.ts';
import { useAppDispatch } from '@/components/app-components/waybills/modal/EditWaybillModal.tsx';

const { Text } = Typography;

const AddWaybillModal = ({ isOpen, onClose }: Props) => {
    const [form] = useForm();
    const [step, setStep] = useState<number>(1);
    const [transport, setTransport] = useState<components['schemas']['TransportDetailsout']>();
    const [driver, setDriver] = useState<components['schemas']['EmployeeDetailsOut']>();
    const [numberWaybill, setNumberWaybill] = useState<string>();
    const [profile, setProfile] = useState<components['schemas']['EmployeeUserMe']>();

    const dispatch = useAppDispatch();

    useEffect(() => {
        AuthService.getMe().then((response) => {
            if (response.data) {
                setProfile(response.data);
            }
        });
    }, [isOpen]);

    const handleOk = () => {
        if (step === 1) {
            setStep(step + 1);
        } else if (step === 2) {
            const value = form.getFieldsValue();

            WaybillsService.createWaybills({
                numberWaybill: numberWaybill,
                transportId: value.govNumber,
                dateOfDeparture: value.period[0]._d,
                dateOfArrival: value.period[1]._d,
                driverId: value.driver,
                comment: value.comments,
                signerId: profile?.employee?.id,
            })
                .then(() => {
                    dispatch(
                        getWaybills({
                            query: {
                                skip: 0,
                                limit: 10,
                            },
                        }),
                    );
                    onClose();
                    form.resetFields();
                    setStep(1);
                })
                .finally(() => {
                    // setLoading(false);
                });
        }
    };

    const handleCancel = () => {
        setStep(1);
        form.resetFields();
        onClose();
    };

    useEffect(() => {
        TransportService.getTransport({
            query: {
                skip: 0,
                limit: 100,
            },
        }).then((response) => {
            if (response.data) {
                setTransport(response.data);
            }
        });
        EmployeeService.getEmployees({
            query: {
                skip: 0,
                limit: 100,
                role: 'employee',
            },
        }).then((response) => {
            if (response.data) {
                setDriver(response.data);
            }
        });
    }, [isOpen]);

    return (
        <Modal
            title={<IntlMessage id={'waybill.modal.title'} />}
            open={isOpen}
            okText={step === 1 ? <IntlMessage id={'continue'} /> : <IntlMessage id={'save'} />}
            cancelText={<IntlMessage id={'cancel'} />}
            onCancel={handleCancel}
            onOk={handleOk}
        >
            <>
                {step === 1 && (
                    <>
                        <Text>
                            <IntlMessage id={'waybill.modal.text'} />
                        </Text>
                        <div className={'mt-3'}>
                            <Form form={form} layout={'vertical'}>
                                <Form.Item
                                    label={<IntlMessage id={'waybill.table.numberWayBills'} />}
                                    name={'numberWayBills'}
                                    required
                                    rules={[
                                        {
                                            required: true,
                                            message: <IntlMessage id={'form.required'} />,
                                        },
                                    ]}
                                >
                                    <Input onChange={(e) => setNumberWaybill(e.target.value)} />
                                </Form.Item>
                            </Form>
                        </div>
                    </>
                )}
                {step === 2 && (
                    <>
                        <Text>
                            <IntlMessage id={'waybill.modal.stepTwo.title'} />
                        </Text>

                        <div className={'mt-3'}>
                            <Form form={form} layout={'vertical'}>
                                <Form.Item
                                    label={<IntlMessage id={'settings.transport.govNumber'} />}
                                    name={'govNumber'}
                                    required
                                    rules={[
                                        {
                                            required: true,
                                            message: <IntlMessage id={'form.required'} />,
                                        },
                                    ]}
                                >
                                    <Select
                                        options={transport?.items.map((item) => ({
                                            value: item.id,
                                            label: item.govNumber,
                                        }))}
                                    />
                                </Form.Item>

                                <Form.Item
                                    label={<IntlMessage id={'waybill.modal.stepTwo.period'} />}
                                    name={'period'}
                                    required
                                    rules={[
                                        {
                                            required: true,
                                            message: <IntlMessage id={'form.required'} />,
                                        },
                                    ]}
                                >
                                    <DatePicker.RangePicker
                                        style={{ width: '100%' }}
                                        showTime={{ format: 'HH:mm' }}
                                    />
                                </Form.Item>

                                <Form.Item
                                    label={<IntlMessage id={'waybill.modal.stepTwo.driver'} />}
                                    name={'driver'}
                                    required
                                    rules={[
                                        {
                                            required: true,
                                            message: <IntlMessage id={'form.required'} />,
                                        },
                                    ]}
                                >
                                    <Select
                                        options={driver?.items.map((item) => ({
                                            value: item.id,
                                            label: item.fullName,
                                        }))}
                                    />
                                </Form.Item>

                                <Form.Item
                                    label={
                                        <>
                                            <IntlMessage id={'waybill.modal.stepTwo.comments'} />
                                            &nbsp;
                                            <div className={'text-muted'}>
                                                (<IntlMessage id={'waybill.modal.stepTwo.commentsTextMute'} />)
                                            </div>
                                        </>
                                    }
                                    name={'comments'}
                                    required
                                    rules={[
                                        {
                                            required: true,
                                            message: <IntlMessage id={'form.required'} />,
                                        },
                                    ]}
                                >
                                    <Input />
                                </Form.Item>
                            </Form>
                        </div>
                    </>
                )}
            </>
        </Modal>
    );
};

export default AddWaybillModal;
