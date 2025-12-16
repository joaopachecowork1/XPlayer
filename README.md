# 🎮 XPlayer — Task, Notes & Game Progress Engine

> **Tagline:** _Trabalha como um dev. Progride como num jogo._

XPlayer é uma **PWA pessoal** que combina **gestão de tarefas e notas** com um **sistema de gamificação e progressão**, transformando tempo gasto (em tarefas, estudo ou jogos) em **XP, níveis e métricas reais**.  
O objetivo é simples: **organizar o teu dia e manter motivação**, usando regras automáticas em vez de input manual pesado.

Este projeto serve dois propósitos:

1. Uma aplicação **realmente usável no dia a dia** (no iPhone ou desktop)
    
2. Um **projeto técnico sério** para portfólio (Kotlin + Web + regras de negócio)
    

---

## 🧠 O Problema

- Apps de tarefas são passivas (listas infinitas)
    
- Apps de gamificação são vazias (sem lógica real)
    
- Tracking manual é cansativo e acaba abandonado
    

**FocusForge resolve isto ao:**

- reduzir input ao mínimo (1–2 cliques)
    
- transformar ações em eventos (sessions)
    
- aplicar regras automáticas de progressão
    

---

## 🧩 Conceito da Aplicação

Tudo gira à volta de **EVENTOS**, não estados manuais.

- Criar uma task = intenção
    
- Iniciar uma sessão = compromisso
    
- Terminar uma sessão = dado real
    

A aplicação decide:

- progresso
    
- estado
    
- XP
    
- nível
    
- recomendações
    

O utilizador apenas **age** — o sistema **pensa**.

---

## 🎮 Gamificação (core do projeto)

### Perfil do Jogador

- Level
    
- XP total
    
- Streak de dias ativos
    
- Distribuição de tempo (focus, study, play)
    

### Ganho de XP

- Start + Stop de sessão → XP automático
    
- XP proporcional ao tempo (com cap)
    
- Bónus por consistência (streak)
    
- Bónus por concluir tasks
    

### Penalizações suaves

- Longos períodos sem sessões → quebra de streak
    
- Tasks abandonadas → redução de score futuro
    

> ⚠️ Importante: XP **nunca é manual** — é sempre derivado de sessões.

---

## 🔄 Sistema de Progressão

```text
XP total → Level
Sessões → XP
XP + Streak → Recomendação
```

Exemplo:

- Sessão de 45min → +30 XP
    
- 3 dias seguidos → +20 XP
    
- Concluir task → +15 XP
    

---

## 📋 Gestão de Tarefas (Task Engine)

### Task mínima

- Título (obrigatório)
    
- Tag (opcional)
    
- Prioridade (default automática)
    

### Estados (derivados)

- ACTIVE
    
- COMPLETED
    
- STALE (sem sessões há X dias)
    

⚠️ O estado não é editável manualmente.

---

## 📝 Notas

- Notas rápidas (markdown leve)
    
- Associáveis a tasks ou soltas
    
- Criadas em 1 clique
    

---

## ⏱️ Sessões (Event Engine)

- Start / Stop
    
- Timer automático
    
- Ligável a task ou livre
    
- Persistido localmente
    

Tudo o resto deriva daqui.

---

## 📱 Experiência no iPhone (PWA)

- Instalável via "Adicionar ao ecrã inicial"
    
- Funciona offline
    
- Ícone próprio
    
- UX tipo app nativa
    

---

## 🛠️ Stack Tecnológica

### Backend

- Kotlin
    
- Ktor
    
- SQLite
    

### Frontend

- React + Vite
    
- PWA (Service Worker + Manifest)
    

### Ferramentas de apoio

- Git + GitHub
    
- Docker (opcional)
    

---

## 🧰 Ferramentas para organização do projeto

### Gestão de tarefas do desenvolvimento

**Não usar Jira** (overkill para projeto pessoal).

Alternativas melhores:

- GitHub Projects (Kanban simples)
    
- Linear (se quiseres algo mais clean)
    
- Notion (tasks + notas técnicas)
    

Sugestão:

> **GitHub Projects** com colunas: Backlog → Doing → Done

---

## 💻 Aplicações que vais precisar instalar

### Obrigatórias

- Node.js (LTS)
    
- npm ou pnpm
    
- JDK 17+
    
- Git
    
- VS Code / IntelliJ
    

### Opcionais

- Docker Desktop
    
- Postman / Insomnia
    

---

## 🚀 Quickstart (visão)

1. Backend Kotlin (Ktor) com SQLite
    
2. API simples de tasks, notes e sessions
    
3. Frontend React com QuickAdd + Timer
    
4. PWA install no iPhone
    

---

## 🧪 Qualidade & Boas Práticas

- Regras no backend
    
- Estado sempre derivado
    
- 3–5 testes unitários chave
    
- README claro e honesto
    

---

## 🧭 Roadmap

### MVP

- Tasks + Notes
    
- Sessões
    
- XP + Level
    

### V2

- Recomendações
    
- Badges
    
- Integração Backlog Game Engine
    