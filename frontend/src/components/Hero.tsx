import { motion, AnimatePresence } from "framer-motion";
import { Library, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

interface HeroProps {
  onSearch: (query: string) => Promise<void>;
  isSearching?: boolean;
}

const Hero = ({ onSearch, isSearching = false }: HeroProps) => {
  const MAX_SUGGESTIONS = 8;
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement | null>(null);
  const suggestionsCacheRef = useRef<Map<string, string[]>>(new Map());

  const handleSearch = async () => {
    const trimmedQuery = query.trim();

    if (!trimmedQuery || isSearching) return;

    setIsSuggestionsOpen(false);
    await onSearch(trimmedQuery);
  };

  const handleSuggestionSelect = async (suggestion: string) => {
    setQuery(suggestion);
    setIsSuggestionsOpen(false);
    await onSearch(suggestion);
  };

  useEffect(() => {
    const trimmedQuery = query.trim();
    const normalizedQuery = trimmedQuery.toLowerCase();

    if (trimmedQuery.length < 1) {
      setSuggestions([]);
      setIsSuggestionsOpen(false);
      setIsLoadingSuggestions(false);
      return;
    }

    const cachedSuggestions = suggestionsCacheRef.current.get(normalizedQuery);

    if (cachedSuggestions) {
      setSuggestions(cachedSuggestions);
      setIsSuggestionsOpen(cachedSuggestions.length > 0);
      setIsLoadingSuggestions(false);
      return;
    }

    const controller = new AbortController();
    const debounceId = window.setTimeout(async () => {
      setIsLoadingSuggestions(true);

      try {
        const response = await fetch(
          `http://127.0.0.1:8000/search/suggestions?query=${encodeURIComponent(trimmedQuery)}&limit=${MAX_SUGGESTIONS}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error(`Suggestions request failed with status ${response.status}`);
        }

        const data = await response.json();
        const nextSuggestions = Array.isArray(data.suggestions)
          ? data.suggestions.filter((title: unknown): title is string => typeof title === "string")
          : [];

        suggestionsCacheRef.current.set(normalizedQuery, nextSuggestions);
        setSuggestions(nextSuggestions);
        setIsSuggestionsOpen(nextSuggestions.length > 0);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        console.error("Error fetching search suggestions:", error);
        setSuggestions([]);
        setIsSuggestionsOpen(false);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingSuggestions(false);
        }
      }
    }, 120);

    return () => {
      controller.abort();
      window.clearTimeout(debounceId);
    };
  }, [query]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!searchContainerRef.current?.contains(event.target as Node)) {
        setIsSuggestionsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, []);

  return (
    <motion.section
      className="relative flex min-h-[85vh] items-center justify-center overflow-x-hidden overflow-y-visible"
      animate={{ paddingBottom: isSuggestionsOpen ? 384 : 0 }}
      transition={{ duration: 0.48, ease: [0.16, 1, 0.3, 1] }}
    >
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
          className="relative z-40 max-w-xl mx-auto"
          ref={searchContainerRef}
        >
          <div className="flex items-center rounded-2xl bg-secondary/80 backdrop-blur-xl border border-border glow-border overflow-hidden">
            <input
              type="text"
              placeholder="Search for a book, author, or genre..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => {
                if (suggestions.length > 0) {
                  setIsSuggestionsOpen(true);
                }
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  void handleSearch();
                }
              }}
              className="flex-1 px-6 py-4 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none text-base"
            />

            <button
              onClick={() => {
                void handleSearch();
              }}
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

          <AnimatePresence>
            {isSuggestionsOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="absolute left-0 right-0 top-[calc(100%+1rem)] z-30 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/90 text-left shadow-2xl shadow-black/30 backdrop-blur-xl"
              >
                <div className="border-b border-white/5 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                  Smart Suggestions
                </div>

                {isLoadingSuggestions && suggestions.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-slate-400">
                    Finding matching titles...
                  </div>
                ) : (
                  <div
                    className="max-h-[26rem] overflow-y-auto overscroll-contain py-2"
                    style={{ touchAction: "pan-y" }}
                    onWheelCapture={(event) => {
                      event.stopPropagation();
                    }}
                  >
                    {suggestions.map((suggestion) => (
                      <button
                        key={suggestion}
                        onMouseDown={(event) => {
                          event.preventDefault();
                          void handleSuggestionSelect(suggestion);
                        }}
                        className="flex w-full items-center justify-between px-4 py-3 text-sm text-slate-100 transition hover:bg-white/5 hover:text-white"
                      >
                        <span className="truncate">{suggestion}</span>
                        <Search className="h-4 w-4 text-slate-500" />
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default Hero;
