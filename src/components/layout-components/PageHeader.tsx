import { FC } from 'react';

import { AppBreadcrumb } from '@/components/layout-components/AppBreadcrumb';
import { IntlMessage } from '@/components/util-components/IntlMessage';

type Props = {
    display?: boolean;
    title?: string;
};

export const PageHeader: FC<Props> = ({ title, display }) => {
    return display ? (
        <div className='app-page-header'>
            <h3 className='mb-0 mr-3 font-weight-semibold'>
                <IntlMessage id={title ? title : 'home'} />
            </h3>
            <AppBreadcrumb />
        </div>
    ) : null;
};
