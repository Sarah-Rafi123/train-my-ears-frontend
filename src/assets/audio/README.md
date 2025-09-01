# Audio Files Migration Guide

## Overview
This directory contains the frontend audio assets that replace the backend audio file serving system. The files here exactly match your backend file naming conventions for seamless integration.

## File Structure

### Guitar Chords
```
src/assets/audio/guitar/
├── a_major_guitar_1748850439475.mp3
├── a_minor_guitar_1748850402648.mp3
├── b_major_guitar.mp3
├── b_minor_guitar_1748850643840.mp3
├── c_major_guitar_1748849870992.mp3
├── c_minor_guitar_1748851715190.mp3
├── d_major_guitar_1748849912389.mp3
├── d_minor_guitar_1748850542890.mp3
├── e_major_guitar_1748850467190.mp3
├── e_minor_guitar_1748850362400.mp3
├── f_major_guitar_1748850600510.mp3
├── f_minor_guitar.mp3
├── g_major_guitar_1748849842782.mp3
└── g_minor_guitar_1748851742689.mp3
```

### Piano Chords
```
src/assets/audio/piano/
├── a_major_piano_1748852260801.mp3
├── a_minor_piano_1748852002841.mp3
├── b_major_piano_1748852396745.mp3
├── b_minor_piano_1748852337929.mp3
├── c_major_piano_1748851928355.mp3
├── c_minor_piano_1748852294041.mp3
├── d_major_piano_1748852230412.mp3
├── d_minor_piano_1748852191635.mp3
├── e_major_piano.mp3
├── e_minor_piano_1748852144102.mp3
├── f_major_piano_1748852033438.mp3
├── f_minor_piano_1748852367097.mp3
└── g_major_piano_1748852092913.mp3
```

## Migration Steps

### Step 1: Copy Backend Audio Files
Copy your backend audio files from:
```
backend/uploads/audio/guitar/* → src/assets/audio/guitar/
backend/uploads/audio/piano/* → src/assets/audio/piano/
```

### Step 2: Replace Placeholder Files
The current files are empty placeholders. Replace them with your actual audio files while keeping the same file names.

### Step 3: Verify Integration
After copying the files, the app will automatically:
- Use local audio files instead of making API requests
- Maintain the same chord naming conventions as your backend
- Provide instant audio playback without network delays

## Benefits
- **Faster Loading**: No network requests for audio files
- **Offline Support**: Audio works without internet connection
- **Reduced Server Load**: No more audio file serving from backend
- **Better UX**: Instant chord playback

## Technical Details
- The `audioMap.tsx` file contains the mapping between chord names and file paths
- The `chordsApi.tsx` automatically uses local files when available
- Fallback to backend URLs if local files are missing
- Supports both guitar and piano with proper instrument ID mapping