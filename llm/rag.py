"""Ask questions about FloodShield BD and get answers from our own project documents.

Everything runs locally:
  - chunking:   documents are split at their headings, long sections again at paragraph
                breaks (variable-size chunks that keep one topic together)
  - embeddings: nomic-embed-text through Ollama
  - vector DB:  ChromaDB, stored in llm/.rag_index
  - search:     hybrid = BM25 keyword search + vector search, merged with reciprocal rank fusion
  - query:      the local LLM first rewrites the question into a short search query
  - answer:     qwen2.5:3b answers only from the retrieved chunks and names its sources;
                if nothing relevant is found it says it does not know

Run:  python rag.py --build              (index the documents)
      python rag.py "How is flood frequency computed?"
"""
import pathlib
import re
import sys

import chromadb
import httpx
from rank_bm25 import BM25Okapi

ROOT = pathlib.Path(__file__).resolve().parent.parent
DOCS = ["README.md", "mcp/README.md", "llm/README.md"]
OLLAMA = "http://localhost:11434"
EMBED, LLM = "nomic-embed-text", "qwen2.5:3b"
MAX_CHARS = 900
db = chromadb.PersistentClient(path=str(ROOT / "llm" / ".rag_index"))


def chunk(path: str) -> list[dict]:
    text = (ROOT / path).read_text(encoding="utf-8")
    out, title, buf = [], path, []

    def flush():
        body = "\n".join(buf).strip()
        if not body:
            return
        piece = ""
        for para in re.split(r"\n\s*\n", body):          # split long sections at paragraphs
            if piece and len(piece) + len(para) > MAX_CHARS:
                out.append({"title": title, "text": piece.strip(), "src": path})
                piece = ""
            piece += para + "\n\n"
        if piece.strip():
            out.append({"title": title, "text": piece.strip(), "src": path})

    for line in text.splitlines():
        if re.match(r"^#{1,4} ", line):                  # a new heading starts a new topic
            flush()
            title, buf = line.lstrip("# ").strip(), []
        else:
            buf.append(line)
    flush()
    return out


def embed(texts: list[str], kind: str) -> list[list[float]]:
    prefix = "search_document: " if kind == "doc" else "search_query: "
    r = httpx.post(f"{OLLAMA}/api/embed", timeout=120, json={"model": EMBED, "input": [prefix + t for t in texts]})
    r.raise_for_status()
    return r.json()["embeddings"]


def chat(system: str, user: str) -> str:
    r = httpx.post(f"{OLLAMA}/api/chat", timeout=180, json={
        "model": LLM, "stream": False, "options": {"temperature": 0},
        "messages": [{"role": "system", "content": system}, {"role": "user", "content": user}]})
    r.raise_for_status()
    return r.json()["message"]["content"].strip()


def build():
    chunks = [c for d in DOCS for c in chunk(d)]
    try:
        db.delete_collection("floodshield")
    except Exception:
        pass
    col = db.create_collection("floodshield", metadata={"hnsw:space": "cosine"})
    docs = [f"{c['title']}\n{c['text']}" for c in chunks]
    col.add(ids=[str(i) for i in range(len(chunks))], documents=docs,
            embeddings=embed(docs, "doc"), metadatas=[{"src": c["src"], "title": c["title"]} for c in chunks])
    print(f"indexed {len(chunks)} chunks from {len(DOCS)} documents")


def _tok(s: str) -> list[str]:
    return re.findall(r"\w+", s.lower())


def search(query: str, k: int = 4) -> list[dict]:
    col = db.get_collection("floodshield")
    allc = col.get(include=["documents", "metadatas"])
    ids, docs, metas = allc["ids"], allc["documents"], allc["metadatas"]
    # keyword ranking (BM25)
    bm = BM25Okapi([_tok(d) for d in docs]).get_scores(_tok(query))
    kw_rank = [ids[i] for i in sorted(range(len(ids)), key=lambda i: -bm[i])]
    # vector ranking
    v = col.query(query_embeddings=embed([query], "query"), n_results=min(10, len(ids)))
    vec_rank, vec_dist = v["ids"][0], dict(zip(v["ids"][0], v["distances"][0]))
    # reciprocal rank fusion
    score = {}
    for rank_list in (kw_rank[:10], vec_rank):
        for r, i in enumerate(rank_list):
            score[i] = score.get(i, 0) + 1 / (60 + r)
    best = sorted(score, key=lambda i: -score[i])[:k]
    by_id = {i: (d, m) for i, d, m in zip(ids, docs, metas)}
    return [{"id": i, "text": by_id[i][0], "src": by_id[i][1]["src"], "title": by_id[i][1]["title"],
             "vec_distance": round(vec_dist.get(i, 1.0), 3)} for i in best]


def ask(question: str) -> dict:
    query = chat("Rewrite the user's question as a short search query of key words in English. "
                 "Reply with the query only.", question).splitlines()[0]
    hits = search(query)
    if min(h["vec_distance"] for h in hits) > 0.6:      # nothing close enough: do not guess
        return {"query": query, "answer": "I don't know from our documents.", "sources": []}
    context = "\n\n".join(f"[{n + 1}] ({h['src']} / {h['title']})\n{h['text']}" for n, h in enumerate(hits))
    answer = chat("Answer the question using only the numbered sources. Cite sources like [1]. "
                  "If the sources do not contain the answer, say you don't know. Keep it to 3 sentences.",
                  f"Sources:\n{context}\n\nQuestion: {question}")
    return {"query": query, "answer": answer, "sources": [f"[{n + 1}] {h['src']} / {h['title']}" for n, h in enumerate(hits)]}


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    if sys.argv[1:] == ["--build"]:
        build()
    else:
        r = ask(" ".join(sys.argv[1:]) or "How is flood frequency computed?")
        print("search query:", r["query"])
        print("answer:", r["answer"])
        print("sources:", *r["sources"], sep="\n  ")
