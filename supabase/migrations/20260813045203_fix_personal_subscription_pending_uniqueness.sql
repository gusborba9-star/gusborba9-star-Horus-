drop index if exists public.personal_subscriptions_one_active_per_user;
create unique index if not exists personal_subscriptions_one_active_per_user
  on public.personal_subscriptions(user_id)
  where status in ('ACTIVE','PAST_DUE','PAUSED');
