-- 06 API / ROUTING + 07 SECURITY: server-side data and RPC boundaries.
-- Applied to Supabase project ljqmiuxztqseyglhvgmi before this source commit.

REVOKE ALL ON TABLE public.horus_execution_logs FROM anon, authenticated;
REVOKE ALL ON TABLE public.horus_semantic_cache_entries FROM anon, authenticated;

REVOKE ALL ON TABLE public.execution_attempts FROM anon;
REVOKE ALL ON TABLE public.execution_budgets FROM anon;
REVOKE ALL ON TABLE public.execution_usage FROM anon;
REVOKE ALL ON TABLE public.idempotency_keys FROM anon;
REVOKE ALL ON TABLE public.memory_graph_nodes FROM anon;

REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON TABLE public.providers FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON TABLE public.models FROM anon, authenticated;

REVOKE EXECUTE ON FUNCTION public.match_memory_nodes(jsonb,double precision,integer,uuid,uuid,boolean) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.prune_memory_graph(interval,interval,numeric,integer) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.authorize_horus_execution_attempt(uuid,integer,text,text,text,numeric,bigint,bigint,bigint,text,uuid) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.reconcile_horus_execution_attempt(uuid,numeric,text,bigint,bigint,bigint,bigint,numeric,numeric,text,text,text,integer,jsonb) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.reserve_horus_credits(uuid,text,bigint,text) FROM anon;
