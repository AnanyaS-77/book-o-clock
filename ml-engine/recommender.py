import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# load cleaned dataset
df = pd.read_csv("dataset/clean_books.csv")

# create combined features
df["features"] = (
    df["title"] + " " +
    df["authors"] + " " +
    df["publisher"]
)

# convert text into vectors
vectorizer = TfidfVectorizer(stop_words="english")

tfidf_matrix = vectorizer.fit_transform(df["features"])

# compute similarity between books
similarity_matrix = cosine_similarity(tfidf_matrix)


def recommend(book_title, num_recommendations=5):

    # find index of book
    book_index = df[df["title"] == book_title].index

    if len(book_index) == 0:
        return "Book not found"

    book_index = book_index[0]

    # get similarity scores
    similarity_scores = list(enumerate(similarity_matrix[book_index]))

    # sort books by similarity
    similarity_scores = sorted(similarity_scores, key=lambda x: x[1], reverse=True)

    # skip the first (same book)
    similarity_scores = similarity_scores[1:num_recommendations+1]

    book_indices = [i[0] for i in similarity_scores]

    return df["title"].iloc[book_indices].tolist()


# test recommendation
print(recommend("Harry Potter and the Chamber of Secrets (Harry Potter  #2)"))