import { AuthService } from '@/services/AuthService'
import { Button, Card, Col, Input, Row, Spin, message } from 'antd'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const backgroundStyle = {
	backgroundImage: 'url(/images/background-image.jpg)',
	backgroundRepeat: 'no-repeat',
	backgroundSize: 'cover',
}

const SignIn = () => {
	const navigate = useNavigate()
	const [imageUrl, setImageUrl] = useState('1234')
	const [loading, setLoading] = useState(false)
	const [step, setStep] = useState(1)
	const [code, setCode] = useState('')
	const [tempSecret, setTempSecret] = useState('')

	useEffect(() => {
		const register = async () => {
			try {
				const res = await AuthService.reg2FA({ username: 'superadmin' })
				const base64 = res.data.qr_code
				setImageUrl("data:image/png;base64," + base64)
				setTempSecret(res.data.secret)
			} catch (error: any) {
				if (error?.response?.status === 409) {
					navigate('/auth/sign-in')
				} else {
					console.error(error)
				}
			} finally {
				setLoading(false)
			}
		}

		register()
	}, [])



	return (
		<div className='h-100' style={backgroundStyle}>
			<div className='container d-flex flex-column justify-content-center h-100'>
				<Row justify='center'>
					<Col xs={20} sm={20} md={20} lg={7}>
						<Card>
							<div className='my-4'>
								<div className='text-center'>
									<h4 className='my-3'>Антитеррор</h4>
								</div>
								<Row justify='center'>
									<Col xs={24} sm={24} md={20} lg={20}>
										<div>
											{loading ? (
												<div className='text-center'>
													<Spin />
												</div>
											) : (
												step === 1 ? (
													<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}} >
														<img src={imageUrl} style={{ width: '77%' }} alt='QR code' />
														<Button onClick={() => setStep(2)}>
															Далее
														</Button>
													</div>
												) : (
													<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem'}} >
														<Input
															placeholder='Введите код из приложения'
															value={code}
															onChange={e => setCode(e.target.value)}
															style={{ width: '100%' }}
														/>
														<div style={{ display: 'flex', gap: '0.5rem' }}>
                                                        <Button onClick={() => setStep(1)}>
																Вернуться назад
															</Button>
															<Button
																type='primary'
																onClick={async () => {
																	try {
																		const res = await AuthService.confirm2FA({ username: 'superadmin', code, temp_secret: tempSecret })
																		message.success('Код успешно подтверждён')
																		navigate('/auth/sign-in')
																	} catch (err: any) {
																		console.error(err)
																		message.error(err?.response?.data?.detail || 'Ошибка при подтверждении кода')
																	}
																}}
															>
																Подтвердить
															</Button>
													
														</div>
													</div>
												)
											)}
										</div>
									</Col>
								</Row>
							</div>
						</Card>
					</Col>
				</Row>
			</div>
		</div>
	)
}

export default SignIn
