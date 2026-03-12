import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { useState } from "react";

interface HeroProps {
  onSearch: (query: string) => void;
}

const Hero = ({ onSearch }: HeroProps) => {
  const [query, setQuery] = useState("");

  const handleSearch = () => {
    if (!query.trim()) return;
    onSearch(query);
  };

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 gradient-mesh" />
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: "linear-gradient(135deg, hsl(270 80% 65% / 0.2), hsl(220 90% 60% / 0.15), hsl(330 80% 60% / 0.1))",
          backgroundSize: "400% 400%",
          animation: "gradient-shift 8s ease infinite",
        }}
      />

      <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-6xl md:text-8xl font-display font-bold tracking-tight mb-4 glow-text"
        >
          Book O' Clock
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-lg md:text-xl text-muted-foreground mb-12 max-w-xl mx-auto"
        >
          Discover books based on mood, genre and personal taste
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative max-w-xl mx-auto"
        >
          <div className="flex items-center rounded-2xl bg-secondary/80 backdrop-blur-xl border border-border glow-border overflow-hidden">
            <input
              type="text"
              placeholder="Search for a book, author, or genre..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 px-6 py-4 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none text-base"
            />

            <button
              onClick={handleSearch}
              className="flex items-center gap-2 px-6 py-4 bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
            >
              <Search className="w-5 h-5" />
              <span className="hidden sm:inline">Search</span>
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;