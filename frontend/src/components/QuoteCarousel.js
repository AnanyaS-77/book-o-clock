import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

const quotes = [
  {
    quote: "A reader lives a thousand lives before he dies.",
    author: "George R. R. Martin"
  },
  {
    quote: "Not all those who wander are lost.",
    author: "J.R.R. Tolkien"
  },
  {
    quote: "Until I feared I would lose it, I never loved to read.",
    author: "Harper Lee"
  },
  {
    quote: "There is no friend as loyal as a book.",
    author: "Ernest Hemingway"
  }
];

function QuoteCarousel() {
  return (
    <div className="w-full py-20 bg-white flex justify-center">

      <div className="max-w-3xl bg-white rounded-2xl shadow-lg p-12">

        <Swiper slidesPerView={1} loop autoplay>

          {quotes.map((q, index) => (
            <SwiperSlide key={index}>
              <div className="text-center">

                <p className="text-2xl text-gray-700 italic leading-relaxed">
                  "{q.quote}"
                </p>

                <p className="mt-6 text-gray-500">
                  — {q.author}
                </p>

              </div>
            </SwiperSlide>
          ))}

        </Swiper>

      </div>

    </div>
  );
}

export default QuoteCarousel;