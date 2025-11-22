import { DropboxProvider } from "@/utils/book-providers/dropbox";
import { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Button } from "react-native";
import * as WebBrowser from 'expo-web-browser';
import { CodeChallengeMethod, exchangeCodeAsync, makeRedirectUri, ResponseType, useAuthRequest } from 'expo-auth-session';
import * as SecureStore from 'expo-secure-store';
import { PALETTE } from "@/utils/colors";
import { useAppDispatch, useAppSelector } from "@/utils/hooks";
import { setDropboxInitialized, setDropboxTokens } from "@/utils/slices/book-provider-slice";
import FileExplorer from "@/components/molecules/FileExplorer";

WebBrowser.maybeCompleteAuthSession();

// https://www.dropbox.com/oauth2/authorize?client_id=MY_CLIENT_ID&redirect_uri=MY_REDIRECT_URI&response_type=code

const discovery = {
  authorizationEndpoint: 'https://www.dropbox.com/oauth2/authorize',
  tokenEndpoint: 'https://api.dropboxapi.com/oauth2/token',
};

export default function DropboxSettings() {
  const dropboxProvider = useAppSelector(state => state.bookProvider);
  const dispatch = useAppDispatch();

  console.log("provider", dropboxProvider);

  const redirectUri = makeRedirectUri({
    scheme: 'audiobookplayer',
    path: 'settings/dropbox-settings'
  });

  const [request, response, promptAsync] = useAuthRequest({
    clientId: process.env.EXPO_PUBLIC_DROPBOX_APP_KEY ?? '',
    redirectUri,
    scopes: ['account_info.read', 'files.content.read', 'files.metadata.read'],
    responseType: ResponseType.Code,
    usePKCE: true,
    codeChallengeMethod: CodeChallengeMethod.S256,
  }, discovery);

  const exchangeCodeForToken = async (code: string) => {
    try {
      const tokenResult = await exchangeCodeAsync({
        clientId: process.env.EXPO_PUBLIC_DROPBOX_APP_KEY ?? '',
        redirectUri,
        code,
        extraParams: {
          code_verifier: request?.codeVerifier ?? ''
        }
      }, discovery);

      let tokens = { accessToken: tokenResult.accessToken, refreshToken: tokenResult.refreshToken };
      dispatch(setDropboxTokens(tokens as any));
      dispatch(setDropboxInitialized(await DropboxProvider.verifyConnection(dropboxProvider.dropboxAccessToken ?? '')));
      SecureStore.setItemAsync('dropbox-auth', JSON.stringify({ accessToken: tokenResult.accessToken, refreshToken: tokenResult.refreshToken }));
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    if (response?.type === 'success') {
      const { code } = response.params;

      exchangeCodeForToken(code);
    }
  }, [response]);

  return (
    <View>
      <View>
        <Text style={{ color: PALETTE.text }}>Dropbox</Text>
        {dropboxProvider.dropboxInitialized ?
          (
            <View>
              <Text style={{ color: PALETTE.text }}>Dropbox Connected</Text>
              <FileExplorer initialPath="" />
              <Button
                title="Fetch Remote Books"
              />
            </View>
          )
          : (
            <Button title="Connect Dropbox" disabled={!request} onPress={() => {
              promptAsync()
            }}>
            </Button>
          )
        }
      </View>
    </View>
  );
}
