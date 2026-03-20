import json
import os
import re
import time
from difflib import SequenceMatcher, get_close_matches
from urllib.parse import quote
from urllib.request import urlopen

import pandas as pd
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

app = FastAPI()


def normalize_origin(origin: str) -> str:
    return origin.strip().rstrip("/")


def get_allowed_origins():
    raw_value = os.getenv(
        "ALLOWED_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173,http://localhost:8080,http://127.0.0.1:8080"
    )
    return [normalize_origin(origin) for origin in raw_value.split(",") if origin.strip()]


def get_allowed_origin_regex():
    raw_value = os.getenv("ALLOWED_ORIGIN_REGEX", "").strip()
    return raw_value or None


app.add_middleware(
    CORSMiddleware,
    allow_origins=get_allowed_origins(),
    allow_origin_regex=get_allowed_origin_regex(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Load dataset
dataset_path = os.path.join(os.path.dirname(__file__), "../dataset/clean_books.csv")
df = pd.read_csv(dataset_path)

# Normalize column names (some have leading/trailing spaces)
df.columns = df.columns.str.strip()
df = df.fillna("")


def normalize_text(value: str) -> str:
    value = str(value).lower().strip()
    value = re.sub(r"[^a-z0-9\s]", " ", value)
    return re.sub(r"\s+", " ", value).strip()


def title_tokens(value: str):
    return {token for token in normalize_text(value).split() if len(token) > 2}


def is_reasonable_fuzzy_match(query: str, candidate: str) -> bool:
    similarity = SequenceMatcher(None, query, candidate).ratio()
    shared_tokens = len(title_tokens(query) & title_tokens(candidate))

    return similarity >= 0.9 or (similarity >= 0.82 and shared_tokens >= 2)


df["normalized_title"] = df["title"].map(normalize_text)
df["normalized_authors"] = df["authors"].map(normalize_text)
df["popularity_score"] = pd.to_numeric(df.get("ratings_count", 0), errors="coerce").fillna(0)

# Create combined features
df["features"] = df["title"] + " " + df["authors"] + " " + df["publisher"]

# Vectorization
vectorizer = TfidfVectorizer(stop_words="english")
tfidf_matrix = vectorizer.fit_transform(df["features"])

GOOGLE_BOOKS_CACHE_TTL_SECONDS = 60 * 30
google_books_cache = {}

GENRE_QUERY_ALIASES = {
    "thriller": "thriller",
    "thrillers": "thriller",
    "mystery": "mystery",
    "mysteries": "mystery",
    "fantasy": "fantasy",
    "romance": "romance",
    "romantic": "romance",
    "science fiction": "science fiction",
    "sci fi": "science fiction",
    "sci-fi": "science fiction",
    "scifi": "science fiction",
    "literary fiction": "literary fiction",
    "historical fiction": "historical fiction",
    "memoir": "memoir",
    "biography": "biography",
    "adventure": "adventure",
    "poetry": "poetry",
    "philosophy": "philosophy",
    "self help": "self help",
    "self-help": "self help",
}

GENRE_DISCOVERY_QUERIES = {
    "thriller": [
        'subject:"Thrillers"',
        'subject:"Psychological fiction"',
    ],
    "mystery": [
        'subject:"Mystery fiction"',
        'subject:"Detective and mystery stories"',
    ],
    "fantasy": [
        'subject:"Fantasy fiction"',
        'subject:"Magic"',
    ],
    "romance": [
        'subject:"Romance"',
        'subject:"Love stories"',
    ],
    "science fiction": [
        'subject:"Science fiction"',
        'subject:"Space warfare"',
    ],
    "literary fiction": [
        'subject:"Literary Collections"',
        'subject:"Domestic fiction"',
    ],
    "historical fiction": [
        'subject:"Historical fiction"',
        'subject:"History"',
    ],
    "memoir": [
        'subject:"Memoir"',
        'subject:"Autobiography"',
    ],
    "biography": [
        'subject:"Biography & Autobiography"',
        'subject:"Biographical"',
    ],
    "adventure": [
        'subject:"Adventure stories"',
        'subject:"Explorers"',
    ],
    "poetry": [
        'subject:"Poetry"',
        'subject:"Poets"',
    ],
    "philosophy": [
        'subject:"Philosophy"',
        'subject:"Ethics"',
    ],
    "self help": [
        'subject:"Self-Help"',
        'subject:"Personal growth"',
    ],
}

GENRE_FALLBACK_KEYWORDS = {
    "thriller": ["thriller", "mystery", "crime", "suspense"],
    "mystery": ["mystery", "detective", "crime", "suspense"],
    "fantasy": ["fantasy", "magic", "dragon", "myth"],
    "romance": ["romance", "love", "relationship"],
    "science fiction": ["science fiction", "space", "future", "alien"],
    "literary fiction": ["literary", "fiction", "novel"],
    "historical fiction": ["history", "historical", "war"],
    "memoir": ["memoir", "personal", "life"],
    "biography": ["biography", "autobiography", "life"],
    "adventure": ["adventure", "journey", "quest", "expedition"],
    "poetry": ["poetry", "poems", "poet"],
    "philosophy": ["philosophy", "meaning", "ethics"],
    "self help": ["self help", "success", "growth", "habit"],
}


def build_book_payload(book_row):
    def serialize_value(value):
        if pd.isna(value):
            return ""
        if hasattr(value, "item"):
            return value.item()
        return value

    return {
        "title": serialize_value(book_row["title"]),
        "authors": serialize_value(book_row["authors"]),
        "publication_date": serialize_value(book_row["publication_date"]),
        "num_pages": serialize_value(book_row["num_pages"]),
        "average_rating": serialize_value(book_row["average_rating"]),
        "isbn": serialize_value(book_row["isbn"]),
        "isbn13": serialize_value(book_row["isbn13"]),
    }


def resolve_genre_query(query: str):
    normalized_query = normalize_text(query)
    return GENRE_QUERY_ALIASES.get(normalized_query)


def get_suggestion_score(title: str, query: str) -> int:
    normalized_title = normalize_text(title)
    normalized_query = normalize_text(query)

    if not normalized_title or not normalized_query:
        return 0

    if normalized_title.startswith(normalized_query):
        return 3

    if any(word.startswith(normalized_query) for word in normalized_title.split()):
        return 2

    if normalized_query in normalized_title:
        return 1

    return 0


def get_dataset_suggestions(query: str, max_suggestions: int = 8):
    normalized_query = normalize_text(query)
    if not normalized_query:
        return []

    candidates = []
    seen_titles = set()

    for _index, row in df.iterrows():
        title = str(row["title"]).strip()
        normalized_title = row["normalized_title"]
        score = get_suggestion_score(normalized_title, normalized_query)

        if not title or not normalized_title or score <= 0 or normalized_title in seen_titles:
            continue

        seen_titles.add(normalized_title)
        candidates.append(
            {
                "title": title,
                "score": score,
                "popularity": row["popularity_score"],
            }
        )

    candidates.sort(key=lambda item: (-item["score"], -item["popularity"], item["title"]))
    return [item["title"] for item in candidates[:max_suggestions]]


def find_book_index(book_title: str):
    normalized_title = normalize_text(book_title)

    exact_matches = df[df["normalized_title"] == normalized_title]
    if not exact_matches.empty:
        return exact_matches.sort_values("popularity_score", ascending=False).index[0]

    contains_matches = df[
        df["normalized_title"].map(
            lambda title: (
                bool(title)
                and (
                    normalized_title in title
                    or title in normalized_title
                )
                and len(title_tokens(normalized_title) & title_tokens(title)) >= 2
            )
        )
    ]
    if not contains_matches.empty:
        return contains_matches.sort_values("popularity_score", ascending=False).index[0]

    close_matches = get_close_matches(
        normalized_title,
        df["normalized_title"].tolist(),
        n=1,
        cutoff=0.72,
    )
    if close_matches:
        candidate_title = close_matches[0]
        if not is_reasonable_fuzzy_match(normalized_title, candidate_title):
            return None

        fuzzy_matches = df[df["normalized_title"] == candidate_title]
        if not fuzzy_matches.empty:
            return fuzzy_matches.sort_values("popularity_score", ascending=False).index[0]

    return None


def recommend_from_dataset(book_title: str, author: str = "", n: int = 12):
    index = find_book_index(book_title)
    if index is None:
        return []

    source_title = df.loc[index, "normalized_title"]
    scores_array = cosine_similarity(tfidf_matrix[index:index + 1], tfidf_matrix).flatten()
    scores = list(enumerate(scores_array))
    scores = sorted(scores, key=lambda item: item[1], reverse=True)

    recommendations = []
    seen_titles = {source_title}
    for candidate_index, _score in scores[1:]:
        candidate = df.loc[candidate_index]
        candidate_title = candidate["normalized_title"]
        if candidate_title in seen_titles:
            continue

        seen_titles.add(candidate_title)
        recommendations.append(build_book_payload(candidate))

        if len(recommendations) >= n:
            break

    if author:
        normalized_author = normalize_text(author)
        same_author_first = []
        other_books = []
        for recommendation in recommendations:
            normalized_recommendation_author = normalize_text(recommendation["authors"])
            if normalized_author and normalized_author in normalized_recommendation_author:
                same_author_first.append(recommendation)
            else:
                other_books.append(recommendation)
        return (same_author_first + other_books)[:n]

    return recommendations


def fetch_json(url: str):
    cached_entry = google_books_cache.get(url)
    if cached_entry and time.time() - cached_entry["timestamp"] < GOOGLE_BOOKS_CACHE_TTL_SECONDS:
        return cached_entry["data"]

    with urlopen(url, timeout=4) as response:
        data = json.loads(response.read().decode("utf-8"))
        google_books_cache[url] = {
            "timestamp": time.time(),
            "data": data,
        }
        return data


def extract_isbns(industry_identifiers):
    isbn = ""
    isbn13 = ""
    for identifier in industry_identifiers or []:
        id_type = identifier.get("type", "")
        value = identifier.get("identifier", "")
        if id_type == "ISBN_13":
            isbn13 = value
        elif id_type == "ISBN_10":
            isbn = value
    return isbn, isbn13


def map_google_book(item):
    volume_info = item.get("volumeInfo", {})
    isbn, isbn13 = extract_isbns(volume_info.get("industryIdentifiers"))
    published_date = volume_info.get("publishedDate", "")

    return {
        "title": volume_info.get("title", ""),
        "authors": "/".join(volume_info.get("authors", [])),
        "publication_date": published_date,
        "num_pages": volume_info.get("pageCount", ""),
        "average_rating": volume_info.get("averageRating", ""),
        "isbn": isbn,
        "isbn13": isbn13,
    }


def find_google_seed_book(book_title: str, author: str = ""):
    try:
        if author:
            seed_query_value = f'intitle:"{book_title}" inauthor:"{author}"'
        else:
            seed_query_value = f'intitle:"{book_title}"'

        seed_data = fetch_json(
            f"https://www.googleapis.com/books/v1/volumes?q={quote(seed_query_value)}&maxResults=5&langRestrict=en&printType=books"
        )
    except Exception as error:
        print(f"Google Books seed lookup failed for '{book_title}': {error}")
        return None

    normalized_title = normalize_text(book_title)
    items = seed_data.get("items", [])
    if not items:
        return None

    ranked_items = sorted(
        items,
        key=lambda item: (
            get_suggestion_score(item.get("volumeInfo", {}).get("title", ""), normalized_title),
            item.get("volumeInfo", {}).get("ratingsCount", 0),
        ),
        reverse=True,
    )

    best_item = ranked_items[0]
    best_title = normalize_text(best_item.get("volumeInfo", {}).get("title", ""))

    if not best_title or not is_reasonable_fuzzy_match(normalized_title, best_title):
        return None

    return map_google_book(best_item)


def resolve_source_book(book_title: str, author: str = ""):
    if not author and resolve_genre_query(book_title):
        return None

    index = find_book_index(book_title)
    if index is not None:
        return build_book_payload(df.loc[index])

    return find_google_seed_book(book_title, author=author)


def recommend_from_google_books(book_title: str, author: str = "", n: int = 12):
    seed_book = find_google_seed_book(book_title, author=author)
    if not seed_book:
        return []

    normalized_title = normalize_text(book_title)
    category = ""
    primary_author = author or seed_book.get("authors", "").split("/")[0]

    google_seed = find_google_seed_book(book_title, author=author)
    if google_seed:
        # Pull richer category data from the cached Google item when available.
        try:
            if author:
                seed_query_value = f'intitle:"{book_title}" inauthor:"{author}"'
            else:
                seed_query_value = f'intitle:"{book_title}"'
            seed_data = fetch_json(
                f"https://www.googleapis.com/books/v1/volumes?q={quote(seed_query_value)}&maxResults=5&langRestrict=en&printType=books"
            )
            items = seed_data.get("items", [])
            if items:
                best_item = sorted(
                    items,
                    key=lambda item: (
                        get_suggestion_score(item.get("volumeInfo", {}).get("title", ""), normalized_title),
                        item.get("volumeInfo", {}).get("ratingsCount", 0),
                    ),
                    reverse=True,
                )[0]
                seed_info = best_item.get("volumeInfo", {})
                category = (seed_info.get("categories") or [""])[0]
                primary_author = author or (seed_info.get("authors") or [""])[0] or primary_author
        except Exception:
            pass

    queries = []
    if category:
        queries.append(f'subject:"{category}"')
    if primary_author:
        queries.append(f'inauthor:"{primary_author}"')
    if category and primary_author:
        queries.insert(0, f'subject:"{category}" inauthor:"{primary_author}"')
    queries.append(f'intitle:"{book_title}"')

    recommendations = []
    seen_titles = {normalized_title}

    for query in queries:
        try:
            data = fetch_json(
                f"https://www.googleapis.com/books/v1/volumes?q={quote(query)}&maxResults=20"
            )
        except Exception as error:
            print(f"Google Books recommendations lookup failed for '{book_title}': {error}")
            continue

        for item in data.get("items", []):
            mapped_book = map_google_book(item)
            candidate_title = normalize_text(mapped_book["title"])

            if not candidate_title or candidate_title in seen_titles:
                continue

            seen_titles.add(candidate_title)
            recommendations.append(mapped_book)

            if len(recommendations) >= n:
                return recommendations

    return recommendations


def fallback_books_for_genre(genre: str, n: int = 12):
    keywords = GENRE_FALLBACK_KEYWORDS.get(genre, [])
    if not keywords:
        return []

    matches = df[
        df["title"].map(normalize_text).map(lambda value: any(keyword in value for keyword in keywords))
        | df["publisher"].map(normalize_text).map(lambda value: any(keyword in value for keyword in keywords))
        | df["authors"].map(normalize_text).map(lambda value: any(keyword in value for keyword in keywords))
    ]

    if matches.empty:
        return [
            build_book_payload(row)
            for _index, row in df.sort_values("popularity_score", ascending=False).head(n).iterrows()
        ]

    return [
        build_book_payload(row)
        for _index, row in matches.sort_values("popularity_score", ascending=False).head(n).iterrows()
    ]


def discover_books_by_genre(genre: str, n: int = 12):
    genre_key = resolve_genre_query(genre) or normalize_text(genre)
    queries = GENRE_DISCOVERY_QUERIES.get(genre_key, [])[:2]
    recommendations = []
    seen_titles = set()

    for query in queries:
        try:
            data = fetch_json(
                f"https://www.googleapis.com/books/v1/volumes?q={quote(query)}&orderBy=relevance&maxResults=20&printType=books&langRestrict=en"
            )
        except Exception as error:
            print(f"Google Books genre lookup failed for '{genre}' with query '{query}': {error}")
            continue

        for item in data.get("items", []):
            mapped_book = map_google_book(item)
            candidate_title = normalize_text(mapped_book["title"])

            if not candidate_title or candidate_title in seen_titles:
                continue

            seen_titles.add(candidate_title)
            recommendations.append(mapped_book)

            if len(recommendations) >= n:
                return recommendations

    if recommendations:
        return recommendations

    return fallback_books_for_genre(genre_key, n=n)


def recommend(book_title, author="", n=12):
    genre_query = resolve_genre_query(book_title) if not author else None
    if genre_query:
        return discover_books_by_genre(genre_query, n=n)

    dataset_recommendations = recommend_from_dataset(book_title, author=author, n=n)
    if dataset_recommendations:
        return dataset_recommendations

    return recommend_from_google_books(book_title, author=author, n=n)


def get_supported_suggestions(query: str, max_suggestions: int = 8, candidate_limit: int = 12):
    normalized_query = normalize_text(query)
    if not normalized_query:
        return []

    try:
        data = fetch_json(
            f"https://www.googleapis.com/books/v1/volumes?q={quote(f'intitle:{query}')}&maxResults={candidate_limit}&langRestrict=en&printType=books"
        )
    except Exception as error:
        print(f"Google Books suggestions lookup failed for '{query}', using dataset fallback: {error}")
        return get_dataset_suggestions(query, max_suggestions=max_suggestions)

    titles = []
    seen_titles = set()
    for item in data.get("items", []):
        title = item.get("volumeInfo", {}).get("title", "").strip()
        normalized_title = normalize_text(title)
        if not title or normalized_title in seen_titles:
            continue
        seen_titles.add(normalized_title)
        titles.append(title)

    ranked_titles = sorted(
        (
            {"title": title, "score": get_suggestion_score(title, normalized_query)}
            for title in titles
        ),
        key=lambda item: (-item["score"], item["title"]),
    )

    suggestions = []
    for item in ranked_titles:
        if item["score"] <= 0:
            continue
        suggestions.append(item["title"])
        if len(suggestions) >= max_suggestions:
            break

    return suggestions or get_dataset_suggestions(query, max_suggestions=max_suggestions)


MOOD_DISCOVERY_QUERIES = {
    "calm": [
        'subject:"Poetry"',
        'subject:"Nature"',
    ],
    "romantic": [
        'subject:"Romance"',
        'subject:"Love stories"',
    ],
    "motivated": [
        'subject:"Self-Help"',
        'subject:"Biography & Autobiography"',
    ],
    "adventurous": [
        'subject:"Adventure stories"',
        'subject:"Fantasy fiction"',
    ],
    "dark": [
        'subject:"Thrillers"',
        'subject:"Mystery fiction"',
    ],
    "reflective": [
        'subject:"Philosophy"',
        'subject:"Psychology"',
    ],
}


def fallback_books_for_mood(mood: str, n: int = 12):
    mood_key = normalize_text(mood)
    genre_keywords = {
        "calm": ["poetry", "literary", "fiction"],
        "romantic": ["romance", "literary", "fiction"],
        "motivated": ["adventure", "fiction"],
        "adventurous": ["adventure", "fantasy", "science fiction"],
        "dark": ["thriller", "mystery"],
        "reflective": ["literary", "fiction", "fantasy"],
    }

    keywords = genre_keywords.get(mood_key, [])
    if not keywords:
        return []

    matches = df[
        df["title"].map(normalize_text).map(lambda value: any(keyword in value for keyword in keywords))
        | df["publisher"].map(normalize_text).map(lambda value: any(keyword in value for keyword in keywords))
    ]

    if matches.empty:
        matches = df[
            df["authors"].map(normalize_text).map(lambda value: any(keyword in value for keyword in keywords))
        ]

    if matches.empty:
        return [build_book_payload(row) for _index, row in df.sort_values("popularity_score", ascending=False).head(n).iterrows()]

    return [
        build_book_payload(row)
        for _index, row in matches.sort_values("popularity_score", ascending=False).head(n).iterrows()
    ]


def discover_books_by_mood(mood: str, n: int = 12):
    mood_key = normalize_text(mood)
    queries = MOOD_DISCOVERY_QUERIES.get(mood_key, [])[:2]
    recommendations = []
    seen_titles = set()

    for query in queries:
        try:
            data = fetch_json(
                f"https://www.googleapis.com/books/v1/volumes?q={quote(query)}&orderBy=relevance&maxResults=20&printType=books&langRestrict=en"
            )
        except Exception as error:
            print(f"Google Books mood lookup failed for '{mood}' with query '{query}': {error}")
            continue

        for item in data.get("items", []):
            mapped_book = map_google_book(item)
            candidate_title = normalize_text(mapped_book["title"])

            if not candidate_title or candidate_title in seen_titles:
                continue

            seen_titles.add(candidate_title)
            recommendations.append(mapped_book)

            if len(recommendations) >= n:
                return recommendations

    if recommendations:
        return recommendations

    return fallback_books_for_mood(mood_key, n=n)


@app.get("/")
def home():
    return {"message": "Book O Clock API running"}


@app.get("/health")
def healthcheck():
    return {"status": "ok"}


@app.get("/recommend")
def get_recommendations(book: str, author: str = ""):
    return {
        "source_book": resolve_source_book(book, author=author),
        "recommendations": recommend(book, author=author),
    }


@app.get("/search/suggestions")
def get_search_suggestions(query: str, limit: int = 8):
    return {"suggestions": get_supported_suggestions(query, max_suggestions=limit)}


@app.get("/discover/mood")
def get_mood_discovery(mood: str):
    return {"recommendations": discover_books_by_mood(mood)}
