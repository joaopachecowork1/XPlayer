/*
Post-deployment entry point for the Canhoes SQL project.
The schema and seed scripts are kept separate so Visual Studio Publish Database
can run the same idempotent setup repeatedly.
*/

:r .\Scripts\Schema\CreateOrUpdate.Canhoes.sql
:r .\Scripts\Seed\Seed.DefaultData.sql
