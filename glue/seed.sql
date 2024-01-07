drop table ppl;

create table ppl (
  id serial primary key,
  name text not null,
  age int not null
);

insert into ppl (name, age) values
  ('Alice', 23),
  ('Bob', 25),
  ('Carol', 27),
  ('Dave', 29),
  ('Eve', 31);
