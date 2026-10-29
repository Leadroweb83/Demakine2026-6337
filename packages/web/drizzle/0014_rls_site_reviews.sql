-- site_reviews nasceu sem RLS (advisor do Supabase: rls_disabled_in_public). As outras tabelas já têm
-- RLS ligado e sem policy: a API do Supabase (chave pública) não enxerga nada, e o site grava e lê
-- pela conexão direta do banco, que não passa pelo RLS.
ALTER TABLE "site_reviews" ENABLE ROW LEVEL SECURITY;
