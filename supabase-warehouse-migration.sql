-- شغّل هذا الملف مرة واحدة من Supabase SQL Editor.
-- يصبح كل سجل منتج تابعاً لمخزن واحد، وتكون كميته هي كمية ذلك المخزن.

alter table public.products
add column if not exists warehouse text;

update public.products
set warehouse = 'الرياض'
where warehouse is null or btrim(warehouse) = '';

alter table public.products
alter column warehouse set default 'الرياض';

alter table public.products
alter column warehouse set not null;

alter table public.products
drop constraint if exists products_warehouse_check;

alter table public.products
add constraint products_warehouse_check
check (warehouse in ('الرياض', 'جدة'));

create index if not exists products_warehouse_idx
on public.products (warehouse);

alter table public.orders
add column if not exists warehouse text;

update public.orders
set warehouse = 'الرياض'
where warehouse is null or btrim(warehouse) = '';

alter table public.orders
alter column warehouse set default 'الرياض';

alter table public.orders
alter column warehouse set not null;

alter table public.orders
drop constraint if exists orders_warehouse_check;

alter table public.orders
add constraint orders_warehouse_check
check (warehouse in ('الرياض', 'جدة'));

create index if not exists orders_warehouse_idx
on public.orders (warehouse);
