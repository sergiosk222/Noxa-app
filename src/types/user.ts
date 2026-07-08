export type UserStatus = "online" | "offline" | "cruising" | "at_event";

export type UserProfile = {
  id: string;
  name: string;
  username: string;
  avatarUrl?: string;
  city: string;
  status: UserStatus;
  carsCount: number;
  crewsCount: number;
  eventsCount: number;
  followersCount: number;
};
