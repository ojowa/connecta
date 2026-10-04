# Archived migrations

Raw SQL files kept for historical reference only. They are **not executed** by
`npm run migration:run` — `ormconfig.ts` only globs `migrations/*.ts`
(TypeORM migrations). Use `psql` manually if you ever need to replay one of
these against a legacy database.
