import { ReactNode } from 'react';

type Props = {
    children: ReactNode;
    extra?: ReactNode;
    title: string;
};

const GREY_COLOR = '#e6ebf1';

export const CustomCard = (props: Props) => {
    return (
        <div
            style={{
                background: '#ffffff',
                color: '#455560',
                border: `1px solid ${GREY_COLOR}`,
                borderRadius: '0.625rem',
            }}
        >
            <div
                className='d-flex justify-content-between'
                style={{ padding: '12px 24px', color: '#1a3353', borderBottom: `1px solid ${GREY_COLOR}` }}
            >
                <div
                    style={{
                        margin: '0',
                        fontSize: '16px',
                        fontWeight: 500,
                        lineHeight: '22px',
                        color: '#1a3353',
                        padding: '.1rem',
                        wordWrap: 'break-word',
                    }}
                >
                    <span className='font-size-base font-weight-semibold'>{props.title}</span>
                </div>
                {props.extra}
            </div>

            <div style={{ padding: '16px 24px' }}>{props.children}</div>
        </div>
    );
};
