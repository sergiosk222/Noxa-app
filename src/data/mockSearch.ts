import type { SearchResult, SearchSection } from '@/src/types/search';

export const mockSearchResults: SearchResult[] = [
  {
    id: 'driver-alex-voss',
    type: 'drivers',
    title: 'Alex Voss',
    subtitle: 'Acura NSX • Carbon District',
    icon: 'person',
  },
  {
    id: 'driver-kai-nakamura',
    type: 'drivers',
    title: 'Kai Nakamura',
    subtitle: 'Nissan Skyline R32 • Midnight Society',
    icon: 'person',
  },
  {
    id: 'car-nissan-370z',
    type: 'cars',
    title: 'Nissan 370Z',
    subtitle: 'Garage build • Street coupe',
    icon: 'car-sport',
  },
  {
    id: 'car-bmw-e36',
    type: 'cars',
    title: 'BMW E36',
    subtitle: 'Track-ready classic • Manual',
    icon: 'car-sport',
  },
  {
    id: 'car-nissan-silvia-s15',
    type: 'cars',
    title: 'Nissan Silvia S15',
    subtitle: 'Featured drift build • Turbo',
    icon: 'car-sport',
  },
  {
    id: 'crew-midnight-society',
    type: 'crews',
    title: 'Midnight Society',
    subtitle: '32 members • Night meets',
    icon: 'people',
  },
  {
    id: 'crew-carbon-district',
    type: 'crews',
    title: 'Carbon District',
    subtitle: '18 members • Premium garage culture',
    icon: 'people',
  },
  {
    id: 'event-night-run',
    type: 'events',
    title: 'Night Run',
    subtitle: 'Tonight • Curated local cruise',
    icon: 'calendar',
  },
  {
    id: 'event-cars-coffee',
    type: 'events',
    title: 'Cars & Coffee',
    subtitle: 'Sunday • Morning meet',
    icon: 'calendar',
  },
];

export const mockPopularNearby: SearchResult[] = [
  mockSearchResults[1],
  mockSearchResults[5],
  mockSearchResults[7],
];

export const mockRecentSearches: SearchResult[] = [
  mockSearchResults[2],
  mockSearchResults[0],
  mockSearchResults[8],
];

export const mockSearchSections: SearchSection[] = [
  { title: 'Popular nearby', results: mockPopularNearby },
  { title: 'Recent searches', results: mockRecentSearches },
  { title: 'Results', results: mockSearchResults },
];
