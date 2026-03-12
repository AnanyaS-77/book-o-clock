import { useState, useRef, useEffect } from "react";
import Hero from "@/components/Hero";
import FeaturedBanner from "@/components/FeaturedBanner";
import RecommendationGrid from "@/components/RecommendationGrid";
import TrendingBooksRow from "@/components/TrendingBooksRow";
import MoodSelector from "@/components/MoodSelector";
import QuoteCarousel from "@/components/QuoteCarousel";

const Index = () => {

  const [recommendations, setRecommendations] = useState([]);
  const resultsRef = useRef<HTMLDivElement | null>(null);

  const getRecommendations = async (query: string) => {

    const response = await fetch(
      `http://127.0.0.1:8000/recommend?book=${query}`
    );

    const data = await response.json();

    const books = await Promise.all(
      data.recommendations.map(async (title: string) => {

        const res = await fetch(
          `https://www.googleapis.com/books/v1/volumes?q=${title}`
        );

        const bookData = await res.json();

        const cover =
          bookData.items?.[0]?.volumeInfo?.imageLinks?.thumbnail || "";

        return {
          title,
          cover
        };

      })
    );

    setRecommendations(books);
  };

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
        <RecommendationGrid books={recommendations} />
      </div>

      <FeaturedBanner />

      <TrendingBooksRow />

      <MoodSelector onSelectMood={getRecommendations} />

      <QuoteCarousel />

      <footer className="border-t border-border py-8 px-6 text-center text-muted-foreground text-sm">
        Book O' Clock — Discover your next favorite read.
      </footer>

    </div>
  );
};

export default Index;