import type { ComponentProps } from 'react';
import type { Ionicons } from '@expo/vector-icons';

export type SearchCategory = 'all' | 'drivers' | 'cars' | 'crews' | 'events';

export type SearchResultType = Exclude<SearchCategory, 'all'>;

export type SearchResult = {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle: string;
  icon: ComponentProps<typeof Ionicons>['name'];
};

export type SearchSection = {
  title: string;
  results: SearchResult[];
};
