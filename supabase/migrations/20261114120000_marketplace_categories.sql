-- Align the category taxonomy with the KAMY marketplace brief (seven top-level categories).
update public.categories set name_id = '3D & Aset Game', name_en = '3D & Game Assets' where id = '3d-game';
update public.categories set name_id = 'UI/UX & Web', name_en = 'UI/UX & Web' where id = 'ui-ux';
update public.categories set name_id = 'Desain Grafis', name_en = 'Graphic Design' where id = 'graphics';
update public.categories set name_id = 'Software & Tools', name_en = 'Software & Tools' where id = 'tools-plugins';

insert into public.categories (id, parent_id, name_id, name_en, icon, sort_order)
values ('creative-services', null, 'Jasa Kreatif', 'Creative Services', 'services', 70)
on conflict (id) do nothing;

update public.categories
   set parent_id = 'creative-services', name_id = 'Desain kustom', name_en = 'Custom design', icon = 'services', sort_order = 10
 where id = 'services';

insert into public.categories (id, parent_id, name_id, name_en, icon, sort_order) values
  ('web-development', 'creative-services', 'Pengembangan website', 'Website development', 'desktop', 20),
  ('custom-3d', 'creative-services', '3D kustom', 'Custom 3D', 'model3d', 30)
on conflict (id) do nothing;
