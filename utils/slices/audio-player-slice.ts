import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

enum AudioPlayerSliceState {
	UNINITIALIZED,
	INITIALIZED,
}

type AudioPlayerState = {
	playerInitialized: boolean,
	activeTitle: null | any,
	sleepTimerEndTime: null | number,
};

const initialAudioPlayerState: AudioPlayerState = {
	playerInitialized: false,
	activeTitle: null,
	sleepTimerEndTime: null,
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
		},
		initializeSleepTimer(state, action: PayloadAction<number>) {
			state.sleepTimerEndTime = action.payload;
		}
	},
});

export const { setInitialized, setActiveTitle, initializeSleepTimer } = audioPlayerSlice.actions;
export default audioPlayerSlice.reducer;

