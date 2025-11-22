import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

enum AudioPlayerSliceState {
	UNINITIALIZED,
	INITIALIZED,
}

const initialAudioPlayerState = {
	playerInitialized: false,
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
		}
	},
});

export const { setInitialized } = audioPlayerSlice.actions;
export default audioPlayerSlice.reducer;

