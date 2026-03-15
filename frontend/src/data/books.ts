export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  cover: string;
  genre: string;
  featured?: boolean;
}

export const books: Book[] = [
  {
    id: "1",
    title: "The Midnight Library",
    author: "Matt Haig",
    description: "Between life and death there is a library, and within that library, the shelves go on forever.",
    cover: "https://covers.openlibrary.org/b/isbn/9780525559474-L.jpg?default=false",
    genre: "Fantasy",
    featured: true,
  },
  {
    id: "2",
    title: "Where the Crawdads Sing",
    author: "Delia Owens",
    description: "A painfully beautiful first novel that is at once a murder mystery and a celebration of nature.",
    cover: "https://covers.openlibrary.org/b/isbn/9780735219090-L.jpg?default=false",
    genre: "Literary Fiction",
    featured: true,
  },
  {
    id: "3",
    title: "The Silent Patient",
    author: "Alex Michaelides",
    description: "A shocking psychological thriller of a woman's act of violence against her husband.",
    cover: "https://covers.openlibrary.org/b/isbn/9781250301697-L.jpg?default=false",
    genre: "Thriller",
    featured: true,
  },
  {
    id: "4",
    title: "Project Hail Mary",
    author: "Andy Weir",
    description: "A lone astronaut must save the earth from disaster in this propulsive interstellar adventure.",
    cover: "https://covers.openlibrary.org/b/isbn/9780593135204-L.jpg?default=false",
    genre: "Science Fiction",
  },
  {
    id: "5",
    title: "The Alchemist",
    author: "Paulo Coelho",
    description: "A magical tale about following your dreams through the deserts and markets of the world.",
    cover: "https://covers.openlibrary.org/b/isbn/9780061122415-L.jpg?default=false",
    genre: "Adventure",
  },
  {
    id: "6",
    title: "Norwegian Wood",
    author: "Haruki Murakami",
    description: "A wild, ambitious and intensely compelling coming-of-age story set in 1960s Tokyo.",
    cover: "https://covers.openlibrary.org/b/isbn/9780375704024-L.jpg?default=false",
    genre: "Literary Fiction",
  },
];

export const quotes = [
  { text: "A reader lives a thousand lives before he dies. The man who never reads lives only one.", author: "George R.R. Martin" },
  { text: "Not all those who wander are lost.", author: "J.R.R. Tolkien" },
  { text: "It is our choices that show what we truly are, far more than our abilities.", author: "J.K. Rowling" },
  { text: "We read to know we are not alone.", author: "C.S. Lewis" },
  { text: "The only way out of the labyrinth of suffering is to forgive.", author: "John Green" },
];

export const moods = [
  { name: "Calm", gradient: "from-sky-900/60 to-teal-900/60" },
  { name: "Romantic", gradient: "from-rose-900/60 to-pink-900/60" },
  { name: "Motivated", gradient: "from-amber-900/60 to-orange-900/60" },
  { name: "Adventurous", gradient: "from-emerald-900/60 to-green-900/60" },
  { name: "Dark", gradient: "from-slate-900/60 to-zinc-900/60" },
  { name: "Reflective", gradient: "from-indigo-900/60 to-violet-900/60" },
];
