import { AudiobookPlayerTheme, PALETTE } from '@/utils/colors';
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import TrackPlayer from 'react-native-track-player';
import { Provider } from 'react-redux';
import { store } from '@/utils/store';
import { useAppDispatch, useAppSelector } from '@/utils/hooks';
import { setDropboxInitialized, setDropboxTokens } from '@/utils/slices/book-provider-slice';
import { DropboxProvider } from '@/utils/book-providers/dropbox';
import { setInitialized } from '@/utils/slices/audio-player-slice';
import { SQLiteProvider } from 'expo-sqlite';
import { migrateDbIfNeeded } from '@/utils/db/db';

function AppInitializer() {
  const dispatch = useAppDispatch();
  const audioPlayer = useAppSelector(state => state.audioPlayer);
  const bookProvider = useAppSelector(state => state.bookProvider);

  useEffect(() => {
    TrackPlayer.registerPlaybackService(() => require('../service.js'));

    if (!bookProvider.dropboxInitialized) {
      (async () => {
        let tokens = await DropboxProvider.fetchStoreToken();

        if (tokens.accessToken) {
          dispatch(setDropboxTokens(tokens));
          dispatch(setDropboxInitialized(await DropboxProvider.verifyConnection(bookProvider.dropboxAccessToken ?? '')));
        }
      })().then(() => { });
    } else {
      (async () => {
        if (!await DropboxProvider.verifyConnection(bookProvider.dropboxAccessToken ?? '')) {
          // dispatch(setDropboxTokens(tokens));
          dispatch(setDropboxInitialized(false));
        }
      })().then(() => { });
    }

    if (!audioPlayer.playerInitialized) {
      TrackPlayer.setupPlayer().then(() => {
        dispatch(setInitialized(true));
      });
    }
  }, []);

  return null;
}

export default function RootLayout() {
  return (
    <ThemeProvider value={AudiobookPlayerTheme}>
      <Provider store={store}>
        <SQLiteProvider databaseName="abp.db" onInit={migrateDbIfNeeded}>
          <AppInitializer />
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="player" options={{ presentation: 'modal', title: 'Player' }} />
          </Stack>
        </SQLiteProvider>
      </Provider>
    </ThemeProvider>
  );
}
