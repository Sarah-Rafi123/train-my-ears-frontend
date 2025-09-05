// Audio file mapping utility to map backend URLs to local assets

// Guitar audio files
const guitarAudioFiles = {
  'a_major_guitar.mp3': require('../assets/audio/guitar/a_major_guitar_1748850439475.mp3'),
  'a_minor_guitar.mp3': require('../assets/audio/guitar/a_minor_guitar_1748850402648.mp3'),
  'b_major_guitar.mp3': require('../assets/audio/guitar/b_major_guitar.mp3'),
  'b_minor_guitar.mp3': require('../assets/audio/guitar/b_minor_guitar_1748851675661.mp3'),
  'c_major_guitar.mp3': require('../assets/audio/guitar/c_major_guitar_1748849870992.mp3'),
  'c_minor_guitar.mp3': require('../assets/audio/guitar/c_minor_guitar_1748851715190.mp3'),
  'd_major_guitar.mp3': require('../assets/audio/guitar/d_major_guitar_1748849912389.mp3'),
  'd_minor_guitar.mp3': require('../assets/audio/guitar/d_minor_guitar_1748850542890.mp3'),
  'e_major_guitar.mp3': require('../assets/audio/guitar/e_major_guitar_1748850467190.mp3'),
  'e_minor_guitar.mp3': require('../assets/audio/guitar/e_minor_guitar_1748850362400.mp3'),
  'f_major_guitar.mp3': require('../assets/audio/guitar/f_major_guitar_1748850600510.mp3'),
  'f_minor_guitar.mp3': require('../assets/audio/guitar/f_minor_guitar.mp3'),
  'g_major_guitar.mp3': require('../assets/audio/guitar/g_major_guitar_1748849842782.mp3'),
  'g_minor_guitar.mp3': require('../assets/audio/guitar/g_minor_guitar_1748851742689.mp3'),
};

// Piano audio files  
const pianoAudioFiles = {
  'a_major_piano.mp3': require('../assets/audio/piano/a_major_piano_1748852260801.mp3'),
  'a_minor_piano.mp3': require('../assets/audio/piano/a_minor_piano_1748852002841.mp3'),
  'b_major_piano.mp3': require('../assets/audio/piano/b_major_piano_1748852396745.mp3'),
  'b_minor_piano.mp3': require('../assets/audio/piano/b_minor_piano_1748852337929.mp3'),
  'c_major_piano.mp3': require('../assets/audio/piano/c_major_piano_1748851928355.mp3'),
  'c_minor_piano.mp3': require('../assets/audio/piano/c_minor_piano_1748852294041.mp3'),
  'd_major_piano.mp3': require('../assets/audio/piano/d_major_piano_1748852230412.mp3'),
  'd_minor_piano.mp3': require('../assets/audio/piano/d_minor_piano_1748852191635.mp3'),
  'e_major_piano.mp3': require('../assets/audio/piano/e_major_piano.mp3'),
  'e_minor_piano.mp3': require('../assets/audio/piano/e_minor_piano_1748852144102.mp3'),
  'f_major_piano.mp3': require('../assets/audio/piano/f_major_piano_1748852033438.mp3'), // Original file - testing if still corrupted
  'f_minor_piano.mp3': require('../assets/audio/piano/f_minor_piano_1748852367097.mp3'),
  'g_major_piano.mp3': require('../assets/audio/piano/g_major_piano_1748852092913.mp3'),
};

/**
 * Gets a local audio asset based on chord name and instrument
 * @param chordName Chord name like "g major", "c minor", etc.
 * @param instrumentName Instrument name like "guitar" or "piano"
 * @returns Local audio asset that can be played by Expo AV
 */
export function getAudioAssetForChord(chordName: string, instrumentName: string): any {
  console.log('🎵 [AudioMapping] Getting audio for chord:', chordName, 'instrument:', instrumentName);
  
  // Normalize chord name: "g major" -> "g_major"
  const normalizedChordName = chordName.toLowerCase().replace(/\s+/g, '_');
  
  // Build filename: "g_major_guitar.mp3" or "g_major_piano.mp3"
  const fileName = `${normalizedChordName}_${instrumentName.toLowerCase()}.mp3`;
  
  console.log('🎵 [AudioMapping] Looking for filename:', fileName);
  
  // Check if it's a guitar audio file
  if (instrumentName.toLowerCase() === 'guitar' && guitarAudioFiles[fileName as keyof typeof guitarAudioFiles]) {
    const asset = guitarAudioFiles[fileName as keyof typeof guitarAudioFiles];
    console.log('🎸 [AudioMapping] Found guitar audio asset for:', fileName);
    return asset;
  }
  
  // Check if it's a piano audio file  
  if (instrumentName.toLowerCase() === 'piano' && pianoAudioFiles[fileName as keyof typeof pianoAudioFiles]) {
    const asset = pianoAudioFiles[fileName as keyof typeof pianoAudioFiles];
    console.log('🎹 [AudioMapping] Found piano audio asset for:', fileName);
    return asset;
  }
  
  console.error('❌ [AudioMapping] No local audio asset found for:', fileName);
  console.error('❌ [AudioMapping] Available guitar files:', Object.keys(guitarAudioFiles));
  console.error('❌ [AudioMapping] Available piano files:', Object.keys(pianoAudioFiles));
  
  return null;
}

/**
 * Maps a backend audio file URL to a local audio asset (legacy function - kept for compatibility)
 * @param audioFileUrl Backend URL like "/uploads/audio/guitar/g_major_guitar.mp3"
 * @returns Local audio asset that can be played by Expo AV
 */
export function mapAudioUrlToLocalAsset(audioFileUrl: string): any {
  console.log('🎵 [AudioMapping] Legacy URL mapping for:', audioFileUrl);
  
  // Extract filename from URL
  const fileName = audioFileUrl.split('/').pop();
  
  if (!fileName) {
    console.error('❌ [AudioMapping] Could not extract filename from URL:', audioFileUrl);
    return null;
  }
  
  console.log('🎵 [AudioMapping] Extracted filename:', fileName);
  
  // Check if it's a guitar audio file
  if (guitarAudioFiles[fileName as keyof typeof guitarAudioFiles]) {
    const asset = guitarAudioFiles[fileName as keyof typeof guitarAudioFiles];
    console.log('🎸 [AudioMapping] Found guitar audio asset for:', fileName);
    return asset;
  }
  
  // Check if it's a piano audio file  
  if (pianoAudioFiles[fileName as keyof typeof pianoAudioFiles]) {
    const asset = pianoAudioFiles[fileName as keyof typeof pianoAudioFiles];
    console.log('🎹 [AudioMapping] Found piano audio asset for:', fileName);
    return asset;
  }
  
  console.error('❌ [AudioMapping] No local audio asset found for:', fileName);
  console.error('❌ [AudioMapping] Available guitar files:', Object.keys(guitarAudioFiles));
  console.error('❌ [AudioMapping] Available piano files:', Object.keys(pianoAudioFiles));
  
  return null;
}

/**
 * Checks if an audio file URL can be mapped to a local asset
 * @param audioFileUrl Backend URL like "/uploads/audio/guitar/g_major_guitar.mp3"
 * @returns true if local asset exists, false otherwise
 */
export function hasLocalAudioAsset(audioFileUrl: string): boolean {
  const fileName = audioFileUrl.split('/').pop();
  
  if (!fileName) {
    return false;
  }
  
  return !!(guitarAudioFiles[fileName as keyof typeof guitarAudioFiles] || 
           pianoAudioFiles[fileName as keyof typeof pianoAudioFiles]);
}