import { createSlice } from "@reduxjs/toolkit";
import { BookProvider } from "../book-providers/book-provider";
import type { PayloadAction } from '@reduxjs/toolkit'
import { DropboxProvider } from "../book-providers/dropbox";

export type BookProviderState = {
	// dropboxProvider: DropboxProvider | null;
	dropboxAccessToken: string | null;
	dropboxRefreshToken?: string;
	dropboxInitialized: boolean;
	jellyfinUser?: any;
	jellyfinAccessToken?: string;
	jellyfinDomain?: string;
};

const bookProviderInitialState: BookProviderState = {
	dropboxAccessToken: null,
	dropboxInitialized: false,
};

const bookProviderSlice = createSlice({
	name: 'bookProvider',
	initialState: bookProviderInitialState,
	reducers: {
		setDropboxTokens: (state, action: PayloadAction<{ accessToken: string, refreshToken?: string }>) => {
			state.dropboxAccessToken = action.payload.accessToken;
			state.dropboxRefreshToken = action.payload.refreshToken;
		},
		setDropboxInitialized: (state, action: PayloadAction<boolean>) => {
			state.dropboxInitialized = action.payload;
		},
		setJellyfinUser: (state, action: PayloadAction<any | undefined>) => {
			state.jellyfinUser = action.payload;
		},
		setJellyfinDomain: (state, action: PayloadAction<string | undefined>) => {
			state.jellyfinDomain = action.payload;
		},
		setAccessToken: (state, action: PayloadAction<string | undefined>) => {
			state.jellyfinAccessToken = action.payload;
		},
	}
});

export const { setDropboxTokens, setDropboxInitialized, setAccessToken, setJellyfinUser, setJellyfinDomain } = bookProviderSlice.actions;
export default bookProviderSlice.reducer;
