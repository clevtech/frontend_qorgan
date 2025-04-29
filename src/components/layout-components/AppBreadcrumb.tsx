import { Breadcrumb } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import { IntlMessage } from '@/components/util-components/IntlMessage';
import navigationConfig from '@/configs/NavigationConfig.ts';
import {NavItem} from "@/types/custom.ts"; // Adjust path if needed

interface BreadcrumbData {
    [key: string]: JSX.Element;
}

const breadcrumbData: BreadcrumbData = {
    '/app': <IntlMessage id='home' />,
};

navigationConfig.forEach((elm) => {
    const assignBreadcrumb = (obj: NavItem) => {
        if(obj.path){
            breadcrumbData[obj.path] = <IntlMessage id={obj.title} />;
        }
    };
    assignBreadcrumb(elm);
    if (elm.submenu) {
        elm.submenu.forEach((subElm) => {
            assignBreadcrumb(subElm);
            if (subElm.submenu) {
                subElm.submenu.forEach((nestedElm) => {
                    assignBreadcrumb(nestedElm);
                });
            }
        });
    }
});

const BreadcrumbRoute = () => {
    const location = useLocation();
    const pathSnippets = location.pathname.split('/').filter((i) => i);
    const buildBreadcrumb = pathSnippets.map((_, index) => {
        const url = `/${pathSnippets.slice(0, index + 1).join('/')}`;
        return (
            <Breadcrumb.Item key={url}>
                <Link to={url}>{breadcrumbData[url] || url}</Link>
            </Breadcrumb.Item>
        );
    });

    return <Breadcrumb>{buildBreadcrumb}</Breadcrumb>;
};

export const AppBreadcrumb = () => {
    return <BreadcrumbRoute />;
};
