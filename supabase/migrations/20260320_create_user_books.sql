create table if not exists public.user_books (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  cover text not null default '',
  author text not null default '',
  description text not null default '',
  year text not null default '',
  genre text not null default '',
  pages text not null default '',
  book_rating text not null default '',
  is_saved boolean not null default false,
  user_review text not null default '',
  user_rating integer not null default 0 check (user_rating between 0 and 5),
  reading_progress integer not null default 0 check (reading_progress between 0 and 100),
  reading_status text check (reading_status in ('reading', 'completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, title)
);

create or replace function public.set_user_books_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_user_books_updated_at on public.user_books;
create trigger set_user_books_updated_at
before update on public.user_books
for each row
execute function public.set_user_books_updated_at();

alter table public.user_books enable row level security;

create policy "Users can view their own books"
on public.user_books
for select
using (auth.uid() = user_id);

create policy "Users can insert their own books"
on public.user_books
for insert
with check (auth.uid() = user_id);

create policy "Users can update their own books"
on public.user_books
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete their own books"
on public.user_books
for delete
using (auth.uid() = user_id);
