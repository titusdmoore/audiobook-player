import { downloadTitle, fetchAudiobooks, fetchItem } from "@/utils/book-providers/jellyfin";
import { PALETTE } from "@/utils/colors";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { Fragment, useEffect, useLayoutEffect, useRef, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, ScrollView, Animated } from "react-native";
import { useAppDispatch, useAppSelector } from "@/utils/hooks";
import { Button } from "@react-navigation/elements";
import TrackPlayer, { PitchAlgorithm, Track } from "react-native-track-player";
import { useLoadedAuthRequest } from "expo-auth-session";
import { setActiveTitle } from "@/utils/slices/audio-player-slice";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { /* callableWithDb, */ fetchPlayerDuration, setAppOption } from "@/utils/db/db";
import { useSQLiteContext } from "expo-sqlite";
import { formatAudioProgressTime } from "@/utils/audio-player";
import { Image } from "expo-image";
import FontAwesome6Pro from "@react-native-vector-icons/fontawesome6-pro";
import { encodeObjectToQueryParams, getPlayableById, fetchChildrenPlayables } from "@/utils";
import { Playable } from "@/utils/classes/playable";
import Slider from "@react-native-community/slider";


function ChapterListItem({ index, item: chapter, playButtonAction }: { index: number, item: Playable, playButtonAction: any }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 45, width: '100%', paddingHorizontal: 10 }}>
      <Text style={{ color: PALETTE.text, flexBasis: '85%' }}>{chapter.name}</Text>
      <TouchableOpacity style={{}} onPress={() => playButtonAction(index)}>
        <FontAwesome6Pro name="circle-play" size={20} color={PALETTE.text} />
      </TouchableOpacity>
    </View>
  );
}

function ChaptersModal({ chapters, isOpen, setIsOpen, chapterSelect }: { chapters: any[], isOpen: boolean, setIsOpen: any, chapterSelect: any }) {
  return (
    <Modal visible={isOpen} transparent={true}>
      <SafeAreaView style={styles.centeredView}>
        <View style={styles.modalView}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalHeaderText}>Chapters</Text>
            <TouchableOpacity onPress={() => setIsOpen(!isOpen)}>
              <FontAwesome6Pro name="x" size={15} color={PALETTE.text} />
            </TouchableOpacity>
          </View>
          <FlatList data={chapters} style={{ rowGap: 5, width: '100%' }} renderItem={(props) => (<ChapterListItem {...props} playButtonAction={chapterSelect} />)} />
        </View>
      </SafeAreaView>
    </Modal>
  );
}

export function TitleHeader({ navigation, route, options, back }: any) {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'transparent', paddingTop: insets.top + 6, paddingBottom: 6, paddingHorizontal: 24, justifyContent: 'space-between' }}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
        <FontAwesome6Pro name="arrow-left" iconStyle="solid" size={16} color={PALETTE.textWhite} />
      </TouchableOpacity>
      <View style={{ flexDirection: 'row', gap: 6 }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <FontAwesome6Pro name="share-nodes" size={16} color={PALETTE.textWhite} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <FontAwesome6Pro name="heart" size={16} color={PALETTE.textWhite} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function TitleView() {
  const { titleId } = useLocalSearchParams();
  const [chapters, setChapters] = useState<Playable[]>([]);
  const [chaptersModalOpen, setChaptersModalOpen] = useState<boolean>(false);
  const jellyfinProvider = useAppSelector(state => state.bookProvider);
  const dispatch = useAppDispatch();
  const db = useSQLiteContext();
  const navigation = useNavigation();

  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const rotateAnimValue = useRef(new Animated.Value(0)).current;
  Animated.loop(
    Animated.timing(rotateAnimValue, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true
    })
  ).start();

  const spin = rotateAnimValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  const [playable, setPlayable] = useState<Playable | null>(null);
  const router = useRouter();

  const bookInformation = [
    { key: 'Narrator', value: 'Carey Mulligan', icon: 'microphone' },
    { key: 'Release Date', value: 'August 13, 2020', icon: 'calendar' },
    { key: 'Language', value: 'English', icon: 'subtitles' },
    { key: 'Publisher', value: 'Penguin Audio', icon: 'building' },
  ]

  let jellyConfig = {
    domain: jellyfinProvider.jellyfinDomain ?? '',
    accessToken: jellyfinProvider.jellyfinAccessToken ?? '',
    userId: jellyfinProvider.jellyfinUser?.Id
  };

  const handleDowloadTitleClick = async () => {
    setIsDownloading(true);
    await downloadTitle(db, jellyfinProvider.jellyfinDomain ?? '', jellyfinProvider.jellyfinAccessToken ?? '', jellyfinProvider.jellyfinUser?.Id, titleId as string)

    let playableRes = await getPlayableById(titleId as string, jellyConfig, db)
    setPlayable(playableRes);
    setIsDownloading(false);
    // when completed, update db download thingy
  };

  const loadTracksForTitle = async (startChapterIndex?: number) => {
    await TrackPlayer.reset();


    if (!startChapterIndex) {
      let duration = await fetchPlayerDuration(db, titleId as string);
      if (duration) {
        startChapterIndex = chapters.findIndex((chapter) => chapter.id == duration.chapter_id);
      } else {
        startChapterIndex = 0;
      }
    }

    for (const chapter of chapters.slice(startChapterIndex)) {
      // let track: Track = {
      //   id: chapter.Id,
      //   url: `${jellyfinProvider.jellyfinDomain}/Audio/${chapter.Id}/universal?TranscodingProtocol=hls&Container=m4b`,
      //   headers: {
      //     'Authorization': `MediaBrowser Token="${jellyfinProvider.jellyfinAccessToken}"`
      //   },
      //   title: chapter.Name,
      //   artist: chapter.AlbumArtist,
      //   // type: TrackType.HLS,
      //   pitchAlgorithm: PitchAlgorithm.Voice,
      //   duration: runTimeTicksToDuration(chapter.RunTimeTicks),
      //   parentItemId: titleId,
      // };
      //
      let track = chapter.toTrack();
      await TrackPlayer.add(track);
    }

    await setAppOption(db, "new_title_loaded", "true");
    dispatch(setActiveTitle({ name: playable?.name, imagePath: playable?.imagePath }))
    router.navigate("/player");
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      title: playable?.name
    })
  }, [navigation, playable]);

  useEffect(() => {
    (async () => {
      let playableRes = await getPlayableById(titleId as string, jellyConfig, db)
      setPlayable(playableRes);

      if (playableRes) {
        let chapters = await fetchChildrenPlayables(playableRes, db, jellyConfig);
        setChapters(chapters);
      }
    })().then(() => { });
  }, []);

  return (
    <ScrollView>
      <View style={styles.container}>
        <Image source={playable?.imagePath} style={{ width: 335, height: 335, borderRadius: 10, margin: 'auto' }} />
        <View style={styles.metaContainer}>
          <View>
            <Text style={styles.titleText}>{playable?.name}</Text>
            <Text style={styles.authorText}>Eric Metaxas</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 24, marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <FontAwesome6Pro name="star" iconStyle="solid" size={12} color={'#FACC15'} />
                <Text style={{ fontFamily: 'Inter_500Medium', color: PALETTE.textWhite }}>4.8</Text>
                <Text style={{ fontFamily: 'Inter_400Regular', color: PALETTE.textOffWhite }}>(12.4k)</Text>
              </View>
              <Text style={{ fontFamily: 'Inter_400Regular', color: PALETTE.textOffWhite }}>8h 32m</Text>
            </View>
            <View style={{ flexDirection: 'row', marginBottom: 12, gap: 6, justifyContent: 'center' }}>
              {['Fiction', 'Fantasy', 'Philosophy'].map((item, index) => (
                <View style={{ backgroundColor: 'rgba(108, 92, 231, .2)', borderRadius: 40, paddingHorizontal: 8 }} key={index}>
                  <Text style={{ fontFamily: 'Inter_300Light', color: PALETTE.primary, textAlign: 'center' }}>{item}</Text>
                </View>
              ))}
            </View>
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={[styles.buttonRoot, styles.playTitleButton]} onPress={() => loadTracksForTitle()}>
              <FontAwesome6Pro name="play" iconStyle="solid" size={15} color={PALETTE.text} />
              <Text style={styles.playTitleButtonText}>Play Now</Text>
            </TouchableOpacity>
            {playable?.isDownloaded() && !isDownloading ? (
              <TouchableOpacity style={[styles.buttonRoot, styles.downloadButton]} onPress={() => { }}>
                <FontAwesome6Pro name="file-slash" iconStyle="solid" size={15} color={PALETTE.primary} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={[styles.buttonRoot, styles.downloadButton]} onPress={handleDowloadTitleClick}>
                <FontAwesome6Pro name="download" iconStyle="duotone" size={15} color={PALETTE.primary} />
              </TouchableOpacity>
            )}
            {isDownloading && (
              <TouchableOpacity style={[styles.buttonRoot, styles.downloadButton]} onPress={() => { }}>
                <Animated.View style={{ transform: [{ rotate: spin }] }}>
                  <FontAwesome6Pro name="loader" style={{}} iconStyle="duotone" size={15} color={PALETTE.primary} />
                </Animated.View>
              </TouchableOpacity>
            )}
          </View>
          <View style={{ backgroundColor: PALETTE.backgroundLight, borderRadius: 10, padding: 12, marginBottom: 24 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: PALETTE.textOffWhite, fontFamily: 'Inter_500Medium', fontSize: 15 }}>Your Progress</Text>
              <Text style={{ color: PALETTE.primary, fontFamily: 'Inter_500Medium', fontSize: 15 }}>42%</Text>
            </View>
            <View>
              <Slider
                style={{ width: '100%', height: 55 }}
                minimumValue={0}
                maximumValue={100}
                value={45}
                minimumTrackTintColor={PALETTE.primary}
                maximumTrackTintColor={PALETTE.background}
              />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: PALETTE.textOffWhite, fontFamily: 'Inter_400Regular', fontSize: 12 }}>3h 36m completed</Text>
              <Text style={{ color: PALETTE.textOffWhite, fontFamily: 'Inter_400Regular', fontSize: 12 }}>4h 56m remaining</Text>
            </View>
          </View>
        </View>
        <View style={styles.additionalSectionContainer}>
          <View style={styles.additionalSectionHeader}>
            <Text style={styles.titleSectionHeader}>About This Book</Text>
          </View>
          <View style={styles.aboutBookTextContainer}>
            <Text style={styles.aboutBookText}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec vitae varius enim, at efficitur lacus. Fusce luctus faucibus ligula, id condimentum...
            </Text>
            <TouchableOpacity>
              <Text style={{ fontFamily: 'Inter_500Medium', color: PALETTE.primary }}>Read More</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.additionalSectionContainer}>
          <View style={styles.additionalSectionHeader}>
            <Text style={styles.titleSectionHeader}>Book Information</Text>
          </View>
          <View style={styles.bookInfoContainer}>
            {bookInformation.map((item, index) => (
              <Fragment key={index}>
                <View style={styles.bookInfoEntry} key={index}>
                  <View style={{ backgroundColor: 'rgba(108, 92, 231, .2)', width: 40, height: 40, borderRadius: '100%', alignItems: 'center', justifyContent: 'center' }}>
                    <FontAwesome6Pro name={item.icon as any} iconStyle="solid" size={20} color={PALETTE.primary} />
                  </View>
                  <View style={{ width: '100%' }}>
                    <Text style={{ color: PALETTE.textOffWhite, fontFamily: 'Inter_400Regular', width: '100%', flex: 1 }}>{item.key}</Text>
                    <Text style={{ color: PALETTE.textWhite, fontFamily: 'Inter_500Medium', width: '100%' }}>{item.value}</Text>
                  </View>
                </View>
                {index != bookInformation.length - 1 && (<View style={{ width: '95%', height: 1, marginVertical: 16, backgroundColor: '#252530', marginHorizontal: 'auto' }}></View>)}
              </Fragment>
            ))}
          </View>
        </View>
        <View style={styles.additionalSectionContainer}>
          <View style={styles.additionalSectionHeader}>
            <Text style={styles.titleSectionHeader}>Chapters</Text>
            <Text style={styles.chaptersFeatureChapterCount}>{chapters.length} Chapters</Text>
          </View>
          <View style={styles.chaptersContainer}>
            {chapters.slice(0, 5).map((chapter, index) => (
              <View style={styles.chapterContainer} key={index}>
                <View style={{ width: 40, height: 40, backgroundColor: PALETTE.background, borderRadius: 10, justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ color: PALETTE.textOffWhite, fontSize: 18, fontFamily: 'Inter_400Regular' }}>{index + 1}</Text>
                </View>
                <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 12, alignItems: 'center' }}>
                  <View style={{ maxWidth: '75%' }}>
                    <Text style={{ fontFamily: 'Inter_400Regular', color: PALETTE.textWhite, fontSize: 14, wordWrap: 'break-word' }} numberOfLines={2}>{chapter.name}</Text>
                    <Text style={{ fontFamily: 'Inter_300Light', color: PALETTE.textOffWhite, }}>{formatAudioProgressTime(chapter.getDuration())}</Text>
                  </View>
                  <TouchableOpacity>
                    <FontAwesome6Pro name='ellipsis-vertical' iconStyle="solid" size={20} color={PALETTE.textWhite} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            <TouchableOpacity style={{ width: '100%', justifyContent: 'center', alignItems: 'center', padding: 16 }}>
              <Text style={{ fontFamily: 'Inter_400Regular', color: PALETTE.primary, fontSize: 14 }}>View All Chapters</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.additionalSectionContainer}>
          <View style={styles.additionalSectionHeader}>
            <Text style={styles.titleSectionHeader}>Reviews</Text>
            <TouchableOpacity>
              <Text style={{ fontFamily: 'Inter_400Regular', color: PALETTE.primary, fontSize: 14 }}>See All</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.additionalSectionContainer}>
          <View style={styles.additionalSectionHeader}>
            <Text style={styles.titleSectionHeader}>Similar Audiobooks</Text>
            <TouchableOpacity>
              <Text style={{ fontFamily: 'Inter_400Regular', color: PALETTE.primary, fontSize: 14 }}>See All</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  headerButton: {
    backgroundColor: 'rgba(107, 114, 128, .15)',
    backdropFilter: 'blur(10px)',
    borderRadius: '100%',
    width: 35,
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metaContainer: {
    justifyContent: 'center',
    paddingTop: 25,
    width: '100%'
    // alignItems: ''
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 12,
  },
  titleText: {
    color: PALETTE.textWhite,
    fontSize: 26,
    textAlign: 'center',
    fontFamily: 'Inter_700Bold',
    marginBottom: 12
  },
  authorText: {
    color: PALETTE.textOffWhite,
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 12
  },
  buttonRoot: {
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playTitleButton: {
    backgroundColor: 'linear-gradient(rgba(108, 92, 231, 1), rgba(108, 92, 231, .2))',
    paddingVertical: 12,
    flexDirection: 'row',
    gap: 8,
    flex: 1,
  },
  playTitleButtonText: {
    color: PALETTE.text,
    fontSize: 16,
  },
  downloadButton: {
    backgroundColor: PALETTE.backgroundLight,
  },
  downloadButtonText: {
    color: PALETTE.primary,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    margin: 20,
    backgroundColor: PALETTE.background,
    borderRadius: 20,
    paddingTop: 15,
    paddingHorizontal: 15,
    paddingBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  aboutBookTextContainer: {
    backgroundColor: PALETTE.backgroundLight,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 18,
  },
  aboutBookText: {
    color: PALETTE.textWhite,
    lineHeight: 22,
    marginBottom: 12
  },
  bookInfoContainer: {
    backgroundColor: PALETTE.backgroundLight,
    padding: 16,
    borderRadius: 10,
    width: '100%',
  },
  bookInfoEntry: {
    width: '100%',
    flexDirection: 'row',
    gap: 12,
  },
  additionalSectionContainer: {
    width: '100%',
    marginBottom: 24,
  },
  additionalSectionHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleSectionHeader: {
    color: PALETTE.textWhite,
    fontSize: 22,
    fontFamily: 'Inter_600SemiBold'
  },
  chaptersFeatureChapterCount: {
    color: PALETTE.textOffWhite,
  },
  chaptersContainer: {
    backgroundColor: PALETTE.backgroundLight,
    borderRadius: 10,
  },
  chapterContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#252530',
    flexDirection: 'row',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 15,
    width: '100%',
  },
  modalHeaderText: {
    color: PALETTE.text,
    fontSize: 18,
  },
});
