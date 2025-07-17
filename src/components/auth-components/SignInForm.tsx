import { Alert, Button, Form, Input } from 'antd'
import { motion } from 'framer-motion'
import { useEffect } from 'react'
import { ConnectedProps, connect } from 'react-redux'
import { useNavigate } from 'react-router-dom'

import { LockOutlined, LoginOutlined, MailOutlined } from '@ant-design/icons'

import { RootState } from '@/store'
import {
	onHideAuthMessage,
	onLoading,
	onShowAuthMessage,
	signIn,
} from '@/store/slices/authSlice'

const mapStateToProps = (state: RootState) => ({
	...state.auth,
})

const mapDispatchToProps = {
	signIn,
	onHideAuthMessage,
	onShowAuthMessage,
	onLoading,
}

const connector = connect(mapStateToProps, mapDispatchToProps)

type PropsFromRedux = ConnectedProps<typeof connector>

type Props = {
	allowRedirect?: boolean
} & PropsFromRedux

export const SignInForm = connector((props: Props) => {
	const navigate = useNavigate()

	const {
		allowRedirect,
		onHideAuthMessage,
		onLoading,
		access_token,
		loading,
		redirect,
		showMessage,
		message,
		signIn,
	} = props

	const onLogin = (values: { username: string; password: string }) => {
		onLoading()

		signIn(values)
	}

	useEffect(() => {
		if (access_token !== null && allowRedirect) {
			console.log('test')
			navigate(redirect)
		}

		if (showMessage) {
			const timer = setTimeout(() => onHideAuthMessage(), 5000)

			return () => {
				clearTimeout(timer)
			}
		}
	}, [access_token, allowRedirect, redirect, showMessage, navigate])

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

			<Form
				layout='vertical'
				name='login-form'
				onFinish={onLogin}
				// initialValues={{
				//     username: 'guest',
				//     password: 'password',
				// }}
			>
				<Form.Item
					label={
						<span>
							Имя пользователя{' '}
							{/* <Tooltip 
                            title="По умолчанию: guest"
                            placement="right"
                            overlayInnerStyle={{
                            fontSize: '12px',
                            padding: '6px 10px',
                            backgroundColor: '#f5f5f5',
                            color: '#333',
                            }}
                            overlayStyle={{ maxWidth: '200px' }}
                            >
                            <QuestionCircleOutlined style={{ color: '#999' }} />
                        </Tooltip> */}
						</span>
					}
					name='username'
					rules={[
						{
							required: true,
							message: 'Введите имя пользователя или guest',
						},
					]}
				>
					<Input
						placeholder='Введите имя пользователя'
						prefix={<MailOutlined className='text-primary' />}
					/>
				</Form.Item>
				<Form.Item
					label={
						<span>
							Пароль{' '}
							{/* <Tooltip 
                            title="По умолчанию: password"
                            placement="right"
                            overlayInnerStyle={{
                            fontSize: '12px',
                            padding: '6px 10px',
                            backgroundColor: '#f5f5f5',
                            color: '#333',
                            }}
                            overlayStyle={{ maxWidth: '200px' }}
                            >
                            <QuestionCircleOutlined style={{ color: '#999' }} />
                        </Tooltip> */}
						</span>
					}
					name='password'
					rules={[
						{
							required: true,
							message: 'Введите пароль или password',
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
					<Button
						type='primary'
						htmlType='submit'
						block
						loading={loading}
						icon={<LoginOutlined />}
					>
						Войти
					</Button>
				</Form.Item>
				{/* <Form.Item>
                    <Button
                        type='default'
                        block
                        onClick={() => onLogin({ username: 'guest', password: 'password' })}
                        icon={<UserOutlined />}
                    >
                        Войти как гость
                    </Button>
                </Form.Item> */}
			</Form>
		</>
	)
})
