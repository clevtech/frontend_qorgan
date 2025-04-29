import { ReactNode } from 'react';

export const FieldWrapper = ({ children }: { children: ReactNode }) => {
    return (
        <div className='d-flex align-items-center' style={{ gap: '0.5rem' }}>
            {children}
        </div>
    );
};
