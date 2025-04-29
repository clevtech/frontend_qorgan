import { initReactI18next } from 'react-i18next';

import antdKkKZ from 'antd/es/locale/kk_KZ';
import antdRuRU from 'antd/es/locale/ru_RU';

import i18n from 'i18next';

import { THEME_CONFIG } from '@/configs/AppConfig';

import kz from '@/lang/locales/kk_KZ.json';
import ru from '@/lang/locales/ru_RU.json';

export const resources = {
    kz: {
        translation: kz,
        antd: antdKkKZ,
    },
    ru: {
        translation: ru,
        antd: antdRuRU,
    },
};

i18n.use(initReactI18next).init({
    resources,
    fallbackLng: THEME_CONFIG.locale,
    lng: THEME_CONFIG.locale,
    interpolation: {
        escapeValue: false,
    },
});

export default i18n;
