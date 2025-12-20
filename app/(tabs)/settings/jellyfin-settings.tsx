import { PALETTE } from "@/utils/colors";
import { View, Text, TextInput, TouchableOpacity, Button, StyleSheet } from "react-native";
import { useAppDispatch, useAppSelector } from "@/utils/hooks";
import { useEffect, useState } from "react";
import { authenticateUserByName } from "@/utils/book-providers/jellyfin";
import { setAccessToken, setJellyfinDomain, setJellyfinUser } from "@/utils/slices/book-provider-slice";
import { Storage } from 'expo-sqlite/kv-store';
import { getAppOption, setAppOption } from "@/utils/db/db";
import { useSQLiteContext } from "expo-sqlite";

export default function JellyfinSettings() {
  const jellyfinProvider = useAppSelector(state => state.bookProvider);
  const dispatch = useAppDispatch();
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [domain, setDomain] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const db = useSQLiteContext();

  const handleLogin = async () => {
    let message = '';
    try {
      dispatch(setJellyfinDomain(domain));
      // throw new Error('Breakpoint, prior to setItem');
      let userResponse = await authenticateUserByName(domain, username, password);
      setErrorMessage('');

      if (userResponse.errors) {
        setErrorMessage(userResponse.errors.message);
        return;
      }

      // throw new Error('Breakpoint, prior to setItem' + JSON.stringify(userResponse));
      await setAppOption(db, 'jellyfinAccessToken', userResponse.accessToken);
      await setAppOption(db, 'jellyfinUsername', userResponse.accessToken);
      await setAppOption(db, 'jellyfinPassword', userResponse.accessToken);
      await setAppOption(db, 'jellyfinUserId', userResponse.user.Id);
      await setAppOption(db, 'jellyfinDomain', domain);
      dispatch(setAccessToken(userResponse.accessToken));
      dispatch(setJellyfinUser(userResponse.user));
    } catch (error) {
      setErrorMessage("unable to login \n" + JSON.stringify(error) + message);
    }
  };

  const disconnectJellyfin = async () => {
    await setAppOption(db, 'jellyfinUserId', '');
    await setAppOption(db, 'jellyfinAccessToken', '');
    await setAppOption(db, 'jellyfinDomain', '');

    dispatch(setJellyfinDomain(undefined));
    dispatch(setAccessToken(undefined));
    dispatch(setJellyfinUser(undefined));
  }

  useEffect(() => {
    (async () => {
      console.log(await getAppOption(db, 'jellyfinUsername'))
      setDomain((await getAppOption(db, 'jellyfinDomain'))?.option_value ?? '');
      setUsername((await getAppOption(db, 'jellyfinUsername'))?.option_value ?? '');
      setPassword((await getAppOption(db, 'jellyfinPassword'))?.option_value ?? '');
    })().then(() => { });
  }, []);

  return (
    <View>
      <View>
        <Text style={{ color: PALETTE.text }}>Jellyfin</Text>
        {jellyfinProvider.jellyfinAccessToken && (<Text style={{ color: PALETTE.text }}>Connected</Text>)}
        {errorMessage && (<Text style={{ color: PALETTE.text, padding: 12 }}>{errorMessage}</Text>)}
      </View>
      <TextInput style={styles.input} autoCapitalize="none" placeholder="Domain" value={domain} onChangeText={setDomain} />
      <TextInput style={styles.input} autoCapitalize="none" placeholder="Username" value={username} onChangeText={setUsername} />
      <TextInput style={styles.input} autoCapitalize="none" placeholder="Password" secureTextEntry={true} value={password} onChangeText={setPassword} textContentType="password" />
      <View style={{ flexDirection: 'row' }}>
        <TouchableOpacity style={{ backgroundColor: PALETTE.primary }} onPress={handleLogin}>
          <Text style={{ color: PALETTE.text }}>Sign In</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ backgroundColor: PALETTE.primary }} onPress={disconnectJellyfin}>
          <Text style={{ color: PALETTE.text }}>Disconnect</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    borderColor: PALETTE.primary,
    borderWidth: 1,
    borderRadius: 12,
    padding: 6,
    color: PALETTE.text
  }
})
