export const SportTypes = [
    'Basketball',
    'Tennis',
    'Soccer',
    'Volleyball',
    'Badminton',
    'Running',
    'Cycling',
    'Swimming',
    'Hiking',
    'Golf',
    'Table Tennis',
    'Cricket',
    'Rugby',
    'Baseball',
    'Yoga',
    'Boxing',
    'Martial Arts',
    'Skiing',
    'Snowboarding',
    'Surfing',
    'Rock Climbing',
    'Weight Training',
    'CrossFit',
    'Pilates',
    'Dance',
    'Skateboarding',
    'Rowing',
    'Kayaking',
    'Archery',
    'Fencing',
    'Hockey',
    'Ice Hockey',
    'Handball',
    'Squash',
    'Triathlon',
    'Ultimate Frisbee',
    'Parkour',
    'Zumba',
    'Walking',
    'Sailing',
    'Bowling',
    'Climbing',
    'Gymnastics',
    'Judo',
    'Karate',
    'Kickboxing',
    'Lacrosse',
    'Marathon',
    'MMA',
    'Muay Thai',
    'Paddle Boarding',
    'Pole Dancing',
    'Racquetball',
    'Roller Skating',
    'Scuba Diving',
    'Snorkeling',
    'Softball',
    'Taekwondo',
    'Tai Chi',
    'Water Polo'
  ];
  
  export const ActivityTypes = {
    GAME: 'game',
    TRAINING: 'training',
    RUNNING: 'running',
    CYCLING: 'cycling',
    SWIMMING: 'swimming',
    HIKING: 'hiking',
    WORKOUT: 'workout',
    OTHER: 'other'
  };
  
  export const ActivityMetrics = {
    DISTANCE: 'distance',
    DURATION: 'duration',
    CALORIES: 'calories',
    STEPS: 'steps',
    PACE: 'pace',
    SPEED: 'speed',
    ELEVATION: 'elevation',
    HEART_RATE: 'heartRate',
    SCORE: 'score'
  };
  
  export const ActivityUnits = {
    DISTANCE: {
      KM: 'km',
      MI: 'mi',
      M: 'm'
    },
    DURATION: {
      HOUR: 'h',
      MINUTE: 'm',
      SECOND: 's'
    },
    SPEED: {
      KMH: 'km/h',
      MPH: 'mph',
      MS: 'm/s'
    },
    PACE: {
      MIN_KM: 'min/km',
      MIN_MI: 'min/mi'
    },
    ELEVATION: {
      M: 'm',
      FT: 'ft'
    },
    HEART_RATE: {
      BPM: 'bpm'
    },
    CALORIES: {
      KCAL: 'kcal'
    },
    STEPS: {
      COUNT: 'steps'
    }
  };
  
  export const ActivityStatus = {
    SCHEDULED: 'scheduled',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled'
  };
  
  export const ActivityVisibility = {
    PUBLIC: 'public',
    FRIENDS: 'friends',
    PRIVATE: 'private'
  };
  
  export const ActivityDifficulty = {
    EASY: 'easy',
    MODERATE: 'moderate',
    CHALLENGING: 'challenging',
    DIFFICULT: 'difficult',
    EXTREME: 'extreme'
  };
  
  export const TerrainTypes = {
    FLAT: 'flat',
    HILLY: 'hilly',
    MOUNTAINOUS: 'mountainous',
    MIXED: 'mixed',
    TRAIL: 'trail',
    ROAD: 'road',
    TRACK: 'track',
    BEACH: 'beach',
    INDOOR: 'indoor'
  };
  
  export const WeatherConditions = {
    SUNNY: 'sunny',
    CLOUDY: 'cloudy',
    RAINY: 'rainy',
    SNOWY: 'snowy',
    WINDY: 'windy',
    HOT: 'hot',
    COLD: 'cold',
    MODERATE: 'moderate'
  };
  
  export const ActivityIntensity = {
    LOW: 'low',
    MODERATE: 'moderate',
    HIGH: 'high',
    VERY_HIGH: 'very_high',
    MAXIMUM: 'maximum'
  };
  
  export const RunningTypes = {
    EASY_RUN: 'easy_run',
    TEMPO_RUN: 'tempo_run',
    INTERVAL: 'interval',
    LONG_RUN: 'long_run',
    RECOVERY_RUN: 'recovery_run',
    RACE: 'race',
    TRAIL_RUN: 'trail_run',
    TREADMILL: 'treadmill'
  };
  
  export const CyclingTypes = {
    ROAD: 'road',
    MOUNTAIN: 'mountain',
    GRAVEL: 'gravel',
    COMMUTE: 'commute',
    INDOOR: 'indoor',
    RACE: 'race',
    TOURING: 'touring'
  };
  
  export const SwimmingTypes = {
    POOL: 'pool',
    OPEN_WATER: 'open_water',
    INTERVAL: 'interval',
    TECHNIQUE: 'technique',
    RECOVERY: 'recovery'
  };
  
  export const HikingTypes = {
    DAY_HIKE: 'day_hike',
    BACKPACKING: 'backpacking',
    MOUNTAINEERING: 'mountaineering',
    TREKKING: 'trekking',
    SCRAMBLING: 'scrambling'
  };
  
  export const WorkoutTypes = {
    STRENGTH: 'strength',
    CARDIO: 'cardio',
    HIIT: 'hiit',
    CIRCUIT: 'circuit',
    FLEXIBILITY: 'flexibility',
    CROSSFIT: 'crossfit',
    BODYWEIGHT: 'bodyweight',
    FUNCTIONAL: 'functional'
  };