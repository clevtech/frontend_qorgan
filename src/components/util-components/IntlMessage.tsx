import { useTranslation } from 'react-i18next';

type Props = {
    id: string;
    fallback?: string,
};

export const IntlMessage = (props: Props) => {
    const { t } = useTranslation();

    const translate = t(props.id, props.fallback || 'Не переведено');

    return <>{translate}</>;
};
