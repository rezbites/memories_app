// GalleryScreen.js
import React, { useState, useEffect } from 'react';
import { View, Image, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import { Camera } from 'lucide-react-native';

const GalleryScreen = ({ navigation }) => {
  const [media, setMedia] = useState([]);
  const [selectedMedia, setSelectedMedia] = useState([]);
  const [hasPermission, setHasPermission] = useState(null);

  useEffect(() => {
    (async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      setHasPermission(status === 'granted');
      
      if (status === 'granted') {
        loadMedia();
      }
    })();
  }, []);

  const loadMedia = async () => {
    try {
      // Get all photos and videos from the last month
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

      const { assets } = await MediaLibrary.getAssetsAsync({
        mediaType: ['photo', 'video'],
        createdAfter: oneMonthAgo.getTime(),
        first: 100, // Limit to 100 items for performance
        sortBy: ['creationTime'],
      });

      setMedia(assets);
    } catch (error) {
      console.error('Error loading media:', error);
    }
  };

  const toggleMediaSelection = (item) => {
    setSelectedMedia(prev => {
      const isSelected = prev.some(media => media.id === item.id);
      if (isSelected) {
        return prev.filter(media => media.id !== item.id);
      } else {
        return [...prev, item];
      }
    });
  };

  const renderMediaItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.mediaItem,
        selectedMedia.some(media => media.id === item.id) && styles.selectedItem
      ]}
      onPress={() => toggleMediaSelection(item)}
    >
      <Image
        source={{ uri: item.uri }}
        style={styles.thumbnail}
      />
      {item.mediaType === 'video' && (
        <View style={styles.videoIcon}>
          <Camera size={20} color="white" />
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={media}
        renderItem={renderMediaItem}
        keyExtractor={item => item.id}
        numColumns={3}
        contentContainerStyle={styles.gridContainer}
      />
      {selectedMedia.length > 0 && (
        <TouchableOpacity
          style={styles.nextButton}
          onPress={() => navigation.navigate('Preview', { selectedMedia })}
        >
          <Text style={styles.nextButtonText}>
            Next ({selectedMedia.length})
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  gridContainer: {
    padding: 2,
  },
  mediaItem: {
    flex: 1/3,
    margin: 1,
    aspectRatio: 1,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  selectedItem: {
    borderWidth: 3,
    borderColor: '#007AFF',
  },
  videoIcon: {
    position: 'absolute',
    right: 5,
    bottom: 5,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    padding: 4,
  },
  nextButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 25,
  },
  nextButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});

export default GalleryScreen;