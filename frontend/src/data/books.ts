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
  {
    id: "7",
    title: "Circe",
    author: "Madeline Miller",
    description: "A bold retelling of myth through the eyes of a banished witch who discovers power on her own terms.",
    cover: "https://covers.openlibrary.org/b/isbn/9780316556347-L.jpg?default=false",
    genre: "Fantasy",
  },
  {
    id: "8",
    title: "Klara and the Sun",
    author: "Kazuo Ishiguro",
    description: "An observant artificial friend watches human longing and loneliness unfold in a quietly unsettling future.",
    cover: "https://covers.openlibrary.org/b/isbn/9780593318171-L.jpg?default=false",
    genre: "Science Fiction",
  },
  {
    id: "9",
    title: "The Seven Husbands of Evelyn Hugo",
    author: "Taylor Jenkins Reid",
    description: "A glamorous old Hollywood icon finally tells the truth about ambition, love, and the cost of reinvention.",
    cover: "https://covers.openlibrary.org/b/isbn/9781501161933-L.jpg?default=false",
    genre: "Historical Fiction",
  },
  {
    id: "10",
    title: "Educated",
    author: "Tara Westover",
    description: "A memoir about self-invention, learning, and the painful distance that can open between family and freedom.",
    cover: "https://covers.openlibrary.org/b/isbn/9780399590504-L.jpg?default=false",
    genre: "Memoir",
  },
  {
    id: "11",
    title: "The Night Circus",
    author: "Erin Morgenstern",
    description: "A dreamlike competition between magicians unfolds inside a black-and-white circus filled with wonder.",
    cover: "https://covers.openlibrary.org/b/isbn/9780385534635-L.jpg?default=false",
    genre: "Fantasy",
  },
  {
    id: "12",
    title: "Tomorrow, and Tomorrow, and Tomorrow",
    author: "Gabrielle Zevin",
    description: "A layered story of friendship, art, and creative obsession built around a decades-long game design partnership.",
    cover: "https://covers.openlibrary.org/b/isbn/9780593321201-L.jpg?default=false",
    genre: "Literary Fiction",
  },
  {
    id: "13",
    title: "The Martian",
    author: "Andy Weir",
    description: "A stranded astronaut turns survival into a suspenseful, funny engineering puzzle on the surface of Mars.",
    cover: "https://covers.openlibrary.org/b/isbn/9780804139021-L.jpg?default=false",
    genre: "Science Fiction",
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
