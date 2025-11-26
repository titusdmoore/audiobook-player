import { PALETTE } from "@/utils/colors";
import { View, Text, TextInput, TouchableOpacity, Button, StyleSheet } from "react-native";
import { useAppDispatch, useAppSelector } from "@/utils/hooks";
import { useState } from "react";
import { authenticateUserByName } from "@/utils/book-providers/jellyfin";
import { setAccessToken, setJellyfinDomain, setJellyfinUser } from "@/utils/slices/book-provider-slice";
import { deleteItemAsync, setItemAsync } from "expo-secure-store";

export default function JellyfinSettings() {
  const jellyfinProvider = useAppSelector(state => state.bookProvider);
  const dispatch = useAppDispatch();
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [domain, setDomain] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleLogin = async () => {
    dispatch(setJellyfinDomain(domain));
    let userResponse = await authenticateUserByName(domain, username, password);
    setErrorMessage('');

    if (userResponse.errors) {
      setErrorMessage(userResponse.errors.message);
      return;
    }

    await setItemAsync('jellyfinAccessToken', userResponse.accessToken);
    await setItemAsync('jellyfinUserId', userResponse.user.Id);
    await setItemAsync('jellyfinDomain', domain);
    dispatch(setAccessToken(userResponse.accessToken));
    dispatch(setJellyfinUser(userResponse.user));
  };

  const disconnectJellyfin = async () => {
    await deleteItemAsync('jellyfinUserId');
    await deleteItemAsync('jellyfinAccessToken');
    await deleteItemAsync('jellyfinDomain');

    dispatch(setJellyfinDomain(undefined));
    dispatch(setAccessToken(undefined));
    dispatch(setJellyfinUser(undefined));
  }

  return (
    <View>
      <View>
        <Text style={{ color: PALETTE.text }}>Jellyfin</Text>
        {jellyfinProvider.jellyfinAccessToken && (<Text style={{ color: PALETTE.text }}>Connected</Text>)}
      </View>
      <TextInput style={styles.input} placeholder="Domain" value={domain} onChangeText={setDomain} />
      <TextInput style={styles.input} placeholder="Username" value={username} onChangeText={setUsername} />
      <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} textContentType="password" />
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
