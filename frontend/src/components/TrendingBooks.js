import React, { useEffect, useState } from "react";
import BookCard from "./BookCard";

function TrendingBooks() {

  const [books, setBooks] = useState([]);

  useEffect(() => {

    const fetchBooks = async () => {

      const response = await fetch(
        "https://www.googleapis.com/books/v1/volumes?q=bestseller"
      );

      const data = await response.json();

      const formatted = data.items.map((item) => ({
        title: item.volumeInfo.title,
        cover: item.volumeInfo.imageLinks?.thumbnail
      }));

      setBooks(formatted);

    };

    fetchBooks();

  }, []);

  return (

  <div className="py-20 bg-gray-50">

    <div className="max-w-6xl mx-auto">

      <h2 className="text-3xl font-semibold text-gray-700 mb-10 text-center">
        Trending Books
      </h2>

      <div className="flex gap-6 overflow-x-auto pb-4">

        {books.map((book, index) => (
        <div key={index} className="min-w-[180px]">
            <BookCard book={book} />
        </div>
        ))}

      </div>

    </div>

  </div>

);
}

export default TrendingBooks;