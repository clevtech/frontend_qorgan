// Third-party package imports
import { createSlice } from '@reduxjs/toolkit';

// Local imports
import { THEME_CONFIG } from '@/configs/AppConfig';

export const initialState = THEME_CONFIG;

export const themeSlice = createSlice({
    name: 'theme',
    initialState,
    reducers: {
        onNavCollapsedChange: (state, action) => {
            state.navCollapsed = action.payload;
        },
        onSideNavThemeChange: (state, action) => {
            state.sideNavTheme = action.payload;
        },
        onLocaleChange: (state, action) => {
            state.locale = action.payload;
        },
        onNavTypeChange: (state, action) => {
            state.navType = action.payload;
        },
        onTopNavColorChange: (state, action) => {
            state.topNavColor = action.payload;
        },
        onHeaderNavColorChange: (state, action) => {
            state.headerNavColor = action.payload;
        },
        onMobileNavChange: (state, action) => {
            state.mobileNav = action.payload;
        },
        onCurrentThemeChange: (state, action) => {
            state.currentTheme = action.payload;
        },
        onDirectionChange: (state, action) => {
            state.direction = action.payload;
        },
        onBlankLayoutChange: (state, action) => {
            state.blankLayout = action.payload;
        },
    },
});

export const {
    onNavCollapsedChange,
    onSideNavThemeChange,
    onLocaleChange,
    onNavTypeChange,
    onTopNavColorChange,
    onHeaderNavColorChange,
    onMobileNavChange,
    onCurrentThemeChange,
    onDirectionChange,
    onBlankLayoutChange,
} = themeSlice.actions;

export default themeSlice.reducer;
