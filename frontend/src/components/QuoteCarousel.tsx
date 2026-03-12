import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { quotes } from "@/data/books";

const QuoteCarousel = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setIndex((i) => (i + 1) % quotes.length), 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-20 px-6">
      <div className="max-w-3xl mx-auto text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl bg-card/60 backdrop-blur border border-border p-10"
          >
            <p className="font-display text-xl md:text-2xl font-medium italic text-foreground mb-4 leading-relaxed">
              "{quotes[index].text}"
            </p>
            <p className="text-muted-foreground text-sm">— {quotes[index].author}</p>
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-center gap-2 mt-6">
          {quotes.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${i === index ? "bg-primary" : "bg-muted"}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default QuoteCarousel;
