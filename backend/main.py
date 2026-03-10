from fastapi import FastAPI
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

app = FastAPI()

# Load dataset
df = pd.read_csv("dataset/clean_books.csv")

# Create combined features
df["features"] = df["title"] + " " + df["authors"] + " " + df["publisher"]

# Vectorization
vectorizer = TfidfVectorizer(stop_words="english")
tfidf_matrix = vectorizer.fit_transform(df["features"])

# Similarity
similarity_matrix = cosine_similarity(tfidf_matrix)


def recommend(book_title, n=5):

    index = df[df["title"] == book_title].index

    if len(index) == 0:
        return ["Book not found"]

    index = index[0]

    scores = list(enumerate(similarity_matrix[index]))
    scores = sorted(scores, key=lambda x: x[1], reverse=True)

    scores = scores[1:n+1]

    book_indices = [i[0] for i in scores]

    return df["title"].iloc[book_indices].tolist()


@app.get("/")
def home():
    return {"message": "Book O Clock API running"}


@app.get("/recommend")
def get_recommendations(book: str):
    return {"recommendations": recommend(book)}