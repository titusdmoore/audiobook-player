import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

enum AudioPlayerSliceState {
	UNINITIALIZED,
	INITIALIZED,
}

const initialAudioPlayerState = {
	playerInitialized: false,
	activeTitle: null,
};

export const initializePlayerThunk = createAsyncThunk(
	'audioPlayer/initializePlayer',
	async () => {
		try {

		} catch (error) {

		}
	}
)

export const audioPlayerSlice = createSlice({
	name: 'audioPlayer',
	initialState: initialAudioPlayerState,
	reducers: {
		setInitialized: (state, action: PayloadAction<boolean>) => {
			state.playerInitialized = action.payload;
		},
		setActiveTitle: (state, action: PayloadAction<any>) => {
			state.activeTitle = action.payload;
		}
	},
});

export const { setInitialized, setActiveTitle } = audioPlayerSlice.actions;
export default audioPlayerSlice.reducer;

