import React, { useState } from "react";
import Hero from "./components/Hero";
import QuoteCarousel from "./components/QuoteCarousel";
import MoodSelector from "./components/MoodSelector";
import TrendingBooks from "./components/TrendingBooks";
import BookCard from "./components/BookCard";

function App() {

  const [recommendations, setRecommendations] = useState([]);

  const getRecommendations = async (mood) => {

    // for now we just send the mood as a search query
    const response = await fetch(`http://127.0.0.1:8000/recommend?book=${mood}`);

    const data = await response.json();

    const books = await Promise.all(
      data.recommendations.map(async (title) => {

        const res = await fetch(
          `https://www.googleapis.com/books/v1/volumes?q=${title}`
        );

        const bookData = await res.json();

        const cover =
          bookData.items?.[0]?.volumeInfo?.imageLinks?.thumbnail || "";

        return { title, cover };

      })
    );

    setRecommendations(books);

  };

  const setMood = (mood) => {
    console.log("Selected mood:", mood);
    getRecommendations(mood);
  };

  return (

    <div>

      <Hero />

      <QuoteCarousel />

      <TrendingBooks />

      <MoodSelector setMood={setMood} />

      {/* Recommendation Section */}

      {recommendations.length > 0 && (

        <div className="py-20 bg-gray-50">

          <div className="max-w-6xl mx-auto">

            <h2 className="text-3xl font-semibold text-gray-700 mb-10 text-center">
              Recommended Books
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">

              {recommendations.map((book, index) => (
                <BookCard key={index} book={book} />
              ))}

            </div>

          </div>

        </div>

      )}

    </div>

  );
}

export default App;