create table if not exists people (
    id serial primary key,
    name varchar(255) not null,
    age int not null
);

insert into people (name, age) values
  ('John', 30),
  ('Jane', 25),
  ('Bob', 40),
  ('Mary', 35);
