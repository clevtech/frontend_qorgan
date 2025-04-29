import moment from 'moment';

import { Button, Form, Modal, Spin, Typography } from 'antd';
import { useCallback, useEffect, useState } from 'react';

import { MODAL_WIDTH } from '@/constants/LayoutConstant';
import { EmployeeService } from '@/services/EmployeeService';
import { DailyOrderCreate, EmployeeRead, EmployeesRead, WhiteListCreate } from '@/types/custom';

import { FirstStep } from './FirstStep';
import { SecondStep } from './SecondStep';
import { ThirdStep } from './ThirdStep';
import FourthStep from './FourthStep';
import { DailyOrdersService } from '@/services/DailyOrdersService';
import { WhitelistService } from '@/services/WhiteListService';

type Props = {
    isOpen: boolean;
    onClose: () => void;
};

type employeeName = {
    fullName: string;
    imgPath: string | null;
};

const NUMBER_OF_STEPS = 4;

export const CreateDailyOrderModal = ({ isOpen, onClose }: Props) => {
    const [dailyOrder, setDailyOrder] = useState<DailyOrderCreate>({
        checkpointDuties: [],
        dateOfSign: moment(new Date()).format(),
        dutyId: '',
        dutyHelperId: '',
        onDate: moment(new Date()).add(1, 'd').format(),
        orderNumber: '',
    });

    const [dataSource, setDataSource] = useState<EmployeesRead>({ employees: [], totalCount: 0 });
    const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
    const [saveLoading, setSaveLoading] = useState<boolean>(false);

    const [employeesOrder, setEmployeesOrder] = useState<EmployeeRead[]>([]);
    const [absentEmployeeList, setAbsentEmployeeList] = useState<(WhiteListCreate & employeeName)[]>([]);

    // states for creation steps
    const [step, setStep] = useState<number>(1);

    const cancelButtonHandler = () => {
        if (step > 1 && step <= 4) {
            setStep((prev) => prev - 1);
        } else {
            onClose();
        }
    };

    const okButtonHandler = () => {
        if (step > 0 && step < 4) setStep((prev) => prev + 1);

        if (step === 4) {
            setSaveLoading(true);

            const createDailyOrder = DailyOrdersService.createDailyOrders(dailyOrder);
            const createWhitelist = absentEmployeeList.map((absentEmployee) => {
                WhitelistService.createWhitelist(absentEmployee);
            });

            Promise.all([createDailyOrder, createWhitelist]).finally(() => {
                setSaveLoading(false);
                onClose();
            });
            setStep(1);
        }
    };

    const fetchEmployees = useCallback(async () => {
        await EmployeeService.getEmployees({
            query: {
                skip: 0,
                limit: 10,
                role: 'employee',
            },
        })
            .then((response) => {
                const { data }: { data: EmployeesRead } = response;

                setDataSource(data);
            })
    }, []);

    useEffect(() => {
        fetchEmployees();
    }, [fetchEmployees]);

    const buttonIsDisabled = () => {
        if (step === 1 && dailyOrder.orderNumber === '') return true;
        else if (step === 2 && (dailyOrder.dutyId === '' || dailyOrder.dutyHelperId === '')) return true;
        else if (step === 3 && dailyOrder.checkpointDuties?.length === 0) return true;
        else if (step === 4 && absentEmployeeList.length === 0) return true;
        else return false;
    };

    return (
        <Modal
            footer={null}
            onCancel={onClose}
            open={isOpen}
            title={
                <Typography.Text className='font-size-base font-weight-semibold'>{`Заполнение суточного приказа. Шаг ${step} из ${NUMBER_OF_STEPS}.`}</Typography.Text>
            }
            width={MODAL_WIDTH}
        >
            <Form
                autoComplete='off'
                initialValues={{
                    orderNumber: '№ ҚР ДСМ-',
                }}
                layout='vertical'
            >
                {step === 1 && <FirstStep setDailyOrder={setDailyOrder} />}

                {step === 2 && (
                    <SecondStep
                        allEmployees={dataSource.employees}
                        dailyOrder={dailyOrder}
                        selectedEmployees={selectedEmployees}
                        setDailyOrder={setDailyOrder}
                        setSelectedEmployees={setSelectedEmployees}
                    />
                )}

                {step === 3 && (
                    <ThirdStep
                        setEmployeesOrder={setEmployeesOrder}
                        employeesOrder={employeesOrder}
                        selectedEmployees={selectedEmployees}
                        setDailyOrder={setDailyOrder}
                        setSelectedEmployees={setSelectedEmployees}
                        allEmployees={dataSource.employees}
                    />
                )}

                {step === 4 && (
                    <FourthStep
                        allEmployees={dataSource.employees}
                        absentEmployeeList={absentEmployeeList}
                        setAbsentEmployeeList={setAbsentEmployeeList}
                    />
                )}
            </Form>
            <div
                className='d-flex justify-content-end'
                style={{
                    padding: '10px 16px',
                    margin: '24px -24px -24px -24px',

                    borderTop: '1px solid #e6ebf1',
                }}
            >
                <Button onClick={cancelButtonHandler}>{step === 1 ? 'Отменить' : 'Назад'}</Button>
                <Button
                    onClick={okButtonHandler}
                    style={{ marginLeft: '8px' }}
                    type='primary'
                    htmlType={step === 4 ? 'submit' : 'button'}
                    disabled={(buttonIsDisabled() || saveLoading) || localStorage.getItem('ROLE') !== 'superadmin'}
                >
                    {saveLoading ? <Spin /> : step === 4 ? 'Cохранить' : 'Продолжить'}
                </Button>
            </div>
        </Modal>
    );
};
