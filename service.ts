import { openDatabaseAsync } from "expo-sqlite";
import TrackPlayer, { Event, PlaybackActiveTrackChangedEvent, PlaybackProgressUpdatedEvent, PlaybackState, State } from "react-native-track-player";
import { createTitleDuration, fetchPlayerDuration, getAppOption, getOrCreateDatabaseKey, setAppOption, updateTitleDuration } from "./utils/db/db";
import { JellyfinBookProgressDb } from "./utils/db/schema";

enum DURATION_POSITION_ENUM {
  UNSET,
  SET_CORRECT_TRACK,
  SET_CORRECT_POSITION,
}

export const PlaybackService = async () => {
  const db = await openDatabaseAsync('abp_secure.db', {
    useNewConnection: true
  });
  await db.execAsync(`PRAGMA key = '${await getOrCreateDatabaseKey()}'`)

  TrackPlayer.addEventListener(Event.RemotePlay, () => TrackPlayer.play());
  TrackPlayer.addEventListener(Event.RemotePause, () => TrackPlayer.pause());
  TrackPlayer.addEventListener(Event.RemoteNext, () => TrackPlayer.skipToNext());
  TrackPlayer.addEventListener(Event.RemotePrevious, () => TrackPlayer.skipToPrevious());
  TrackPlayer.addEventListener(Event.PlaybackState, async (event: PlaybackState) => {
    let newTitleLoaded = await getAppOption(db, 'new_title_loaded');
    let queue = await TrackPlayer.getQueue();

    // Seek Changed Due to Duration prevents infinite loop
    if (queue && queue.length > 0) {
      if (newTitleLoaded && newTitleLoaded.option_value === 'true') {
        let duration = await fetchPlayerDuration(db, queue[0].parentItemId);
        let activeIndex = queue.findIndex((queueTrack) => (queueTrack.id == duration?.chapter_id));

        await TrackPlayer.skip(activeIndex != -1 ? activeIndex : 0, duration?.position);
        await setAppOption(db, "new_title_loaded", "false");
      }
    }

    // 
    // Clean up Seek Changed Due to Duration
    // if (seekChangedDueToDuration) { seekChangedDueToDuration = false; }
  });
  TrackPlayer.addEventListener(Event.PlaybackProgressUpdated, async (event: PlaybackProgressUpdatedEvent) => {
    let trackObject = await TrackPlayer.getTrack(event.track);
    let duration = await fetchPlayerDuration(db, trackObject?.parentItemId);


    let sleepTimerResult = await getAppOption(db, 'sleep_timer');
    if (sleepTimerResult && sleepTimerResult.option_value) {
      let currentDate = new Date();

      if (currentDate.getTime() >= parseInt(sleepTimerResult.option_value)) {
        await TrackPlayer.pause();
        await setAppOption(db, "sleep_timer", "");
      }
    }

    if (!duration) {
      await createTitleDuration(db, {
        position: Math.floor(event.position),
        title_id: trackObject?.parentItemId,
        chapter_id: trackObject?.id,
      });
      return;
    }

    await updateTitleDuration(db, duration.id!, trackObject?.id, Math.floor(event.position));
  });
};
