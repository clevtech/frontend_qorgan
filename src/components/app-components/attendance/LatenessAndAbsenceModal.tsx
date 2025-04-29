import moment from 'moment';

import { Col, Modal, Row, Spin, Tag, Typography } from 'antd';
import { useEffect, useState } from 'react';

import { CustomTable } from '@/components/custom-components/CustomTable';
import { AttendanceService } from '@/services/AttendanceService';
import { AttendanceRead, AttendancesEmployeeRead, SummaryDetailRead, personStatusToColorMap } from '@/types/custom';

import utils from '@/utils';

import type { TableColumnsType } from 'antd';

type Props = {
    isModalOpen: boolean;
    record: AttendanceRead;
    closeModal: () => void;
};

export const LatenessAndAbsenceModal = (props: Props) => {
    const { isModalOpen, record, closeModal } = props;

    const [current, setCurrent] = useState<number>(1);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [pageSize, setPageSize] = useState<number>(10);

    const [attendanceData, setAttendanceData] = useState<AttendancesEmployeeRead>();

    useEffect(() => {
        if (record) {
            setIsLoading(true);

            AttendanceService.getAttendanceByEmployeesId({
                path: {
                    employeeId: record.id,
                },
            })
                .then((response) => {
                    const { data } = response;

                    setAttendanceData(data);
                })
                .finally(() => setIsLoading(false));
        }
    }, [record]);

    const columns = [
        {
            dataIndex: 'date',
            sortDirections: ['ascend', 'descend'],
            title: 'Дата',
            render: (text: string) => <Typography.Text>{moment(text).format('DD/MM/YYYY')}</Typography.Text>,
        },
        {
            dataIndex: 'timeOfArrival',
            sortDirections: ['ascend', 'descend'],
            title: 'Время явки',
            render: (text: string) => <Typography.Text>{moment(text).format('HH:mm')}</Typography.Text>,
            sorter: (a: SummaryDetailRead, b: SummaryDetailRead) => {
                if (a.timeOfArrival && b.timeOfArrival) {
                    return new Date(a.timeOfArrival).getTime() - new Date(b.timeOfArrival).getTime();
                }
            },
        },
        {
            key: 'minutesOfLate',
            sortDirections: ['ascend', 'descend'],
            title: 'Часы отсутствия',
            render: (_: string, record: SummaryDetailRead) => {
                const timeOfArrival = moment(record.timeOfArrival);
                const workingStartTime = moment(
                    moment(`${moment(record.timeOfArrival).format('YYYY-MM-DD')} 09:00`),
                    'YYYY-MM-DDTHH:mm:ss',
                );

                const durationInMinutes = timeOfArrival.diff(workingStartTime, 'minutes');

                return `${durationInMinutes} мин.`;
            },
            // sorter: (a: SummaryDetailRead, b: SummaryDetailRead) => {
            //     if (a. && b.minutesOfLate) {
            //         return a.minutesOfLate - b.minutesOfLate;
            //     }
            // },
        },
        {
            dataIndex: 'status',
            key: 'status',
            sortDirections: ['ascend', 'descend'],
            title: 'Статус',
            render: (text: string) => (
                <Tag
                    style={{
                        color: `${personStatusToColorMap[text]}`,
                        border: `1px solid ${utils.lightenColor(personStatusToColorMap[text], 45)}`,
                        borderRadius: '14px',
                        background: `${utils.lightenColor(personStatusToColorMap[text], 95)}`,
                    }}
                >
                    {text.slice(0, 1) + text.slice(1).toLowerCase()}
                </Tag>
            ),
            sorter: (a: SummaryDetailRead, b: SummaryDetailRead) => {
                if (a.status && b.status) {
                    a.status.localeCompare(b.status);
                }
            },
        },
    ] as TableColumnsType<SummaryDetailRead>;

    if (!record) return null;

    return (
        <Modal
            footer={null}
            onCancel={closeModal}
            open={isModalOpen}
            title={
                <Typography.Text className='font-size-base font-weight-semibold'>{`${record.fullName} – опоздания и отсутствия`}</Typography.Text>
            }
            width={810}
        >
            <Spin spinning={isLoading}>
                <Row className='mb-3' gutter={[12, 12]}>
                    <Col xs={12}>
                        <h5 className='my-0'>Всего опоздании</h5>
                        <p className='my-0'>{attendanceData?.totalCount || 0}</p>
                    </Col>
                    <Col xs={12}>
                        <h5 className='my-0'>Всего пропусков без уважительной причины</h5>
                        <p className='my-0'>{attendanceData?.passCount || 0}</p>
                    </Col>
                    <Col xs={12}>
                        <h5 className='my-0'>Опозданий за месяц</h5>
                        <p className='my-0'>{attendanceData?.monthLateCount || 0}</p>
                    </Col>
                    <Col xs={12}>
                        <h5 className='my-0'>Опоздания - проценты</h5>
                        <p className='my-0'>{attendanceData?.latePercent || 0}</p>
                    </Col>
                </Row>
            </Spin>

            <CustomTable
                columns={columns}
                current={current}
                dataSource={attendanceData?.summaries}
                loading={isLoading}
                pageSize={pageSize}
                setCurrent={setCurrent}
                setPageSize={setPageSize}
                total={attendanceData?.totalCount || 0}
            />
        </Modal>
    );
};
