from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Load dataset
import os
dataset_path = os.path.join(os.path.dirname(__file__), "../dataset/clean_books.csv")
df = pd.read_csv(dataset_path)

# Normalize column names (some have leading/trailing spaces)
df.columns = df.columns.str.strip()

# Create combined features
df["features"] = df["title"] + " " + df["authors"] + " " + df["publisher"]

# Vectorization
vectorizer = TfidfVectorizer(stop_words="english")
tfidf_matrix = vectorizer.fit_transform(df["features"])

# Similarity
similarity_matrix = cosine_similarity(tfidf_matrix)


def recommend(book_title, n=12):

    matches = df[df["title"].str.contains(book_title, case=False, na=False)]

    if matches.empty:
        return []

    index = matches.index[0]

    scores = list(enumerate(similarity_matrix[index]))
    scores = sorted(scores, key=lambda x: x[1], reverse=True)

    scores = scores[1:n+1]

    book_indices = [i[0] for i in scores]

    # Return a list of rich book objects to avoid relying on external APIs for metadata.
    return (
        df.loc[book_indices, [
            "title",
            "authors",
            "publication_date",
            "num_pages",
            "average_rating",
            "isbn",
            "isbn13",
        ]]
        .fillna("")
        .to_dict(orient="records")
    )


@app.get("/")
def home():
    return {"message": "Book O Clock API running"}


@app.get("/recommend")
def get_recommendations(book: str):
    return {"recommendations": recommend(book)}