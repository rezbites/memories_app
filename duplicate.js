// utils/duplicateFilter.js
import * as ImageManipulator from 'expo-image-manipulator';
import { differenceInMinutes } from 'date-fns';

export class DuplicateFilter {
  static async filterDuplicates(mediaItems) {
    const filtered = [];
    const processed = new Set();

    // Sort by creation time
    const sortedItems = [...mediaItems].sort((a, b) => 
      new Date(a.creationTime) - new Date(b.creationTime)
    );

    for (let i = 0; i < sortedItems.length; i++) {
      const currentItem = sortedItems[i];
      
      if (processed.has(currentItem.id)) continue;
      
      let isDuplicate = false;
      
      // Compare with next few items within a time window
      for (let j = i + 1; j < sortedItems.length; j++) {
        const nextItem = sortedItems[j];
        
        // Only compare items within 5 minutes of each other
        if (differenceInMinutes(
          new Date(nextItem.creationTime),
          new Date(currentItem.creationTime)
        ) > 5) break;
        
        if (await this.areMediaItemsSimilar(currentItem, nextItem)) {
          isDuplicate = true;
          processed.add(nextItem.id);
        }
      }
      
      if (!isDuplicate) {
        filtered.push(currentItem);
      }
      processed.add(currentItem.id);
    }
    
    return filtered;
  }
  
  static async areMediaItemsSimilar(item1, item2) {
    // If different media types, they're not duplicates
    if (item1.mediaType !== item2.mediaType) return false;
    
    // For videos, compare duration and creation time
    if (item1.mediaType === 'video') {
      return Math.abs(item1.duration - item2.duration) < 1 && // Within 1 second
        differenceInMinutes(
          new Date(item1.creationTime),
          new Date(item2.creationTime)
        ) < 5; // Within 5 minutes
    }
    
    // For images, compare visual similarity
    try {
      // Resize images to smaller size for faster comparison
      const [resized1, resized2] = await Promise.all([
        ImageManipulator.manipulateAsync(
          item1.uri,
          [{ resize: { width: 32, height: 32 } }],
          { format: 'png' }
        ),
        ImageManipulator.manipulateAsync(
          item2.uri,
          [{ resize: { width: 32, height: 32 } }],
          { format: 'png' }
        )
      ]);
      
      // Calculate average hash or simple pixel comparison
      return this.compareImageData(resized1, resized2);
    } catch (error) {
      console.error('Error comparing images:', error);
      return false;
    }
  }
  
  static async compareImageData(img1, img2) {
    // Simple pixel comparison (in real app, use more sophisticated image hashing)
    // This is a placeholder implementation
    try {
      // Compare image dimensions
      if (img1.width !== img2.width || img1.height !== img2.height) {
        return false;
      }
      
      // In a real implementation, you would:
      // 1. Convert images to grayscale
      // 2. Calculate perceptual hash (pHash) or average hash
      // 3. Compare hash values
      
      return true; // Placeholder return
    } catch (error) {
      console.error('Error in image comparison:', error);
      return false;
    }
  }
}

// Implementation in GalleryScreen
const handleMediaSelection = async (selectedItems) => {
  try {
    // Filter out duplicates from selected items
    const uniqueMedia = await DuplicateFilter.filterDuplicates(selectedItems);
    setSelectedMedia(uniqueMedia);
    
    // Navigate to preview with filtered media
    navigation.navigate('Preview', { selectedMedia: uniqueMedia });
  } catch (error) {
    console.error('Error filtering duplicates:', error);
    Alert.alert('Error', 'Failed to process media selection');
  }
};