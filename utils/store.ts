import devToolsEnhancer from 'redux-devtools-expo-dev-plugin';
import { configureStore } from '@reduxjs/toolkit'
import bookProviderReducer from './slices/book-provider-slice';
import audioPlayerReducer from './slices/audio-player-slice';

export const store = configureStore({
	reducer: {
		bookProvider: bookProviderReducer,
		audioPlayer: audioPlayerReducer
	},
	devTools: false,
	enhancers: getDefaultEnhancers => getDefaultEnhancers().concat(devToolsEnhancer()),
});

export type AppStore = typeof store;
export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
