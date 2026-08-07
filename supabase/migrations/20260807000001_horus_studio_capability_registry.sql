insert into public.capabilities (id, display_name, category, enabled)
values
('APPS','Apps','studio',true),('AUDIO','Audio','studio',true),('CAMPAIGNS','Campaigns','studio',true),('CODE','Code','studio',true),('DASHBOARDS','Dashboards','studio',true),('DEV','Dev','studio',true),('DOCS','Docs','studio',true),('IMAGE','Image','studio',true),('MUSIC','Music','studio',true),('PRESENTATIONS','Presentations','studio',true),('VIDEO','Video','studio',true),('WEBSITES','Websites','studio',true),('APIS','APIs','studio',true),('AUTOMATIONS','Automations','studio',true)
on conflict (id) do update set display_name = excluded.display_name, category = excluded.category, enabled = excluded.enabled, updated_at = now();
