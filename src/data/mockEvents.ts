import type { Event } from "@/src/types";

export const mockEvents: Event[] = [
  {
    id: "event-night-run",
    title: "Night Run",
    type: "Meet",
    location: "Thessaloniki Waterfront",
    timeLabel: "Tonight • 22:30",
    participantsCount: 22,
    tag: "FEATURED",
    isFeatured: true,
  },
  {
    id: "event-cars-coffee",
    title: "Cars & Coffee",
    type: "Social",
    location: "Old Port Garage",
    timeLabel: "Sunday • 10:00",
    participantsCount: 18,
    tag: "SOCIAL",
    isFeatured: false,
  },
  {
    id: "event-drift-practice",
    title: "Drift Practice",
    type: "Track",
    location: "Private Circuit Pad",
    timeLabel: "Friday • 21:00",
    participantsCount: 12,
    tag: "TRACK",
    isFeatured: false,
  },
  {
    id: "event-sunset-cruise",
    title: "Sunset Cruise",
    type: "Cruise",
    location: "Thermaikos Lookout",
    timeLabel: "Saturday • 19:30",
    participantsCount: 34,
    tag: "CRUISE",
    isFeatured: false,
  },
];

export const featuredEvent =
  mockEvents.find((event) => event.isFeatured) ?? mockEvents[0];
