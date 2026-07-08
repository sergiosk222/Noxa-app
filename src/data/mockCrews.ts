import type { Crew } from "@/src/types";

export const mockCrews: Crew[] = [
  {
    id: "crew-midnight-society",
    name: "Midnight Society",
    city: "Thessaloniki",
    subtitle: "Thessaloniki Night Crew",
    membersCount: 24,
    carsCount: 18,
    tag: "STREET",
    isFeatured: true,
    nextEvent: "Night Run • Tonight",
  },
  {
    id: "crew-northline-club",
    name: "Northline Club",
    city: "Kalamaria",
    subtitle: "Kalamaria Cruise Crew",
    membersCount: 16,
    carsCount: 12,
    tag: "CRUISE",
    isFeatured: false,
  },
  {
    id: "crew-redline-garage",
    name: "Redline Garage",
    city: "Evosmos",
    subtitle: "Evosmos Build Crew",
    membersCount: 31,
    carsCount: 22,
    tag: "BUILDS",
    isFeatured: false,
  },
];

export const featuredCrew =
  mockCrews.find((crew) => crew.isFeatured) ?? mockCrews[0];
