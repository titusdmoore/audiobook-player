import Card from "@/components/molecules/Card";
import { DropboxProvider } from "@/utils/book-providers/dropbox";
import { PALETTE } from "@/utils/colors";
import { BookProviderDb } from "@/utils/db/schema";
import { Link } from "expo-router";
import { authenticateUserByName } from "@/utils/book-providers/jellyfin";
import { useSQLiteContext } from "expo-sqlite";
import { View, Text, StyleSheet, TouchableOpacity, Button, TextInput, ScrollView, Switch } from "react-native";
import { setAccessToken, setJellyfinDomain, setJellyfinUser } from "@/utils/slices/book-provider-slice";
import FontAwesome6Pro from "@react-native-vector-icons/fontawesome6-pro";
import { useEffect, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { verifyApiKey } from "@/utils/book-providers/jellyfin";
import { getAppOption, setAppOption } from "@/utils/db/db";
import { useAppDispatch, useAppSelector } from "@/utils/hooks";
import CardListItem from "@/components/molecules/CardListItem";
import ProgressBar from "@/components/molecules/ProgresBar";

export default function Tab() {
  const db = useSQLiteContext();
  const dispatch = useAppDispatch();
  const jellyfinProvider = useAppSelector(state => state.bookProvider);
  const [jellyIsConnected, setJellyIsConnected] = useState<boolean>(false);
  const [passwordHidden, setPasswordHidden] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [domain, setDomain] = useState<string>("");

  const validateJellyConnection = async () => {
    setJellyIsConnected(await verifyApiKey(jellyfinProvider.jellyfinDomain ?? '', jellyfinProvider.jellyfinAccessToken ?? ''));
  };

  const signInJellyfin = async () => {
    console.log('signing in')
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
      await setAppOption(db, 'jellyfinUsername', username);
      await setAppOption(db, 'jellyfinPassword', password);
      await setAppOption(db, 'jellyfinUserId', userResponse.user.Id);
      await setAppOption(db, 'jellyfinDomain', domain);
      dispatch(setAccessToken(userResponse.accessToken));
      dispatch(setJellyfinUser(userResponse.user));
    } catch (error) {
      setErrorMessage("unable to login \n" + JSON.stringify(error) + message);
    }
  };

  useEffect(() => {
    (async () => {
      setDomain(jellyfinProvider.jellyfinDomain ?? '');
      setUsername((await getAppOption(db, 'jellyfinUsername'))?.option_value ?? '');
      setPassword((await getAppOption(db, 'jellyfinPassword'))?.option_value ?? '');

      await validateJellyConnection();
    })().then(() => { });
  }, []);

  useEffect(() => {
    if (jellyfinProvider.jellyfinAccessToken && jellyfinProvider.jellyfinDomain) {
      (async () => {
        await validateJellyConnection();
      })().then(() => { });
    }
  }, [jellyfinProvider.jellyfinAccessToken]);

  const clearJellyfinProgress = async () => {
    await db.runAsync('DELETE FROM jellyfin_book_progress;');
  };


  const disconnectJellyfin = async () => {
    await setAppOption(db, 'jellyfinUserId', '');
    await setAppOption(db, 'jellyfinAccessToken', '');
    await setAppOption(db, 'jellyfinDomain', '');

    dispatch(setJellyfinDomain(undefined));
    dispatch(setAccessToken(undefined));
    dispatch(setJellyfinUser(undefined));
  }

  return (
    <ScrollView contentContainerStyle={styles.settingsContainer}>
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>App Settings</Text>
        <View style={styles.sectionCard}>
          <CardListItem
            title="Theme"
            subtitle="Dark Mode"
            iconBackgroundColor="rgba(139, 92, 246, .2)"
            iconContent={<FontAwesome6Pro name="palette" size={15} iconStyle="solid" color='#8B5CF6' />}
            actionContent={() => (
              <TouchableOpacity>
                <FontAwesome6Pro name="angle-right" size={20} iconStyle="solid" color={PALETTE.textWhite} />
              </TouchableOpacity>
            )}
          />
          <CardListItem
            title="Language"
            subtitle="English"
            iconBackgroundColor="rgba(59, 130, 246, .2)"
            iconContent={<FontAwesome6Pro name="language" size={15} iconStyle="solid" color='#3B82F6' />}
            actionContent={() => (
              <TouchableOpacity>
                <FontAwesome6Pro name="angle-right" size={20} iconStyle="solid" color={PALETTE.textWhite} />
              </TouchableOpacity>
            )}
          />
          <CardListItem
            title="Download Quality"
            subtitle="High (128 kbps)"
            iconBackgroundColor="rgba(34, 197, 94, .2)"
            iconContent={<FontAwesome6Pro name="download" size={15} iconStyle="solid" color='#22C55E' />}
            actionContent={() => (
              <TouchableOpacity>
                <FontAwesome6Pro name="angle-right" size={20} iconStyle="solid" color={PALETTE.textWhite} />
              </TouchableOpacity>
            )}
          />
          <CardListItem
            title="Stream Quality"
            subtitle="Auto"
            iconBackgroundColor="rgba(249, 115, 22, .2)"
            iconContent={<FontAwesome6Pro name="wifi" size={15} iconStyle="solid" color='#F97316' />}
            actionContent={() => (
              <TouchableOpacity>
                <FontAwesome6Pro name="angle-right" size={20} iconStyle="solid" color={PALETTE.textWhite} />
              </TouchableOpacity>
            )}
          />
          <CardListItem
            title="Notifications"
            subtitle="Enabled"
            style={{ borderBottomWidth: 0 }}
            iconBackgroundColor="rgba(236, 72, 153, .2)"
            iconContent={<FontAwesome6Pro name="bell" size={15} iconStyle="solid" color='#EC4899' />}
            actionContent={() => {
              const [isEnabled, setIsEnabled] = useState<boolean>(false);

              return (
                <Switch
                  trackColor={{ false: PALETTE.grey, true: PALETTE.primary }}
                  thumbColor={isEnabled ? PALETTE.textWhite : PALETTE.greyLight}
                  ios_backgroundColor={PALETTE.grey}
                  value={isEnabled}
                  onValueChange={() => setIsEnabled(!isEnabled)}
                />
              )
            }}
          />
        </View>
      </View>
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Playback</Text>
        <View style={styles.sectionCard}>
          <CardListItem
            title="Auto-Play Next"
            subtitle="Continue to next book"
            iconBackgroundColor="rgba(168, 85, 247, .2)"
            iconContent={<FontAwesome6Pro name="forward" size={15} iconStyle="solid" color='#A855F7' />}
            actionContent={() => {
              const [isEnabled, setIsEnabled] = useState<boolean>(false);

              return (
                <Switch
                  trackColor={{ false: PALETTE.grey, true: PALETTE.primary }}
                  thumbColor={isEnabled ? PALETTE.textWhite : PALETTE.greyLight}
                  ios_backgroundColor={PALETTE.grey}
                  value={isEnabled}
                  onValueChange={() => setIsEnabled(!isEnabled)}
                />
              )
            }}
          />
          <CardListItem
            title="Car Mode"
            subtitle="Large Controls"
            style={{ borderBottomWidth: 0 }}
            iconBackgroundColor="rgba(6, 182, 212, .2)"
            iconContent={<FontAwesome6Pro name="car" size={15} iconStyle="solid" color='#06B6D4' />}
            actionContent={() => {
              const [isEnabled, setIsEnabled] = useState<boolean>(false);

              return (
                <Switch
                  trackColor={{ false: PALETTE.grey, true: PALETTE.primary }}
                  thumbColor={isEnabled ? PALETTE.textWhite : PALETTE.greyLight}
                  ios_backgroundColor={PALETTE.grey}
                  value={isEnabled}
                  onValueChange={() => setIsEnabled(!isEnabled)}
                />
              )
            }}
          />
        </View>
      </View>
      <View style={[styles.sectionContainer]}>
        <Text style={styles.sectionTitle}>Jellyfin Server</Text>
        <View style={[styles.sectionCard, styles.jellyfinCardContainer]}>
          <View style={styles.formInputContainer}>
            <Text style={styles.formLabel}>Server Domain</Text>
            <View style={styles.inputContainer}>
              <TextInput style={styles.input} autoCapitalize="none" placeholderTextColor={PALETTE.textOffWhite} value={domain as any} onChangeText={setDomain} />
            </View>
          </View>
          <View style={styles.formInputContainer}>
            <Text style={styles.formLabel}>Username</Text>
            <View style={styles.inputContainer}>
              <TextInput style={styles.input} autoCapitalize="none" placeholderTextColor={PALETTE.textOffWhite} value={username as any} onChangeText={setUsername} />
            </View>
          </View>
          <View style={styles.formInputContainer}>
            <Text style={styles.formLabel}>Password</Text>
            <View style={styles.inputContainer}>
              <TextInput style={styles.input} autoCapitalize="none" placeholderTextColor={PALETTE.textOffWhite} secureTextEntry={passwordHidden} value={password as any} onChangeText={setPassword} />
              <TouchableOpacity onPress={() => setPasswordHidden(!passwordHidden)}>
                {passwordHidden
                  ? (<FontAwesome6Pro name="eye" style={styles.inputIcon} iconStyle="solid" size={15} color={PALETTE.textWhite} />)
                  : (<FontAwesome6Pro name="eye-slash" style={styles.inputIcon} iconStyle="solid" size={15} color={PALETTE.textWhite} />)}
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.jellyFormSubmitContainer}>
            <View style={styles.jellyFormStatusContainer}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <FontAwesome6Pro name="circle-dot" iconStyle="solid" size={14} color={jellyIsConnected ? PALETTE.success : 'red'} />
                <Text style={{ color: PALETTE.textWhite, fontFamily: 'Inter_400Regular', fontSize: 12 }}>{!jellyIsConnected && 'Not '}Connected</Text>
              </View>
              <TouchableOpacity onPress={validateJellyConnection}>
                <Text style={{ color: PALETTE.primary, fontFamily: 'Inter_500Medium ' }}>Test Connection</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={signInJellyfin}>
              <LinearGradient
                colors={['rgba(108, 92, 231, 1)', '#A29BFE']}
                end={{ x: 1, y: 1 }}
                style={{ paddingVertical: 12, borderRadius: 10 }}
              >
                <Text style={{ color: PALETTE.textWhite, textAlign: 'center', fontFamily: 'Inter_500Medium', fontSize: 16 }}>Save Changes</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Storage</Text>
        <View style={[styles.sectionCard, { padding: 12 }]}>
          <View style={styles.storageInfoContainer}>
            <View>
              <Text style={styles.storageTitle}>Storage Used</Text>
              <Text style={styles.storageSubTitle}>2.5 GB of 64 GB</Text>
            </View>
            <Text style={styles.storageAmount}>3.8%</Text>
          </View>
          <ProgressBar
            value={.15}
            baseColor={PALETTE.grey}
            progressColor={PALETTE.primary}
            rounded={true}
          />
          <TouchableOpacity style={styles.storageButton}>
            <Text style={styles.storageButtonText}>Manage Downloads</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={[styles.sectionCard, { padding: 0 }]}>
          <CardListItem
            title="Privacy & Security"
            iconBackgroundColor="rgba(234, 179, 8, .2)"
            iconContent={<FontAwesome6Pro name="shield" iconStyle="solid" color='#EAB308' />}
            actionContent={() => (
              <TouchableOpacity>
                <FontAwesome6Pro name="angle-right" size={20} iconStyle="solid" color={PALETTE.textWhite} />
              </TouchableOpacity>
            )}
          />
          <CardListItem
            title="About"
            iconBackgroundColor="rgba(238, 68, 68, .2)"
            iconContent={<FontAwesome6Pro name="circle-info" color={PALETTE.error} />}
            actionContent={() => (
              <TouchableOpacity>
                <FontAwesome6Pro name="angle-right" size={20} iconStyle="solid" color={PALETTE.textWhite} />
              </TouchableOpacity>
            )}
          />
          <CardListItem
            title="Disconnect Jellyfin"
            titleStyle={{ color: PALETTE.redLight }}
            iconBackgroundColor="rgba(107, 114, 128, .2)"
            iconContent={<FontAwesome6Pro name="signal-bars-slash" iconStyle="solid" color={PALETTE.greyLight} />} />
          <CardListItem
            title="Logout"
            style={{ borderBottomWidth: 0 }}
            titleStyle={{ color: PALETTE.redLight }}
            iconBackgroundColor="rgba(107, 114, 128, .2)"
            iconContent={<FontAwesome6Pro name="arrow-right-from-bracket" iconStyle="solid" color={PALETTE.greyLight} />} />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  settingsContainer: {
    paddingHorizontal: 24,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: PALETTE.textOffWhite,
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 12,
  },
  sectionCard: {
    backgroundColor: PALETTE.backgroundLight,
    borderRadius: 10,
  },
  jellyfinCardContainer: {
    padding: 0
  },
  formLabel: {
    color: PALETTE.textOffWhite,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    marginBottom: 8,
  },
  formInputContainer: {
    padding: 12,
    borderBottomWidth: .5,
    borderBottomColor: PALETTE.textOffWhite,
  },
  inputContainer: {
    width: '100%',
    position: 'relative',
  },
  input: {
    backgroundColor: PALETTE.background,
    padding: 8,
    paddingVertical: 8,
    width: '100%',
    color: PALETTE.textWhite,
    borderRadius: 10,
    borderColor: '#252530',
    borderWidth: 1,
  },
  inputIconRight: {
    paddingRight: 36,
  },
  inputIcon: {
    position: 'absolute',
    top: '50%',
    right: 10,
    transform: 'translateY(-26%)'
  },
  jellyFormSubmitContainer: {
    padding: 12,
    paddingBottom: 24
  },
  jellyFormStatusContainer: {
    paddingTop: 10,
    paddingBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  storageInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  storageTitle: {
    color: PALETTE.textWhite,
  },
  storageSubTitle: {
    color: PALETTE.textOffWhite
  },
  storageAmount: {
    color: PALETTE.primary,
    fontSize: 20,
  },
  storageButton: {
    marginTop: 12,
    backgroundColor: PALETTE.grey,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
  },
  storageButtonText: {
    color: PALETTE.textWhite
  },
});
