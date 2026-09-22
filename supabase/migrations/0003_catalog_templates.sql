-- ---------------------------------------------------------------------
-- Templates visuais completos: nova coluna template_id em businesses
-- ---------------------------------------------------------------------

alter table businesses
  add column template_id text not null default 'classico_dark';

update businesses set template_id = case
  when theme = 'clean_detail' then 'claro_premium'
  when theme = 'performance' then 'performance_gt'
  else 'classico_dark'
end;
