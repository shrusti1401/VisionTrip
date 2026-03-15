from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
import os

docs = []

KB_FOLDER = "Monuments_KB"

for file in os.listdir(KB_FOLDER):
    loader = TextLoader(f"{KB_FOLDER}/{file}", encoding="utf-8")
    docs.extend(loader.load())

splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
chunks = splitter.split_documents(docs)

embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

db = FAISS.from_documents(chunks, embeddings)

db.save_local("monument_index")

print("✅ Monument vector index created successfully!")
