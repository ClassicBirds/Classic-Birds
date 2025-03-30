import axios from "axios";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

const initialState = {


};

// Define the slice for pools data and token prices
const walletSlice = createSlice({
  name: "wallet",
  initialState,
  reducers: {
    setNetwork: (state, action) => {
    },
  },
  extraReducers: (builder) => {
   
  },
});

export const {setNetwork} = walletSlice.actions;
export default walletSlice.reducer;
