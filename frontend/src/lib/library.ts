export interface SavedBook {
  title: string;
  cover: string;
  author?: string;
  description?: string;
  year?: string;
  genre?: string;
  pages?: string | number;
  rating?: string | number;
}

export const LIBRARY_STORAGE_KEY = "book-o-clock-library";
export const REVIEW_STORAGE_PREFIX = "review-";

export const getStoredLibrary = (): SavedBook[] => {
  const stored = localStorage.getItem(LIBRARY_STORAGE_KEY);

  if (!stored) {
    return [];
  }

  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Unable to parse library from storage:", error);
    return [];
  }
};

export const saveLibrary = (library: SavedBook[]) => {
  localStorage.setItem(LIBRARY_STORAGE_KEY, JSON.stringify(library));
};

export const getStoredReview = (title: string) => {
  return localStorage.getItem(`${REVIEW_STORAGE_PREFIX}${title}`) ?? "";
};

export const saveReview = (title: string, review: string) => {
  localStorage.setItem(`${REVIEW_STORAGE_PREFIX}${title}`, review);
};
