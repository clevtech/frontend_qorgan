import { LoadingOutlined } from '@ant-design/icons';
import { Spin } from 'antd';

const Icon = <LoadingOutlined style={{ fontSize: 35 }} spin />;

type Props = {
    align?: string;
    cover?: string;
};

export const Loading = (props: Props) => {
    return (
        <div className={`loading text-${props.align} cover-${props.cover}`}>
            <Spin indicator={Icon} />
        </div>
    );
};

Loading.defaultProps = {
    align: 'center',
    cover: 'inline',
};
