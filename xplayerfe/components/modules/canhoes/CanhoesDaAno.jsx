"use client";
import { useState, useEffect, useRef } from "react";

/* ─────────────────────────────────────────
   MOCK DATA
───────────────────────────────────────── */
const USERS = [
  { id: 1, name: "João Brisado",  emoji: "😎", color: "#00ff44", level: 2 },
  { id: 2, name: "Maria Loka",    emoji: "🌸", color: "#ff2d75", level: 3 },
  { id: 3, name: "Pedro Pascada", emoji: "🎩", color: "#ffe135", level: 3 },
  { id: 4, name: "Carol Chapada", emoji: "💜", color: "#8b00ff", level: 2 },
  { id: 5, name: "Léo do Fumaço", emoji: "🌿", color: "#00ff44", level: 1 },
  { id: 6, name: "Bob Bolado",    emoji: "🕶️", color: "#ff8c00", level: 2 },
];

const POSTS = [
  { id: 1, userId: 1, title: "Quem fez o maior canhão?",  image: "🐸", votes: 8400, reactions: { chapado: 2100, destruidor: 1500, morreu: 210, derreteu: 180 } },
  { id: 2, userId: 4, title: "Esse foi sinistro! 👀💫",   image: "🍄", votes: 2100, reactions: { chapado: 800,  destruidor: 600,  morreu: 150, derreteu: 120 } },
  { id: 3, userId: 2, title: "Brisa da Noite",            image: "🌙", votes: 2800, reactions: { chapado: 1200, destruidor: 900,  morreu: 300, derreteu: 200 } },
];

const LEADERBOARD = [
  { rank: 1, userId: 3, points: 4200, streak: "🔥 12 dias", level: "Mesadão"  },
  { rank: 2, userId: 4, points: 3690, streak: "🔥 9 dias",  level: "Viajando" },
  { rank: 3, userId: 5, points: 2880, streak: "🔥 7 dias",  level: "Suave"    },
  { rank: 4, userId: 6, points: 1990, streak: "🔥 5 dias",  level: "Suave"    },
  { rank: 5, userId: 1, points: 1350, streak: "🔥 3 dias",  level: "Mesadão"  },
  { rank: 6, userId: 2, points: 1200, streak: "💤 1 dia",   level: "Viajando" },
];

const THREADS = [
  { id: 1, userId: 6, text: "Qual o melhor beck?",                   likes: 78,  dislikes: 2,  replies: 5  },
  { id: 2, userId: 3, text: "O de skunk! 🔥 420 💀 12",             likes: 420, dislikes: 12, replies: 8  },
  { id: 3, userId: 4, text: "O prensado é clássico! 😄 88 🔥 5",    likes: 88,  dislikes: 3,  replies: 12 },
  { id: 4, userId: 6, text: "Hidro é outras ideias! 😎 💀 142",     likes: 142, dislikes: 8,  replies: 20 },
  { id: 5, userId: 2, text: "Tonhão do Verdão 🌿",                  likes: 210, dislikes: 5,  replies: 33 },
];

const LEVEL_NAMES = ["Suave", "Mesadão", "Viajando"];
const LEVEL_COLORS = ["#00ff44", "#8b00ff", "#ff2d75"];
const LEVEL_EMOJIS = ["😌", "😵‍💫", "🫠"];

const STICKERS = [
  { key: "chapado",   label: "Chapado",    emoji: "😂", color: "#00ff44" },
  { key: "destruidor",label: "Destruidor", emoji: "🔥", color: "#ff8c00" },
  { key: "morreu",    label: "Morreu",     emoji: "💀", color: "#ff2d75" },
  { key: "derreteu",  label: "Derreteu",   emoji: "🫠", color: "#8b00ff" },
];

const ADMIN_ACTIVITY = [
  { color: "#00ff44", text: "Novo utilizador",  user: "Pedro Pascada",  time: "2m" },
  { color: "#ff2d75", text: "Report recebido",  user: "Maria Loka",     time: "5m" },
  { color: "#8b00ff", text: "Nova votação",      user: "Bob Bolado",     time: "12m" },
  { color: "#ff8c00", text: "Novo sticker",      user: "Carol Chapada",  time: "20m" },
];

/* ─────────────────────────────────────────
   KEYFRAMES (injected via <style>)
───────────────────────────────────────── */
const KEYFRAMES = `
  @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@700;900&display=swap');

  @keyframes smokeRise {
    0%   { transform: translateY(0) scale(0.8) rotate(0deg);   opacity: 0.5; }
    60%  { transform: translateY(-50px) scale(1.8) rotate(20deg);  opacity: 0.15; }
    100% { transform: translateY(-90px) scale(2.5) rotate(-10deg); opacity: 0; }
  }
  @keyframes glowPulse {
    0%, 100% { box-shadow: 0 0 20px #00ff4430; }
    50%       { box-shadow: 0 0 45px #00ff4465; }
  }
  @keyframes floatOrb {
    0%, 100% { transform: translate(0, 0) scale(1); }
    33%       { transform: translate(12px, -18px) scale(1.1); }
    66%       { transform: translate(-10px, -8px) scale(0.95); }
  }
  @keyframes voteSpring {
    0%   { transform: scale(1) rotate(0deg); }
    30%  { transform: scale(1.3) rotate(-8deg); }
    60%  { transform: scale(0.92) rotate(4deg); }
    80%  { transform: scale(1.08) rotate(-2deg); }
    100% { transform: scale(1.05) rotate(0deg); }
  }
  @keyframes tabGlow {
    0%, 100% { filter: drop-shadow(0 0 4px #00ff4460); }
    50%       { filter: drop-shadow(0 0 12px #00ff44aa); }
  }
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  @keyframes bgFloat {
    0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.06; }
    50%       { transform: translateY(-20px) rotate(5deg); opacity: 0.10; }
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes barFill {
    from { width: 0%; }
    to   { width: var(--bar-w); }
  }
  @keyframes badgePop {
    0%   { transform: scale(0.7); }
    60%  { transform: scale(1.15); }
    100% { transform: scale(1); }
  }
  .canhao-card {
    background: linear-gradient(145deg, #0d1f12, #091508);
    border: 2px solid #2aaa44;
    border-radius: 18px;
    box-shadow: 0 0 0 1px #00ff4415, 0 0 24px #00882230, inset 0 1px 0 #00ff4410, 0 4px 16px rgba(0,0,0,0.6);
    animation: glowPulse 4s ease-in-out infinite;
  }
  .smoke-particle {
    position: absolute;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(0,200,80,0.12) 0%, transparent 70%);
    pointer-events: none;
  }
`;

/* ─────────────────────────────────────────
   HELPERS
───────────────────────────────────────── */
function getUser(id) {
  return USERS.find((u) => u.id === id) ?? USERS[0];
}

function fmtNum(n) {
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return String(n);
}

function getLevelLabel(lvl) {
  return LEVEL_NAMES[Math.min(lvl - 1, 2)] ?? "Suave";
}
function getLevelColor(lvl) {
  return LEVEL_COLORS[Math.min(lvl - 1, 2)] ?? "#00ff44";
}
function getLevelEmoji(lvl) {
  return LEVEL_EMOJIS[Math.min(lvl - 1, 2)] ?? "😌";
}

/* ─────────────────────────────────────────
   REUSABLE PIECES
───────────────────────────────────────── */
function SmokeParticles({ count = 4 }) {
  const particles = Array.from({ length: count }, (_, i) => ({
    w: 12 + ((i * 7) % 20),
    h: 12 + ((i * 5) % 20),
    delay: i * 0.8,
    dur: 3 + i,
    bottom: 20 + i * 30,
    left: 10 + i * 15,
  }));
  return (
    <>
      {particles.map((p, i) => (
        <div
          key={i}
          className="smoke-particle"
          style={{
            width: p.w,
            height: p.h,
            animationName: "smokeRise",
            animationDuration: `${p.dur}s`,
            animationTimingFunction: "ease-in-out",
            animationIterationCount: "infinite",
            animationDelay: `${p.delay}s`,
            bottom: p.bottom,
            left: p.left,
          }}
        />
      ))}
    </>
  );
}

function Avatar({ user, size = 44 }) {
  const fontSize = Math.round(size * 0.45);
  return (
    <div
      style={{
        width: size,
        height: size,
        minWidth: size,
        borderRadius: "50%",
        background: `radial-gradient(circle at 35% 35%, ${user.color}33, ${user.color}11)`,
        border: `2px solid ${user.color}`,
        boxShadow: `0 0 14px ${user.color}60`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize,
        position: "relative",
        flexShrink: 0,
      }}
    >
      {user.emoji}
      <span
        style={{
          position: "absolute",
          bottom: -3,
          right: -3,
          background: "#091508",
          border: `1px solid ${getLevelColor(user.level)}`,
          borderRadius: 99,
          fontSize: Math.max(8, Math.round(size * 0.2)),
          lineHeight: 1,
          padding: "1px 3px",
          color: getLevelColor(user.level),
          fontFamily: "'Fredoka One', cursive",
          animation: "badgePop 0.3s ease",
        }}
      >
        {getLevelEmoji(user.level)}
      </span>
    </div>
  );
}

function GreenButton({ children, onClick, style = {}, small = false }) {
  const [pressed, setPressed] = useState(false);
  return (
    <button
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
      onClick={onClick}
      style={{
        background: "linear-gradient(90deg, #00cc44, #008833)",
        border: "1.5px solid #00ff4460",
        borderRadius: 999,
        color: "white",
        fontFamily: "'Fredoka One', cursive",
        fontSize: small ? 14 : 16,
        padding: small ? "8px 18px" : "12px 24px",
        boxShadow: pressed
          ? "0 2px 10px #00ff4480"
          : "0 4px 20px #00ff4450, 0 0 40px #00cc3330",
        cursor: "pointer",
        transform: pressed ? "scale(0.97)" : "scale(1)",
        transition: "all 0.15s ease",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        width: "100%",
        ...style,
      }}
    >
      {children}
    </button>
  );
}

function Input({ placeholder, value, onChange, style = {} }) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        background: "#091508",
        border: `1.5px solid ${focused ? "#00ff44" : "#2aaa44"}`,
        borderRadius: 12,
        color: "#c8f5c8",
        padding: "12px 16px",
        fontFamily: "'Nunito', sans-serif",
        fontWeight: 700,
        fontSize: 14,
        outline: "none",
        boxShadow: focused ? "0 0 12px #00ff4430" : "none",
        transition: "border-color 0.2s, box-shadow 0.2s",
        width: "100%",
        boxSizing: "border-box",
        ...style,
      }}
    />
  );
}

function SectionTitle({ children, color = "#ffe135" }) {
  return (
    <div
      style={{
        fontFamily: "'Fredoka One', cursive",
        fontSize: 22,
        color,
        textShadow: `0 0 20px ${color}`,
        letterSpacing: 0.5,
      }}
    >
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────
   SCREEN 1 — FEED
───────────────────────────────────────── */
function FeedScreen({ onVote }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 16,
        padding: "0 14px 14px",
        animation: "fadeIn 0.3s ease",
        overflowY: "auto",
        maxHeight: "100%",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 0 6px",
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: "linear-gradient(to bottom, #0a0f0a 80%, transparent)",
        }}
      >
        <button
          style={{ background: "none", border: "none", cursor: "pointer", fontSize: 22, color: "#00ff44" }}
        >
          ≡
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 16, color: "#ffe135" }}>✨</span>
          <SectionTitle>🌿 CANHÕES DO ANO</SectionTitle>
          <span style={{ fontSize: 16, color: "#ffe135" }}>✨</span>
        </div>
        <div style={{ position: "relative" }}>
          <button
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: 22, color: "#7abf7a" }}
          >
            🔔
          </button>
          <span
            style={{
              position: "absolute",
              top: -2,
              right: -2,
              background: "#ff2d75",
              borderRadius: 99,
              fontSize: 9,
              color: "white",
              padding: "1px 4px",
              fontFamily: "'Fredoka One', cursive",
              lineHeight: 1.4,
            }}
          >
            3
          </span>
        </div>
      </div>

      {/* Post cards */}
      {POSTS.map((post) => {
        const user = getUser(post.userId);
        const total = Object.values(post.reactions).reduce((a, b) => a + b, 0);
        return (
          <div key={post.id} className="canhao-card" style={{ padding: 14, position: "relative" }}>
            <SmokeParticles count={2} />
            {/* Author row */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 10,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Avatar user={user} size={44} />
                <div>
                  <div
                    style={{
                      fontFamily: "'Fredoka One', cursive",
                      color: user.color,
                      fontSize: 15,
                    }}
                  >
                    {user.name}
                  </div>
              <span
                style={{
                  fontFamily: "'Nunito', sans-serif",
                  fontWeight: 700,
                  color: "#7abf7a",
                  fontSize: 11,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                {getLevelEmoji(user.level)} Nível {getLevelLabel(user.level)} ⭐
              </span>
                </div>
              </div>
              <button
                style={{ background: "none", border: "none", cursor: "pointer", color: "#7abf7a", fontSize: 18 }}
              >
                ⋯
              </button>
            </div>

            {/* Title */}
            <div
              style={{
                fontFamily: "'Nunito', sans-serif",
                fontWeight: 800,
                color: "#ffffff",
                fontSize: 15,
                marginBottom: 10,
              }}
            >
              {post.title}
            </div>

            {/* Image placeholder */}
            <div
              style={{
                width: "100%",
                height: 180,
                borderRadius: 12,
                background: `linear-gradient(145deg, ${user.color}22, #0a0f0a)`,
                border: `1px solid ${user.color}30`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 80,
                marginBottom: 12,
                position: "relative",
                overflow: "hidden",
              }}
            >
              {post.image}
              <SmokeParticles count={3} />
            </div>

            {/* Stats */}
            <div
              style={{
                display: "flex",
                gap: 10,
                marginBottom: 12,
                flexWrap: "wrap",
                fontFamily: "'Nunito', sans-serif",
                fontWeight: 700,
                fontSize: 13,
              }}
            >
              <span style={{ color: "#00ff44" }}>🔥 {fmtNum(post.votes)}</span>
              <span style={{ color: "#00ff44" }}>💚 {fmtNum(post.reactions.chapado)}</span>
              <span style={{ color: "#ff8c00" }}>🔥 {fmtNum(post.reactions.destruidor)}</span>
              <span style={{ color: "#ff2d75" }}>💀 {fmtNum(post.reactions.morreu)}</span>
            </div>

            {/* Vote button */}
            <GreenButton onClick={() => onVote(post.id)}>
              🌿 Mandar Canhão
            </GreenButton>
          </div>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────
   SCREEN 2 — CRIAR ENQUETE
───────────────────────────────────────── */
function CriarScreen({ onBack }) {
  const [title, setTitle] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [preview, setPreview] = useState(false);
  const user = USERS[0];

  const addOption = () => setOptions([...options, ""]);
  const removeOption = (i) => {
    if (options.length <= 2) return;
    setOptions(options.filter((_, idx) => idx !== i));
  };
  const updateOption = (i, v) => {
    const o = [...options];
    o[i] = v;
    setOptions(o);
  };

  return (
    <div style={{ padding: "0 14px 14px", animation: "fadeIn 0.3s ease", overflowY: "auto", maxHeight: "100%" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 0 16px",
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: "linear-gradient(to bottom, #0a0f0a 80%, transparent)",
        }}
      >
        <button
          onClick={onBack}
          style={{ background: "none", border: "none", cursor: "pointer", color: "#00ff44", fontSize: 20 }}
        >
          ←
        </button>
        <SectionTitle>Criar Enquete</SectionTitle>
      </div>

      {/* Form */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Input placeholder="Título da Enquete" value={title} onChange={setTitle} />

        {options.map((opt, i) => (
          <div key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <Input
              placeholder={`Opção ${i + 1}`}
              value={opt}
              onChange={(v) => updateOption(i, v)}
              style={{ flex: 1 }}
            />
            {i >= 2 && (
              <button
                onClick={() => removeOption(i)}
                style={{
                  background: "#1a0a10",
                  border: "1px solid #ff2d7540",
                  borderRadius: 8,
                  color: "#ff2d75",
                  width: 36,
                  height: 36,
                  cursor: "pointer",
                  fontSize: 16,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                ×
              </button>
            )}
          </div>
        ))}

        {/* Add option */}
        <button
          onClick={addOption}
          style={{
            background: "transparent",
            border: "1.5px dashed #2aaa44",
            borderRadius: 12,
            color: "#7abf7a",
            padding: "10px 16px",
            fontFamily: "'Nunito', sans-serif",
            fontWeight: 700,
            fontSize: 14,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span style={{ color: "#00ff44" }}>+</span> Adicionar outra opção
        </button>

        {/* Upload card */}
        <div
          className="canhao-card"
          style={{
            padding: 24,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
            cursor: "pointer",
            border: "1.5px dashed #2aaa44",
          }}
        >
          <span style={{ fontSize: 40 }}>☁️</span>
          <span
            style={{
              fontFamily: "'Nunito', sans-serif",
              fontWeight: 700,
              color: "#7abf7a",
              fontSize: 14,
            }}
          >
            Adicionar Imagem
          </span>
        </div>

        {/* CTA row */}
        <div style={{ display: "flex", gap: 10 }}>
          <GreenButton onClick={() => {}}>🌿 Lançar Canhão</GreenButton>
          <button
            onClick={() => setPreview(!preview)}
            style={{
              background: "linear-gradient(90deg, #0a6a20, #0d8a28)",
              border: "1px solid #00ff4430",
              borderRadius: 999,
              color: "white",
              fontFamily: "'Nunito', sans-serif",
              fontWeight: 900,
              fontSize: 14,
              padding: "12px 18px",
              cursor: "pointer",
              flexShrink: 0,
              whiteSpace: "nowrap",
            }}
          >
            👁 Preview
          </button>
        </div>

        {/* Preview modal */}
        {preview && (
          <div className="canhao-card" style={{ padding: 14, animation: "fadeIn 0.25s ease" }}>
            <div
              style={{
                fontFamily: "'Fredoka One', cursive",
                color: "#7abf7a",
                fontSize: 11,
                marginBottom: 8,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Preview
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <Avatar user={user} size={36} />
              <div>
                <div style={{ fontFamily: "'Fredoka One', cursive", color: user.color, fontSize: 13 }}>
                  {user.name}
                </div>
                <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: 11, color: "#7abf7a" }}>
                  {getLevelEmoji(user.level)} Nível {getLevelLabel(user.level)}
                </div>
              </div>
            </div>
            <div
              style={{
                fontFamily: "'Nunito', sans-serif",
                fontWeight: 900,
                color: "#c8f5c8",
                fontSize: 14,
                marginBottom: 8,
              }}
            >
              {title || "Título da Enquete"}
            </div>
            <div
              style={{
                width: "100%",
                height: 80,
                borderRadius: 10,
                background: "linear-gradient(145deg, #00ff4415, #0a0f0a)",
                border: "1px solid #00ff4420",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 40,
                marginBottom: 8,
              }}
            >
              🌿
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
              {options.filter((o) => o).map((opt, i) => (
                <div
                  key={i}
                  style={{
                    background: "#0d1f12",
                    border: "1px solid #2aaa44",
                    borderRadius: 8,
                    padding: "6px 12px",
                    color: "#c8f5c8",
                    fontFamily: "'Nunito', sans-serif",
                    fontWeight: 700,
                    fontSize: 13,
                  }}
                >
                  {opt}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   SCREEN 3 — VOTE STICKER
───────────────────────────────────────── */
function VoteScreen({ postId, onBack }) {
  const post = POSTS.find((p) => p.id === postId) ?? POSTS[0];
  const user = getUser(post.userId);
  const [voted, setVoted] = useState(null);
  const [animKey, setAnimKey] = useState(null);

  const total = Object.values(post.reactions).reduce((a, b) => a + b, 0);

  const handleVote = (key) => {
    setVoted(key);
    setAnimKey(key);
    setTimeout(() => setAnimKey(null), 600);
  };

  const pct = (key) => Math.round((post.reactions[key] / total) * 100);

  return (
    <div style={{ padding: "0 14px 14px", animation: "fadeIn 0.3s ease", overflowY: "auto", maxHeight: "100%" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 0 16px",
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: "linear-gradient(to bottom, #0a0f0a 80%, transparent)",
        }}
      >
        <button
          onClick={onBack}
          style={{ background: "none", border: "none", cursor: "pointer", color: "#00ff44", fontSize: 20 }}
        >
          ←
        </button>
        <div
          style={{
            fontFamily: "'Fredoka One', cursive",
            fontSize: 22,
            color: "white",
            textShadow: "0 0 10px #00ff4440",
          }}
        >
          Vote aí!
        </div>
      </div>

      {/* Context card */}
      <div className="canhao-card" style={{ padding: 14, marginBottom: 16, position: "relative" }}>
        <SmokeParticles count={2} />
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <Avatar user={user} size={40} />
          <div>
            <div style={{ fontFamily: "'Fredoka One', cursive", color: user.color, fontSize: 14 }}>
              {user.name}
            </div>
            <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: 11, color: "#7abf7a" }}>
              {getLevelEmoji(user.level)} Nível {getLevelLabel(user.level)}
            </div>
          </div>
        </div>
        <div
          style={{
            fontFamily: "'Nunito', sans-serif",
            fontWeight: 900,
            color: "#c8f5c8",
            fontSize: 15,
            marginBottom: 8,
          }}
        >
          {post.title}
        </div>
        <div
          style={{
            fontFamily: "'Nunito', sans-serif",
            fontWeight: 700,
            color: "#7abf7a",
            fontSize: 12,
          }}
        >
          🔥 {fmtNum(post.votes)} votos totais
        </div>
      </div>

      {/* 2×2 Sticker grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
          marginBottom: 16,
        }}
      >
        {STICKERS.map((s) => {
          const isVoted = voted === s.key;
          const isAnimating = animKey === s.key;
          return (
            <button
              key={s.key}
              onClick={() => handleVote(s.key)}
              style={{
                aspectRatio: "1",
                background: `linear-gradient(145deg, ${s.color}15, ${s.color}05)`,
                border: `2px solid ${s.color}`,
                borderRadius: 16,
                boxShadow: isVoted
                  ? `0 0 30px ${s.color}80`
                  : `0 0 20px ${s.color}40`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                padding: 12,
                cursor: "pointer",
                transition: "transform 0.2s, box-shadow 0.2s",
                transform: isVoted ? "scale(1.05)" : "scale(1)",
                animation: isAnimating ? "voteSpring 0.6s ease forwards" : "none",
                outline: "none",
              }}
            >
              <span
                style={{
                  fontSize: 60,
                  filter: `drop-shadow(0 0 12px ${s.color})`,
                  display: "block",
                  lineHeight: 1,
                }}
              >
                {s.emoji}
              </span>
              <span
                style={{
                  fontFamily: "'Fredoka One', cursive",
                  fontSize: 16,
                  color: s.color,
                }}
              >
                {s.label}
              </span>
              {voted && (
                <span
                  style={{
                    fontFamily: "'Fredoka One', cursive",
                    fontSize: 22,
                    color: s.color,
                    fontWeight: 700,
                  }}
                >
                  {pct(s.key)}%
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Result bars (post-vote) */}
      {voted && (
        <div
          className="canhao-card"
          style={{ padding: 14, animation: "fadeIn 0.3s ease" }}
        >
          <div
            style={{
              fontFamily: "'Fredoka One', cursive",
              color: "#7abf7a",
              fontSize: 12,
              marginBottom: 10,
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            Resultados
          </div>
          {STICKERS.map((s) => (
            <div key={s.key} style={{ marginBottom: 8 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontFamily: "'Nunito', sans-serif",
                  fontWeight: 700,
                  fontSize: 12,
                  color: s.color,
                  marginBottom: 4,
                }}
              >
                <span>
                  {s.emoji} {s.label}
                </span>
                <span>{pct(s.key)}%</span>
              </div>
              <div
                style={{
                  height: 8,
                  background: "#091508",
                  borderRadius: 99,
                  overflow: "hidden",
                  border: `1px solid ${s.color}30`,
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${pct(s.key)}%`,
                    background: s.color,
                    borderRadius: 99,
                    transition: "width 0.8s ease",
                    boxShadow: `0 0 8px ${s.color}80`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────
   SCREEN 4 — LEADERBOARD
───────────────────────────────────────── */
function RankingScreen() {
  const top3 = LEADERBOARD.slice(0, 3);
  const rest = LEADERBOARD.slice(3);

  const podiumOrder = [
    LEADERBOARD.find((e) => e.rank === 2),
    LEADERBOARD.find((e) => e.rank === 1),
    LEADERBOARD.find((e) => e.rank === 3),
  ];

  const podiumSizes = [66, 80, 60];
  const podiumColors = ["#c0c0c0", "#ffd700", "#cd7f32"];
  const podiumHeights = [70, 90, 55];

  return (
    <div style={{ padding: "0 14px 14px", animation: "fadeIn 0.3s ease", overflowY: "auto", maxHeight: "100%" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          padding: "10px 0 16px",
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: "linear-gradient(to bottom, #0a0f0a 80%, transparent)",
        }}
      >
        <span style={{ fontSize: 20 }}>⭐</span>
        <SectionTitle>Canhões do Ano</SectionTitle>
        <span style={{ fontSize: 20 }}>⭐</span>
      </div>

      {/* Podium */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          gap: 12,
          marginBottom: 20,
          padding: "10px 0",
          position: "relative",
        }}
      >
        <SmokeParticles count={4} />
        {podiumOrder.map((entry, idx) => {
          if (!entry) return null;
          const user = getUser(entry.userId);
          const sz = podiumSizes[idx];
          const gold = podiumColors[idx];
          const h = podiumHeights[idx];
          return (
            <div
              key={entry.rank}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
                flex: 1,
              }}
            >
              {/* Rank badge */}
              <div
                style={{
                  fontFamily: "'Fredoka One', cursive",
                  fontSize: 11,
                  color: gold,
                  textShadow: `0 0 10px ${gold}`,
                }}
              >
                #{entry.rank}
              </div>
              {/* Avatar with aura */}
              <div style={{ position: "relative" }}>
                <div
                  style={{
                    position: "absolute",
                    inset: -8,
                    borderRadius: "50%",
                    background: `radial-gradient(circle, ${user.color}30 0%, transparent 70%)`,
                    animation: "floatOrb 4s ease-in-out infinite",
                  }}
                />
                <Avatar user={user} size={sz} />
              </div>
              <div
                style={{
                  fontFamily: "'Fredoka One', cursive",
                  color: user.color,
                  fontSize: 12,
                  textAlign: "center",
                  textShadow: `0 0 8px ${user.color}60`,
                }}
              >
                {user.name}
              </div>
              <div
                style={{
                  fontFamily: "'Nunito', sans-serif",
                  fontWeight: 700,
                  color: "#7abf7a",
                  fontSize: 10,
                  textAlign: "center",
                }}
              >
                {getLevelEmoji(USERS.find(u => u.id === entry.userId)?.level ?? 1)} Nível {entry.level}
              </div>
              {/* Pedestal */}
              <div
                style={{
                  width: "100%",
                  height: h,
                  background: `linear-gradient(180deg, ${gold}30 0%, ${gold}10 100%)`,
                  border: `1.5px solid ${gold}60`,
                  borderRadius: "8px 8px 4px 4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "'Fredoka One', cursive",
                  fontSize: 24,
                  color: gold,
                  textShadow: `0 0 15px ${gold}`,
                  boxShadow: `0 0 20px ${gold}40`,
                }}
              >
                {entry.rank}
              </div>
            </div>
          );
        })}
      </div>

      {/* Rest list */}
      <div className="canhao-card" style={{ overflow: "hidden" }}>
        {rest.map((entry, idx) => {
          const user = getUser(entry.userId);
          return (
            <div
              key={entry.rank}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 14px",
                borderBottom: idx < rest.length - 1 ? "1px solid #00ff4410" : "none",
              }}
            >
              <span
                style={{
                  fontFamily: "'Fredoka One', cursive",
                  color: "#7abf7a",
                  fontSize: 14,
                  width: 20,
                  textAlign: "center",
                  flexShrink: 0,
                }}
              >
                {entry.rank}
              </span>
              <Avatar user={user} size={36} />
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontFamily: "'Fredoka One', cursive",
                    color: user.color,
                    fontSize: 14,
                  }}
                >
                  {user.name}
                </div>
                <div
                  style={{
                    fontFamily: "'Nunito', sans-serif",
                    fontWeight: 700,
                    color: "#7abf7a",
                    fontSize: 11,
                  }}
                >
                  {entry.streak}
                </div>
              </div>
              <span
                style={{
                  fontFamily: "'Fredoka One', cursive",
                  color: "#ffe135",
                  fontSize: 14,
                  textShadow: "0 0 8px #ffe13560",
                }}
              >
                {fmtNum(entry.points)} 🔥
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   SCREEN 5 — FORUM
───────────────────────────────────────── */
function ForumScreen() {
  const me = USERS[0];
  const [msg, setMsg] = useState("");
  const [threads, setThreads] = useState(THREADS);
  const [expanded, setExpanded] = useState(null);

  const sendMsg = () => {
    if (!msg.trim()) return;
    setThreads([
      {
        id: Date.now(),
        userId: me.id,
        text: msg,
        likes: 0,
        dislikes: 0,
        replies: 0,
      },
      ...threads,
    ]);
    setMsg("");
  };

  return (
    <div style={{ padding: "0 14px 14px", animation: "fadeIn 0.3s ease", overflowY: "auto", maxHeight: "100%" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 0 14px",
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: "linear-gradient(to bottom, #0a0f0a 80%, transparent)",
        }}
      >
        <SectionTitle color="#00ff44">💬 Fórum</SectionTitle>
      </div>

      {/* Composer */}
      <div
        className="canhao-card"
        style={{
          padding: 12,
          display: "flex",
          gap: 10,
          alignItems: "center",
          marginBottom: 14,
        }}
      >
        <Avatar user={me} size={38} />
        <input
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMsg()}
          placeholder="Escreve o teu papo..."
          style={{
            flex: 1,
            background: "#091508",
            border: "1.5px solid #2aaa44",
            borderRadius: 12,
            color: "#c8f5c8",
            padding: "10px 14px",
            fontFamily: "'Nunito', sans-serif",
            fontWeight: 700,
            fontSize: 13,
            outline: "none",
          }}
        />
        <button
          onClick={sendMsg}
          style={{
            background: "linear-gradient(90deg, #00cc44, #008833)",
            border: "none",
            borderRadius: 10,
            color: "white",
            width: 36,
            height: 36,
            cursor: "pointer",
            fontSize: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          ➤
        </button>
      </div>

      {/* Thread list */}
      <div className="canhao-card" style={{ overflow: "hidden" }}>
        {threads.map((t, idx) => {
          const user = getUser(t.userId);
          const isExpanded = expanded === t.id;
          return (
            <div
              key={t.id}
              style={{
                padding: "12px 14px",
                borderBottom: idx < threads.length - 1 ? "1px solid #00ff4410" : "none",
              }}
            >
              <div style={{ display: "flex", gap: 10 }}>
                <Avatar user={user} size={44} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: 4,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'Fredoka One', cursive",
                        color: user.color,
                        fontSize: 14,
                      }}
                    >
                      {user.name}
                    </span>
                    <span
                      style={{
                        fontFamily: "'Nunito', sans-serif",
                        fontWeight: 700,
                        color: "#7abf7a",
                        fontSize: 11,
                      }}
                    >
                      {idx === 0 ? "agora" : `${idx * 5}m`}
                    </span>
                  </div>
                  <div
                    style={{
                      fontFamily: "'Nunito', sans-serif",
                      fontWeight: 700,
                      color: "#c8f5c8",
                      fontSize: 14,
                      marginBottom: 8,
                      wordBreak: "break-word",
                    }}
                  >
                    {t.text}
                  </div>
                  <button
                    onClick={() => setExpanded(isExpanded ? null : t.id)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      gap: 12,
                      padding: 0,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'Nunito', sans-serif",
                        fontWeight: 700,
                        color: "#ff8c00",
                        fontSize: 12,
                      }}
                    >
                      🔥 {t.likes}
                    </span>
                    <span
                      style={{
                        fontFamily: "'Nunito', sans-serif",
                        fontWeight: 700,
                        color: "#00ff44",
                        fontSize: 12,
                      }}
                    >
                      💚 {Math.max(1, Math.round(t.likes * 0.06))}
                    </span>
                    <span
                      style={{
                        fontFamily: "'Nunito', sans-serif",
                        fontWeight: 700,
                        color: "#ff2d75",
                        fontSize: 12,
                      }}
                    >
                      💀 {t.dislikes}
                    </span>
                    <span
                      style={{
                        fontFamily: "'Nunito', sans-serif",
                        fontWeight: 700,
                        color: "#7abf7a",
                        fontSize: 12,
                      }}
                    >
                      💬 {t.replies}
                    </span>
                  </button>
                  {isExpanded && (
                    <div
                      style={{
                        marginTop: 10,
                        padding: 10,
                        background: "#091508",
                        borderRadius: 10,
                        border: "1px solid #2aaa44",
                        fontFamily: "'Nunito', sans-serif",
                        fontWeight: 700,
                        color: "#7abf7a",
                        fontSize: 13,
                        animation: "fadeIn 0.2s ease",
                      }}
                    >
                      {t.replies} respostas • Clica para ver
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   SCREEN 6 — ADMIN
───────────────────────────────────────── */
function AdminScreen({ isAdmin, setIsAdmin }) {
  const STATS = [
    { icon: "👥", value: "1.420", label: "Usuários",  trend: "+12% ↑" },
    { icon: "🗳️", value: "4.200", label: "Votos",     trend: "+88% ↑" },
    { icon: "📢", value: "369",   label: "Posts",     trend: "+5% ↑"  },
    { icon: "🎭", value: "42",    label: "Stickers",  trend: "+2% ↑"  },
  ];

  const MGMT_BTNS = [
    { icon: "👤", label: "Gerenciar Usuários" },
    { icon: "✅", label: "Gerenciar Votos" },
    { icon: "📋", label: "Gerenciar Postagens" },
    { icon: "🎭", label: "Gerenciar Figurinhas" },
  ];

  return (
    <div
      style={{
        padding: "0 14px 14px",
        animation: "fadeIn 0.3s ease",
        overflowY: "auto",
        maxHeight: "100%",
        position: "relative",
      }}
    >
      {/* Dev toggle */}
      <div
        onClick={() => setIsAdmin((v) => !v)}
        style={{
          position: "absolute",
          top: 12,
          right: 0,
          background: "#0a2010",
          border: "1px solid #00ff4440",
          borderRadius: 99,
          padding: "6px 14px",
          display: "flex",
          gap: 8,
          alignItems: "center",
          cursor: "pointer",
          zIndex: 100,
        }}
      >
        <span>{isAdmin ? "👑" : "👤"}</span>
        <span
          style={{
            color: isAdmin ? "#00ff44" : "#ff2d75",
            fontSize: 12,
            fontFamily: "'Fredoka One', cursive",
          }}
        >
          {isAdmin ? "Admin" : "User"}
        </span>
      </div>

      {/* Header */}
      <div
        style={{
          padding: "10px 0 16px",
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: "linear-gradient(to bottom, #0a0f0a 80%, transparent)",
        }}
      >
        <SectionTitle>⚙️ Admin Painel</SectionTitle>
      </div>

      {!isAdmin ? (
        /* ── ACCESS DENIED ── */
        <div
          className="canhao-card"
          style={{
            padding: 32,
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
            marginTop: 20,
          }}
        >
          <span style={{ fontSize: 60 }}>🚫</span>
          <div
            style={{
              fontFamily: "'Fredoka One', cursive",
              fontSize: 22,
              color: "#ff2d75",
              textShadow: "0 0 20px #ff2d7560",
            }}
          >
            Acesso Negado
          </div>
          <div
            style={{
              fontFamily: "'Nunito', sans-serif",
              fontWeight: 700,
              color: "#7abf7a",
              fontSize: 14,
              lineHeight: 1.5,
            }}
          >
            Não tens permissão para aceder a esta área.
          </div>
          <div
            style={{
              fontFamily: "'Nunito', sans-serif",
              fontWeight: 700,
              color: "#7abf7a",
              fontSize: 12,
              marginTop: 4,
            }}
          >
            (usa o toggle 👤/👑 para alternar)
          </div>
        </div>
      ) : (
        /* ── FULL ADMIN PANEL ── */
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Stats grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
            }}
          >
            {STATS.map((s) => (
              <div
                key={s.label}
                className="canhao-card"
                style={{ padding: "14px 12px" }}
              >
                <div style={{ fontSize: 22, marginBottom: 4 }}>{s.icon}</div>
                <div
                  style={{
                    fontFamily: "'Fredoka One', cursive",
                    fontSize: 22,
                    color: "#ffe135",
                    textShadow: "0 0 10px #ffe13540",
                  }}
                >
                  {s.value}
                </div>
                <div
                  style={{
                    fontFamily: "'Nunito', sans-serif",
                    fontWeight: 700,
                    color: "#7abf7a",
                    fontSize: 12,
                  }}
                >
                  {s.label}
                </div>
                <div
                  style={{
                    fontFamily: "'Nunito', sans-serif",
                    fontWeight: 900,
                    color: "#00ff44",
                    fontSize: 11,
                    marginTop: 4,
                  }}
                >
                  {s.trend}
                </div>
              </div>
            ))}
          </div>

          {/* Activity feed */}
          <div className="canhao-card" style={{ padding: 14 }}>
            <div
              style={{
                fontFamily: "'Fredoka One', cursive",
                color: "#7abf7a",
                fontSize: 12,
                marginBottom: 10,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Actividade Recente
            </div>
            {ADMIN_ACTIVITY.map((a, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 0",
                  borderBottom: i < ADMIN_ACTIVITY.length - 1 ? "1px solid #00ff4408" : "none",
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: a.color,
                    boxShadow: `0 0 8px ${a.color}`,
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1 }}>
                  <span
                    style={{
                      fontFamily: "'Nunito', sans-serif",
                      fontWeight: 700,
                      color: "#c8f5c8",
                      fontSize: 13,
                    }}
                  >
                    {a.text}
                  </span>{" "}
                  <span
                    style={{
                      fontFamily: "'Nunito', sans-serif",
                      fontWeight: 700,
                      color: a.color,
                      fontSize: 13,
                    }}
                  >
                    {a.user}
                  </span>
                </div>
                <span
                  style={{
                    fontFamily: "'Nunito', sans-serif",
                    fontWeight: 700,
                    color: "#7abf7a",
                    fontSize: 11,
                  }}
                >
                  {a.time}
                </span>
              </div>
            ))}
          </div>

          {/* Management buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {MGMT_BTNS.map((b) => (
              <button
                key={b.label}
                style={{
                  background: "linear-gradient(90deg, #0a6a20, #0d8a28)",
                  border: "1px solid #00ff4430",
                  borderRadius: 999,
                  padding: "14px 20px",
                  color: "white",
                  fontFamily: "'Nunito', sans-serif",
                  fontWeight: 900,
                  fontSize: 14,
                  boxShadow: "0 4px 16px #00aa3340",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  width: "100%",
                  cursor: "pointer",
                }}
              >
                <span style={{ fontSize: 18 }}>{b.icon}</span>
                <span style={{ flex: 1, textAlign: "left" }}>{b.label}</span>
                <span style={{ color: "#00ff44" }}>›</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────
   STATUS BAR
───────────────────────────────────────── */
function StatusBar() {
  const [time, setTime] = useState(() => {
    const d = new Date();
    return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
  });

  useEffect(() => {
    const id = setInterval(() => {
      const d = new Date();
      setTime(`${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`);
    }, 10000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      style={{
        height: 48,
        background: "#0a0f0a",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 18px",
        flexShrink: 0,
      }}
    >
      <span
        style={{
          fontFamily: "'Fredoka One', cursive",
          fontSize: 13,
          color: "#7abf7a",
        }}
      >
        {time}
      </span>
      {/* Notch */}
      <div
        style={{
          width: 110,
          height: 28,
          background: "#0a0f0a",
          borderRadius: "0 0 18px 18px",
          border: "1px solid #1a3a1a",
          borderTop: "none",
        }}
      />
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <span style={{ color: "#7abf7a", fontSize: 11 }}>▲▲▲</span>
        <span style={{ color: "#7abf7a", fontSize: 11 }}>▮▮▮</span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   BOTTOM NAV
───────────────────────────────────────── */
const TABS = [
  { id: "feed",    emoji: "🍀",  label: "Feed"    },
  { id: "forum",   emoji: "💬",  label: "Fórum"   },
  { id: "criar",   emoji: "➕",  label: "Criar"   },
  { id: "ranking", emoji: "👑",  label: "Ranking" },
  { id: "admin",   emoji: "⚙️",  label: "Admin"   },
];

function BottomNav({ active, onChange }) {
  return (
    <nav
      style={{
        height: 60,
        background: "#091508",
        borderTop: "1px solid #00ff4420",
        display: "flex",
        alignItems: "stretch",
        flexShrink: 0,
      }}
    >
      {TABS.map((tab) => {
        const isActive = active === tab.id;
        const isCreate = tab.id === "criar";
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            style={{
              flex: 1,
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
              padding: 0,
              position: "relative",
            }}
          >
            {isCreate ? (
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #00cc44, #008833)",
                  border: "2px solid #00ff4460",
                  boxShadow: "0 0 20px #00ff4450",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                  marginTop: -10,
                }}
              >
                {tab.emoji}
              </div>
            ) : (
              <span
                style={{
                  fontSize: 20,
                  filter: isActive ? "drop-shadow(0 0 6px #00ff44aa)" : "none",
                  animation: isActive ? "tabGlow 2s ease-in-out infinite" : "none",
                  color: isActive ? "#00ff44" : "#4a7a4a",
                }}
              >
                {tab.emoji}
              </span>
            )}
            {!isCreate && (
              <span
                style={{
                  fontFamily: "'Nunito', sans-serif",
                  fontWeight: 700,
                  fontSize: 10,
                  color: isActive ? "#00ff44" : "#4a7a4a",
                }}
              >
                {tab.label}
              </span>
            )}
            {isActive && !isCreate && (
              <div
                style={{
                  position: "absolute",
                  bottom: 2,
                  width: 16,
                  height: 2,
                  borderRadius: 99,
                  background: "#00ff44",
                  boxShadow: "0 0 6px #00ff4480",
                }}
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}

/* ─────────────────────────────────────────
   BACKGROUND PLANTS
───────────────────────────────────────── */
function BgDecor() {
  return (
    <>
      {/* Left plant */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: 0,
          bottom: 60,
          fontSize: 60,
          opacity: 0.08,
          pointerEvents: "none",
          filter: "blur(1px)",
          animation: "bgFloat 8s ease-in-out infinite",
          userSelect: "none",
        }}
      >
        🌿
      </div>
      {/* Right plant */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          right: 0,
          bottom: 80,
          fontSize: 50,
          opacity: 0.07,
          pointerEvents: "none",
          filter: "blur(1px)",
          animation: "bgFloat 6s ease-in-out infinite 2s",
          userSelect: "none",
        }}
      >
        🌱
      </div>
      {/* Top smoke orb */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 80,
          right: 20,
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0,200,80,0.08) 0%, transparent 70%)",
          animation: "floatOrb 7s ease-in-out infinite",
          pointerEvents: "none",
        }}
      />
    </>
  );
}

/* ─────────────────────────────────────────
   ROOT COMPONENT
───────────────────────────────────────── */
export default function CanhoesDaAno() {
  const [screen, setScreen] = useState("feed");
  const [votePostId, setVotePostId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const handleVote = (postId) => {
    setVotePostId(postId);
    setScreen("vote");
  };

  const renderScreen = () => {
    switch (screen) {
      case "feed":
        return <FeedScreen onVote={handleVote} />;
      case "criar":
        return <CriarScreen onBack={() => setScreen("feed")} />;
      case "vote":
        return (
          <VoteScreen
            postId={votePostId}
            onBack={() => setScreen("feed")}
          />
        );
      case "ranking":
        return <RankingScreen />;
      case "forum":
        return <ForumScreen />;
      case "admin":
        return <AdminScreen isAdmin={isAdmin} setIsAdmin={setIsAdmin} />;
      default:
        return <FeedScreen onVote={handleVote} />;
    }
  };

  return (
    <>
      <style>{KEYFRAMES}</style>

      {/* Outer centering wrapper */}
      <div
        style={{
          minHeight: "100vh",
          background: "#050a05",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px 0",
          fontFamily: "'Nunito', sans-serif",
        }}
      >
        {/* Mobile frame */}
        <div
          style={{
            width: 390,
            height: 844,
            borderRadius: 48,
            background: "#0a0f0a",
            overflow: "hidden",
            position: "relative",
            boxShadow:
              "0 0 0 8px #0f1a0f, 0 0 0 10px #1a3a1a, 0 60px 100px rgba(0,0,0,0.8), 0 0 80px rgba(0,200,60,0.08)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Background decorations */}
          <BgDecor />

          {/* Status bar */}
          <StatusBar />

          {/* Screen content */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              overflowX: "hidden",
              position: "relative",
              zIndex: 1,
            }}
          >
            {renderScreen()}
          </div>

          {/* Bottom nav */}
          <BottomNav
            active={screen === "vote" ? "feed" : screen}
            onChange={(id) => {
              if (id === "criar") {
                setScreen("criar");
              } else if (id === "admin") {
                setScreen("admin");
              } else {
                setScreen(id);
              }
            }}
          />
        </div>
      </div>
    </>
  );
}
