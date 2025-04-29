import {useEffect, useState} from 'react';

import 'moment/locale/ru';
import moment from 'moment/moment';

import {Button, Col, DatePicker, Form, Input, Modal, Row, Select, Typography} from 'antd';

import {useForm} from 'antd/es/form/Form';

import {Props} from '@/types/custom.ts';
import {components} from '@/types/generated.ts';

import {IntlMessage} from '@/components/util-components/IntlMessage';
import {WaybillsService} from '@/services/WaybillsService.ts';
import {TransportService} from '@/services/TransportService.ts';
import {EmployeeService} from '@/services/EmployeeService.ts';
import {AuthService} from "@/services/AuthService.ts";
// import {getWaybills} from "@/store/slices/documentationSlice.ts";
import {useDispatch} from "react-redux";
import {AppDispatch} from "@/store";

const {Text} = Typography;
export const useAppDispatch = () => useDispatch<AppDispatch>();


const EditWaybillModal = ({isOpen, onClose, isEdit, record}: Props) => {
    const [form] = useForm();
    const [transport, setTransport] = useState<components['schemas']['TransportDetailsout']>();
    const [driver, setDriver] = useState<components['schemas']['EmployeeDetailsOut']>();

    const [profile,setProfile] = useState<components['schemas']['EmployeeUserMe']>();
    const dispatch = useAppDispatch();

    useEffect(()=>{
        AuthService.getMe().then((response)=>{
            if(response.data){
                setProfile(response.data)
            }
        })
    },[isOpen]);

    const handleOk = () => {
        const value = form.getFieldsValue();
        if (record) {
            // setLoading(true);

            const transport = Object.hasOwnProperty.call(value.govNumber, 'value') ?
                {transportId: value.govNumber.value} :
                {transportId: value.govNumber};

            const driver = Object.hasOwnProperty.call(value.driver, 'value') ?
                {driverId: value.driver.value} :
                {driverId: value.driver};
            const waybill_id = record.id as string;

            WaybillsService.updateWaybills({
                path: {
                    waybill_id
                }
            }, {
                numberWaybill: value.numberWayBills,
                dateOfDeparture: value.period[0]._d,
                dateOfArrival: value.period[1]._d,
                comment: value.comments,
                signerId: profile?.employee?.id,
                ...transport,
                ...driver
            }).then(() => {
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
            }).finally(() => {
                // setLoading(false);
            });
        }
    }

    const handleCancel = () => {
        onClose();
        form.resetFields();
        form.resetFields();
    }

    useEffect(() => {
        if (record && driver && transport) {
            const data = {
                numberWayBills: record.numberWaybill,
                govNumber: {
                    value: record.transportId,
                    label: record.transportName
                },
                period: [moment(record.dateOfDeparture), moment(record.dateOfArrival)],
                driver: {
                    value: record.driverId,
                    label: driver.items.find((item) => item.id === record.driverId)?.fullName,
                },
                comments: record.comment
            };
            form.setFieldsValue(data)
        }
    }, [isOpen])

    useEffect(() => {
        TransportService.getTransport({
            query: {
                skip: 0,
                limit: 100
            }
        }).then((response) => {
            if (response.data) {
                setTransport(response.data);
            }
        })
        EmployeeService.getEmployees({
            query: {
                skip: 0,
                limit: 100
            }
        }).then((response) => {
            if (response.data) {
                setDriver(response.data);
            }
        })
    }, [isOpen])

    return (
        <Modal
            title={<IntlMessage id={'waybill.modal.title'}/>}
            open={isOpen}
            okText={<IntlMessage id={'save'}/>}
            cancelText={<IntlMessage id={'cancel'}/>}
            onCancel={handleCancel}
            onOk={handleOk}
            footer={null}
        >

            <Text><IntlMessage id={'waybill.modal.stepTwo.title'}/></Text>

            <div className={'mt-3'}>
                <Form form={form} layout={'vertical'}>
                    <Form.Item label={<IntlMessage id={'waybill.table.numberWayBills'}/>}
                               name={'numberWayBills'}
                               required
                               rules={[
                                   {
                                       required: true,
                                       message: <IntlMessage id={'form.required'}/>,
                                   }
                               ]}>
                        <Input disabled={isEdit === 'watch'}/>
                    </Form.Item>

                    <Form.Item label={<IntlMessage id={'settings.transport.govNumber'}/>}
                               name={'govNumber'}
                               required
                               rules={[
                                   {
                                       required: true,
                                       message: <IntlMessage id={'form.required'}/>,
                                   }
                               ]}>
                        <Select
                            disabled={isEdit === 'watch'}
                            options={transport?.items.map((item) => ({
                                value: item.id,
                                label: item.govNumber
                            }))}/>
                    </Form.Item>

                    <Form.Item label={<IntlMessage id={'waybill.modal.stepTwo.period'}/>}
                               name={'period'}
                               required
                               rules={[
                                   {
                                       required: true,
                                       message: <IntlMessage id={'form.required'}/>,
                                   }
                               ]}>
                        <DatePicker.RangePicker
                            style={{width: '100%'}}
                            showTime={{format: 'HH:mm:ss'}}
                            disabled={isEdit === 'watch'}
                            name={'period'}
                        />
                    </Form.Item>

                    <Form.Item label={<IntlMessage id={'waybill.modal.stepTwo.driver'}/>}
                               name={'driver'}
                               required
                               rules={[
                                   {
                                       required: true,
                                       message: <IntlMessage id={'form.required'}/>,
                                   }
                               ]}>
                        <Select
                            disabled={isEdit === 'watch'}
                            options={driver?.items.map((item) => ({
                                value: item.id,
                                label: item.fullName
                            }))}
                        />
                    </Form.Item>

                    <Form.Item label={<>
                        <IntlMessage id={'waybill.modal.stepTwo.comments'}/>
                        &nbsp;
                        <div className={'text-muted'}>(<IntlMessage id={'waybill.modal.stepTwo.commentsTextMute'}/>)
                        </div>
                    </>}
                               name={'comments'}
                               required
                               rules={[
                                   {
                                       required: true,
                                       message: <IntlMessage id={'form.required'}/>,
                                   }
                               ]}>
                        <Input disabled={isEdit === 'watch'}/>
                    </Form.Item>
                </Form>
            </div>
            <Row style={{display: 'flex', justifyContent: 'flex-end', marginTop: '10px'}} gutter={16}>
                {
                    isEdit === 'watch'
                        ?
                        <Col>
                            <Button type={'primary'} onClick={onClose}>
                                Ок
                            </Button>
                        </Col>
                        :
                        <>
                            <Col>
                                <Button danger onClick={() => handleCancel()}>
                                    Отменить
                                </Button>
                            </Col>
                            <Col>
                                <Button type={'primary'} onClick={() => handleOk()} disabled={localStorage.getItem('ROLE') !== 'superadmin'}>
                                    Сохранить
                                </Button>
                            </Col>
                        </>
                }
            </Row>
        </Modal>
    );
};

export default EditWaybillModal;
