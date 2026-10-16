create or replace function public.cancel_customer_order(p_order_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  update public.orders
  set status = 'cancelled'
  where id = p_order_id
    and customer_id = auth.uid()
    and lower(status) = 'pending';

  return found;
end;
$$;

revoke all on function public.cancel_customer_order(uuid) from public;
grant execute on function public.cancel_customer_order(uuid) to authenticated;

notify pgrst, 'reload schema';