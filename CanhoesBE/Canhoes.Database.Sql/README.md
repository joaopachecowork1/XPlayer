# Canhoes.Database.Sql

Projeto SQL para `Publish Database` no Visual Studio.

## O que faz

- aplica schema incremental e idempotente para a base de dados do Canhoes
- faz seed do evento default `canhoes-do-ano`
- mantém compatibilidade com bases de dados antigas onde faltam colunas como `EventId`

## Como usar

1. Abrir [`Canhoes.Database.Sql.sqlproj`](C:\PessoalRepo\Canhoes\CanhoesBE\Canhoes.Database.Sql\Canhoes.Database.Sql.sqlproj) no Visual Studio com SSDT instalado.
2. `Build`.
3. `Right click` no projeto.
4. `Publish`.
5. Escolher a ligação SQL Server / Azure SQL.

## Ficheiros principais

- [`Script.PostDeployment.sql`](C:\PessoalRepo\Canhoes\CanhoesBE\Canhoes.Database.Sql\Script.PostDeployment.sql)
- [`CreateOrUpdate.Canhoes.sql`](C:\PessoalRepo\Canhoes\CanhoesBE\Canhoes.Database.Sql\Scripts\Schema\CreateOrUpdate.Canhoes.sql)
- [`Seed.DefaultData.sql`](C:\PessoalRepo\Canhoes\CanhoesBE\Canhoes.Database.Sql\Scripts\Seed\Seed.DefaultData.sql)
