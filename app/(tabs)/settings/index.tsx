import Card from "@/components/molecules/Card";
import { DropboxProvider } from "@/utils/book-providers/dropbox";
import { PALETTE } from "@/utils/colors";
import { BookProviderDb } from "@/utils/db/schema";
import { Link } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useAppSelector } from "@/utils/hooks";
import { View, Text, StyleSheet, TouchableOpacity, Button } from "react-native";

function ProviderButton() {
  return (
    <Link style={styles.providerButton} href="/settings/dropbox-settings">
      <Text style={styles.providerButtonText}>Dropbox</Text>
    </Link>
  );
}

export default function Tab() {
  const db = useSQLiteContext();
  const dropboxProvider = useAppSelector(state => state.bookProvider);

  const handleRemoteSync = async () => {
    console.log("Hello")
    const result = await db.getAllAsync<BookProviderDb>('SELECT * FROM book_providers');
    console.log(result)

    for (const bookProvider of result) {
      let bookEntries = await DropboxProvider.fetchBooksInDir(dropboxProvider.dropboxAccessToken ?? '', bookProvider.remote_path, db);
      console.log(bookEntries)
    }
  };

  return (
    <View>
      <Text style={{ color: PALETTE.text }}>Hello, Settings</Text>
      <Card title="Providers">
        <ProviderButton />
      </Card>
      <Button
        title="Sync Remote Books"
        onPress={handleRemoteSync}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  providerCard: {

  },
  providerButton: {
    backgroundColor: PALETTE.primary,
  },
  providerButtonText: {
    color: PALETTE.text
  }
});
