import type { Car } from "@/src/types";

export const mockCars: Car[] = [
  {
    id: "car-370z-street-hunter",
    ownerId: "user-sergey",
    name: "Nissan 370Z",
    buildName: "Street Hunter",
    brand: "Nissan",
    model: "370Z",
    year: 2019,
    imageUrl:
      "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=1200&q=85",
    powerHp: 612,
    torqueNm: 620,
    zeroToHundred: 3.6,
    stage: "Stage 2",
    visibility: "public",
    buildProgress: 78,
    installedParts: [
      "Turbo Stage 2",
      "Performance Exhaust",
      "Coilovers",
      "Cold Air Intake",
      "Semi Slick Tires",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=500&q=80",
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=500&q=80",
      "https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=500&q=80",
      "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=500&q=80",
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=500&q=80",
    ],
  },
];

export const featuredCar = mockCars[0];
