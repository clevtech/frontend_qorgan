import { SignInForm } from '@/components/auth-components/SignInForm'
import { Logo } from '@/components/layout-components/Logo'
import { Card, Col, Row } from 'antd'

const backgroundStyle = {
	backgroundImage: 'url(/images/background_image_purple_lite.png)',
	backgroundRepeat: 'no-repeat',
	backgroundSize: 'cover',
}

const SignIn = () => {
	return (
		<div className='h-100' style={backgroundStyle}>
			<div className='container d-flex flex-column justify-content-center h-100'>
				<Row justify='center'>
					<Col xs={20} sm={20} md={20} lg={7}>
						<Card 
							style={{
								border: 0,
								borderRadius: '1rem'
							}}
						>
							<div className='my-4'>
								<div
									style={{
										display: 'flex',
										justifyContent: 'center',
										alignItems: 'center',
										margin: '0% 40%',
									}}
								>
									<Logo />
								</div>
								<Row justify='center'>
									<Col xs={24} sm={24} md={20} lg={20}>
										<SignInForm />
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
