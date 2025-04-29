import { Button } from 'antd';

import type { ButtonProps } from 'antd';

export const CustomTableButton = (props: ButtonProps) => {
    return (
        <Button
            className='p-0'
            style={{
                height: 'auto',

                ...(props.style ?? {}),
            }}
            type='link'
            {...props}
        />
    );
};
