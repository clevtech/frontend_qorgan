import { ReactNode } from 'react';

type Props = {
    alignItems?: string;
    children: ReactNode;
    className?: string;
    flexDirection?: string;
    justifyContent?: string;
    mobileFlex?: boolean;
};

export const Flex = ({
    alignItems,
    children,
    className = '',
    flexDirection = 'row',
    justifyContent,
    mobileFlex = true,
}: Props) => {
    const getFlexResponsive = () => (mobileFlex ? 'd-flex' : 'd-md-flex');

    return (
        <div
            className={`${getFlexResponsive()} ${className} ${flexDirection ? 'flex-' + flexDirection : ''} ${
                alignItems ? 'align-items-' + alignItems : ''
            } ${justifyContent ? 'justify-content-' + justifyContent : ''}`}
        >
            {children}
        </div>
    );
};
