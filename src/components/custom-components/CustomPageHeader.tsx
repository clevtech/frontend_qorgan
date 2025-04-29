import { PageHeader, PageHeaderProps } from 'antd';

import { Time } from '@/components/shared-components/Time';

export const CustomPageHeader = (props: PageHeaderProps) => {
    return (
        <PageHeader
            extra={props.extra ? props.extra : <Time />}
            ghost={false}
            style={{
                margin: '-25px -25px 25px -25px',
               backgroundColor: 'rgba(255, 255, 255, 0)'
            }}
            {...props}
        />
    );
};
