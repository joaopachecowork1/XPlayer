# TODO / Próximos passos

## Auth (Google)
- [ ] No frontend, definir variáveis de ambiente:
  - `NEXTAUTH_SECRET`
  - `NEXTAUTH_URL` (ex: http://localhost:3000)
  - `GOOGLE_CLIENT_ID`
  - `GOOGLE_CLIENT_SECRET`
  - `NEXT_PUBLIC_XPLAYER_API_URL` (ex: http://localhost:5231)
- [ ] No backend, definir `Auth:Google:ClientId` (igual ao `GOOGLE_CLIENT_ID`).
- [ ] (Opcional) Adicionar outros providers (Microsoft) no NextAuth.

## Canhões do Ano
- [ ] Submissão de stickers: guardar também o `CategoryId` (quando existir) e permitir editar antes de fechar nomeações.
- [ ] Admin: drag & drop / reorder de categorias; toggle `IsActive`.
- [ ] Fase/estado: UI para "Abrir/Fechar" nomeações e votações + locks.
- [ ] Resultados: página de resultados com top 3 por categoria + export.

## XPlayer (Sessões)
- [ ] Definir regra final de XP (ex: XP/minuto, bónus, etc.).
- [ ] Guardar periodic "heartbeat" no backend (apenas para analytics), mas a verdade é `StartedAt/EndedAt`.
- [ ] Dashboard: gráficos simples (últimos 7 dias, XP total, streak).

## Qualidade
- [ ] Adicionar testes básicos (API + componentes)
- [ ] Adicionar logging estruturado no backend e tratamento de erros consistente no frontend
