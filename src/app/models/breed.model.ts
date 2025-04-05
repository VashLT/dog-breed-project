export type BreedList = Record<string, string[]>;

export interface BreedTile {
  cols: number;
  rows: number;
  src: string;
}

export interface BreedQuery {
  breed: string;
  subBreed: string;
}
