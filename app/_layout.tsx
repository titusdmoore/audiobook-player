import { AudiobookPlayerTheme, PALETTE } from '@/utils/colors';
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Link, Stack } from 'expo-router';
import { useEffect } from 'react';
import TrackPlayer, { Capability, Event, PlaybackActiveTrackChangedEvent, PlaybackProgressUpdatedEvent, PlaybackState, State } from "react-native-track-player";
import { Provider } from 'react-redux';
import { store } from '@/utils/store';
import { useAppDispatch, useAppSelector } from '@/utils/hooks';
import { setAccessToken, setDropboxInitialized, setDropboxTokens, setJellyfinDomain, setJellyfinUser } from '@/utils/slices/book-provider-slice';
import { DropboxProvider } from '@/utils/book-providers/dropbox';
import { setInitialized } from '@/utils/slices/audio-player-slice';
import { SQLiteProvider } from 'expo-sqlite';
import { migrateDbIfNeeded } from '@/utils/db/db';
import { Text, TouchableOpacity, View } from 'react-native';
import startup from '@/utils';
import { getItemAsync } from 'expo-secure-store';
import { getUserById } from '@/utils/book-providers/jellyfin';
import { PlaybackService } from '@/service';

function AppInitializer() {
  const dispatch = useAppDispatch();
  const audioPlayer = useAppSelector(state => state.audioPlayer);
  const bookProvider = useAppSelector(state => state.bookProvider);

  useEffect(() => {
    TrackPlayer.registerPlaybackService(() => PlaybackService);

    if (!bookProvider.jellyfinAccessToken) {
      (async () => {
        let accessToken = await getItemAsync('jellyfinAccessToken');
        let userId = await getItemAsync('jellyfinUserId');
        let domain = await getItemAsync('jellyfinDomain');

        if (accessToken && domain) {
          dispatch(setAccessToken(accessToken));
          dispatch(setJellyfinDomain(domain));

          if (!bookProvider.jellyfinUser && userId) {
            let userRes = await getUserById(domain, userId, accessToken);

            if (userRes.ok) {
              dispatch(setJellyfinUser(await userRes.json()));
            }
          }
        }
      })().then(() => { });
    }

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
      TrackPlayer.setupPlayer({
        autoHandleInterruptions: true,
      }).then(() => {
        dispatch(setInitialized(true));

        TrackPlayer.updateOptions({
          progressUpdateEventInterval: 3,
          capabilities: [
            Capability.Play,
            Capability.Pause,
            Capability.SeekTo,
          ],
          compactCapabilities: [
            Capability.Play,
            Capability.Pause,
          ],
          notificationCapabilities: [
            Capability.Play,
            Capability.Pause,
          ],
        }).then(() => { });
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
            <Stack.Screen name="[titleId]" options={{ headerShown: true }} />
          </Stack>
        </SQLiteProvider>
      </Provider>
    </ThemeProvider>
  );
}
