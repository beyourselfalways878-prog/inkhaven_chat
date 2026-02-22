-- =============================================================================
-- Migration 003: Add find_best_vector_match RPC
-- =============================================================================
-- Uses pgvector cosine similarity to find the best match for a user
-- in the connection queue. Falls back gracefully if no embeddings exist.

-- Drop existing function if return type differs
DROP FUNCTION IF EXISTS public.find_best_vector_match(uuid, text, integer);

CREATE OR REPLACE FUNCTION public.find_best_vector_match(
  p_user_id UUID,
  p_mode TEXT DEFAULT 'casual',
  p_limit INT DEFAULT 10
)
RETURNS TABLE (
  user_id UUID,
  compatibility_score FLOAT,
  interests TEXT[],
  comfort_level TEXT,
  vibe_score INT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    cq.user_id,
    -- Cosine similarity between user embeddings (1 = identical, 0 = orthogonal)
    COALESCE(1 - (ue_self.embedding <=> ue_other.embedding), 0.5)::FLOAT AS compatibility_score,
    cq.interests,
    cq.comfort_level,
    cq.vibe_score
  FROM public.connection_queue cq
  -- Join embeddings for candidate
  LEFT JOIN public.user_embeddings ue_other ON ue_other.user_id = cq.user_id
  -- Join embeddings for requesting user
  LEFT JOIN public.user_embeddings ue_self ON ue_self.user_id = p_user_id
  WHERE cq.user_id != p_user_id
    AND cq.mode = p_mode
    AND cq.matched_with IS NULL
    AND cq.waiting_since > NOW() - INTERVAL '10 minutes'
  ORDER BY
    -- Prefer users with actual embedding similarity
    CASE WHEN ue_self.embedding IS NOT NULL AND ue_other.embedding IS NOT NULL
         THEN 1 - (ue_self.embedding <=> ue_other.embedding)
         ELSE 0.5 END DESC,
    -- Then by vibe score
    cq.vibe_score DESC
  LIMIT p_limit;
END;
$$;
