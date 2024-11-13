// PreviewScreen.js
import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Video } from 'expo-av';
import { VideoCompiler } from '../utils/videoCompiler';

const PreviewScreen = ({ route }) => {
  const { selectedMedia } = route.params;
  const [compiledVideoUri, setCompiledVideoUri] = useState(null);
  const [isCompiling, setIsCompiling] = useState(false);

  const compileVideo = async () => {
    setIsCompiling(true);
    try {
      const outputUri = await VideoCompiler.compileVideo(selectedMedia, {
        duration: 30,
        music: null, // Add music later
      });
      setCompiledVideoUri(outputUri);
    } catch (error) {
      console.error('Error compiling video:', error);
      Alert.alert('Error', 'Failed to compile video');
    } finally {
      setIsCompiling(false);
    }
  };

  return (
    <View style={styles.container}>
      {isCompiling ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : compiledVideoUri ? (
        <Video
          source={{ uri: compiledVideoUri }}
          style={styles.video}
          resizeMode="contain"
          shouldPlay
          isLooping
        />
      ) : (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  video: {
    width: '100%',
    height: '100%',
  },
});

export default PreviewScreen;