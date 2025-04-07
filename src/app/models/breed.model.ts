export type BreedList = Record<string, string[]>;

export interface BreedQuery {
  breed: string;
  subBreed: string;
}

export interface BreedItem {
  name: string;
  src: string;
}

export interface BreedDetail extends BreedItem {
  canSearch: boolean;
}

export interface BreedLikeEmit extends BreedItem {
  isLiked: boolean;
}
