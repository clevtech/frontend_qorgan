import { Avatar, Card, Col, Row, Spin, Typography } from 'antd';
import { useEffect, useState } from 'react';

import { UserOutlined } from '@ant-design/icons';

import { CustomCard } from '@/components/custom-components/CustomCard';
import { AuthService } from '@/services/AuthService';
import { components } from '@/types/generated';

export const ActiveUsersCard = () => {
    const [dataSource, setDataSource] = useState<components['schemas']['EmployeeUserMe']>();
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        setIsLoading(true);

        AuthService.getMe()
            .then((response) => {
                const { data } = response;

                setDataSource(data);
            })
            .finally(() => setIsLoading(false));
    }, []);

    const users = [
        { user: dataSource?.employee, title: 'Дежурный', key: 'employee' },
        { user: dataSource?.employeeHelper, title: 'Помощник дежурного', key: 'employeeHelper' },
    ];

    return (
        <>
            <div>
                <Typography.Title level={4}>Сотрудники</Typography.Title>

                <CustomCard title='Дежурные на смене'>
                    <Spin spinning={isLoading}>
                        <Row gutter={24}>
                            {users.map(({ user, title, key }) => (
                                <Col xs={24} md={12} key={key}>
                                    <Card
                                        headStyle={{
                                            padding: '0 12px',

                                            borderBottom: '1px solid #E6EBF1',
                                        }}
                                        size='small'
                                        style={{ borderLeft: '2px solid #1890FF' }}
                                    >
                                        <div className='d-flex align-items-center'>
                                            <Avatar
                                                icon={<UserOutlined />}
                                                shape='square'
                                                size={64}
                                                src={user?.imgPath}
                                            />
                                            <div className='d-flex flex-column ml-3'>
                                                <Typography.Text className='font-weight-semibold'>{title}</Typography.Text>
                                                <Typography.Text className='text-muted'>{user?.fullName}</Typography.Text>
                                            </div>
                                        </div>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </Spin>
                </CustomCard>
            </div>
        </>
    );
};
