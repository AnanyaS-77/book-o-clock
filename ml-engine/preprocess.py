import pandas as pd

# load dataset
df = pd.read_csv("dataset/books.csv", on_bad_lines="skip")

# show basic info
print(df.head())

# check missing values
print(df.isnull().sum())

# fill missing values
df["authors"] = df["authors"].fillna("")
df["title"] = df["title"].fillna("")
df["average_rating"] = df["average_rating"].fillna(0)

# create popularity score
df["popularity"] = df["average_rating"] * df["ratings_count"]

# save cleaned dataset
df.to_csv("dataset/clean_books.csv", index=False)

print("Dataset cleaned and saved as clean_books.csv")