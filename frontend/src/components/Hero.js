import React from "react";

function Hero() {
  return (
    <div className="relative w-full py-32 overflow-hidden bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 flex flex-col items-center text-center">

      {/* floating shapes */}
      <div className="absolute w-72 h-72 bg-pink-200 rounded-full opacity-40 blur-3xl top-10 left-10 animate-pulse"></div>
      <div className="absolute w-72 h-72 bg-purple-200 rounded-full opacity-40 blur-3xl bottom-10 right-10 animate-pulse"></div>
      <div className="absolute w-60 h-60 bg-blue-200 rounded-full opacity-40 blur-3xl top-20 right-1/3 animate-pulse"></div>

      <h1 className="text-6xl font-bold text-gray-800 tracking-tight relative">
        Book O' Clock
      </h1>

      <p className="mt-6 text-gray-600 text-lg max-w-xl relative">
        Discover books that match your mood, your taste, and your curiosity.
      </p>

    </div>
  );
}

export default Hero;