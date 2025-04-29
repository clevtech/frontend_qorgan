import { Button } from 'antd';

import type { ButtonProps } from 'antd';

export const CustomActionButton = (props: ButtonProps) => {
    return (
        <Button
            className='py-0 px-0'
            style={{
                height: 'auto',

                ...(props.style ?? {}),
            }}
            type='link'
            {...props}
        />
    );
};
