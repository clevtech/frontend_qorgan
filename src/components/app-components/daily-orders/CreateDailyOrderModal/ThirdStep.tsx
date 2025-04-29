import { Button, Form, Row, Select, Table, Tooltip, Typography } from 'antd';
import { Dispatch, SetStateAction, useState } from 'react';
import { IconProgressHelp } from '@tabler/icons-react';
import { CustomActionButton } from '@/components/custom-components/CustomActionButton';
import { ICON_SIZE, ICON_STROKE } from '@/constants/IconConstant';
import { DailyOrderCreate, EmployeeRead } from '@/types/custom';
import type { TableColumnsType } from 'antd';

type Props = {
    selectedEmployees: string[];
    setDailyOrder: Dispatch<SetStateAction<DailyOrderCreate>>;
    setSelectedEmployees: Dispatch<SetStateAction<string[]>>;
    allEmployees: EmployeeRead[];
    setEmployeesOrder: Dispatch<SetStateAction<EmployeeRead[]>>;
    employeesOrder: EmployeeRead[];
};

export const ThirdStep = ({
    selectedEmployees,
    setSelectedEmployees,
    allEmployees,
    setDailyOrder,
    setEmployeesOrder,
    employeesOrder,
}: Props) => {
    const [currentEmployee, setCurrentEmployee] = useState<string>('');

    const columns = [
        {
            title: 'ФИО',
            dataIndex: 'fullName',
            key: 'fullName',
            render: (_: string, record: EmployeeRead) => <Typography.Text>{record.fullName}</Typography.Text>,
        },
        {
            title: 'Действие',
            key: 'detail',
            render: (_: string, record: EmployeeRead) => (
                <>
                    <CustomActionButton
                        danger
                        disabled={localStorage.getItem('ROLE') !== 'superadmin'}
                        onClick={() => {
                            setSelectedEmployees((prev) => prev.filter((employee) => employee !== record.id));

                            setEmployeesOrder((prev) => prev.filter((employee) => employee.id !== record.id));

                            setDailyOrder((prev) => ({
                                ...prev,
                                checkpointDuties: prev.checkpointDuties?.filter((employee) => employee !== record.id),
                            }));
                        }}
                    >
                        Удалить
                    </CustomActionButton>
                </>
            ),
        },
    ] as TableColumnsType<EmployeeRead>;

    const handleAddEmployee = () => {
        if (currentEmployee) {
            setSelectedEmployees((prev) => Array.from(new Set([...prev, currentEmployee])));

            const employee = allEmployees.find((employee) => employee.id === currentEmployee);

            setDailyOrder((prev) => ({
                ...prev,
                checkpointDuties: prev.checkpointDuties
                    ? [...prev.checkpointDuties, currentEmployee]
                    : [currentEmployee],
            }));

            setEmployeesOrder((prev) => [...prev, employee] as EmployeeRead[]);
            setCurrentEmployee('');
        }
    };

    return (
        <div
            className='d-flex flex-column'
            style={{
                gap: '1.5rem',
            }}
        >
            <div className='d-flex align-items-center' style={{ gap: '0.25rem' }}>
                <Typography.Text>Заполните форму сотрудников заступающих в КПП.</Typography.Text>

                <Tooltip title='Можно добавить максимум 5 сотрудников'>
                    <IconProgressHelp
                        color='#72849a'
                        size={ICON_SIZE}
                        stroke={ICON_STROKE}
                        style={{ marginBottom: '2px', cursor: 'pointer' }}
                    />
                </Tooltip>
            </div>

            <Form.Item className='mb-0' required>
                <Row wrap={false} style={{ columnGap: '10px' }}>
                    <Tooltip title={employeesOrder.length === 5 && 'Можно добавить максимум 5 сотрудников'}>
                        <Select
                            disabled={employeesOrder.length === 5}
                            onChange={(value) => {
                                if (currentEmployee) {
                                    setSelectedEmployees((prev) => prev.filter((val) => val !== currentEmployee));
                                }
                                setSelectedEmployees((prev) => Array.from(new Set([...prev, value])));
                                setCurrentEmployee(value);
                            }}
                            value={currentEmployee}
                        >
                            {allEmployees.map((option) => (
                                <Select.Option
                                    key={option.id}
                                    value={option.id}
                                    disabled={selectedEmployees.includes(option.id)}
                                >
                                    {option.fullName}
                                </Select.Option>
                            ))}
                        </Select>
                    </Tooltip>
                    <Tooltip title={employeesOrder.length === 5 && 'Можно добавить максимум 5 сотрудников'}>
                        <Button
                            type='primary'
                            // disabled={!currentEmployee || employeesOrder.length === 5}
                            disabled={localStorage.getItem('ROLE') !== 'superadmin'}
                            onClick={handleAddEmployee}
                        >
                            Добавить
                        </Button>
                    </Tooltip>
                </Row>
            </Form.Item>

            <Table columns={columns} dataSource={employeesOrder} pagination={false} />
        </div>
    );
};
