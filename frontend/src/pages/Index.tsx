import { useState, useRef, useEffect } from "react";
import Hero from "@/components/Hero";
import FeaturedBanner from "@/components/FeaturedBanner";
import RecommendationGrid from "@/components/RecommendationGrid";
import TrendingBooksRow from "@/components/TrendingBooksRow";
import MoodSelector from "@/components/MoodSelector";
import QuoteCarousel from "@/components/QuoteCarousel";
import BookDetailsModal from "@/components/BookDetailsModal";
import { books as localBooks, type Book } from "@/data/books";

const Index = () => {

  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [selectedBook, setSelectedBook] = useState<any | null>(null);
  const [bookHistory, setBookHistory] = useState<any[]>([]);

  const resultsRef = useRef<HTMLDivElement | null>(null);

  const getRecommendations = async (query: string) => {
    const response = await fetch(
      `http://127.0.0.1:8000/recommend?book=${encodeURIComponent(query)}`
    );

    const data = await response.json();

    const books = data.recommendations.map((rec: any) => {
      console.log('recommendation item:', rec);

      const year = rec.publication_date ? rec.publication_date.split("-")[0] : "Unknown";

      const localMatch = localBooks.find((b) => b.title === rec.title);

      const isbn = rec.isbn13 || rec.isbn;
      const openLibraryCover = isbn
        ? `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg?default=false`
        : "/placeholder.svg";

      const cover = localMatch?.cover || openLibraryCover;
      console.log("Computed cover for", rec.title, "=", cover);

      return {
        title: rec.title,
        author: rec.authors || "Unknown Author",
        description: localMatch?.description || "No description available.",
        cover,
        genre: localMatch?.genre || "Unknown Genre",
        year,
        rating: rec.average_rating || "N/A",
        pages: rec.num_pages || "N/A",
      };
    });

    setRecommendations(books);
  };

  // Auto scroll to recommendations
  useEffect(() => {
    if (recommendations.length > 0) {
      const timeoutId = window.setTimeout(() => {
        resultsRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 180);

      return () => window.clearTimeout(timeoutId);
    }
  }, [recommendations]);

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
  };

  return (
    <div className="min-h-screen bg-background">

      <Hero onSearch={getRecommendations} />

      <div ref={resultsRef}>
        <RecommendationGrid
          books={recommendations}
          onBookClick={handleOpenBook}
        />
      </div>

      <FeaturedBanner onBookClick={handleOpenBook} />

      <TrendingBooksRow onBookClick={handleOpenBook} />

      <MoodSelector onSelectMood={getRecommendations} />

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
