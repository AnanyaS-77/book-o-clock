import { useState, useRef, useEffect } from "react";
import Hero from "@/components/Hero";
import FeaturedBanner from "@/components/FeaturedBanner";
import RecommendationGrid from "@/components/RecommendationGrid";
import TrendingBooksRow from "@/components/TrendingBooksRow";
import MoodSelector from "@/components/MoodSelector";
import QuoteCarousel from "@/components/QuoteCarousel";
import BookDetailsModal from "@/components/BookDetailsModal";

const Index = () => {

  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [selectedBook, setSelectedBook] = useState<any | null>(null);

  const resultsRef = useRef<HTMLDivElement | null>(null);

  const getRecommendations = async (query: string) => {

    const response = await fetch(
      `http://127.0.0.1:8000/recommend?book=${query}`
    );

    const data = await response.json();

    const books = await Promise.all(
      data.recommendations.map(async (title: string) => {

        const res = await fetch(
          `https://www.googleapis.com/books/v1/volumes?q=intitle:${encodeURIComponent(title)}`
        );

        const bookData = await res.json();

        const info = bookData.items?.[0]?.volumeInfo || {};

        let cover =
          info.imageLinks?.large ||
          info.imageLinks?.medium ||
          info.imageLinks?.thumbnail ||
          "/default-book.png";

        if (cover.startsWith("http://")) {
          cover = cover.replace("http://", "https://");
        }

        return {
          title: info.title || title,
          author: info.authors?.[0] || "Unknown Author",
          description: info.description || "No description available.",
          cover,
          genre: info.categories?.[0] || "Unknown Genre",
          year: info.publishedDate
            ? info.publishedDate.substring(0, 4)
            : "Unknown",
          rating: info.averageRating || "N/A",
          pages: info.pageCount || "N/A"
        };

      })
    );

    setRecommendations(books);
  };

  // Auto scroll to recommendations
  useEffect(() => {
    if (recommendations.length > 0) {
      resultsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [recommendations]);

  return (
    <div className="min-h-screen bg-background">

      <Hero onSearch={getRecommendations} />

      <div ref={resultsRef}>
        <RecommendationGrid
          books={recommendations}
          onBookClick={(book) => setSelectedBook(book)}
        />
      </div>

      <FeaturedBanner />

      <TrendingBooksRow />

      <MoodSelector onSelectMood={getRecommendations} />

      <QuoteCarousel />

      <footer className="border-t border-border py-8 px-6 text-center text-muted-foreground text-sm">
        Book O' Clock — Discover your next favorite read.
      </footer>

      <BookDetailsModal
        book={selectedBook}
        onClose={() => setSelectedBook(null)}
      />

    </div>
  );
};

export default Index;