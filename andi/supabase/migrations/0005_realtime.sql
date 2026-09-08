-- Enable Realtime broadcast for the tables the app subscribes to from the
-- client (chat messages, live notifications, and rental status changes so
-- both sides of a booking see status updates instantly).
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.notifications;
alter publication supabase_realtime add table public.rentals;
