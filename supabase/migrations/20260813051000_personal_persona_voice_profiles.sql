update public.personal_personas set
 voice_profile = case id
  when 'aline' then '{"gender":"female","locale":"pt-BR","primary":{"engine":"browser","voice_hint":"pt-BR-female-natural","stability":"high"},"fallback":{"engine":"browser","voice_hint":"pt-BR-female-neutral","stability":"high"}}'::jsonb
  when 'luiza' then '{"gender":"female","locale":"pt-BR","primary":{"engine":"browser","voice_hint":"pt-BR-female-natural","stability":"high"},"fallback":{"engine":"browser","voice_hint":"pt-BR-female-neutral","stability":"high"}}'::jsonb
  when 'iris' then '{"gender":"female","locale":"pt-BR","primary":{"engine":"browser","voice_hint":"pt-BR-female-precise","stability":"high"},"fallback":{"engine":"browser","voice_hint":"pt-BR-female-neutral","stability":"high"}}'::jsonb
  when 'clara' then '{"gender":"female","locale":"pt-BR","primary":{"engine":"browser","voice_hint":"pt-BR-female-warm","stability":"high"},"fallback":{"engine":"browser","voice_hint":"pt-BR-female-neutral","stability":"high"}}'::jsonb
  when 'bel' then '{"gender":"female","locale":"pt-BR","primary":{"engine":"browser","voice_hint":"pt-BR-female-dynamic","stability":"high"},"fallback":{"engine":"browser","voice_hint":"pt-BR-female-neutral","stability":"high"}}'::jsonb
  when 'lucia' then '{"gender":"female","locale":"pt-BR","primary":{"engine":"browser","voice_hint":"pt-BR-female-calm","stability":"high"},"fallback":{"engine":"browser","voice_hint":"pt-BR-female-neutral","stability":"high"}}'::jsonb
  else voice_profile end,
 personality_profile = case id
  when 'aline' then '{"archetype":"proactive_personal","warmth":"balanced","decision_style":"actionable"}'::jsonb
  when 'luiza' then '{"archetype":"organized_personal","warmth":"balanced","decision_style":"structured"}'::jsonb
  when 'iris' then '{"archetype":"analytical_personal","warmth":"balanced","decision_style":"evidence_first"}'::jsonb
  when 'clara' then '{"archetype":"supportive_personal","warmth":"balanced","decision_style":"contextual"}'::jsonb
  when 'bel' then '{"archetype":"energetic_personal","warmth":"balanced","decision_style":"momentum"}'::jsonb
  when 'lucia' then '{"archetype":"calm_personal","warmth":"balanced","decision_style":"minimal_intervention"}'::jsonb
  else personality_profile end
where id in ('aline','luiza','iris','clara','bel','lucia');
