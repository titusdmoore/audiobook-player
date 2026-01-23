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
import { initializeSleepTimer, setInitialized } from '@/utils/slices/audio-player-slice';
import { SQLiteProvider, useSQLiteContext } from 'expo-sqlite';
import { getAppOption, migrateDbIfNeeded, setAppOption } from '@/utils/db/db';
import { Text, TouchableOpacity, View } from 'react-native';
import startup from '@/utils';
import { authenticateUserByName, fetchUser, getUserById, verifyApiKey } from '@/utils/book-providers/jellyfin';
import { PlaybackService } from '@/service';
import { Storage } from 'expo-sqlite/kv-store';
import * as Inter from '@expo-google-fonts/inter';
import { PlayerHeader } from './player';
import { TitleHeader } from '@/components/molecules/TitleHeader';

function AppInitializer() {
  const dispatch = useAppDispatch();
  const audioPlayer = useAppSelector(state => state.audioPlayer);
  const bookProvider = useAppSelector(state => state.bookProvider);
  const db = useSQLiteContext();

  let [fontsloaded] = Inter.useFonts({
    ...Inter
  });


  useEffect(() => {
    TrackPlayer.registerPlaybackService(() => PlaybackService);
    (async () => {
      let domain = (await getAppOption(db, 'jellyfinDomain'))?.option_value ?? '';
      let username = (await getAppOption(db, 'jellyfinUsername'))?.option_value ?? '';
      let password = (await getAppOption(db, 'jellyfinPassword'))?.option_value ?? '';
      let accessToken = (await getAppOption(db, 'jellyfinAccessToken'))?.option_value ?? '';

      let sleepTimer = await getAppOption(db, "sleep_timer");
      if (sleepTimer && sleepTimer.option_value) {
        dispatch(initializeSleepTimer(parseInt(sleepTimer.option_value)));
      }

      if (!bookProvider.jellyfinDomain) {
        dispatch(setJellyfinDomain(domain));
        dispatch(setAccessToken(accessToken));
        dispatch(setAccessToken(accessToken));
      }

      if (domain && username && password && accessToken) {
        if (!await verifyApiKey(domain, accessToken)) {
          let userResponse = await authenticateUserByName(domain, username, password);

          await setAppOption(db, 'jellyfinAccessToken', userResponse.accessToken);
          await setAppOption(db, 'jellyfinDomain', domain);
          dispatch(setAccessToken(userResponse.accessToken));
          dispatch(setJellyfinUser(userResponse.user));
        } else {
          let userResponse = await fetchUser(domain, accessToken);

          if (userResponse.ok) {
            let userData = await userResponse.json();

            dispatch(setJellyfinUser(userData));
          }
        }
      }
    })().then(() => { });

    if (!audioPlayer.playerInitialized) {
      TrackPlayer.setupPlayer({
        autoHandleInterruptions: true,
      }).then(() => {
        dispatch(setInitialized(true));

        TrackPlayer.updateOptions(({
          progressUpdateEventInterval: 3,
          capabilities: [
            Capability.Play,
            Capability.Pause,
            Capability.SeekTo,
            Capability.JumpForward,
            Capability.JumpBackward,
          ],
          compactCapabilities: [
            Capability.Play,
            Capability.Pause,
            Capability.JumpForward,
            Capability.JumpBackward,
          ],
          notificationCapabilities: [
            Capability.Play,
            Capability.Pause,
            Capability.JumpForward,
            Capability.JumpBackward,
          ],
        }) as any).then(() => { });
      });

    }

  }, []);

  return null;
}

export default function RootLayout() {
  return (
    <ThemeProvider value={AudiobookPlayerTheme}>
      <Provider store={store}>
        <SQLiteProvider options={{ useNewConnection: true }} databaseName="abp_secure.db" onInit={migrateDbIfNeeded}>
          <AppInitializer />
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="player" options={{ presentation: 'modal', title: 'Player', header: (props) => <PlayerHeader {...props} /> }} />
            <Stack.Screen name="[titleId]" options={{ header: (props) => <TitleHeader {...props} />, headerShown: true }} />
          </Stack>
        </SQLiteProvider>
      </Provider>
    </ThemeProvider>
  );
}
