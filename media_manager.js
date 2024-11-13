import * as MediaLibrary from 'expo-media-library';
import { DuplicateFilter } from './duplicatefilter';

class MediaItem {
  constructor(id, uri, mediaType, creationTime, duration) {
    this.id = id;
    this.uri = uri;
    this.mediaType = mediaType;
    this.creationTime = creationTime;
    this.duration = duration;
  }
}

export class MediaManager {
  constructor() {
    this.media = [];
    this.selectedMedia = [];
  }

  async loadMedia() {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Media library access not granted');
      }

      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

      const { assets } = await MediaLibrary.getAssetsAsync({
        mediaType: ['photo', 'video'],
        createdAfter: oneMonthAgo.getTime(),
        first: 100,
        sortBy: ['creationTime'],
      });

      this.media = assets.map((asset) => new MediaItem(
        asset.id,
        asset.uri,
        asset.mediaType,
        asset.creationTime,
        asset.duration
      ));

      this.media = await DuplicateFilter.filterDuplicates(this.media);
    } catch (error) {
      console.error('Error loading media:', error);
      throw error;
    }
  }

  toggleMediaSelection(mediaItem) {
    const index = this.selectedMedia.findIndex((item) => item.id === mediaItem.id);
    if (index === -1) {
      this.selectedMedia.push(mediaItem);
    } else {
      this.selectedMedia.splice(index, 1);
    }
  }

  getSelectedMedia() {
    return this.selectedMedia;
  }
}