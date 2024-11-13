// utils/videoCompiler.js
import { FFmpegKit } from 'ffmpeg-kit-react-native';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';

export class VideoCompiler {
  static async compileVideo(mediaItems, options = {}) {
    const {
      duration = 30,
      outputPath = `${FileSystem.documentDirectory}output.mp4`,
      music,
    } = options;

    try {
      // Create temporary directory for processed media
      const tempDir = `${FileSystem.cacheDirectory}temp/`;
      await FileSystem.makeDirectoryAsync(tempDir, { intermediates: true });

      // Process all media items (resize, convert to compatible format)
      const processedMedia = await Promise.all(
        mediaItems.map((item, index) => this.processMediaItem(item, tempDir, index))
      );

      // Calculate duration for each clip
      const clipDuration = duration / mediaItems.length;

      // Create FFmpeg command for concatenating media
      const command = await this.buildFFmpegCommand(
        processedMedia,
        clipDuration,
        outputPath,
        music
      );

      // Execute FFmpeg command
      const result = await FFmpegKit.execute(command);
      
      // Clean up temporary files
      await FileSystem.deleteAsync(tempDir, { idempotent: true });

      if (await result.getReturnCode() === 0) {
        return outputPath;
      } else {
        throw new Error('Video compilation failed');
      }
    } catch (error) {
      console.error('Error compiling video:', error);
      throw error;
    }
  }

  static async processMediaItem(item, tempDir, index) {
    const outputPath = `${tempDir}processed_${index}.mp4`;

    if (item.mediaType === 'video') {
      // Trim video to desired length and ensure compatible format
      await FFmpegKit.execute(`-i ${item.uri} -c:v libx264 -c:a aac -strict experimental -t 5 ${outputPath}`);
    } else {
      // Convert image to video clip with transition effect
      const resizedImage = await ImageManipulator.manipulateAsync(
        item.uri,
        [{ resize: { width: 1280, height: 720 } }],
        { format: 'jpeg' }
      );

      await FFmpegKit.execute(
        `-loop 1 -i ${resizedImage.uri} -c:v libx264 -t 5 -pix_fmt yuv420p -vf "scale=1280:720" ${outputPath}`
      );
    }

    return outputPath;
  }

  static async buildFFmpegCommand(processedMedia, clipDuration, outputPath, music) {
    // Create filter complex command for transitions and effects
    const filterComplex = processedMedia
      .map((path, i) => `[${i}:v]`)
      .join('');

    let command = processedMedia
      .map((path) => `-i "${path}"`)
      .join(' ');

    if (music) {
      command += ` -i "${music}"`;
    }

    command += ` -filter_complex "${filterComplex}concat=n=${processedMedia.length}:v=1:a=0[outv]" -map "[outv]"`;

    if (music) {
      command += ` -map ${processedMedia.length}:a`;
    }

    command += ` -preset ultrafast -c:v libx264 -c:a aac -strict experimental "${outputPath}"`;

    return command;
  }
}

