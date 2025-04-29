import moment from 'moment';

import { DatePicker, Form, Input, Modal, Typography } from 'antd';

import { WaybillRead } from '@/types/custom';

type Props = {
    isOpen: boolean;
    waybill: WaybillRead;
    onClose: () => void;
};

export const ReadWaybillModal = (props: Props) => {
    const { isOpen, waybill, onClose } = props;

    return (
        <Modal
            footer={null}
            onCancel={onClose}
            open={isOpen}
            title={<Typography.Text className='font-size-base'>Просмотреть путевой лист</Typography.Text>}
        >
            <Form layout='vertical'>
                <Form.Item label='Номер путевого листа'>
                    <Input value={waybill.numberWaybill} />
                </Form.Item>

                <Form.Item label='Гос. номер'>
                    <Input value={waybill.transportGovNumber} />
                </Form.Item>

                <Form.Item className={waybill.comment ? '' : 'mb-0'} label='Период разрешения'>
                    <DatePicker.RangePicker
                        value={[moment(waybill.dateOfDeparture), moment(waybill.dateOfArrival)]}
                        style={{ width: '100%' }}
                    />
                </Form.Item>

                {waybill.comment && (
                    <Form.Item label='Комментарий'>
                        <Input value={waybill.comment} />
                    </Form.Item>
                )}
            </Form>
        </Modal>
    );
};
