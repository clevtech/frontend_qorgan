// import './wdyr';

import React from 'react';
import ReactDOM from 'react-dom/client';

import { Provider } from 'react-redux';

import { App } from '@/App';
import { store } from '@/store';

import '@/less/index.less';
import '@/less/light-theme.less';
import '@/lang';
import moment from 'moment';
import 'moment/locale/ru';

// Устанавливаем русскую локаль глобально
moment.locale('ru');

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <Provider store={store}>
            <App />
        </Provider>
    </React.StrictMode>,
);
