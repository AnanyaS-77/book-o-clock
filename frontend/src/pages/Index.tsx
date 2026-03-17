import { useState, useRef, useEffect } from "react";
import Hero from "@/components/Hero";
import ContinueReadingRow, { type ContinueReadingBook } from "@/components/ContinueReadingRow";
import FeaturedBanner from "@/components/FeaturedBanner";
import RecommendationGrid from "@/components/RecommendationGrid";
import TrendingBooksRow from "@/components/TrendingBooksRow";
import MoodSelector from "@/components/MoodSelector";
import QuoteCarousel from "@/components/QuoteCarousel";
import BookDetailsModal from "@/components/BookDetailsModal";
import SearchEmptyState from "@/components/SearchEmptyState";
import { books as localBooks, type Book } from "@/data/books";
import { resolveBookCover } from "@/lib/covers";
import { moodDiscoveryMap, type DiscoveryBook } from "@/lib/discovery";
import { getStoredLibrary, getStoredReadingProgressMap } from "@/lib/library";

const Index = () => {

  const [searchRecommendations, setSearchRecommendations] = useState<DiscoveryBook[]>([]);
  const [moodRecommendations, setMoodRecommendations] = useState<DiscoveryBook[]>([]);
  const [continueReadingBooks, setContinueReadingBooks] = useState<ContinueReadingBook[]>([]);
  const [activeMood, setActiveMood] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [loadingMood, setLoadingMood] = useState("");
  const [lastSearchQuery, setLastSearchQuery] = useState("");
  const [hasCompletedSearch, setHasCompletedSearch] = useState(false);
  const [selectedBook, setSelectedBook] = useState<any | null>(null);
  const [bookHistory, setBookHistory] = useState<any[]>([]);

  const searchResultsRef = useRef<HTMLDivElement | null>(null);
  const moodResultsRef = useRef<HTMLDivElement | null>(null);

  const loadContinueReadingBooks = () => {
    const library = getStoredLibrary();
    const progressMap = getStoredReadingProgressMap();

    const inProgressBooks = library
      .map((book) => {
        const progressEntry = progressMap[book.title];

        if (!progressEntry || progressEntry.progress <= 0 || progressEntry.progress >= 100) {
          return null;
        }

        return {
          ...book,
          progress: progressEntry.progress,
        };
      })
      .filter((book): book is ContinueReadingBook => Boolean(book));

    setContinueReadingBooks(inProgressBooks);
  };

  const mapApiBooksToCards = (items: any[]) => {
    return items.map((rec: any) => {
      const year = rec.publication_date ? rec.publication_date.split("-")[0] : "Unknown";
      const localMatch = localBooks.find((b) => b.title === rec.title);
      const author = rec.authors || localMatch?.author || "Unknown Author";
      const cover = resolveBookCover({
        title: rec.title,
        author,
        primaryCover: localMatch?.cover,
        isbn: rec.isbn13 || rec.isbn,
      });

      return {
        title: rec.title,
        author,
        description: localMatch?.description || "No description available.",
        cover,
        genre: localMatch?.genre || "Unknown Genre",
        year,
        rating: rec.average_rating || "N/A",
        pages: rec.num_pages || "N/A",
      };
    });
  };

  const getRecommendations = async (query: string) => {
    setIsSearching(true);
    setLastSearchQuery(query);

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/recommend?book=${encodeURIComponent(query)}`
      );

      const data = await response.json();
      const searchedBook = data.source_book ? mapApiBooksToCards([data.source_book])[0] : null;
      const recommendationCards = mapApiBooksToCards(data.recommendations || []);
      const combinedCards = searchedBook
        ? [searchedBook, ...recommendationCards.filter((book) => book.title !== searchedBook.title)]
        : recommendationCards;

      setSearchRecommendations(combinedCards);
      setHasCompletedSearch(true);
    } finally {
      setIsSearching(false);
    }
  };

  const getMoodRecommendations = async (mood: string) => {
    const moodConfig = moodDiscoveryMap[mood.toLowerCase()];

    if (!moodConfig) {
      await getRecommendations(mood);
      return;
    }

    setLoadingMood(moodConfig.label);

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/discover/mood?mood=${encodeURIComponent(mood)}`
      );

      if (!response.ok) {
        throw new Error(`Mood discovery request failed with status ${response.status}`);
      }

      const data = await response.json();

      setActiveMood(moodConfig.label);
      setMoodRecommendations(mapApiBooksToCards(data.recommendations || []));
    } finally {
      setLoadingMood("");
    }
  };

  useEffect(() => {
    loadContinueReadingBooks();
  }, []);

  useEffect(() => {
    const syncContinueReading = () => {
      loadContinueReadingBooks();
    };

    window.addEventListener("focus", syncContinueReading);
    window.addEventListener("storage", syncContinueReading);

    return () => {
      window.removeEventListener("focus", syncContinueReading);
      window.removeEventListener("storage", syncContinueReading);
    };
  }, []);

  useEffect(() => {
    if (searchRecommendations.length > 0 || hasCompletedSearch) {
      const timeoutId = window.setTimeout(() => {
        searchResultsRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 180);

      return () => window.clearTimeout(timeoutId);
    }
  }, [searchRecommendations, hasCompletedSearch]);

  useEffect(() => {
    if (moodRecommendations.length > 0) {
      const timeoutId = window.setTimeout(() => {
        moodResultsRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 180);

      return () => window.clearTimeout(timeoutId);
    }
  }, [moodRecommendations]);

  const handleOpenBook = (book: Book | any) => {
    setBookHistory([]);
    setSelectedBook(book);
  };

  const handleSelectBookFromModal = (book: Book | any) => {
    setBookHistory((history) => (selectedBook ? [...history, selectedBook] : history));
    setSelectedBook(book);
  };

  const handleBackToPreviousBook = () => {
    setBookHistory((history) => {
      if (history.length === 0) {
        return history;
      }

      const previousBook = history[history.length - 1];
      setSelectedBook(previousBook);
      return history.slice(0, -1);
    });
  };

  const handleCloseModal = () => {
    setSelectedBook(null);
    setBookHistory([]);
    loadContinueReadingBooks();
  };

  return (
    <div className="min-h-screen bg-background">

      <Hero onSearch={getRecommendations} isSearching={isSearching} />

      <ContinueReadingRow books={continueReadingBooks} onBookClick={handleOpenBook} />

      <div ref={searchResultsRef}>
        <RecommendationGrid
          books={searchRecommendations}
          onBookClick={handleOpenBook}
          title="Recommended for You"
        />
        {hasCompletedSearch && searchRecommendations.length === 0 && (
          <SearchEmptyState query={lastSearchQuery} />
        )}
      </div>

      <FeaturedBanner onBookClick={handleOpenBook} />

      <TrendingBooksRow onBookClick={handleOpenBook} />

      <MoodSelector
        onSelectMood={getMoodRecommendations}
        activeMood={activeMood}
        loadingMood={loadingMood}
      />

      <div ref={moodResultsRef}>
        <RecommendationGrid
          books={moodRecommendations}
          onBookClick={handleOpenBook}
          title={activeMood ? `${activeMood} Picks For You` : "Mood Picks For You"}
        />
      </div>

      <QuoteCarousel />

      <footer className="border-t border-border py-8 px-6 text-center text-muted-foreground text-sm">
        Book O' Clock — Discover your next favorite read.
      </footer>

      <BookDetailsModal
        book={selectedBook}
        onClose={handleCloseModal}
        onSelectBook={handleSelectBookFromModal}
        onBack={handleBackToPreviousBook}
        canGoBack={bookHistory.length > 0}
      />

    </div>
  );
};

export default Index;
