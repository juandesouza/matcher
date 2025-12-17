export interface User {
  id: string;
  name: string;
  age: number;
  gender: string;
  bio: string;
  photos: string[];
  location?: {
    lat: number;
    lng: number;
  };
  isSubscribed?: boolean;
}

export interface Match {
  id: string;
  user: User;
  createdAt: string;
}

export interface Message {
  id: string;
  content: string;
  type: string;
  isOwn: boolean;
  timestamp: string;
}

export interface Chat {
  id: string;
  matchId: string;
  userId1: string;
  userId2: string;
  messages: Message[];
  updatedAt: string;
}

export interface Settings {
  ageRangeMin: number;
  ageRangeMax: number;
  distanceRange: number;
  locale: string;
  theme: 'light' | 'dark';
  isSubscribed: boolean;
}
