import React, { useState } from "react";

function App() {

  const [book, setBook] = useState("");
  const [recommendations, setRecommendations] = useState([]);

  const getRecommendations = async () => {

    const response = await fetch(`http://127.0.0.1:8000/recommend?book=${book}`);
    const data = await response.json();

    const books = await Promise.all(
      data.recommendations.map(async (title) => {

        const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${title}`);
        const bookData = await res.json();

        const cover =
          bookData.items?.[0]?.volumeInfo?.imageLinks?.thumbnail || "";

        return { title, cover };

      })
    );

    setRecommendations(books);
  };

  return (

    <div className="min-h-screen bg-gray-100 flex flex-col items-center">

      {/* Header */}
      <div className="text-center mt-12">
        <h1 className="text-5xl font-bold text-gray-800">
           Book O' Clock
        </h1>

        <p className="text-gray-500 mt-2">
          AI Powered Book Recommendation System
        </p>
      </div>

      {/* Search */}
      <div className="flex mt-10 gap-3">

        <input
          type="text"
          placeholder="Search a book..."
          value={book}
          onChange={(e) => setBook(e.target.value)}
          className="px-4 py-3 w-80 rounded-lg border shadow-sm focus:outline-none"
        />

        <button
          onClick={getRecommendations}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
        >
          Recommend
        </button>

      </div>

      {/* Recommendations */}
      <div className="mt-14 w-full max-w-6xl px-10">

        <h2 className="text-xl font-semibold mb-6 text-gray-700">
          Recommended Books
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">

          {recommendations.map((rec, index) => (

            <div
              key={index}
              className="bg-white rounded-xl shadow-md p-4 text-center hover:shadow-xl hover:-translate-y-1 transition"
            >

              {rec.cover && (
                <img
                  src={rec.cover}
                  alt={rec.title}
                  className="mx-auto h-44 object-contain"
                />
              )}

              <p className="text-sm font-medium mt-3">
                {rec.title}
              </p>

            </div>

          ))}

        </div>

      </div>

    </div>

  );
}

export default App;