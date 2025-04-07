import { BREED_SUB_BREED_SEPARATOR } from '@constants/keys';

/**
 * Normalize the string to remove accents, special characters and convert to lowercase
 * @param str the string to normalize
 * @returns the normalized string
 */
export const normalizeString = (str: string): string => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
};

/**
 * Get the breed name from the source of the image
 * @param src source of the image
 * @returns the breed name
 */
export const getBreedNameFromSrc = (src: string): string | null => {
  const breedRegex = /\/breeds\/([^/]+)/;
  const breedMatch = breedRegex.exec(src);
  if (!breedMatch) return null;

  const breedName = breedMatch[1].split('-').join(BREED_SUB_BREED_SEPARATOR);

  return breedName;
};
