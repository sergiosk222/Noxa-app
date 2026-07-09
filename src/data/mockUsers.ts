import type { UserProfile } from "@/src/types";

export const mockUsers: UserProfile[] = [
  {
    id: "user-sergey",
    name: "Sergey",
    username: "@noxa",
    city: "Thessaloniki",
    status: "online",
    carsCount: 2,
    crewsCount: 1,
    eventsCount: 24,
    followersCount: 148,
    followingCount: 86,
  },
];

export const currentUser = mockUsers[0];
