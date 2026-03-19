import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { books as localBooks } from "@/data/books";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/lib/supabase";
import {
  clearReadingProgress,
  getStoredLibrary,
  getStoredRating,
  getStoredRatingsMap,
  getStoredReadingProgressMap,
  getStoredReview,
  getStoredReviewsMap,
  saveLibrary,
  saveReadingProgress,
  saveReview,
  saveStoredRating,
  type ReadingProgressEntry,
  type ReadingStatus,
  type SavedBook,
} from "@/lib/library";

interface ShelfEntry extends SavedBook {
  isSaved: boolean;
  userReview: string;
  userRating: number;
  readingProgress: number;
  readingStatus: ReadingStatus | null;
}

interface UserShelfContextValue {
  isLoading: boolean;
  libraryBooks: SavedBook[];
  progressMap: Record<string, ReadingProgressEntry>;
  getReview: (title: string) => string;
  getRating: (title: string) => number;
  isInLibrary: (title: string) => boolean;
  saveBook: (book: SavedBook) => Promise<void>;
  removeBook: (title: string) => Promise<void>;
  saveProgress: (book: SavedBook, progress: number, status: ReadingStatus) => Promise<void>;
  saveBookReview: (book: SavedBook, review: string) => Promise<void>;
  saveBookRating: (book: SavedBook, rating: number) => Promise<void>;
}

const UserShelfContext = createContext<UserShelfContextValue | undefined>(undefined);

const clampProgress = (value: number) => Math.min(100, Math.max(0, Math.round(value)));

const normalizeSavedBook = (book: Partial<SavedBook> & Pick<SavedBook, "title">): SavedBook => {
  const localMatch = localBooks.find((candidate) => candidate.title === book.title);

  return {
    title: book.title,
    cover: book.cover || localMatch?.cover || "",
    author: book.author || localMatch?.author || "Unknown Author",
    description: book.description || localMatch?.description || "No description available.",
    year: book.year || "",
    genre: book.genre || localMatch?.genre || "Unknown Genre",
    pages: book.pages || "",
    rating: book.rating || "",
  };
};

const createEntry = (
  book: Partial<SavedBook> & Pick<SavedBook, "title">,
  overrides?: Partial<ShelfEntry>
): ShelfEntry => {
  const normalized = normalizeSavedBook(book);

  return {
    ...normalized,
    isSaved: false,
    userReview: "",
    userRating: 0,
    readingProgress: 0,
    readingStatus: null,
    ...overrides,
  };
};

const mapRowToEntry = (row: any): ShelfEntry => {
  return createEntry(
    {
      title: row.title,
      cover: row.cover,
      author: row.author,
      description: row.description,
      year: row.year,
      genre: row.genre,
      pages: row.pages,
      rating: row.book_rating,
    },
    {
      isSaved: Boolean(row.is_saved),
      userReview: row.user_review || "",
      userRating: row.user_rating || 0,
      readingProgress: row.reading_progress || 0,
      readingStatus: row.reading_status || null,
    }
  );
};

const mapEntryToRow = (userId: string, entry: ShelfEntry) => ({
  user_id: userId,
  title: entry.title,
  cover: entry.cover,
  author: entry.author || "",
  description: entry.description || "",
  year: entry.year || "",
  genre: entry.genre || "",
  pages: entry.pages ? String(entry.pages) : "",
  book_rating: entry.rating ? String(entry.rating) : "",
  is_saved: entry.isSaved,
  user_review: entry.userReview,
  user_rating: entry.userRating,
  reading_progress: entry.readingProgress,
  reading_status: entry.readingStatus,
});

const buildLocalEntries = (): ShelfEntry[] => {
  const library = getStoredLibrary();
  const progressMap = getStoredReadingProgressMap();
  const reviews = getStoredReviewsMap();
  const ratings = getStoredRatingsMap();
  const titles = new Set<string>([
    ...library.map((book) => book.title),
    ...Object.keys(progressMap),
    ...Object.keys(reviews),
    ...Object.keys(ratings),
  ]);

  return [...titles].map((title) => {
    const localBook = library.find((candidate) => candidate.title === title)
      || localBooks.find((candidate) => candidate.title === title);
    const progress = progressMap[title];

    return createEntry(
      {
        title,
        cover: localBook?.cover,
        author: localBook?.author,
        description: localBook?.description,
        year: "year" in (localBook || {}) ? (localBook as SavedBook).year : "",
        genre: localBook?.genre,
        pages: "pages" in (localBook || {}) ? (localBook as SavedBook).pages : "",
        rating: "rating" in (localBook || {}) ? (localBook as SavedBook).rating : "",
      },
      {
        isSaved: library.some((book) => book.title === title),
        userReview: reviews[title] || "",
        userRating: ratings[title] || 0,
        readingProgress: progress?.progress || 0,
        readingStatus: progress?.status || null,
      }
    );
  });
};

interface Props {
  children: ReactNode;
}

export const UserShelfProvider = ({ children }: Props) => {
  const { user, isConfigured } = useAuth();
  const [entries, setEntries] = useState<ShelfEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadShelf = async () => {
      if (!user || !isConfigured) {
        if (!isMounted) return;
        setEntries(buildLocalEntries());
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      const { data, error } = await supabase
        .from("user_books")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) {
        console.error("Unable to load user shelf:", error);
        if (!isMounted) return;
        setEntries(buildLocalEntries());
        setIsLoading(false);
        return;
      }

      let loadedEntries = (data || []).map(mapRowToEntry);

      if (loadedEntries.length === 0) {
        const localEntries = buildLocalEntries();

        if (localEntries.length > 0) {
          const { error: importError } = await supabase
            .from("user_books")
            .upsert(localEntries.map((entry) => mapEntryToRow(user.id, entry)), {
              onConflict: "user_id,title",
            });

          if (importError) {
            console.error("Unable to migrate local shelf into Supabase:", importError);
          } else {
            loadedEntries = localEntries;
          }
        }
      }

      if (!isMounted) return;
      setEntries(loadedEntries);
      setIsLoading(false);
    };

    void loadShelf();

    return () => {
      isMounted = false;
    };
  }, [user, isConfigured]);

  const persistRemoteEntry = async (entry: ShelfEntry) => {
    if (!user || !isConfigured) {
      return;
    }

    const { error } = await supabase
      .from("user_books")
      .upsert(mapEntryToRow(user.id, entry), { onConflict: "user_id,title" });

    if (error) {
      console.error("Unable to persist shelf entry:", error);
      throw error;
    }
  };

  const persistLocalEntry = async (entry: ShelfEntry) => {
    if (entry.isSaved) {
      const nextLibrary = [
        normalizeSavedBook(entry),
        ...getStoredLibrary().filter((book) => book.title !== entry.title),
      ];
      saveLibrary(nextLibrary);
    } else {
      saveLibrary(getStoredLibrary().filter((book) => book.title !== entry.title));
      clearReadingProgress(entry.title);
    }

    if (entry.readingStatus) {
      saveReadingProgress({
        title: entry.title,
        progress: entry.readingProgress,
        status: entry.readingStatus,
      });
    }

    if (entry.userReview) {
      saveReview(entry.title, entry.userReview);
    }

    if (entry.userRating) {
      saveStoredRating(entry.title, entry.userRating);
    }
  };

  const upsertEntry = async (
    book: SavedBook,
    updater: (existing: ShelfEntry | null) => ShelfEntry
  ) => {
    const existing = entries.find((entry) => entry.title === book.title) ?? null;
    const nextEntry = updater(existing);

    setEntries((current) => {
      const filtered = current.filter((entry) => entry.title !== nextEntry.title);
      return [nextEntry, ...filtered];
    });

    if (user && isConfigured) {
      await persistRemoteEntry(nextEntry);
      return;
    }

    await persistLocalEntry(nextEntry);
  };

  const saveBook = async (book: SavedBook) => {
    await upsertEntry(book, (existing) =>
      createEntry(book, {
        ...existing,
        isSaved: true,
      })
    );
  };

  const removeBook = async (title: string) => {
    const existing = entries.find((entry) => entry.title === title)
      || createEntry({ title }, { isSaved: false });

    const nextEntry = {
      ...existing,
      isSaved: false,
      readingProgress: 0,
      readingStatus: null,
    };

    setEntries((current) => {
      const filtered = current.filter((entry) => entry.title !== title);
      const shouldKeep =
        Boolean(nextEntry.userReview) || nextEntry.userRating > 0;
      return shouldKeep ? [nextEntry, ...filtered] : filtered;
    });

    if (user && isConfigured) {
      if (nextEntry.userReview || nextEntry.userRating > 0) {
        await persistRemoteEntry(nextEntry);
      } else {
        const { error } = await supabase
          .from("user_books")
          .delete()
          .eq("user_id", user.id)
          .eq("title", title);

        if (error) {
          console.error("Unable to remove shelf entry:", error);
          throw error;
        }
      }
      return;
    }

    saveLibrary(getStoredLibrary().filter((book) => book.title !== title));
    clearReadingProgress(title);
  };

  const saveProgress = async (book: SavedBook, progress: number, status: ReadingStatus) => {
    const nextProgress = clampProgress(progress);

    await upsertEntry(book, (existing) =>
      createEntry(book, {
        ...existing,
        isSaved: true,
        readingProgress: nextProgress,
        readingStatus: nextProgress >= 100 ? "completed" : status,
      })
    );
  };

  const saveBookReview = async (book: SavedBook, review: string) => {
    await upsertEntry(book, (existing) =>
      createEntry(book, {
        ...existing,
        userReview: review,
      })
    );
  };

  const saveBookRating = async (book: SavedBook, rating: number) => {
    await upsertEntry(book, (existing) =>
      createEntry(book, {
        ...existing,
        userRating: rating,
      })
    );
  };

  const libraryBooks = useMemo(
    () =>
      entries
        .filter((entry) => entry.isSaved)
        .map((entry) => normalizeSavedBook(entry)),
    [entries]
  );

  const progressMap = useMemo(
    () =>
      Object.fromEntries(
        entries
          .filter((entry) => entry.readingStatus)
          .map((entry) => [
            entry.title,
            {
              title: entry.title,
              progress: entry.readingProgress,
              status: entry.readingStatus as ReadingStatus,
            },
          ])
      ),
    [entries]
  );

  const value = useMemo<UserShelfContextValue>(
    () => ({
      isLoading,
      libraryBooks,
      progressMap,
      getReview: (title: string) =>
        entries.find((entry) => entry.title === title)?.userReview || getStoredReview(title),
      getRating: (title: string) =>
        entries.find((entry) => entry.title === title)?.userRating || getStoredRating(title),
      isInLibrary: (title: string) =>
        entries.some((entry) => entry.title === title && entry.isSaved),
      saveBook,
      removeBook,
      saveProgress,
      saveBookReview,
      saveBookRating,
    }),
    [entries, isLoading, libraryBooks, progressMap]
  );

  return (
    <UserShelfContext.Provider value={value}>
      {children}
    </UserShelfContext.Provider>
  );
};

export const useUserShelf = () => {
  const context = useContext(UserShelfContext);

  if (!context) {
    throw new Error("useUserShelf must be used within a UserShelfProvider");
  }

  return context;
};
