# 🎮 XPlayer

**XPlayer** é uma aplicação pessoal de produtividade gamificada.

> Trabalha como um dev. Progride como num jogo.

O objetivo é transformar **tempo real gasto** (tarefas, estudo, foco ou jogo)
em **XP, níveis e métricas reais**, sem tracking manual cansativo.

---

## 🧠 Conceito Base

- Tudo gira à volta de **eventos (sessions)**, não estados manuais
- O utilizador **age**
- O sistema **decide**

**Sessões são a única fonte de verdade.**

---

## 🧩 Funcionalidades (MVP)

### ⏱️ Sessões
- Start / Stop
- Ligadas a tarefas ou livres
- Tempo real persistido

### 🎮 Gamificação
- XP automático por tempo
- Level derivado do XP
- Streak de dias ativos
- Bónus por consistência

⚠️ XP nunca é manual

---

### 📋 Tasks
- Criar tarefas rapidamente
- Estado **derivado**, nunca editável:
  - ACTIVE
  - COMPLETED
  - STALE

---

### 📝 Notes
- Markdown leve
- Ligadas a tasks ou soltas
- Criadas em 1 clique

---

## 🛠️ Stack Tecnológica

### Backend
- .NET 8
- ASP.NET Core (Minimal API)
- EF Core
- SQLite (dev)
- SQL Server (produção)

### Frontend
- Next.js (App Router)
- React + TypeScript (TSX)
- Tailwind CSS
- shadcn/ui (componentes)

---

## 🧭 Roadmap

### Fase 1 — Core
- [ ] Sessions (start/stop)
- [ ] XP calculation
- [ ] Level system
- [ ] Profile derivado

### Fase 2 — Tasks & Notes
- [ ] CRUD Tasks
- [ ] Task state derivado
- [ ] Notes markdown

### Fase 3 — Gamificação
- [ ] Streak
- [ ] Penalizações suaves
- [ ] Recomendações

---

## 🚀 Setup Local

### Backend
```bash
dotnet restore
dotnet run
