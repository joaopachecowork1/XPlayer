# TODO — Canhões do Ano

> Estado: **COMPLETO (esqueleto funcional)**. O objetivo aqui foi ter um fluxo end-to-end simples, “junior-friendly”, pronto para evoluir.

## Feito

- **Hub /canhoes**
  - Entrada única com links para Stickers, Categorias, Medidas, Votação, Gala e Admin.

- **Stickers (Nomeações) /canhoes/stickers**
  - Submeter nomeação com título e **upload de imagem**.
  - Categoria é opcional ("Admin decide") — o admin pode atribuir mais tarde.
  - Lista por categoria + bloco “sem categoria”.

- **Categorias /canhoes/categorias**
  - Propor categoria (nome + descrição opcional).
  - Categorias aprovadas aparecem como “ativas”.

- **Medidas /canhoes/medidas**
  - Propor medida (texto).
  - Medidas aprovadas aparecem listadas.

- **Votação /canhoes/votacao**
  - Mostra só nomeações **aprovadas**.
  - Voto **único e editável** (até fechar).

- **Gala /canhoes/gala**
  - Resultados por categoria com **Top 3**.
  - Mostra imagem do sticker quando existir.

- **Admin /canhoes/admin**
  - Tabs: Pendentes / Estado / Auditoria.
  - Pendentes:
    - Aprovar/Rejeitar nomeações.
    - Atribuir categoria a nomeação pendente.
    - Aprovar/Rejeitar propostas de categoria.
    - Aprovar/Rejeitar propostas de medida.
  - Estado:
    - Trocar fase (nominations/voting/locked/gala).
    - Flags: `nominationsVisible`, `resultsVisible`.
  - Auditoria:
    - Lista de votos (para estatística) — **DEV** (X-Admin=1).

- **Backend (SQLite, sem migrations)**
  - Novas entidades:
    - `CategoryProposalEntity`, `MeasureProposalEntity`, `GalaMeasureEntity`
  - Novos endpoints:
    - Propostas (público):
      - `POST /api/canhoes/categories/proposals`
      - `POST /api/canhoes/measures/proposals`
    - Admin:
      - `GET /api/canhoes/admin/pending`
      - `POST /api/canhoes/admin/nominees/{id}/set-category`
      - `POST /api/canhoes/admin/categories/{id}/approve|reject`
      - `POST /api/canhoes/admin/measures/{id}/approve|reject`
    - Resultados:
      - `GET /api/canhoes/results` (Top 3 por categoria, com imagens)

## Como testar rápido (Dev)

1. Backend
   - `cd backend/XPlayer.Api`
   - `dotnet run`
   - Swagger: `/swagger`

2. Frontend
   - `npm i`
   - `npm run dev`
   - Abrir `/canhoes`

3. Admin
   - UI já usa endpoints com header `X-Admin: 1` via `canhoesRepo`.

## Próximos passos (para iterar)

- **Auth real (roles)**
  - Substituir `MockAuthMiddleware` por JWT/Identity.
  - Introduzir roles: `Admin` vs `User`.

- **Uploads / CDN / validações**
  - Limites de tamanho.
  - Thumbnails.
  - Sanitização e anti-abuso.

- **Anonimato real**
  - Voto é anónimo na UI (ninguém vê), mas o admin tem auditoria.
  - Em produção: mover auditoria para área protegida e logs.

- **Gala mode (apresentação)**
  - “Reveal” progressivo por categoria.
  - Fullscreen mode e animações leves.

- **Seed configurável**
  - Definir categorias default via config.

