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
export const READING_PROGRESS_STORAGE_KEY = "book-o-clock-reading-progress";

export type ReadingStatus = "reading" | "completed";

export interface ReadingProgressEntry {
  title: string;
  progress: number;
  status: ReadingStatus;
}

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

const clampProgress = (value: number) => {
  if (Number.isNaN(value)) {
    return 0;
  }

  return Math.min(100, Math.max(0, Math.round(value)));
};

export const getStoredReadingProgressMap = (): Record<string, ReadingProgressEntry> => {
  const stored = localStorage.getItem(READING_PROGRESS_STORAGE_KEY);

  if (!stored) {
    return {};
  }

  try {
    const parsed = JSON.parse(stored);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (error) {
    console.error("Unable to parse reading progress from storage:", error);
    return {};
  }
};

export const getStoredReadingProgress = (title: string): ReadingProgressEntry | null => {
  return getStoredReadingProgressMap()[title] ?? null;
};

export const saveReadingProgress = (entry: ReadingProgressEntry) => {
  const progressMap = getStoredReadingProgressMap();
  const progress = clampProgress(entry.progress);

  progressMap[entry.title] = {
    title: entry.title,
    progress,
    status: progress >= 100 ? "completed" : entry.status,
  };

  localStorage.setItem(READING_PROGRESS_STORAGE_KEY, JSON.stringify(progressMap));
};

export const clearReadingProgress = (title: string) => {
  const progressMap = getStoredReadingProgressMap();
  delete progressMap[title];
  localStorage.setItem(READING_PROGRESS_STORAGE_KEY, JSON.stringify(progressMap));
};

export const getStoredReview = (title: string) => {
  return localStorage.getItem(`${REVIEW_STORAGE_PREFIX}${title}`) ?? "";
};

export const saveReview = (title: string, review: string) => {
  localStorage.setItem(`${REVIEW_STORAGE_PREFIX}${title}`, review);
};
