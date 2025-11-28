import { openDatabaseAsync } from "expo-sqlite";
import TrackPlayer, { Event, PlaybackActiveTrackChangedEvent, PlaybackProgressUpdatedEvent, PlaybackState, State } from "react-native-track-player";
import { createTitleDuration, fetchPlayerDuration, updateTitleDuration } from "./utils/db/db";
import { JellyfinBookProgressDb } from "./utils/db/schema";

export const PlaybackService = async () => {
  const db = await openDatabaseAsync('abp.db');
  let seekChangedDueToDuration = false;

  TrackPlayer.addEventListener(Event.RemotePlay, () => TrackPlayer.play());
  TrackPlayer.addEventListener(Event.RemotePause, () => TrackPlayer.pause());
  TrackPlayer.addEventListener(Event.RemoteNext, () => TrackPlayer.skipToNext());
  TrackPlayer.addEventListener(Event.RemotePrevious, () => TrackPlayer.skipToPrevious());
  TrackPlayer.addEventListener(Event.PlaybackState, async (event: PlaybackState) => {
    console.log("playback state event handler", event);
    let trackObject = await TrackPlayer.getActiveTrack();
    // Seek Changed Due to Duration prevents infinite loop
    if (trackObject && !seekChangedDueToDuration) {
      seekChangedDueToDuration = true;
      console.log(await db.getAllAsync('SELECT * FROM jellyfin_book_progress WHERE title_id = ?;', trackObject.parentItemId))

      let duration = await fetchPlayerDuration(db, trackObject.parentItemId);
      if (event.state == State.Ready && duration) {
        console.log("seeking", trackObject, duration);
        console.log("queue", await TrackPlayer.getQueue())
        await TrackPlayer.play();
        setTimeout(async () => {
          await TrackPlayer.seekTo(duration.position);
        }, 100);
      }
    }

    // 
    // Clean up Seek Changed Due to Duration
    if (seekChangedDueToDuration) { seekChangedDueToDuration = false; }
  });
  TrackPlayer.addEventListener(Event.PlaybackProgressUpdated, async (event: PlaybackProgressUpdatedEvent) => {
    let trackObject = await TrackPlayer.getTrack(event.track);
    let duration = await fetchPlayerDuration(db, trackObject?.parentItemId);

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
