export type CarVisibility = "public" | "private" | "crew";

export type Car = {
  id: string;
  ownerId: string;
  name: string;
  buildName: string;
  brand: string;
  model: string;
  year: number;
  imageUrl?: string;
  powerHp: number;
  torqueNm: number;
  zeroToHundred: number;
  stage: string;
  visibility: CarVisibility;
  buildProgress: number;
  installedParts: string[];
  gallery: string[];
};
