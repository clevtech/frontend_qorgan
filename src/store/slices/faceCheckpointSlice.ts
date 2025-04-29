import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { components, paths } from '@/types/generated';
import { FaceCheckpointsService } from '@/services/FaceCheckpointsService';

interface FaceCheckpointsSliceType {
    entrance: {
        data: components['schemas']['FaceCheckpointsRead'] | null;
        isLoading: boolean;
        error: string | null;
    };
    exit: {
        data: components['schemas']['FaceCheckpointsRead'] | null;
        isLoading: boolean;
        error: string | null;
    };
    error: string | null;
    isLoading: boolean;
}

const initialState: any = {
    entrance: {
        data: null,
        isLoading: false,
        error: null,
    },
    exit: {
        data: null,
        isLoading: false,
        error: null,
    },
    error: null,
    isLoading: false,
};

export const getFaceCheckpoints = createAsyncThunk(
    'faceCheckpointsSlice/getFaceCheckpoints',
    async (options: any) => {
        return FaceCheckpointsService.getFaceCheckpoints(options);
    },
);

export const updateFaceCheckpoints = createAsyncThunk(
    'faceCheckpointsSlice/updateFaceCheckpoints',
    async ({
        options,
        data,
    }: {
        options: paths['/api/face-checkpoints/{id}/']['put']['parameters'];
        data: components['schemas']['FaceCheckpointUpdate'];
    }) => {
        return FaceCheckpointsService.updateFaceCheckpoints(options, data);
    },
);

export const faceCheckpointsSlice = createSlice({
    name: 'faceCheckpointsSlice',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(getFaceCheckpoints.pending, (state) => {
            state.entrance.isLoading = true;
        });
        builder.addCase(getFaceCheckpoints.fulfilled, (state, action) => {

            state.entrance.isLoading = false;

            if (action.payload.config.params && action.payload.config.params.typeOfPass === 'Вход')
                state.entrance.data = action.payload.data;
            if (action.payload.config.params && action.payload.config.params.typeOfPass === 'Выход')
                state.exit.data = action.payload.data;
        });
        builder.addCase(getFaceCheckpoints.rejected, (state, action) => {
            state.entrance.isLoading = false;
            state.entrance.error = action.error.message as string | null;
        });
        builder.addCase(updateFaceCheckpoints.pending, (state) => {
            state.isLoading = true;
            state.isLoading = true;
        });
        builder.addCase(updateFaceCheckpoints.fulfilled, (state) => {
            state.isLoading = false;
        });
        builder.addCase(updateFaceCheckpoints.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.error.message as string | null;
        });
    },
});

export default faceCheckpointsSlice.reducer;
