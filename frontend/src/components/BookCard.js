import React from "react";

function BookCard({ book }) {

  const buyBook = () => {
    const url = `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(book.title)}`;
    window.open(url, "_blank");
  };

  const readBook = () => {
    const url = `https://archive.org/search?query=${encodeURIComponent(book.title)}`;
    window.open(url, "_blank");
  };

  return (

  <div className="bg-white rounded-xl shadow-md p-4 w-[180px] h-[320px] flex flex-col justify-between text-center hover:shadow-xl hover:-translate-y-1 transition">
      {book.cover && (
        <img
          src={book.cover}
          alt={book.title}
          className="mx-auto h-52 object-contain"
        />
      )}

     <p className="text-sm font-medium mt-3 text-gray-700 line-clamp-2">
        {book.title}
      </p>

      <div className="flex justify-center gap-2 mt-4">

        <button
          onClick={buyBook}
          className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
        >
          Buy
        </button>

        <button
          onClick={readBook}
          className="text-sm bg-purple-500 text-white px-3 py-1 rounded hover:bg-purple-600"
        >
          Read
        </button>

      </div>

    </div>

  );
}

export default BookCard;