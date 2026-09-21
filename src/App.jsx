import React, { createContext, useContext, useEffect, useMemo, useReducer, useRef, useState } from "react";
import {
  ArrowLeft, Check, Eye, GripVertical, Minus, Pause, Play,
  Plus, Settings as SettingsIcon, Trash2, Users, X, Languages,
  Volume2, VolumeX, Vibrate, Moon, Sun, Trophy, Clock3, Sparkles, Pencil,
  ShieldAlert, Search
} from "lucide-react";

/* ============ ВСТАВЬ СЮДА БЕЗ ИЗМЕНЕНИЙ: const THEMES = [...] и функции themeName / themeWords ============ */
/* ============ ВСТАВЬ СЮДА БЕЗ ИЗМЕНЕНИЙ: const STRINGS = {...} и const EMOJIS = [...] ============ */

/* ============================== UTILS ============================== */
function colorFor(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360;
  return `hsl(${h} 62% 42%)`;
}
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function uid() { return Math.random().toString(36).slice(2, 10) + Date.now().toString(36); }

let audioCtx = null;
function beep(freq = 440, dur = 0.08, type = "sine", vol = 0.05) {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type; osc.frequency.value = freq;
    gain.gain.value = vol;
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + dur);
    osc.stop(audioCtx.currentTime + dur);
  } catch (e) {}
}

const STORAGE_KEY = "spy-word-game-state-v1";
async function loadState() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) { return null; }
}
async function saveState(state) {
  try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {}
}

/* ============================== STATE ============================== */
const defaultSettings = {
  spies: 1, minutes: 5, difficulty: "theme", allowSpyGuess: true,
  sound: true, vibration: true, dark: true, language: "ru",
};
const initialState = {
  screen: "splash",
  players: [],
  themeIds: [],
  settings: defaultSettings,
  round: null,
  wins: {},
  loaded: false,
};

function reducer(state, action) {
  switch (action.type) {
    case "HYDRATE":
      return { ...state, ...action.payload, screen: "home", loaded: true };
    case "SET_SCREEN":
      return { ...state, screen: action.screen };
    case "ADD_PLAYER":
      return { ...state, players: [...state.players, { id: uid(), name: action.name, emoji: action.emoji }] };
    case "UPDATE_PLAYER":
      return { ...state, players: state.players.map(p => p.id === action.id ? { ...p, name: action.name ?? p.name, emoji: action.emoji ?? p.emoji } : p) };
    case "REMOVE_PLAYER":
      return { ...state, players: state.players.filter(p => p.id !== action.id) };
    case "REORDER_PLAYERS": {
      const arr = state.players.slice();
      const from = arr.findIndex(p => p.id === action.dragId);
      const to = arr.findIndex(p => p.id === action.overId);
      if (from < 0 || to < 0) return state;
      const [item] = arr.splice(from, 1);
      arr.splice(to, 0, item);
      return { ...state, players: arr };
    }
    case "TOGGLE_THEME": {
      const has = state.themeIds.includes(action.id);
      return { ...state, themeIds: has ? state.themeIds.filter(t => t !== action.id) : [...state.themeIds, action.id] };
    }
    case "SELECT_ALL_THEMES":
      return { ...state, themeIds: THEMES.map(t => t.id) };
    case "CLEAR_THEMES":
      return { ...state, themeIds: [] };
    case "UPDATE_SETTINGS":
      return { ...state, settings: { ...state.settings, ...action.payload } };
    case "START_ROUND": {
      const activeThemes = THEMES.filter(t => state.themeIds.includes(t.id));
      const theme = activeThemes[Math.floor(Math.random() * activeThemes.length)];
      const wordCount = theme.words.ru.length;
      const wordIndex = Math.floor(Math.random() * wordCount);
      const spyCount = Math.min(state.settings.spies, Math.max(1, state.players.length - 2));
      const order = shuffle(state.players.map(p => p.id));
      const spyIds = order.slice(0, spyCount);
      const otherIndices = Array.from({ length: wordCount }, (_, i) => i).filter(i => i !== wordIndex);
      const hintIndices = shuffle(otherIndices).slice(0, 3);
      const revealOrder = shuffle(state.players.map(p => p.id));
      return {
        ...state,
        round: {
          themeId: theme.id, wordIndex, spyIds, hintIndices,
          revealOrder, revealIndex: 0,
          aliveIds: state.players.map(p => p.id),
          exiledIds: [],
          phase: "reveal",
          seconds: state.settings.minutes * 60,
          finished: false, winner: null, endReason: null,
          spyGuessIndex: null,
        },
      };
    }
    case "NEXT_REVEAL":
      return { ...state, round: { ...state.round, revealIndex: state.round.revealIndex + 1 } };
    case "SET_ROUND_PHASE":
      return { ...state, round: { ...state.round, phase: action.phase } };
    case "TICK": {
      if (!state.round) return state;
      const seconds = Math.max(0, state.round.seconds - 1);
      return { ...state, round: { ...state.round, seconds } };
    }
    case "ADD_TIME":
      return { ...state, round: { ...state.round, seconds: state.round.seconds + action.amount } };
    case "EXILE_PLAYER": {
      const r = state.round;
      const isSpy = r.spyIds.includes(action.id);
      const aliveIds = r.aliveIds.filter(id => id !== action.id);
      const exiledIds = [...r.exiledIds, action.id];
      if (isSpy) {
        return { ...state, round: { ...r, aliveIds, exiledIds, finished: true, winner: "players", endReason: "exiled" } };
      }
      const aliveNonSpy = aliveIds.filter(id => !r.spyIds.includes(id));
      if (aliveNonSpy.length < 1) {
        return { ...state, round: { ...r, aliveIds, exiledIds, finished: true, winner: "spy", endReason: "exiled" } };
      }
      return { ...state, round: { ...r, aliveIds, exiledIds, phase: "timer", lastExiledWasSpy: false, lastExiledId: action.id } };
    }
    case "CLEAR_EXILE_BANNER":
      return { ...state, round: { ...state.round, lastExiledId: null } };
    case "SPY_GUESS": {
      const r = state.round;
      const correct = action.wordIndex === r.wordIndex;
      return { ...state, round: { ...r, finished: true, spyGuessIndex: action.wordIndex, winner: correct ? "spy" : "players", endReason: "guess" } };
    }
    case "RECORD_WIN": {
      const wins = { ...state.wins };
      action.playerIds.forEach(id => { wins[id] = (wins[id] || 0) + 1; });
      return { ...state, wins };
    }
    case "NEW_GAME":
      return { ...state, round: null, screen: "home" };
    default:
      return state;
  }
}

const GameContext = createContext(null);
function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within provider");
  return ctx;
}
function GameProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  useEffect(() => {
    let mounted = true;
    (async () => {
      const saved = await loadState();
      if (mounted) dispatch({ type: "HYDRATE", payload: saved || {} });
    })();
    return () => { mounted = false; };
  }, []);
  useEffect(() => {
    if (!state.loaded) return;
    saveState({ players: state.players, themeIds: state.themeIds, settings: state.settings, wins: state.wins });
  }, [state.players, state.themeIds, state.settings, state.wins, state.loaded]);
  const t = STRINGS[state.settings.language] || STRINGS.ru;
  const value = useMemo(() => ({ state, dispatch, t }), [state, t]);
  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

/* ============================== UI ATOMS ============================== */
function SpyLogo({ className = "" }) {
  return (
    <svg viewBox="0 0 200 200" className={"sw-logo-svg " + className} role="img" aria-label="Spy logo">
      <defs>
        <linearGradient id="spyBadgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="55%" stopColor="#c026d3" />
          <stop offset="100%" stopColor="#f472b6" />
        </linearGradient>
        <radialGradient id="spyGlow" cx="32%" cy="26%" r="75%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="spyRimGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2dd4bf" />
          <stop offset="100%" stopColor="#a78bfa" />
        </linearGradient>
      </defs>
      <circle cx="100" cy="100" r="97" fill="url(#spyBadgeGrad)" />
      <circle cx="100" cy="100" r="93" fill="none" stroke="url(#spyRimGrad)" strokeWidth="2.5" opacity="0.7" />
      <circle cx="100" cy="100" r="97" fill="url(#spyGlow)" />
      <path d="M38 182 Q100 138 162 182 L162 205 L38 205 Z" fill="#1c1730" />
      <path d="M38 182 Q100 138 162 182" fill="none" stroke="#2d2650" strokeWidth="4" />
      <ellipse cx="100" cy="118" rx="33" ry="35" fill="#f2c396" />
      <ellipse cx="100" cy="128" rx="24" ry="10" fill="#e0a978" opacity="0.6" />
      <ellipse cx="100" cy="90" rx="54" ry="13" fill="#181622" />
      <path d="M70 92 Q73 54 100 51 Q127 54 130 92 Z" fill="#221f33" />
      <path d="M76 85 h48 v7 h-48 z" fill="#3a3560" />
      <rect x="68" y="108" width="26" height="15" rx="7" fill="#0d0d14" />
      <rect x="106" y="108" width="26" height="15" rx="7" fill="#0d0d14" />
      <rect x="94" y="112" width="12" height="4.5" rx="2" fill="#0d0d14" />
      <circle cx="146" cy="150" r="21" fill="none" stroke="#fff" strokeWidth="7.5" />
      <circle cx="146" cy="150" r="21" fill="#ffffff" opacity="0.08" />
      <line x1="161" y1="165" x2="179" y2="183" stroke="#fff" strokeWidth="8.5" strokeLinecap="round" />
    </svg>
  );
}

function Screen({ children, className = "" }) {
  return <main className={"sw-screen " + className}>{children}</main>;
}
function Header({ title, onBack, right }) {
  return (
    <header className="sw-header">
      <button className="sw-icon-btn" onClick={onBack} aria-label="back"><ArrowLeft size={20} /></button>
      <h1>{title}</h1>
      <div className="sw-header-right">{right}</div>
    </header>
  );
}
function Button({ children, onClick, primary, danger, disabled, className = "", style }) {
  return (
    <button
      disabled={disabled}
      style={style}
      className={"sw-btn " + (primary ? "sw-btn-primary " : "") + (danger ? "sw-btn-danger " : "") + className}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
function Toggle({ value, onChange, label }) {
  return (
    <button className={"sw-toggle " + (value ? "on" : "")} onClick={() => onChange(!value)} type="button">
      <span className="sw-toggle-knob" />
      {label && <em>{label}</em>}
    </button>
  );
}

/* Модалка без анимаций */
function Modal({ open, onClose, title, children, wide }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="sw-backdrop" onClick={onClose}>
      <div className={"sw-modal " + (wide ? "wide" : "")} onClick={(e) => e.stopPropagation()}>
        <div className="sw-modal-head">
          <h3>{title}</h3>
          <button className="sw-icon-btn" onClick={onClose} aria-label="close"><X size={19} /></button>
        </div>
        <div className="sw-modal-body">{children}</div>
      </div>
    </div>
  );
}

function ConfirmModal({ open, onClose, onConfirm, title, message, confirmLabel, danger }) {
  const { t } = useGame();
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="sw-muted">{message}</p>
      <div className="sw-modal-actions">
        <Button onClick={onClose}>{t.cancel}</Button>
        <Button primary={!danger} danger={danger} onClick={onConfirm}>{confirmLabel || t.yes}</Button>
      </div>
    </Modal>
  );
}

function EmojiPickerModal({ open, onClose, onPick, current }) {
  const { t } = useGame();
  return (
    <Modal open={open} onClose={onClose} title={t.chooseAvatar} wide>
      <div className="sw-emoji-grid">
        {EMOJIS.map((e) => (
          <button
            key={e}
            className={"sw-emoji " + (current === e ? "selected" : "")}
            onClick={() => { onPick(e); onClose(); }}
          >
            {e}
          </button>
        ))}
      </div>
    </Modal>
  );
}

function ThemePreviewModal({ open, onClose, theme, lang }) {
  if (!theme) return null;
  const words = themeWords(theme, lang);
  return (
    <Modal open={open} onClose={onClose} title={theme.emoji + " " + themeName(theme, lang)} wide>
      <div className="sw-preview-grid">
        {words.map((w, i) => <span key={i} className="sw-preview-word" style={{ "--accent": theme.color }}>{w}</span>)}
      </div>
    </Modal>
  );
}

/* Конфетти на CSS (лёгкое, только на десктопе) */
function Confetti({ variant = "players" }) {
  const pieces = useMemo(() => Array.from({ length: 24 }, (_, i) => ({
    id: i, x: Math.random() * 100, delay: Math.random() * 0.6,
    rotate: Math.random() * 360, size: 6 + Math.random() * 8,
    duration: 2 + Math.random() * 1.4,
  })), []);
  const colors = variant === "spy" ? ["#fbbf24", "#a78bfa", "#f472b6"] : ["#34d399", "#38bdf8", "#a3e635"];
  return (
    <div className="sw-confetti" aria-hidden="true">
      {pieces.map((p, i) => (
        <span
          key={p.id}
          className="sw-confetti-piece"
          style={{
            left: p.x + "%", width: p.size, height: p.size * 0.4,
            background: colors[i % colors.length],
            animationDuration: p.duration + "s", animationDelay: p.delay + "s",
            "--rot": p.rotate + "deg",
          }}
        />
      ))}
    </div>
  );
}

/* ============================== SCREENS ============================== */
function Splash() {
  const { dispatch, state } = useGame();
  useEffect(() => {
    if (!state.loaded) return;
    const id = setTimeout(() => dispatch({ type: "SET_SCREEN", screen: "home" }), 1200);
    return () => clearTimeout(id);
  }, [state.loaded]);
  return (
    <Screen className="sw-splash">
      <div className="sw-splash-logo">
        <div className="sw-logo-mark"><SpyLogo /></div>
        <h1>ШПИОН</h1>
        <p>Слово знают все. Кроме одного.</p>
      </div>
    </Screen>
  );
}

function Home() {
  const { state, dispatch, t } = useGame();
  const { players, themeIds } = state;
  const canPlay = players.length >= 3 && themeIds.length >= 1;
  const items = [
    { key: "play", label: t.play, icon: <Sparkles size={20} />, primary: true, onClick: () => dispatch({ type: "SET_SCREEN", screen: canPlay ? "pregame" : "players" }) },
    { key: "players", label: t.players, icon: <Users size={19} />, badge: players.length, onClick: () => dispatch({ type: "SET_SCREEN", screen: "players" }) },
    { key: "themes", label: t.themes, icon: <Eye size={19} />, badge: themeIds.length, onClick: () => dispatch({ type: "SET_SCREEN", screen: "themes" }) },
    { key: "settings", label: t.settings, icon: <SettingsIcon size={19} />, onClick: () => dispatch({ type: "SET_SCREEN", screen: "settings" }) },
  ];
  return (
    <Screen className="sw-home">
      <div className="sw-home-layout">
        <div className="sw-home-hero">
          <div className="sw-emblem"><SpyLogo /></div>
        </div>
        <div className="sw-home-main">
          <h1 className="sw-title-pulse">{t.appName}</h1>
          <p className="sw-tagline">{t.tagline}</p>
          <div className="sw-menu">
            {items.map((item) => (
              <div key={item.key}>
                <Button primary={item.primary} onClick={item.onClick} className="sw-menu-btn">
                  {item.icon} {item.label} {item.badge != null && <span className="sw-badge">{item.badge}</span>}
                </Button>
              </div>
            ))}
          </div>
          <div className="sw-home-stats">
            <span>{players.length} {t.playersCount.toLowerCase()}</span>
            <span>{themeIds.length} {t.themesCount.toLowerCase()}</span>
          </div>
        </div>
      </div>
    </Screen>
  );
}

function PlayersScreen() {
  const { state, dispatch, t } = useGame();
  const { players } = state;
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🙂");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [dragId, setDragId] = useState(null);
  const [shake, setShake] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const isDuplicate = (n) => players.some(p => p.name.trim().toLowerCase() === n.trim().toLowerCase());

  const add = () => {
    const n = name.trim();
    if (!n) return;
    if (isDuplicate(n)) { setShake(true); setTimeout(() => setShake(false), 400); return; }
    if (players.length >= 20) return;
    dispatch({ type: "ADD_PLAYER", name: n, emoji });
    setName(""); setEmoji("🙂");
  };
  const quickAdd = () => {
    let i = 1;
    while (players.some(p => p.name === "Игрок " + i)) i++;
    dispatch({ type: "ADD_PLAYER", name: "Игрок " + i, emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)] });
  };

  return (
    <Screen>
      <Header title={t.players} onBack={() => dispatch({ type: "SET_SCREEN", screen: "home" })} />
      <div className={"sw-add-row " + (shake ? "sw-shake" : "")}>
        <button className="sw-avatar-btn" onClick={() => setPickerOpen(true)}>{emoji}</button>
        <div className="sw-name-input">
          <input
            value={name} maxLength={16} placeholder={t.addPlayerPlaceholder}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") add(); }}
          />
          <small>{16 - name.length}</small>
        </div>
        <button className="sw-round-btn" onClick={add} disabled={!name.trim() || players.length >= 20}><Plus size={20} /></button>
      </div>
      {isDuplicate(name) && name.trim() && <div className="sw-warning">{t.duplicateName}</div>}

      <div className="sw-player-list">
        {players.map((p) => (
          <div
            key={p.id}
            className={"sw-player-card " + (dragId === p.id ? "dragging" : "")}
            draggable
            onDragStart={() => setDragId(p.id)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => { if (dragId && dragId !== p.id) dispatch({ type: "REORDER_PLAYERS", dragId, overId: p.id }); setDragId(null); }}
            onDragEnd={() => setDragId(null)}
          >
            <span className="sw-drag"><GripVertical size={16} /></span>
            <div className="sw-player-avatar" style={{ background: colorFor(p.name) }}>{p.emoji}</div>
            {editing === p.id ? (
              <input
                className="sw-inline-edit" autoFocus defaultValue={p.name} maxLength={16}
                onBlur={(e) => { dispatch({ type: "UPDATE_PLAYER", id: p.id, name: e.target.value.trim() || p.name }); setEditing(null); }}
                onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }}
              />
            ) : (
              <span className="sw-player-name">{p.name}</span>
            )}
            {state.wins[p.id] > 0 && <span className="sw-win-count"><Trophy size={12} /> {state.wins[p.id]}</span>}
            <button className="sw-small-icon" onClick={() => setEditing(p.id)}><Pencil size={15} /></button>
            <button className="sw-small-icon danger" onClick={() => setConfirmDelete(p.id)}><Trash2 size={15} /></button>
          </div>
        ))}
      </div>

      {players.length < 3 && <div className="sw-warning">{t.minPlayers}</div>}
      {players.length >= 20 && <div className="sw-warning">{t.maxPlayers}</div>}
      <Button onClick={quickAdd} disabled={players.length >= 20}><Plus size={17} /> {t.quickAdd}</Button>

      <EmojiPickerModal open={pickerOpen} onClose={() => setPickerOpen(false)} onPick={setEmoji} current={emoji} />
      <ConfirmModal
        open={!!confirmDelete} onClose={() => setConfirmDelete(null)} danger
        title={t.confirmDelete} message={t.delete + "?"} confirmLabel={t.delete}
        onConfirm={() => { dispatch({ type: "REMOVE_PLAYER", id: confirmDelete }); setConfirmDelete(null); }}
      />
    </Screen>
  );
}

function ThemesScreen() {
  const { state, dispatch, t } = useGame();
  const { themeIds } = state;
  const [preview, setPreview] = useState(null);
  return (
    <Screen className="sw-themes-screen">
      <Header title={t.themes} onBack={() => dispatch({ type: "SET_SCREEN", screen: "home" })} />
      <div className="sw-subline">
        <span>{t.selected}: {themeIds.length} {t.of} {THEMES.length}</span>
        <div className="sw-subline-actions">
          <button onClick={() => dispatch({ type: "SELECT_ALL_THEMES" })}>{t.selectAll}</button>
          <button onClick={() => dispatch({ type: "CLEAR_THEMES" })}>{t.clearAll}</button>
        </div>
      </div>
      <div className="sw-theme-grid">
        {THEMES.map((th) => {
          const active = themeIds.includes(th.id);
          return (
            <div
              key={th.id}
              role="button" tabIndex={0}
              className={"sw-theme-card " + (active ? "active" : "")}
              style={{ "--accent": th.color }}
              onClick={() => dispatch({ type: "TOGGLE_THEME", id: th.id })}
            >
              <button className="sw-theme-preview-btn" onClick={(e) => { e.stopPropagation(); setPreview(th); }}><Eye size={14} /></button>
              <span className="sw-theme-emoji">{th.emoji}</span>
              <b>{themeName(th, state.settings.language)}</b>
              {active && <span className="sw-theme-check"><Check size={15} /></span>}
            </div>
          );
        })}
      </div>
      {themeIds.length === 0 && <div className="sw-warning">{t.needTheme}</div>}
      <ThemePreviewModal open={!!preview} onClose={() => setPreview(null)} theme={preview} lang={state.settings.language} />
    </Screen>
  );
}

function SettingsScreen() {
  const { state, dispatch, t } = useGame();
  const { settings, players } = state;
  const maxSpies = Math.max(1, players.length - 2);
  const upd = (payload) => dispatch({ type: "UPDATE_SETTINGS", payload });
  return (
    <Screen>
      <Header title={t.settings} onBack={() => dispatch({ type: "SET_SCREEN", screen: "home" })} />
      <div className="sw-settings-grid">
        <SettingRow icon={<Users size={18} />} title={t.spiesCount}>
          <div className="sw-stepper">
            <button onClick={() => upd({ spies: Math.max(1, settings.spies - 1) })}><Minus size={16} /></button>
            <b>{Math.min(settings.spies, maxSpies)}</b>
            <button onClick={() => upd({ spies: Math.min(maxSpies, settings.spies + 1) })}><Plus size={16} /></button>
          </div>
        </SettingRow>
        <SettingRow icon={<Clock3 size={18} />} title={t.roundTime}>
          <div className="sw-range-value">{settings.minutes} {t.minutes}</div>
          <input type="range" min="3" max="15" value={settings.minutes} onChange={(e) => upd({ minutes: +e.target.value })} />
        </SettingRow>
        <SettingRow icon={<ShieldAlert size={18} />} title={t.spyDifficulty} full>
          <div className="sw-stacked-options">
            {[["none", t.diffNone], ["theme", t.diffTheme], ["hints", t.diffHints]].map(([val, label]) => (
              <button key={val} className={settings.difficulty === val ? "active" : ""} onClick={() => upd({ difficulty: val })}>{label}</button>
            ))}
          </div>
        </SettingRow>
        <SettingRow icon={<Search size={18} />} title={t.allowSpyGuess}>
          <Toggle value={settings.allowSpyGuess} onChange={(v) => upd({ allowSpyGuess: v })} />
        </SettingRow>
        <SettingRow icon={settings.sound ? <Volume2 size={18} /> : <VolumeX size={18} />} title={t.sound}>
          <Toggle value={settings.sound} onChange={(v) => upd({ sound: v })} />
        </SettingRow>
        <SettingRow icon={<Vibrate size={18} />} title={t.vibration}>
          <Toggle value={settings.vibration} onChange={(v) => upd({ vibration: v })} />
        </SettingRow>
        <SettingRow icon={settings.dark ? <Moon size={18} /> : <Sun size={18} />} title={t.darkTheme}>
          <Toggle value={settings.dark} onChange={(v) => upd({ dark: v })} />
        </SettingRow>
        <SettingRow icon={<Languages size={18} />} title={t.language} full>
          <div className="sw-lang-options">
            <button className={settings.language === "ru" ? "active" : ""} onClick={() => upd({ language: "ru" })}>Русский</button>
            <button className={settings.language === "en" ? "active" : ""} onClick={() => upd({ language: "en" })}>English</button>
            <button className={settings.language === "tj" ? "active" : ""} onClick={() => upd({ language: "tj" })}>Тоҷикӣ</button>
          </div>
        </SettingRow>
      </div>
    </Screen>
  );
}
function SettingRow({ icon, title, children, full }) {
  return (
    <div className={"sw-setting-row " + (full ? "full" : "")}>
      <span className="sw-setting-icon">{icon}</span>
      <div className="sw-setting-main">
        <b>{title}</b>
        <div className="sw-setting-control">{children}</div>
      </div>
    </div>
  );
}

function PreGame() {
  const { state, dispatch, t } = useGame();
  const { players, themeIds, settings } = state;
  const canStart = players.length >= 3 && themeIds.length >= 1;
  const [shake, setShake] = useState(false);
  const tryStart = () => {
    if (!canStart) { setShake(true); setTimeout(() => setShake(false), 400); return; }
    dispatch({ type: "START_ROUND" });
    dispatch({ type: "SET_SCREEN", screen: "reveal" });
  };
  return (
    <Screen className="sw-center">
      <div className="sw-eyebrow">{t.ready}</div>
      <h2>{t.roundTitle}</h2>
      <div className="sw-stack-avatars">
        {players.map((p) => <span key={p.id} style={{ background: colorFor(p.name) }}>{p.emoji}</span>)}
      </div>
      <div className="sw-summary">
        <div><b>{players.length}</b><small>{t.playersWord}</small></div>
        <div><b>{Math.min(settings.spies, Math.max(1, players.length - 2))}</b><small>{t.spiesWord}</small></div>
        <div><b>{settings.minutes}</b><small>{t.minutes}</small></div>
      </div>
      <p className="sw-muted">{t.randomWordFrom} {themeIds.length} {t.activeThemes}.</p>
      <div className={shake ? "sw-shake" : ""}>
        <Button primary onClick={tryStart}>{t.startDeal}</Button>
      </div>
      {!canStart && <div className="sw-warning">{t.notEnough}</div>}
      <Button onClick={() => dispatch({ type: "SET_SCREEN", screen: "home" })}>{t.back}</Button>
    </Screen>
  );
}

function Reveal() {
  const { state, dispatch, t } = useGame();
  const { round, players, settings } = state;
  const lang = settings.language;
  const [held, setHeld] = useState(false);
  const [opened, setOpened] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const playerId = round.revealOrder[round.revealIndex];
  const player = players.find((p) => p.id === playerId);
  const isSpy = round.spyIds.includes(playerId);
  const theme = THEMES.find((th) => th.id === round.themeId);
  const words = themeWords(theme, lang);
  const word = words[round.wordIndex];
  const hints = round.hintIndices.map((i) => words[i]);
  const done = round.revealIndex >= round.revealOrder.length - 1;

  useEffect(() => { setHeld(false); setOpened(false); }, [round.revealIndex]);

  const press = (v) => {
    setHeld((prev) => {
      if (prev === v) return prev;
      return v;
    });
    if (v) {
      setOpened(true);
      if (settings.sound) beep(520, 0.05, "triangle");
      if (settings.vibration && navigator.vibrate) navigator.vibrate(15);
    }
  };

  return (
    <Screen className="sw-center sw-reveal-screen">
      <button className="sw-icon-btn sw-corner-back" onClick={() => setConfirmLeave(true)} aria-label="back"><ArrowLeft size={20} /></button>
      <div className="sw-progress">
        <span>{t.playerOf} {round.revealIndex + 1} {t.ofWord} {round.revealOrder.length}</span>
        <div className="sw-progress-track"><div className="sw-progress-fill" style={{ width: `${((round.revealIndex + 1) / round.revealOrder.length) * 100}%` }} /></div>
      </div>
      <div className="sw-pass-label">{t.passDevice}</div>
      <div className="sw-reveal-player">
        <span>{player.emoji}</span><b>{player.name}</b>
      </div>
      <p className="sw-muted">{t.holdToReveal}</p>
      <div
        className={"sw-secret-card " + (held ? "open" : "") + (isSpy ? " spy" : "")}
        onPointerDown={(e) => { e.preventDefault(); press(true); }}
        onPointerUp={() => press(false)}
        onPointerLeave={() => press(false)}
        onPointerCancel={() => press(false)}
        onContextMenu={(e) => e.preventDefault()}
      >
        <div className="sw-card-front"><span>🔒</span><b>{t.holdCard}</b></div>
        <div className="sw-card-back">
          {isSpy ? (
            <>
              <span className="sw-spy-big">🕵️</span>
              <h2>{t.youAreSpy}</h2>
              {settings.difficulty === "none" && <p>{t.spyNoInfo}</p>}
              {settings.difficulty === "theme" && <p className="sw-theme-tag" style={{ "--accent": theme.color }}>{t.spyThemeOnly} {theme.emoji} {themeName(theme, lang)}</p>}
              {settings.difficulty === "hints" && (
                <>
                  <p className="sw-theme-tag" style={{ "--accent": theme.color }}>{t.spyThemeOnly} {theme.emoji} {themeName(theme, lang)}</p>
                  <p className="sw-hints-label">{t.spyHints}</p>
                  <div className="sw-hints-row">{hints.map((h, i) => <span key={i}>{h}</span>)}</div>
                </>
              )}
            </>
          ) : (
            <>
              <span className="sw-theme-tag" style={{ "--accent": theme.color }}>{theme.emoji} {themeName(theme, lang)}</span>
              <h2>{word}</h2>
            </>
          )}
        </div>
      </div>
      <Button primary disabled={!opened} onClick={() => { if (done) dispatch({ type: "SET_SCREEN", screen: "timer" }); else dispatch({ type: "NEXT_REVEAL" }); }}>
        {done ? t.startGame : t.doneNext}
      </Button>
      <ConfirmModal
        open={confirmLeave} onClose={() => setConfirmLeave(false)} danger
        title={t.back} message={t.leaveRoundWarning}
        confirmLabel={t.leaveRound}
        onConfirm={() => { setConfirmLeave(false); dispatch({ type: "NEW_GAME" }); }}
      />
    </Screen>
  );
}

function TimerScreen() {
  const { state, dispatch, t } = useGame();
  const { round, settings } = state;
  const lang = settings.language;
  const [paused, setPaused] = useState(false);
  const [votingOpen, setVotingOpen] = useState(false);
  const [guessOpen, setGuessOpen] = useState(false);
  const [exileBanner, setExileBanner] = useState(null);
  const [confirmLeave, setConfirmLeave] = useState(false);

  useEffect(() => {
    if (paused || round.finished || votingOpen || guessOpen) return;
    const id = setInterval(() => dispatch({ type: "TICK" }), 1000);
    return () => clearInterval(id);
  }, [paused, round.finished, votingOpen, guessOpen]);

  useEffect(() => {
    if (round.seconds === 0 && !round.finished) {
      if (settings.sound) beep(220, 0.3, "square");
      if (settings.vibration && navigator.vibrate) navigator.vibrate([80, 40, 80]);
      setVotingOpen(true);
    } else if (round.seconds <= 10 && round.seconds > 0 && settings.sound) {
      beep(880, 0.05, "sine", 0.03);
    }
  }, [round.seconds]);

  useEffect(() => {
    if (round.finished) dispatch({ type: "SET_SCREEN", screen: "results" });
  }, [round.finished]);

  const theme = THEMES.find((th) => th.id === round.themeId);
  const total = settings.minutes * 60;
  const pct = Math.min(1, round.seconds / total);
  const r = 108, circ = 2 * Math.PI * r;
  const urgent = round.seconds <= 10 && round.seconds > 0;
  const mm = String(Math.floor(round.seconds / 60)).padStart(2, "0");
  const ss = String(round.seconds % 60).padStart(2, "0");

  const alivePlayers = state.players.filter((p) => round.aliveIds.includes(p.id));

  const handleExile = (id) => {
    const wasSpy = round.spyIds.includes(id);
    dispatch({ type: "EXILE_PLAYER", id });
    setVotingOpen(false);
    if (!wasSpy) {
      const p = state.players.find((pp) => pp.id === id);
      setExileBanner(p.name);
      setTimeout(() => setExileBanner(null), 2300);
      if (round.seconds <= 0) dispatch({ type: "ADD_TIME", amount: 60 });
    }
  };

  return (
    <Screen className="sw-center">
      <button className="sw-icon-btn sw-corner-back" onClick={() => setConfirmLeave(true)} aria-label="back"><ArrowLeft size={20} /></button>
      <div className="sw-eyebrow">{t.theme}: {theme.emoji} {themeName(theme, lang)}</div>
      <div className="sw-timer-ring">
        <svg viewBox="0 0 240 240">
          <circle className="sw-track" cx="120" cy="120" r={r} />
          <circle
            className={"sw-progress-ring " + (urgent ? "urgent" : "")}
            cx="120" cy="120" r={r}
            style={{ strokeDasharray: circ, strokeDashoffset: circ * (1 - pct) }}
          />
        </svg>
        <div className={"sw-timer-digits " + (urgent ? "urgent" : "")}>{mm}:{ss}</div>
      </div>
      <div className="sw-timer-actions">
        <Button onClick={() => setPaused(!paused)}>{paused ? <Play size={18} /> : <Pause size={18} />} {paused ? t.resume : t.pause}</Button>
        <Button onClick={() => setVotingOpen(true)}>{t.exile}</Button>
        {settings.allowSpyGuess && (
          <Button className="sw-spy-cta" onClick={() => setGuessOpen(true)}>🕵️ {t.iAmSpy}</Button>
        )}
      </div>

      <div className="sw-exiled-row">
        {state.players.filter((p) => round.exiledIds.includes(p.id)).map((p) => (
          <span key={p.id} className="sw-exiled-chip">{p.emoji} {p.name} ✕</span>
        ))}
      </div>

      <Modal open={votingOpen} onClose={() => setVotingOpen(false)} title={t.whoToExile} wide>
        <VotingBody players={alivePlayers} exiledIds={round.exiledIds} allPlayers={state.players} onExile={handleExile} />
      </Modal>

      <ConfirmModal
        open={confirmLeave} onClose={() => setConfirmLeave(false)} danger
        title={t.back} message={t.leaveRoundWarning}
        confirmLabel={t.leaveRound}
        onConfirm={() => { setConfirmLeave(false); dispatch({ type: "NEW_GAME" }); }}
      />

      <Modal open={guessOpen} onClose={() => setGuessOpen(false)} title={t.guessTitle} wide>
        <GuessWordBody theme={theme} lang={lang} correctIndex={round.wordIndex} onGuess={(wordIndex) => { setGuessOpen(false); dispatch({ type: "SPY_GUESS", wordIndex }); }} />
      </Modal>

      {exileBanner && (
        <div className="sw-exile-banner">❌ {exileBanner} — {t.notSpyBanner}</div>
      )}
    </Screen>
  );
}

function VotingBody({ players, exiledIds, allPlayers, onExile }) {
  const { t } = useGame();
  const [chosen, setChosen] = useState(null);
  const exiled = allPlayers.filter((p) => exiledIds.includes(p.id));
  return (
    <div>
      <div className="sw-vote-grid">
        {players.map((p) => (
          <button key={p.id} className={"sw-vote-card " + (chosen === p.id ? "chosen" : "")} onClick={() => setChosen(p.id)}>
            <span style={{ background: colorFor(p.name) }}>{p.emoji}</span>
            <b>{p.name}</b>
            {chosen === p.id && <Check className="sw-vote-check" size={16} />}
          </button>
        ))}
      </div>
      {exiled.length > 0 && (
        <div className="sw-exiled-list">
          {exiled.map((p) => <span key={p.id} className="sw-exiled-muted">{p.emoji} {p.name} ✕</span>)}
        </div>
      )}
      <Button primary disabled={!chosen} onClick={() => onExile(chosen)}>{t.exileSelected}</Button>
    </div>
  );
}

function GuessWordBody({ theme, lang, correctIndex, onGuess }) {
  const { t } = useGame();
  const words = themeWords(theme, lang);
  const [candidateIndex, setCandidateIndex] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const optionIndices = useMemo(() => {
    const total = words.length;
    const limit = Math.min(9, total);
    const others = Array.from({ length: total }, (_, i) => i).filter((i) => i !== correctIndex);
    const picked = shuffle(others).slice(0, limit - 1);
    return shuffle([correctIndex, ...picked]);
  }, [theme.id, lang, correctIndex]);
  return (
    <div>
      <p className="sw-muted">{t.guessSubtitle} {theme.emoji} {themeName(theme, lang)}</p>
      <div className="sw-guess-grid">
        {optionIndices.map((i) => (
          <button key={i} className="sw-guess-word" style={{ "--accent": theme.color }} onClick={() => { setCandidateIndex(i); setConfirming(true); }}>{words[i]}</button>
        ))}
      </div>
      <ConfirmModal
        open={confirming} onClose={() => setConfirming(false)}
        title={t.guessTitle}
        message={`${t.confirmGuess} «${candidateIndex != null ? words[candidateIndex] : ""}»? ${t.noWayBack}`}
        onConfirm={() => { setConfirming(false); onGuess(candidateIndex); }}
      />
    </div>
  );
}

function Results() {
  const { state, dispatch, t } = useGame();
  const { round, players } = state;
  const lang = state.settings.language;
  const theme = THEMES.find((th) => th.id === round.themeId);
  const words = themeWords(theme, lang);
  const word = words[round.wordIndex];
  const spyWon = round.winner === "spy";
  const spies = players.filter((p) => round.spyIds.includes(p.id));
  const winnerIds = spyWon ? round.spyIds : players.filter((p) => !round.spyIds.includes(p.id)).map((p) => p.id);

  const recorded = useRef(false);
  useEffect(() => {
    if (!recorded.current) { dispatch({ type: "RECORD_WIN", playerIds: winnerIds }); recorded.current = true; }
  }, []);

  let headline;
  if (round.endReason === "exiled") headline = t.exiledSpyWin;
  else if (spyWon) headline = t.spyGuessedRight;
  else headline = t.spyGuessedWrong;

  return (
    <Screen className="sw-center sw-results">
      <Confetti variant={spyWon ? "spy" : "players"} />
      <Trophy size={52} className={spyWon ? "sw-trophy-spy" : "sw-trophy-players"} />
      <div className={"sw-eyebrow " + (spyWon ? "spy" : "players")}>{spyWon ? t.spyWon : t.playersWon}</div>
      <h2>{theme.emoji} {themeName(theme, lang)} — {word}</h2>
      <p className="sw-muted">{headline}</p>
      <p className="sw-muted">{t.spyWas}{spies.length > 1 ? "ы" : ""}: <b>{spies.map((s) => s.emoji + " " + s.name).join(", ")}</b></p>

      {round.endReason === "guess" && (
        <div className="sw-guess-compare">
          <div className={"sw-guess-pill " + (spyWon ? "hide" : "wrong")}>{!spyWon && "✕ "}{words[round.spyGuessIndex]}</div>
          {!spyWon && <div className="sw-guess-pill correct">✅ {word}</div>}
        </div>
      )}

      <div className="sw-result-card">
        {players.map((p) => (
          <div key={p.id} className={round.exiledIds.includes(p.id) ? "sw-result-exiled" : ""}>
            <span>{p.emoji}</span><b>{p.name}</b>
            <small>{round.spyIds.includes(p.id) ? "🕵️ ШПИОН" : "👤 " + t.players.slice(0, -1)}</small>
          </div>
        ))}
      </div>

      <Button primary onClick={() => { dispatch({ type: "START_ROUND" }); dispatch({ type: "SET_SCREEN", screen: "reveal" }); }}>{t.playAgain}</Button>
      <Button onClick={() => dispatch({ type: "NEW_GAME" })}>{t.newGame}</Button>
    </Screen>
  );
}

/* ============================== STYLES ============================== */
function StyleSheet() {
  return (
    <style>{`
@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@500;700;800&family=Inter:wght@400;500;600&display=swap');

*, *::before, *::after { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
.sw-app {
  --bg1:#0f0c29; --bg2:#302b63; --bg3:#24243e;
  --ink:#f4f2ff; --ink-dim:#b9b3d9;
  --glass:rgba(255,255,255,0.07); --glass-border:rgba(255,255,255,0.14);
  --accent-teal:#2dd4bf; --accent-violet:#a78bfa; --accent-pink:#f472b6;
  --accent-gold:#fbbf24; --accent-green:#34d399; --accent-red:#f87171;
  --radius:20px;
  position:relative; min-height:100dvh; width:100%; overflow-x:hidden;
  font-family:'Inter',system-ui,sans-serif; color:var(--ink);
  padding-top:env(safe-area-inset-top); padding-bottom:env(safe-area-inset-bottom);
  background:linear-gradient(160deg,var(--bg1),var(--bg2) 55%,var(--bg3));
  background-attachment:scroll;
}
.sw-app[data-spy-theme="light"] {
  --bg1:#eef2ff; --bg2:#e0e7ff; --bg3:#f5f3ff;
  --ink:#241f42; --ink-dim:#5b5480;
  --glass:rgba(255,255,255,0.55); --glass-border:rgba(120,110,180,0.18);
}

/* Статичный фон-город, без анимаций */
.sw-ambient { position:absolute; inset:0; z-index:0; pointer-events:none; overflow:hidden; }
.sw-skyline {
  position:absolute; left:0; right:0; bottom:0; width:100%;
  height:38vh; min-height:180px; max-height:380px;
  opacity:0.7; pointer-events:none;
}
.sw-skyline svg { width:100%; height:100%; display:block; }
.sw-app[data-spy-theme="light"] .sw-skyline { opacity:0.28; }
@media (max-height:500px) { .sw-skyline { height:30vh; min-height:100px; } }

.sw-screen {
  position:relative; z-index:1; max-width:520px; margin:0 auto; padding:20px 20px 48px;
  min-height:100dvh; display:flex; flex-direction:column; gap:14px;
}
.sw-screen.sw-center { align-items:center; text-align:center; justify-content:flex-start; padding-top:40px; }
.sw-themes-screen { padding-bottom:80px; }

h1,h2,h3 { font-family:'Manrope',sans-serif; font-weight:800; margin:0; }
.sw-muted { color:var(--ink-dim); font-size:0.92rem; line-height:1.5; margin:0; }

/* Splash */
.sw-splash { align-items:center; justify-content:center; text-align:center; }
.sw-splash-logo .sw-logo-mark { width:clamp(120px,32vw,180px); height:clamp(120px,32vw,180px); margin:0 auto; }
.sw-logo-svg { width:100%; height:100%; display:block; }
.sw-splash-logo h1 { font-size:clamp(1.8rem,6vw,2.4rem); letter-spacing:0.06em; margin-top:6px; }
.sw-splash-logo p { color:var(--ink-dim); margin-top:6px; }

/* Home */
.sw-home { justify-content:center; }
.sw-home-layout { display:flex; flex-direction:column; align-items:center; gap:8px; width:100%; }
.sw-emblem { position:relative; width:min(28vw,140px); height:min(28vw,140px); border-radius:50%; display:flex; align-items:center; justify-content:center; background:rgba(167,139,250,0.18); margin-bottom:6px; padding:6px; }
.sw-home-main { width:100%; max-width:420px; display:flex; flex-direction:column; align-items:center; text-align:center; gap:6px; margin:0 auto; }
.sw-title-pulse { font-size:clamp(2.2rem,9vw,3rem); letter-spacing:0.08em; }
.sw-tagline { color:var(--ink-dim); margin-bottom:8px; }
.sw-menu { width:100%; display:flex; flex-direction:column; gap:10px; margin-top:6px; }
.sw-menu > div { width:100%; }
.sw-menu-btn { width:100%; justify-content:center; font-size:1.05rem; }
.sw-badge { background:rgba(255,255,255,0.18); border-radius:999px; padding:1px 9px; font-size:0.8rem; margin-left:6px; }
.sw-home-stats { display:flex; gap:16px; margin-top:14px; color:var(--ink-dim); font-size:0.85rem; }

/* Buttons (без теней и blur — легче для GPU) */
.sw-btn {
  display:inline-flex; align-items:center; justify-content:center; gap:8px;
  padding:14px 20px; border-radius:16px; border:1px solid var(--glass-border);
  background:var(--glass); color:var(--ink);
  font-weight:600; font-size:0.98rem; cursor:pointer; min-height:48px;
  touch-action:manipulation;
}
.sw-btn:disabled { opacity:0.4; cursor:not-allowed; }
.sw-btn-primary { background:linear-gradient(135deg,var(--accent-violet),var(--accent-pink)); border:none; color:#fff; }
.sw-btn-danger { background:linear-gradient(135deg,#ef4444,#b91c1c); border:none; color:#fff; }
.sw-spy-cta { background:linear-gradient(135deg,#7c3aed,#c026d3); border:none; color:#fff; }
.sw-icon-btn { width:44px; height:44px; border-radius:12px; border:none; background:var(--glass); color:var(--ink); display:flex; align-items:center; justify-content:center; cursor:pointer; touch-action:manipulation; }

/* Header */
.sw-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:4px; }
.sw-corner-back { position:absolute; top:16px; left:16px; z-index:10; }
.sw-header h1 { font-size:1.2rem; }

/* Toggle */
.sw-toggle { display:inline-flex; align-items:center; gap:8px; border:none; background:rgba(255,255,255,0.12); border-radius:999px; width:52px; height:30px; padding:3px; cursor:pointer; position:relative; }
.sw-toggle-knob { width:24px; height:24px; border-radius:50%; background:#fff; }
.sw-toggle.on { background:linear-gradient(135deg,var(--accent-violet),var(--accent-pink)); }
.sw-toggle.on .sw-toggle-knob { transform:translateX(22px); }
.sw-toggle em { font-style:normal; font-size:0.85rem; margin-left:4px; white-space:nowrap; }

/* Modal */
.sw-backdrop { position:fixed; inset:0; background:rgba(10,8,24,0.7); display:flex; align-items:flex-end; justify-content:center; z-index:100; }
.sw-modal { width:100%; max-width:100%; background:var(--bg3); border:1px solid var(--glass-border); border-radius:24px 24px 0 0; padding:18px 18px 26px; max-height:82vh; overflow-y:auto; -webkit-overflow-scrolling:touch; }
.sw-modal-head { display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; }
.sw-modal-actions { display:flex; gap:10px; margin-top:16px; }
.sw-modal-actions .sw-btn { flex:1; }

.sw-emoji-grid { display:grid; grid-template-columns:repeat(6,1fr); gap:8px; }
.sw-emoji { font-size:1.6rem; background:var(--glass); border:1px solid transparent; border-radius:12px; padding:8px 0; cursor:pointer; min-height:48px; }
.sw-emoji.selected { border-color:var(--accent-violet); box-shadow:0 0 0 2px rgba(167,139,250,0.5); }

.sw-preview-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:8px; }
.sw-preview-word { background:var(--glass); border-left:3px solid var(--accent); border-radius:10px; padding:9px 12px; font-size:0.92rem; }

.sw-add-row { display:flex; gap:10px; align-items:center; }
.sw-avatar-btn { width:52px; height:52px; border-radius:16px; background:var(--glass); border:1px solid var(--glass-border); font-size:1.5rem; cursor:pointer; flex-shrink:0; }
.sw-name-input { flex:1; position:relative; background:var(--glass); border:1px solid var(--glass-border); border-radius:14px; padding:0 12px; display:flex; align-items:center; }
.sw-name-input input { flex:1; min-width:0; background:transparent; border:none; outline:none; color:var(--ink); padding:14px 0; font-size:1rem; }
.sw-name-input small { color:var(--ink-dim); font-size:0.75rem; }
.sw-round-btn { width:48px; height:48px; border-radius:14px; border:none; background:linear-gradient(135deg,var(--accent-violet),var(--accent-pink)); color:#fff; cursor:pointer; flex-shrink:0; display:flex; align-items:center; justify-content:center; }
.sw-round-btn:disabled { opacity:0.4; }

.sw-warning { background:rgba(248,113,113,0.14); border:1px solid rgba(248,113,113,0.4); color:#fca5a5; padding:10px 14px; border-radius:12px; font-size:0.88rem; }
.sw-shake { animation:sw-shake 0.4s; }
@keyframes sw-shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-6px)} 75%{transform:translateX(6px)} }

.sw-player-list { display:flex; flex-direction:column; gap:8px; }
.sw-player-card { display:flex; align-items:center; gap:10px; background:var(--glass); border:1px solid var(--glass-border); border-radius:16px; padding:10px 12px; }
.sw-player-card.dragging { opacity:0.5; }
.sw-drag { color:var(--ink-dim); cursor:grab; }
.sw-player-avatar { width:38px; height:38px; border-radius:11px; display:flex; align-items:center; justify-content:center; font-size:1.2rem; flex-shrink:0; }
.sw-player-name, .sw-inline-edit { flex:1; min-width:0; font-weight:600; overflow-wrap:anywhere; }
.sw-inline-edit { background:transparent; border:none; border-bottom:1px solid var(--accent-violet); outline:none; color:var(--ink); font-weight:600; width:100%; }
.sw-win-count { display:flex; align-items:center; gap:3px; font-size:0.75rem; color:var(--accent-gold); }
.sw-small-icon { width:36px; height:36px; border-radius:10px; border:none; background:rgba(255,255,255,0.08); color:var(--ink); display:flex; align-items:center; justify-content:center; cursor:pointer; flex-shrink:0; }
.sw-small-icon.danger { color:var(--accent-red); }

.sw-subline { display:flex; align-items:center; justify-content:space-between; font-size:0.85rem; color:var(--ink-dim); padding:8px 4px; }
.sw-subline-actions button { background:none; border:none; color:var(--accent-violet); font-weight:600; cursor:pointer; margin-left:12px; }

.sw-theme-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:10px; }
.sw-theme-card { position:relative; background:var(--glass); border:1px solid var(--glass-border); border-radius:16px; padding:16px 10px; display:flex; flex-direction:column; align-items:center; gap:6px; cursor:pointer; min-height:48px; color:var(--ink); touch-action:manipulation; }
.sw-theme-card.active { border-color:var(--accent); box-shadow:0 0 0 2px var(--accent) inset; }
.sw-theme-emoji { font-size:1.7rem; }
.sw-theme-card b { font-size:0.85rem; text-align:center; }
.sw-theme-check { position:absolute; bottom:8px; right:8px; background:var(--accent); border-radius:50%; width:22px; height:22px; display:flex; align-items:center; justify-content:center; color:#fff; }
.sw-theme-preview-btn { position:absolute; top:6px; right:6px; width:26px; height:26px; border-radius:50%; border:none; background:rgba(0,0,0,0.25); color:#fff; display:flex; align-items:center; justify-content:center; }

.sw-settings-grid { display:flex; flex-direction:column; gap:10px; }
.sw-setting-row { display:flex; align-items:center; gap:12px; background:var(--glass); border:1px solid var(--glass-border); border-radius:16px; padding:12px 14px; }
.sw-setting-icon { width:38px; height:38px; border-radius:11px; background:rgba(255,255,255,0.08); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.sw-setting-main { flex:1; display:flex; flex-direction:column; gap:8px; }
.sw-setting-row.full { flex-direction:column; align-items:stretch; }
.sw-setting-control { display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
.sw-stepper { display:flex; align-items:center; justify-content:center; gap:16px; width:100%; }
.sw-stepper b { min-width:24px; text-align:center; font-size:1.15rem; }
.sw-stepper button { width:36px; height:36px; border-radius:10px; border:none; background:rgba(255,255,255,0.12); color:var(--ink); cursor:pointer; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.sw-range-value { font-weight:700; }
input[type="range"] { width:100%; accent-color:var(--accent-violet); }

.sw-stacked-options { display:flex; flex-direction:column; gap:8px; width:100%; }
.sw-stacked-options button { width:100%; text-align:center; background:rgba(255,255,255,0.06); border:1px solid transparent; border-radius:12px; padding:12px 14px; font-size:0.9rem; font-weight:600; color:var(--ink-dim); cursor:pointer; line-height:1.3; }
.sw-stacked-options button.active { background:var(--accent-teal); color:#022; }

.sw-lang-options { display:flex; gap:6px; width:100%; flex-wrap:wrap; }
.sw-lang-options button { flex:1; min-width:96px; background:rgba(255,255,255,0.06); border:1px solid transparent; border-radius:12px; padding:11px 8px; font-weight:600; font-size:0.86rem; color:var(--ink-dim); cursor:pointer; }
.sw-lang-options button.active { background:var(--accent-teal); color:#022; }

.sw-eyebrow { color:var(--accent-teal); font-weight:700; letter-spacing:0.04em; }
.sw-eyebrow.spy { color:var(--accent-gold); }
.sw-eyebrow.players { color:var(--accent-green); }
.sw-stack-avatars { display:flex; flex-wrap:wrap; justify-content:center; }
.sw-stack-avatars span { width:44px; height:44px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:1.3rem; margin-left:-12px; border:2px solid var(--bg3); }
.sw-summary { display:flex; gap:20px; }
.sw-summary div { display:flex; flex-direction:column; align-items:center; }
.sw-summary b { font-size:1.5rem; }
.sw-summary small { color:var(--ink-dim); font-size:0.75rem; }

.sw-progress { width:100%; font-size:0.8rem; color:var(--ink-dim); }
.sw-progress-track { height:5px; background:rgba(255,255,255,0.1); border-radius:99px; margin-top:6px; overflow:hidden; }
.sw-progress-fill { height:100%; background:linear-gradient(90deg,var(--accent-teal),var(--accent-violet)); }
.sw-pass-label { color:var(--ink-dim); font-size:0.9rem; }
.sw-reveal-player { display:flex; align-items:center; gap:10px; font-size:1.4rem; }
.sw-reveal-player span { font-size:2rem; }

/* ===== КАРТА: без transition, без 3D, мгновенное переключение ===== */
.sw-secret-card {
  width:100%; max-width:340px; aspect-ratio:3/4;
  cursor:pointer; position:relative;
  user-select:none; -webkit-user-select:none;
  -webkit-touch-callout:none;
  touch-action:none;
}
.sw-card-front, .sw-card-back {
  position:absolute; inset:0; border-radius:22px;
  display:flex; flex-direction:column; align-items:center; justify-content:center;
  gap:10px; padding:20px; text-align:center;
  border:1px solid var(--glass-border);
  pointer-events:none;
}
.sw-card-front {
  background:linear-gradient(160deg,#4a3b86,#1f5a63);
  font-size:2.4rem;
}
.sw-card-front b { font-size:1rem; }
.sw-card-back {
  background:linear-gradient(160deg,#1e143c,#2d1e50);
  display:none;
}
.sw-secret-card.spy .sw-card-back { background:linear-gradient(160deg,#500f32,#3c145a); }
.sw-secret-card.open .sw-card-front { display:none; }
.sw-secret-card.open .sw-card-back { display:flex; }
.sw-spy-big { font-size:2.6rem; }
.sw-theme-tag { background:var(--accent); color:#fff; padding:6px 14px; border-radius:999px; font-weight:700; font-size:0.85rem; margin:0; }
.sw-card-back h2 { font-size:clamp(1.6rem,7vw,2.2rem); color:#fff; }
.sw-card-back p { color:#e6e1ff; margin:0; }
.sw-hints-label { font-size:0.8rem; color:var(--ink-dim); margin-top:6px; }
.sw-hints-row { display:flex; gap:6px; flex-wrap:wrap; justify-content:center; }
.sw-hints-row span { background:rgba(255,255,255,0.12); padding:4px 10px; border-radius:999px; font-size:0.8rem; color:#fff; }

/* Таймер: без transition — обновление раз в секунду без плавности = без лагов */
.sw-timer-ring { position:relative; width:min(70vw,240px); aspect-ratio:1; }
.sw-timer-ring svg { width:100%; height:100%; transform:rotate(-90deg); }
.sw-track { fill:none; stroke:rgba(255,255,255,0.1); stroke-width:12; }
.sw-progress-ring { fill:none; stroke:var(--accent-green); stroke-width:12; stroke-linecap:round; }
.sw-progress-ring.urgent { stroke:var(--accent-red); }
.sw-timer-digits { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; font-size:clamp(1.8rem,8vw,2.6rem); font-weight:800; font-family:'Manrope',sans-serif; font-variant-numeric:tabular-nums; }
.sw-timer-digits.urgent { color:var(--accent-red); }
.sw-timer-actions { display:flex; gap:8px; flex-wrap:wrap; justify-content:center; }
.sw-exiled-row { display:flex; gap:8px; flex-wrap:wrap; justify-content:center; }
.sw-exiled-chip { background:rgba(255,255,255,0.08); color:var(--ink-dim); padding:6px 10px; border-radius:999px; font-size:0.78rem; text-decoration:line-through; }

.sw-exile-banner { position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); background:rgba(20,15,40,0.97); border:1px solid var(--accent-red); color:#fff; padding:16px 22px; border-radius:16px; font-weight:700; z-index:200; text-align:center; max-width:80vw; }

.sw-vote-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:10px; }
.sw-vote-card { position:relative; display:flex; flex-direction:column; align-items:center; gap:6px; background:var(--glass); border:1px solid var(--glass-border); border-radius:14px; padding:12px 8px; cursor:pointer; color:var(--ink); }
.sw-vote-card span { width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:1.2rem; }
.sw-vote-card.chosen { border-color:var(--accent-violet); box-shadow:0 0 0 2px var(--accent-violet) inset; }
.sw-vote-check { position:absolute; top:6px; right:6px; color:var(--accent-violet); }
.sw-exiled-list { display:flex; gap:6px; flex-wrap:wrap; margin:10px 0; }
.sw-exiled-muted { opacity:0.4; font-size:0.8rem; text-decoration:line-through; }

.sw-guess-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:8px; max-height:44vh; overflow-y:auto; margin:10px 0; }
.sw-guess-word { background:var(--glass); border:1px solid var(--accent); border-radius:12px; padding:10px 6px; font-weight:600; font-size:0.9rem; cursor:pointer; color:var(--ink); }

.sw-results { padding-top:24px; }
.sw-trophy-spy { color:var(--accent-gold); }
.sw-trophy-players { color:var(--accent-green); }
.sw-guess-compare { display:flex; gap:10px; flex-wrap:wrap; justify-content:center; }
.sw-guess-pill { padding:8px 14px; border-radius:999px; font-weight:700; }
.sw-guess-pill.wrong { background:rgba(248,113,113,0.18); color:#fca5a5; text-decoration:line-through; }
.sw-guess-pill.correct { background:rgba(52,211,153,0.18); color:#6ee7b7; }
.sw-guess-pill.hide { display:none; }
.sw-result-card { width:100%; display:flex; flex-direction:column; gap:8px; }
.sw-result-card > div { display:flex; align-items:center; gap:10px; background:var(--glass); border:1px solid var(--glass-border); border-radius:12px; padding:10px 12px; text-align:left; }
.sw-result-card > div small { margin-left:auto; color:var(--ink-dim); }
.sw-result-exiled { opacity:0.55; }

/* Конфетти: CSS, только на широких экранах; на телефоне скрыто */
.sw-confetti { position:fixed; inset:0; overflow:hidden; pointer-events:none; z-index:5; display:none; }
.sw-confetti-piece { position:absolute; top:-5%; border-radius:2px; animation-name:sw-fall; animation-timing-function:ease-in; animation-fill-mode:forwards; }
@keyframes sw-fall { to { top:105%; transform:rotate(var(--rot)); } }
@media (min-width:900px) and (prefers-reduced-motion:no-preference) {
  .sw-confetti { display:block; }
}

/* ============ TABLET / LANDSCAPE ============ */
@media (min-width:768px) {
  .sw-screen { padding:32px 40px 48px; max-width:min(90vw,760px); }
  .sw-player-list { display:grid; grid-template-columns:repeat(2,1fr); gap:10px; }
  .sw-theme-grid { grid-template-columns:repeat(4,1fr); }
  .sw-settings-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:12px; }
  .sw-setting-row.full { grid-column:1/-1; }
  .sw-emoji-grid { grid-template-columns:repeat(8,1fr); }
  .sw-guess-grid { grid-template-columns:repeat(4,1fr); }
  .sw-vote-grid { grid-template-columns:repeat(3,1fr); }
  .sw-backdrop { align-items:center; }
  .sw-modal { max-width:520px; border-radius:24px; max-height:80vh; }
  .sw-secret-card { max-width:400px; }
}
@media (min-width:1024px) {
  .sw-screen { max-width:820px; }
  .sw-theme-grid { grid-template-columns:repeat(5,1fr); }
  .sw-guess-grid { grid-template-columns:repeat(5,1fr); }
  .sw-vote-grid { grid-template-columns:repeat(4,1fr); }
}
@media (min-width:1440px) {
  .sw-screen { max-width:900px; }
  .sw-theme-grid { grid-template-columns:repeat(6,1fr); }
}
@media (prefers-reduced-motion:reduce) {
  * { animation-duration:0.01ms !important; transition-duration:0.01ms !important; }
}
    `}</style>
  );
}

/* Статичный город: без анимаций, отрисовывается один раз */
const CitySkyline = React.memo(function CitySkyline() {
  return (
    <div className="sw-skyline" aria-hidden="true">
      <svg viewBox="0 0 1000 300" preserveAspectRatio="xMidYMax meet" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bldGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1a1040"/>
            <stop offset="100%" stopColor="#0d0820"/>
          </linearGradient>
          <linearGradient id="bldGrad2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#211550"/>
            <stop offset="100%" stopColor="#120c2e"/>
          </linearGradient>
        </defs>
        <g fill="url(#bldGrad2)" opacity="0.55">
          <rect x="0" y="180" width="45" height="120"/>
          <rect x="43" y="200" width="30" height="100"/>
          <rect x="71" y="170" width="38" height="130"/>
          <rect x="870" y="185" width="40" height="115"/>
          <rect x="908" y="205" width="35" height="95"/>
          <rect x="941" y="175" width="59" height="125"/>
          <rect x="300" y="195" width="35" height="105"/>
          <rect x="650" y="190" width="40" height="110"/>
          <rect x="690" y="210" width="28" height="90"/>
        </g>
        <g fill="url(#bldGrad)">
          <rect x="0" y="200" width="48" height="100"/>
          <rect x="46" y="220" width="32" height="80"/>
          <rect x="76" y="185" width="42" height="115"/>
          <rect x="116" y="230" width="22" height="70"/>
          <rect x="136" y="110" width="68" height="190"/>
          <rect x="148" y="72" width="44" height="40"/>
          <rect x="158" y="48" width="24" height="26"/>
          <rect x="165" y="28" width="10" height="22"/>
          <polygon points="166,28 174,28 170,6"/>
          <rect x="206" y="175" width="36" height="125"/>
          <rect x="240" y="195" width="28" height="105"/>
          <rect x="266" y="148" width="50" height="152"/>
          <rect x="278" y="128" width="26" height="22"/>
          <rect x="314" y="210" width="24" height="90"/>
          <rect x="336" y="85" width="78" height="215"/>
          <rect x="348" y="58" width="54" height="30"/>
          <rect x="358" y="36" width="34" height="24"/>
          <rect x="368" y="14" width="14" height="24"/>
          <polygon points="369,14 383,14 376,-8"/>
          <rect x="412" y="190" width="30" height="110"/>
          <rect x="440" y="155" width="44" height="145"/>
          <rect x="482" y="175" width="60" height="125"/>
          <ellipse cx="512" cy="175" rx="30" ry="22"/>
          <rect x="508" y="128" width="8" height="50"/>
          <rect x="540" y="200" width="36" height="100"/>
          <rect x="574" y="162" width="52" height="138"/>
          <rect x="586" y="140" width="28" height="24"/>
          <rect x="624" y="92" width="74" height="208"/>
          <polygon points="624,92 661,48 698,92"/>
          <rect x="657" y="34" width="8" height="16"/>
          <rect x="696" y="188" width="38" height="112"/>
          <rect x="732" y="172" width="30" height="128"/>
          <rect x="760" y="198" width="26" height="102"/>
          <rect x="784" y="152" width="50" height="148"/>
          <rect x="796" y="130" width="26" height="24"/>
          <rect x="832" y="218" width="34" height="82"/>
          <rect x="864" y="195" width="40" height="105"/>
          <rect x="902" y="210" width="30" height="90"/>
          <rect x="930" y="180" width="44" height="120"/>
          <rect x="972" y="215" width="28" height="85"/>
        </g>
        <g opacity="0.6">
          <rect x="145" y="122" width="8" height="6" rx="1" fill="#f472b6"/>
          <rect x="159" y="122" width="8" height="6" rx="1" fill="#a78bfa"/>
          <rect x="173" y="122" width="8" height="6" rx="1" fill="#fbbf24"/>
          <rect x="187" y="122" width="8" height="6" rx="1" fill="#f472b6"/>
          <rect x="145" y="142" width="8" height="6" rx="1" fill="#a78bfa"/>
          <rect x="159" y="142" width="8" height="6" rx="1" fill="#fbbf24"/>
          <rect x="173" y="142" width="8" height="6" rx="1" fill="#f472b6"/>
          <rect x="187" y="142" width="8" height="6" rx="1" fill="#a78bfa"/>
          <rect x="145" y="162" width="8" height="6" rx="1" fill="#fbbf24"/>
          <rect x="173" y="162" width="8" height="6" rx="1" fill="#a78bfa"/>
          <rect x="344" y="98" width="9" height="7" rx="1" fill="#a78bfa"/>
          <rect x="358" y="98" width="9" height="7" rx="1" fill="#fbbf24"/>
          <rect x="372" y="98" width="9" height="7" rx="1" fill="#f472b6"/>
          <rect x="386" y="98" width="9" height="7" rx="1" fill="#a78bfa"/>
          <rect x="344" y="120" width="9" height="7" rx="1" fill="#fbbf24"/>
          <rect x="372" y="120" width="9" height="7" rx="1" fill="#a78bfa"/>
          <rect x="358" y="142" width="9" height="7" rx="1" fill="#f472b6"/>
          <rect x="386" y="164" width="9" height="7" rx="1" fill="#a78bfa"/>
          <rect x="632" y="105" width="9" height="7" rx="1" fill="#f472b6"/>
          <rect x="646" y="105" width="9" height="7" rx="1" fill="#a78bfa"/>
          <rect x="674" y="105" width="9" height="7" rx="1" fill="#f472b6"/>
          <rect x="632" y="127" width="9" height="7" rx="1" fill="#fbbf24"/>
          <rect x="660" y="149" width="9" height="7" rx="1" fill="#f472b6"/>
          <rect x="688" y="149" width="9" height="7" rx="1" fill="#fbbf24"/>
          <rect x="270" y="160" width="7" height="5" rx="1" fill="#a78bfa"/>
          <rect x="282" y="178" width="7" height="5" rx="1" fill="#a78bfa"/>
          <rect x="448" y="168" width="7" height="5" rx="1" fill="#f472b6"/>
          <rect x="580" y="175" width="7" height="5" rx="1" fill="#f472b6"/>
          <rect x="802" y="165" width="7" height="5" rx="1" fill="#f472b6"/>
          <rect x="814" y="181" width="7" height="5" rx="1" fill="#a78bfa"/>
        </g>
        <rect x="0" y="295" width="1000" height="5" fill="#0d0820"/>
      </svg>
    </div>
  );
});

/* ============================== ROOT APP ============================== */
function Shell() {
  const { state } = useGame();
  const screens = {
    splash: <Splash key="splash" />,
    home: <Home key="home" />,
    players: <PlayersScreen key="players" />,
    themes: <ThemesScreen key="themes" />,
    settings: <SettingsScreen key="settings" />,
    pregame: <PreGame key="pregame" />,
    reveal: state.round && <Reveal key="reveal" />,
    timer: state.round && <TimerScreen key="timer" />,
    results: state.round && <Results key="results" />,
  };
  return (
    <div className="sw-app" data-spy-theme={state.settings.dark ? "dark" : "light"}>
      <StyleSheet />
      <div className="sw-ambient"><CitySkyline /></div>
      {screens[state.screen] || <Home key="home" />}
    </div>
  );
}

export default function SpyWordGame() {
  return (
    <GameProvider>
      <Shell />
    </GameProvider>
  );
}
