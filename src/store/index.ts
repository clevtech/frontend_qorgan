// import { createLogger } from 'redux-logger';

import { Middleware, configureStore } from '@reduxjs/toolkit';

import authSlice from '@/store/slices/authSlice';
import themeSlice from '@/store/slices/themeSlice';
import faceCheckpointSlice from '@/store/slices/faceCheckpointSlice';

// const logger = createLogger();

const middlewares: Middleware[] = [];

export const store = configureStore({
    reducer: {
        auth: authSlice,
        theme: themeSlice,
        faceCheckpoint: faceCheckpointSlice,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            immutableCheck: false,
            serializableCheck: false,
        }).concat(middlewares),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
