-- Bucket público para logos, capas, fotos de serviços e portfólio.
insert into storage.buckets (id, name, public)
values ('business-media', 'business-media', true)
on conflict (id) do nothing;

-- Convenção de path: business-media/{business_id}/{arquivo}
-- Owner pode gerenciar arquivos só dentro da pasta do próprio business_id.
create policy "business-media: owner can insert"
on storage.objects for insert
with check (
  bucket_id = 'business-media'
  and (storage.foldername(name))[1] in (
    select id::text from businesses where owner_id = auth.uid()
  )
);

create policy "business-media: owner can update"
on storage.objects for update
using (
  bucket_id = 'business-media'
  and (storage.foldername(name))[1] in (
    select id::text from businesses where owner_id = auth.uid()
  )
);

create policy "business-media: owner can delete"
on storage.objects for delete
using (
  bucket_id = 'business-media'
  and (storage.foldername(name))[1] in (
    select id::text from businesses where owner_id = auth.uid()
  )
);

create policy "business-media: anyone can read"
on storage.objects for select
using (bucket_id = 'business-media');
;
