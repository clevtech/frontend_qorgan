import { Button, ButtonProps } from 'antd';

export const CustomCardButton = (props: ButtonProps) => {
    return (
        <Button
            style={{
                height: 'auto',
                padding: '0',
            }}
            type='link'
            {...props}
        />
    );
};
