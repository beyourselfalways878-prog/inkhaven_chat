-- Add HNSW index for fast approximate nearest neighbor search
-- This is critical for scaling matching beyond 10k users

-- Enable vector extension if not already enabled (redundant but safe)
CREATE EXTENSION IF NOT EXISTS vector;

-- Add HNSW index on the embedding column
-- efficient for cosine similarity (vector_cosine_ops)
-- m=16, ef_construction=64 are good defaults for 384d vectors
CREATE INDEX IF NOT EXISTS user_embeddings_embedding_idx 
ON public.user_embeddings 
USING hnsw (embedding vector_cosine_ops) 
WITH (m = 16, ef_construction = 64);

-- Add index for last_chat_embedding as well if used for matching
CREATE INDEX IF NOT EXISTS user_embeddings_chat_embedding_idx 
ON public.user_embeddings 
USING hnsw (last_chat_embedding vector_cosine_ops) 
WITH (m = 16, ef_construction = 64);
