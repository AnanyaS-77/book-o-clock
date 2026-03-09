from fastapi import FastAPI
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

app = FastAPI()

# Load dataset
df = pd.read_csv("dataset/clean_books.csv")

# Create features
df["features"] = (
    df["title"] + " " +
    df["authors"] + " " +
    df["publisher"]
)

# Vectorization
vectorizer = TfidfVectorizer(stop_words="english")
tfidf_matrix = vectorizer.fit_transform(df["features"])

# Similarity matrix
similarity_matrix = cosine_similarity(tfidf_matrix)


def recommend(book_title, num_recommendations=5):

    book_index = df[df["title"] == book_title].index

    if len(book_index) == 0:
        return ["Book not found"]

    book_index = book_index[0]

    similarity_scores = list(enumerate(similarity_matrix[book_index]))

    similarity_scores = sorted(similarity_scores, key=lambda x: x[1], reverse=True)

    similarity_scores = similarity_scores[1:num_recommendations+1]

    book_indices = [i[0] for i in similarity_scores]

    return df["title"].iloc[book_indices].tolist()


@app.get("/")
def home():
    return {"message": "Book O' Clock API is running"}


@app.get("/recommend")
def get_recommendations(book: str):
    recommendations = recommend(book)
    return {"recommended_books": recommendations}