import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UiState {
  isSidebarOpen: boolean;
}

const initialState: UiState = {
  isSidebarOpen: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.isSidebarOpen = action.payload;
    },
  },
});

export const { setSidebarOpen } = uiSlice.actions;
export default uiSlice.reducer;
