// Audio file mappings for local chord sounds
// This maps chord names to their local audio file paths

export interface AudioMapping {
  [instrumentId: string]: {
    [levelId: string]: {
      [chordName: string]: any // require() path
    }
  }
}

export const audioMap: AudioMapping = {
  // Guitar chord mappings - matching your backend fileNameMap
  'cmdh5ji090002ta0boucdg1dd': { // Guitar ID from your app
    '1': {
      'c major': require('./guitar/c_major_guitar_1748849870992.mp3'),
      'd major': require('./guitar/d_major_guitar_1748849912389.mp3'),
      'g major': require('./guitar/g_major_guitar_1748849842782.mp3'),
    },
    '2': {
      'c major': require('./guitar/c_major_guitar_1748849870992.mp3'),
      'd major': require('./guitar/d_major_guitar_1748849912389.mp3'),
      'g major': require('./guitar/g_major_guitar_1748849842782.mp3'),
      'a minor': require('./guitar/a_minor_guitar_1748850402648.mp3'),
      'b minor': require('./guitar/b_minor_guitar_1748850643840.mp3'),
      'e minor': require('./guitar/e_minor_guitar_1748850362400.mp3'),
    },
    '3': {
      'd minor': require('./guitar/d_minor_guitar_1748850542890.mp3'),
      'f major': require('./guitar/f_major_guitar_1748850600510.mp3'),
      'a major': require('./guitar/a_major_guitar_1748850439475.mp3'),
      'c major': require('./guitar/c_major_guitar_1748849870992.mp3'),
      'd major': require('./guitar/d_major_guitar_1748849912389.mp3'),
      'g major': require('./guitar/g_major_guitar_1748849842782.mp3'),
      'a minor': require('./guitar/a_minor_guitar_1748850402648.mp3'),
      'b minor': require('./guitar/b_minor_guitar_1748850643840.mp3'),
      'e minor': require('./guitar/e_minor_guitar_1748850362400.mp3'),
    },
    '4': {
      'd minor': require('./guitar/d_minor_guitar_1748850542890.mp3'),
      'f major': require('./guitar/f_major_guitar_1748850600510.mp3'),
      'a major': require('./guitar/a_major_guitar_1748850439475.mp3'),
      'c major': require('./guitar/c_major_guitar_1748849870992.mp3'),
      'd major': require('./guitar/d_major_guitar_1748849912389.mp3'),
      'g major': require('./guitar/g_major_guitar_1748849842782.mp3'),
      'a minor': require('./guitar/a_minor_guitar_1748850402648.mp3'),
      'b minor': require('./guitar/b_minor_guitar_1748850643840.mp3'),
      'e minor': require('./guitar/e_minor_guitar_1748850362400.mp3'),
      'e major': require('./guitar/e_major_guitar_1748850467190.mp3'),
      'b major': require('./guitar/b_major_guitar.mp3'),
      'f minor': require('./guitar/f_minor_guitar.mp3'),
      'c minor': require('./guitar/c_minor_guitar_1748851715190.mp3'),
      'g minor': require('./guitar/g_minor_guitar_1748851742689.mp3'),
    }
  },
  // Piano chord mappings - matching your backend fileNameMap
  'cmdh5jjpq0003ta0bpxoplgsi': { // Piano ID from your app
    '1': {
      'c major': require('./piano/c_major_piano_1748851928355.mp3'),
      'd major': require('./piano/d_major_piano_1748852230412.mp3'),
      'g major': require('./piano/g_major_piano_1748852092913.mp3'),
    },
    '2': {
      'c major': require('./piano/c_major_piano_1748851928355.mp3'),
      'd major': require('./piano/d_major_piano_1748852230412.mp3'),
      'g major': require('./piano/g_major_piano_1748852092913.mp3'),
      'a minor': require('./piano/a_minor_piano_1748852002841.mp3'),
      'b minor': require('./piano/b_minor_piano_1748852337929.mp3'),
      'e minor': require('./piano/e_minor_piano_1748852144102.mp3'),
    },
    '3': {
      'd minor': require('./piano/d_minor_piano_1748852191635.mp3'),
      'f major': require('./piano/f_major_piano_1748852033438.mp3'), // Original file - testing if still corrupted
      'a major': require('./piano/a_major_piano_1748852260801.mp3'),
      'c major': require('./piano/c_major_piano_1748851928355.mp3'),
      'd major': require('./piano/d_major_piano_1748852230412.mp3'),
      'g major': require('./piano/g_major_piano_1748852092913.mp3'),
      'a minor': require('./piano/a_minor_piano_1748852002841.mp3'),
      'b minor': require('./piano/b_minor_piano_1748852337929.mp3'),
      'e minor': require('./piano/e_minor_piano_1748852144102.mp3'),
    },
    '4': {
      'd minor': require('./piano/d_minor_piano_1748852191635.mp3'),
      'f major': require('./piano/f_major_piano_1748852033438.mp3'), // Original file - testing if still corrupted
      'a major': require('./piano/a_major_piano_1748852260801.mp3'),
      'c major': require('./piano/c_major_piano_1748851928355.mp3'),
      'd major': require('./piano/d_major_piano_1748852230412.mp3'),
      'g major': require('./piano/g_major_piano_1748852092913.mp3'),
      'a minor': require('./piano/a_minor_piano_1748852002841.mp3'),
      'b minor': require('./piano/b_minor_piano_1748852337929.mp3'),
      'e minor': require('./piano/e_minor_piano_1748852144102.mp3'),
      'e major': require('./piano/e_major_piano.mp3'),
      'b major': require('./piano/b_major_piano_1748852396745.mp3'),
      'f minor': require('./piano/f_minor_piano_1748852367097.mp3'),
      'c minor': require('./piano/c_minor_piano_1748852294041.mp3'),
    }
  }
}

// Helper function to get local audio file for a chord
export const getLocalAudioPath = (instrumentId: string, levelId: number, chordName: string) => {
  const instrument = audioMap[instrumentId]
  if (!instrument) return null
  
  const level = instrument[levelId.toString()]
  if (!level) return null
  
  return level[chordName] || null
}