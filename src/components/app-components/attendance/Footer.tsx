import { Tabs } from 'antd';

type Props = {
    setTableType: (key: 'days' | 'employees') => void;
};

export const Footer = ({ setTableType }: Props) => {
    const items = [
        {
            label: 'По дням',
            key: 'days',
        },
        {
            label: 'По сотрудникам',
            key: 'employees',
        },
    ];
    return (
        <Tabs
            items={items}
            onChange={(key) => {
                if (key === 'days' || key === 'employees') {
                    setTableType(key);
                }
            }}
            size='small'
            style={{
                marginTop: '-16px',
            }}
        />
    );
};
