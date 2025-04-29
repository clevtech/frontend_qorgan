import { CustomActionButton } from '@/components/custom-components/CustomActionButton';
import { EmployeeRead, WhiteListCreate } from '@/types/custom';
import { components } from '@/types/generated';
import { Button, Col, DatePicker, Row, Select, Table, TableColumnsType, Typography } from 'antd';
import moment from 'moment';
import { FC, useState, Dispatch, SetStateAction } from 'react';

type TFourthStep = {
    allEmployees: EmployeeRead[];
    absentEmployeeList: (WhiteListCreate & employeeName)[];
    setAbsentEmployeeList: Dispatch<SetStateAction<(WhiteListCreate & employeeName)[]>>;
};

type employeeName = {
    fullName: string;
    imgPath: string | null;
};

const reasonList: components['schemas']['ReasonType'][] = ['В отпуске', 'На больничном', 'По рапорту'];

const whiteListInitialState: WhiteListCreate & employeeName = {
    employeeId: '',
    startDate: '',
    endDate: '',
    reason: undefined,
    fullName: '',
    imgPath: null,
};

const FourthStep: FC<TFourthStep> = ({ allEmployees, absentEmployeeList, setAbsentEmployeeList }) => {
    const [currentEmployee, setCurrentEmployee] = useState<WhiteListCreate & employeeName>(whiteListInitialState);

    const btnDisabled =
        !currentEmployee.employeeId ||
        !currentEmployee.startDate ||
        !currentEmployee.endDate ||
        !currentEmployee.reason;

    const handleAddAbsentEmployee = () => {
        if (currentEmployee && currentEmployee.employeeId) {
            setAbsentEmployeeList((prev) => [...prev, currentEmployee]);
            setCurrentEmployee(whiteListInitialState);
        }
    };

    const columns = [
        {
            title: 'ФИО',
            dataIndex: 'fullName',
            key: 'fullName',
            render: (_: string, record: WhiteListCreate & employeeName) => (
                <Typography.Text>{record.fullName}</Typography.Text>
            ),
        },
        {
            title: 'Период отсутствия',
            dataIndex: 'absentDuration',
            key: 'absentDuration',
            render: (_: string, record: WhiteListCreate & employeeName) => (
                <Typography.Text>
                    {moment(record.startDate).format('DD.MM.YYYY')} - {moment(record.endDate).format('DD.MM.YYYY')}
                </Typography.Text>
            ),
        },
        {
            title: 'Причина отсутствия',
            dataIndex: 'reason',
            key: 'reason',
            render: (_: string, record: WhiteListCreate & employeeName) => (
                <Typography.Text>{record.reason}</Typography.Text>
            ),
        },
        {
            title: 'Действие',
            key: 'detail',
            render: (_: string, record: WhiteListCreate & employeeName) => (
                <>
                    <CustomActionButton
                        danger
                        disabled={localStorage.getItem('ROLE') !== 'superadmin'}
                        onClick={() =>
                            setAbsentEmployeeList(
                                absentEmployeeList.filter((item) => item.employeeId !== record.employeeId),
                            )
                        }
                    >
                        Удалить запись
                    </CustomActionButton>
                </>
            ),
        },
    ] as TableColumnsType<WhiteListCreate & employeeName>;

    return (
        <Col>
            <Col>
                <Typography.Text className='font-size-base font-weight-semibold'>
                    Заполните форму отсутствующих
                </Typography.Text>
            </Col>
            <Row style={{ gap: 10 }} wrap={false}>
                <Row style={{ gap: 10 }} wrap={false}>
                    <Select
                        style={{ width: '115px' }}
                        aria-required
                        value={currentEmployee.fullName}
                        onChange={(value) => {
                            const employee = allEmployees.find((e) => e.id === value);
                            if (employee) {
                                setCurrentEmployee({
                                    ...currentEmployee,
                                    employeeId: employee.id,
                                    fullName: employee.fullName,
                                    imgPath: employee.imgPath,
                                });
                            }
                        }}
                    >
                        {allEmployees.map((option) => (
                            <Select.Option
                                key={option.id}
                                disabled={
                                    currentEmployee.employeeId === option.id ||
                                    absentEmployeeList.some((item) => item.employeeId === option.id)
                                }
                            >
                                {option.fullName}
                            </Select.Option>
                        ))}
                    </Select>

                    <Select
                        aria-required
                        value={currentEmployee.reason}
                        style={{ width: '115px' }}
                        onChange={(value) => {
                            setCurrentEmployee({ ...currentEmployee, reason: value });
                        }}
                    >
                        {reasonList.map((option) => (
                            <Select.Option key={option} disabled={currentEmployee.reason === option}>
                                {option}
                            </Select.Option>
                        ))}
                    </Select>
                </Row>
                <Row style={{ gap: 10, width: 'calc(100% - 240px)' }}>
                    <DatePicker.RangePicker
                        value={
                            currentEmployee.startDate && currentEmployee.endDate
                                ? [moment(currentEmployee.startDate), moment(currentEmployee.endDate)]
                                : undefined
                        }
                        aria-required
                        style={{ flexGrow: 1 }}
                        onChange={(dates) => {
                            const startDate = dates?.[0];
                            const endDate = dates?.[1];
                            if (startDate && endDate) {
                                setCurrentEmployee({
                                    ...currentEmployee,
                                    startDate: startDate.format(),
                                    endDate: endDate.format(),
                                });
                            }
                        }}
                    />
                    <Button type='primary' onClick={handleAddAbsentEmployee} disabled={btnDisabled || localStorage.getItem('ROLE') !== 'superadmin'}>
                        Добавить
                    </Button>
                </Row>
            </Row>
            <Table
                columns={columns}
                dataSource={absentEmployeeList}
                pagination={absentEmployeeList.length < 10 ? false : undefined}
            />
        </Col>
    );
};

export default FourthStep;
