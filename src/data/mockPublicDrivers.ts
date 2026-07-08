export type PublicDriver = {
  id: string;
  name: string;
  username: string;
  avatar: string;
  online: boolean;
  distance: string;
  crew: string;
  stats: {
    followers: string;
    following: string;
    cars: string;
    events: string;
    reputation: string;
  };
  garage: {
    id: string;
    name: string;
    image: string;
    horsepower: string;
    stage: string;
  }[];
  photos: string[];
  activity: { id: string; label: string; meta: string; icon: string }[];
  achievements: { id: string; title: string; subtitle: string; icon: string }[];
};

export const publicDrivers: PublicDriver[] = [
  {
    id: 'r32',
    name: 'Kai Nakamura',
    username: '@kai.r32',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&q=80',
    online: true,
    distance: '1.2 km away',
    crew: 'Midnight Society',
    stats: { followers: '12.4K', following: '486', cars: '3', events: '28', reputation: '4.9' },
    garage: [
      { id: 'r32-gtr', name: 'Nissan Skyline R32', image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=900&q=85', horsepower: '420 HP', stage: 'Stage 2' },
      { id: 's15', name: 'Nissan Silvia S15', image: 'https://images.unsplash.com/photo-1603386329225-868f9b1ee6c9?auto=format&fit=crop&w=900&q=85', horsepower: '390 HP', stage: 'Street' },
      { id: 'evo', name: 'Lancer Evo IX', image: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&w=900&q=85', horsepower: '510 HP', stage: 'Track' },
    ],
    photos: [
      'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=500&q=80',
    ],
    activity: [
      { id: 'night-run', label: 'Joined Night Run', meta: '18 min ago', icon: 'flag' },
      { id: 'new-car', label: 'Uploaded new car', meta: 'Yesterday', icon: 'car-sport' },
      { id: 'crew', label: 'Joined Crew', meta: '3 days ago', icon: 'people' },
      { id: 'achievement', label: 'Earned achievement', meta: 'This week', icon: 'trophy' },
    ],
    achievements: [
      { id: 'elite', title: 'Elite Driver', subtitle: '4.9 reputation', icon: 'star' },
      { id: 'garage', title: 'Curated Garage', subtitle: '3 verified builds', icon: 'diamond' },
      { id: 'crew', title: 'Crew Loyalist', subtitle: 'Midnight Society', icon: 'shield-checkmark' },
    ],
  },
];

export const getPublicDriverById = (id?: string) => publicDrivers.find((driver) => driver.id === id) ?? publicDrivers[0];
