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
export const LIBRARY_UPDATED_EVENT = "book-o-clock:library-updated";

export type ReadingStatus = "reading" | "completed";

export interface ReadingProgressEntry {
  title: string;
  progress: number;
  status: ReadingStatus;
}

const emitLibraryUpdated = () => {
  window.dispatchEvent(new CustomEvent(LIBRARY_UPDATED_EVENT));
};

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
  emitLibraryUpdated();
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
  emitLibraryUpdated();
};

export const clearReadingProgress = (title: string) => {
  const progressMap = getStoredReadingProgressMap();
  delete progressMap[title];
  localStorage.setItem(READING_PROGRESS_STORAGE_KEY, JSON.stringify(progressMap));
  emitLibraryUpdated();
};

export const getStoredReview = (title: string) => {
  return localStorage.getItem(`${REVIEW_STORAGE_PREFIX}${title}`) ?? "";
};

export const saveReview = (title: string, review: string) => {
  localStorage.setItem(`${REVIEW_STORAGE_PREFIX}${title}`, review);
};

const normalizeGenreLabel = (genre?: string) => {
  if (!genre) {
    return "";
  }

  return genre
    .split(/[,&/|]+/)
    .map((part) => part.trim())
    .filter(Boolean)[0] ?? "";
};

export interface PersonalizedGenreProfile {
  genre: string;
  confidence: number;
  observedBooks: number;
}

export const getPreferredGenreProfile = (): PersonalizedGenreProfile | null => {
  const library = getStoredLibrary();
  const progressMap = getStoredReadingProgressMap();
  const genreCounts = new Map<string, number>();
  let observedBooks = 0;

  for (const book of library) {
    const genre = normalizeGenreLabel(book.genre);

    if (!genre || genre.toLowerCase() === "unknown genre") {
      continue;
    }

    observedBooks += 1;

    const progressEntry = progressMap[book.title];
    const interactionWeight =
      progressEntry?.status === "completed" ? 3 : progressEntry?.status === "reading" ? 2 : 1;

    genreCounts.set(genre, (genreCounts.get(genre) ?? 0) + interactionWeight);
  }

  if (observedBooks < 2 || genreCounts.size === 0) {
    return null;
  }

  const rankedGenres = [...genreCounts.entries()].sort((a, b) => b[1] - a[1]);
  const [genre, confidence] = rankedGenres[0];

  if (!genre || confidence < 2) {
    return null;
  }

  return {
    genre,
    confidence,
    observedBooks,
  };
};
