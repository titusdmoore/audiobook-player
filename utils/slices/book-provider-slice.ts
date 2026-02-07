import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from '@reduxjs/toolkit'

export type BookProviderState = {
	jellyfinUser?: any;
	jellyfinAccessToken?: string;
	jellyfinDomain?: string;
	sleepTimer?: number;
};

const bookProviderInitialState: BookProviderState = {
};

const bookProviderSlice = createSlice({
	name: 'bookProvider',
	initialState: bookProviderInitialState,
	reducers: {
		setJellyfinUser: (state, action: PayloadAction<any | undefined>) => {
			state.jellyfinUser = action.payload;
		},
		setJellyfinDomain: (state, action: PayloadAction<string | undefined>) => {
			state.jellyfinDomain = action.payload;
		},
		setAccessToken: (state, action: PayloadAction<string | undefined>) => {
			state.jellyfinAccessToken = action.payload;
		},
		setSleepTimer: (state, action: PayloadAction<number | undefined>) => {
			state.sleepTimer = action.payload;
		},
	}
});

export const { setAccessToken, setJellyfinUser, setJellyfinDomain, setSleepTimer } = bookProviderSlice.actions;
export default bookProviderSlice.reducer;
