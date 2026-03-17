import { books as localBooks } from "@/data/books";
import { normalizeCoverUrl, resolveBookCover } from "@/lib/covers";

export interface DiscoveryBook {
  title: string;
  author: string;
  description: string;
  cover: string;
  genre: string;
  year: string;
  rating: string | number;
  pages: string | number;
}

export interface MoodDiscoveryConfig {
  label: string;
  subjects: string[];
  keywords: string[];
}

export const moodDiscoveryMap: Record<string, MoodDiscoveryConfig> = {
  calm: {
    label: "Calm",
    subjects: ["poetry", "nature", "meditation"],
    keywords: ["gentle", "quiet", "nature writing"],
  },
  romantic: {
    label: "Romantic",
    subjects: ["romance", "love", "relationships"],
    keywords: ["romantic fiction", "love story"],
  },
  motivated: {
    label: "Motivated",
    subjects: ["self-help", "success", "biography"],
    keywords: ["productivity", "personal growth", "inspirational"],
  },
  adventurous: {
    label: "Adventurous",
    subjects: ["adventure", "fantasy", "exploration"],
    keywords: ["quest", "epic journey"],
  },
  dark: {
    label: "Dark",
    subjects: ["thriller", "mystery", "psychological fiction"],
    keywords: ["suspense", "crime"],
  },
  reflective: {
    label: "Reflective",
    subjects: ["philosophy", "self-help", "psychology"],
    keywords: ["mindfulness", "meaning", "personal essays"],
  },
};

export const normalizeGoogleBook = (item: any): DiscoveryBook | null => {
  const info = item?.volumeInfo;

  if (!info?.title) {
    return null;
  }

  const localMatch = localBooks.find((book) => book.title === info.title);
  const isbn = info.industryIdentifiers?.find((identifier: any) =>
    ["ISBN_13", "ISBN_10"].includes(identifier.type)
  )?.identifier;
  const apiCover =
    info.imageLinks?.extraLarge ||
    info.imageLinks?.large ||
    info.imageLinks?.medium ||
    info.imageLinks?.thumbnail ||
    info.imageLinks?.smallThumbnail;

  return {
    title: info.title,
    author: info.authors?.join(", ") || localMatch?.author || "Unknown Author",
    description: info.description || localMatch?.description || "No description available.",
    cover: resolveBookCover({
      title: info.title,
      author: info.authors?.join(", ") || localMatch?.author || "Unknown Author",
      primaryCover: localMatch?.cover || normalizeCoverUrl(apiCover),
      isbn,
    }),
    genre: info.categories?.[0] || localMatch?.genre || "Unknown Genre",
    year: info.publishedDate?.split("-")[0] || "Unknown",
    rating: info.averageRating || "N/A",
    pages: info.pageCount || "N/A",
  };
};
