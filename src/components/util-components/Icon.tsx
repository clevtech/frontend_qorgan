import { createElement } from 'react';

import { AntdIcon } from '@/types/custom';

type Props = {
    className?: string;
    type: AntdIcon;
};

const Icon = (props: Props) => {
    return <>{createElement(props.type, { className: props.className })}</>;
};

export default Icon;
