import { ReactElement } from 'react';

type Props = {
    children: ReactElement;
};

const AuthLayout = ({ children }: Props) => {
    return <div className='auth-container'>{children}</div>;
};

export default AuthLayout;
