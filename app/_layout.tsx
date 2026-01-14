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
import { SQLiteProvider, useSQLiteContext } from 'expo-sqlite';
import { getAppOption, migrateDbIfNeeded } from '@/utils/db/db';
import { Text, TouchableOpacity, View } from 'react-native';
import startup from '@/utils';
import { authenticateUserByName, getUserById } from '@/utils/book-providers/jellyfin';
import { PlaybackService } from '@/service';
import { Storage } from 'expo-sqlite/kv-store';
import * as Inter from '@expo-google-fonts/inter';
import { TitleHeader } from './[titleId]';
import { PlayerHeader } from './player';

function AppInitializer() {
  const dispatch = useAppDispatch();
  const audioPlayer = useAppSelector(state => state.audioPlayer);
  const bookProvider = useAppSelector(state => state.bookProvider);
  const db = useSQLiteContext();

  let [fontsloaded] = Inter.useFonts({
    ...Inter
  });


  useEffect(() => {
    console.log('running this')
    TrackPlayer.registerPlaybackService(() => PlaybackService);

    if (!bookProvider.jellyfinAccessToken) {
      (async () => {
        let accessToken = await Storage.getItem('jellyfinAccessToken');
        let userId = await Storage.getItem('jellyfinUserId');
        let domain = await Storage.getItem('jellyfinDomain');

        if (accessToken && domain) {
          dispatch(setAccessToken(accessToken));
          dispatch(setJellyfinDomain(domain));

          if (userId) {
            let userRes = await getUserById(domain, userId, accessToken);
            console.log(userRes)

            if (userRes.ok) {
              dispatch(setJellyfinUser(await userRes.json()));
            } else {
              let userResponse = await authenticateUserByName(
                (await getAppOption(db, 'jellyfinDomain'))?.option_value ?? '',
                (await getAppOption(db, 'jellyfinUsername'))?.option_value ?? '',
                (await getAppOption(db, 'jellyfinPassword'))?.option_value ?? ''
              );

              if (userResponse.errors) {
                console.log(userResponse.errors)
                await Storage.setItem('jellyfinAccessToken', '');
                return;
              }

              await Storage.setItem('jellyfinAccessToken', userResponse.accessToken);
              dispatch(setAccessToken(userResponse.accessToken));
              dispatch(setJellyfinUser(userResponse.user));
            }
          }

        }
      })().then(() => { });
    }

    console.log("made it to this place")
    if (!audioPlayer.playerInitialized) {
      console.log("initializing")
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
