import { Alert, Button, Form, Input, message } from 'antd';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '@/services/AuthService'


import { LockOutlined, MailOutlined } from '@ant-design/icons';

import { RootState } from '@/store';
import { onHideAuthMessage, onLoading, onShowAuthMessage, signIn } from '@/store/slices/authSlice';
import { SecondStep } from '../app-components/daily-orders/CreateDailyOrderModal/SecondStep'

const mapStateToProps = (state: RootState) => ({
    ...state.auth,
});

const mapDispatchToProps = {
    signIn,
    onHideAuthMessage,
    onShowAuthMessage,
    onLoading,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

type Props = {
    allowRedirect?: boolean;
} & PropsFromRedux;

export const SignInForm = connector((props: Props) => {
    const navigate = useNavigate();

    const {
        allowRedirect = true,
        onHideAuthMessage,
        onLoading,
        access_token,
        loading,
        redirect,
        showMessage,
        message,
        signIn,
    } = props;

    const [secondStep, setSecondStep] = useState(false);
    const [code, setCode] = useState('');
    const [credentials, setCredentials] = useState<{ username: string; password: string } | null>(null);

    const onLogin = async (values: { username: string; password: string }) => {
        onLoading();

        try {
            const response = await AuthService.check2FA({ username: values.username });
            const has2FA = response.data;

            if (has2FA) {
                setCredentials(values);
                setSecondStep(true);
            } else {
                signIn(values);
            }
        } catch (err) {
            message.error('Ошибка при проверке двухэтапной аутентификации');
        }
    };

    useEffect(() => {

        if (access_token !== null && allowRedirect) {
            navigate(redirect);
        }

        if (showMessage) {
            const timer = setTimeout(() => onHideAuthMessage(), 5000);

            return () => {
                clearTimeout(timer);
            };
        }
    });

    return (
        <>
            {showMessage && message && (
                <motion.div
                    initial={{ opacity: 0, marginBottom: 0 }}
                    animate={{
                        opacity: showMessage ? 1 : 0,
                        marginBottom: showMessage ? 20 : 0,
                    }}
                >
                    <Alert message={message} showIcon type='error' />
                </motion.div>
            )}

            {secondStep ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                    <Input
                        placeholder='Введите код из приложения'
                        value={code}
                        onChange={e => setCode(e.target.value)}
                        style={{ width: '77%' }}
                    />
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Button
                            type='primary'
                            onClick={async () => {
                                try {
                                    await AuthService.verify2FA({ username: 'superadmin', code });
                                    // При успешной проверке кода, мы должны логинить пользователя
                                    if (credentials) {
                                        signIn(credentials);
                                    }
                                } catch (err: any) {
                                    message.error(err?.response?.data?.detail || 'Произошла ошибка при проверке кода');
                                }
                            }}
                        >
                            Подтвердить
                        </Button>
                        <Button onClick={() => setSecondStep(false)}>
                            Вернуться назад
                        </Button>
                    </div>
                </div>
            ) : (
                <Form layout='vertical' name='login-form' onFinish={onLogin}>
                    <Form.Item
                        label='Имя пользователя'
                        name='username'
                        rules={[
                            {
                                required: true,
                                message: 'Пожалуйста, введите имя пользователя',
                            },
                        ]}
                    >
                        <Input placeholder='Введите имя пользователя' prefix={<MailOutlined className='text-primary' />} />
                    </Form.Item>
                    <Form.Item
                        label='Пароль'
                        name='password'
                        rules={[
                            {
                                required: true,
                                message: 'Пожалуйста, введите пароль',
                            },
                        ]}
                    >
                        <Input.Password
                            autoComplete='off'
                            placeholder='Введите пароль'
                            prefix={<LockOutlined className='text-primary' />}
                        />
                    </Form.Item>
                    <Form.Item>
                        <Button type='primary' htmlType='submit' block loading={loading}>
                            Войти
                        </Button>
                    </Form.Item>
                </Form>
            )}
        </>
    );
});
