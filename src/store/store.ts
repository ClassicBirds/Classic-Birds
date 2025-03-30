import { configureStore } from '@reduxjs/toolkit';
import walletSlice from "./walletSlice";
const store = configureStore({
    reducer: {
        wallet:walletSlice,
    },
});

export default store;
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch =  typeof store.dispatch