from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_community.llms import Ollama

# ---------------- LOAD EMBEDDINGS ----------------
embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)

# ---------------- LOAD FAISS ----------------
db = FAISS.load_local(
    "monument_index",
    embeddings,
    allow_dangerous_deserialization=True
)
# ---------------- LOAD LLM ----------------
llm = Ollama(model="tinyllama")

# ---------------- RAG FUNCTION ----------------
def ask_monument(monument, question):

    # Force monument into retrieval query
    search_query = f"{monument}. {question}"

    docs = db.similarity_search(search_query, k=6)

    # HARD FILTER: only docs mentioning monument
    filtered_docs = [
        d for d in docs
        if monument.lower() in d.page_content.lower()
    ]

    # fallback if nothing matched
    if not filtered_docs:
        filtered_docs = docs[:3]

    context = "\n".join([d.page_content for d in filtered_docs])

    prompt = f"""
You are a monument assistant.

Answer ONLY using this context.
If the answer is not present, say "Information not available."

Context:
{context}

Question: {question}
"""

    # Debug: see what RAG is actually using
    print("\n========== USED CONTEXT ==========\n")
    print(context)
    print("\n=================================\n")

    return llm.invoke(prompt)
