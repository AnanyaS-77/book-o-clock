import { motion } from "framer-motion";
import { Library, Search } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

interface HeroProps {
  onSearch: (query: string) => Promise<void>;
  isSearching?: boolean;
}

const Hero = ({ onSearch, isSearching = false }: HeroProps) => {
  const [query, setQuery] = useState("");

  const handleSearch = async () => {
    if (!query.trim() || isSearching) return;
    await onSearch(query);
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

      <div className="absolute left-0 top-0 z-20 w-full px-6 py-6">
        <div className="mx-auto flex max-w-7xl justify-end">
          <Link
            to="/library"
            className="inline-flex items-center gap-3 rounded-full border border-border/70 bg-background/70 px-6 py-3 text-base font-semibold text-foreground shadow-lg shadow-black/20 backdrop-blur-xl transition hover:border-primary hover:bg-card"
          >
            <Library className="h-5 w-5" />
            My Library
          </Link>
        </div>
      </div>

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
              disabled={isSearching}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-opacity ${
                isSearching
                  ? "bg-primary/80 text-primary-foreground opacity-90"
                  : "bg-primary text-primary-foreground hover:opacity-90"
              }`}
            >
              <Search className={`w-5 h-5 ${isSearching ? "animate-pulse" : ""}`} />
              <span className="hidden sm:inline">{isSearching ? "Searching..." : "Search"}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
