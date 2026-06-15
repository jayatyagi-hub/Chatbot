import { useState, useEffect, useRef, useCallback } from "react";
import "./App.css"; // same stylesheet — no changes needed

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "";

// ─── Mira Avatar ─────────────────────────────────────────────────────────────
function MiraAvatar({ size = 36, pulse = false }) {
  return (
    <div className="mira-avatar" style={{ width: size, height: size, minWidth: size }}>
      <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="18" cy="18" r="18" fill="url(#miraGrad)" />
        <path d="M11 13h2l5 8 5-8h2v10h-2v-6.5l-4 6.5h-2l-4-6.5V23h-2V13z" fill="#0C1628" />
        <defs>
          <linearGradient id="miraGrad" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
            <stop stopColor="#00CEC4" />
            <stop offset="1" stopColor="#0099A8" />
          </linearGradient>
        </defs>
      </svg>
      {pulse && <div className="mira-pulse" />}
    </div>
  );
}

// ─── Typing Indicator ─────────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="message assistant">
      <MiraAvatar size={28} />
      <div className="message-bubble typing-bubble">
        <span className="dot" /><span className="dot" /><span className="dot" />
      </div>
    </div>
  );
}

// ─── Format message content (bold + newlines) ─────────────────────────────────
function MessageContent({ content }) {
  return (
    <span>
      {content.split("\n").map((line, li) => (
        <span key={li}>
          {li > 0 && <br />}
          {line.split(/\*\*(.*?)\*\*/g).map((part, i) =>
            i % 2 === 1 ? <strong key={i}>{part}</strong> : part
          )}
        </span>
      ))}
    </span>
  );
}

// ─── Property Card ─────────────────────────────────────────────────────────────
const USD = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

function PropertyCard({ property, index, selected, onToggleCompare, disabled, saved, onToggleSave }) {
  const [imgErr, setImgErr] = useState(false);

  return (
    <div className={`property-card ${selected ? "selected" : ""}`} style={{ "--delay": `${index * 0.07}s` }}>
      <div className="property-img-wrap">
        <img
          src={imgErr ? "https://via.placeholder.com/400x220/162035/00CEC4?text=No+Image" : property.image_url}
          alt={property.title}
          onError={() => setImgErr(true)}
          loading="lazy"
        />
        <div className="property-price-badge">{USD.format(property.price)}</div>
        <div className="property-type-badge">For Sale</div>
        <label
          className={`compare-toggle ${selected ? "active" : ""} ${disabled && !selected ? "disabled" : ""}`}
          title={disabled && !selected ? "Compare limit reached (4)" : "Add to compare"}
        >
          <input
            type="checkbox"
            checked={selected}
            disabled={disabled && !selected}
            onChange={() => onToggleCompare(property.id)}
          />
          <span>{selected ? "✓ Added" : "+ Compare"}</span>
        </label>
        <button
          className={`save-btn ${saved ? "saved" : ""}`}
          onClick={(e) => { e.stopPropagation(); onToggleSave(property.id); }}
          title={saved ? "Remove from saved" : "Save property"}
          aria-label={saved ? "Remove from saved" : "Save property"}
        >
          <svg viewBox="0 0 24 24" width="18" height="18">
            {saved ? (
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="currentColor"/>
            ) : (
              <path d="M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z" fill="currentColor"/>
            )}
          </svg>
        </button>
      </div>

      <div className="property-body">
        <h3 className="property-title">{property.title}</h3>

        <p className="property-location">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor"/>
          </svg>
          {property.location}
        </p>

        <div className="property-stats">
          <div className="stat">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M7 13c1.66 0 3-1.34 3-3S8.66 7 7 7s-3 1.34-3 3 1.34 3 3 3zm12-6h-8v7H3V5H1v15h2v-3h18v3h2v-9c0-2.21-1.79-4-4-4z" fill="currentColor"/>
            </svg>
            <span>{property.bedrooms} Bed</span>
          </div>
          <div className="stat">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M9 3.5C9 2.12 10.12 1 11.5 1S14 2.12 14 3.5v1.6l1.5 1.5V3.5C15.5 1.57 13.93 0 12 0S8.5 1.57 8.5 3.5v2.6l1 1.9V3.5zM22 12H2v2h1v7h2v-3h14v3h2v-7h1v-2zM4 18v-4h16v4H4z" fill="currentColor"/>
            </svg>
            <span>{property.bathrooms} Bath</span>
          </div>
          <div className="stat">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M21 3H3v18h18V3zm-2 16H5V5h14v14z" fill="currentColor"/>
            </svg>
            <span>{property.size_sqft?.toLocaleString()} sqft</span>
          </div>
        </div>

        <div className="property-amenities">
          {(property.amenities || []).slice(0, 3).map((a) => (
            <span key={a} className="amenity-pill">{a}</span>
          ))}
        </div>

        <button className="view-btn">
          View Details
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M8 5v14l11-7z" fill="currentColor"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

// ─── Compare Modal ────────────────────────────────────────────────────────────
const HIGHLIGHT_LABELS = {
  cheapest:      "Lowest Price",
  mostExpensive: "Highest Price",
  largest:       "Largest Area",
  mostBedrooms:  "Most Bedrooms",
  mostBathrooms: "Most Bathrooms",
  mostAmenities: "Most Amenities",
  bestValue:     "Best $/sqft",
};

function ComparisonModal({ data, onClose }) {
  if (!data) return null;

  const { properties, highlights } = data;

  const isWinner = (id, key) => highlights[key] === id;

  const rows = [
    { key: "price",        label: "Price",          render: p => USD.format(p.price),                                   winnerKey: "cheapest"      },
    { key: "location",     label: "Location",       render: p => p.location,                                             winnerKey: null            },
    { key: "bedrooms",     label: "Bedrooms",       render: p => p.bedrooms,                                             winnerKey: "mostBedrooms"  },
    { key: "bathrooms",    label: "Bathrooms",      render: p => p.bathrooms,                                            winnerKey: "mostBathrooms" },
    { key: "size_sqft",    label: "Size (sqft)",    render: p => p.size_sqft?.toLocaleString(),                          winnerKey: "largest"       },
    { key: "ppsf",         label: "$ / sqft",       render: p => p.size_sqft ? USD.format(Math.round(p.price / p.size_sqft)) : "—", winnerKey: "bestValue" },
    { key: "amenities",    label: "Amenities",      render: p => (p.amenities || []).join(", ") || "—",                  winnerKey: "mostAmenities" },
  ];

  return (
    <div className="compare-modal-overlay" onClick={onClose}>
      <div className="compare-modal" onClick={(e) => e.stopPropagation()}>
        <div className="compare-modal-header">
          <div>
            <h2>Property Comparison</h2>
            <p>{properties.length} properties side-by-side</p>
          </div>
          <button className="compare-close-btn" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="compare-table-wrap">
          <table className="compare-table">
            <thead>
              <tr>
                <th className="row-label" />
                {properties.map(p => (
                  <th key={p.id} className="compare-col-head">
                    <div className="compare-thumb-wrap">
                      <img
                        src={p.image_url || "https://via.placeholder.com/300x180/162035/00CEC4?text=No+Image"}
                        alt={p.title}
                        onError={(e) => { e.target.src = "https://via.placeholder.com/300x180/162035/00CEC4?text=No+Image"; }}
                      />
                    </div>
                    <div className="compare-title">{p.title}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <tr key={row.key}>
                  <td className="row-label">{row.label}</td>
                  {properties.map(p => {
                    const winner = row.winnerKey && isWinner(p.id, row.winnerKey);
                    return (
                      <td key={p.id} className={winner ? "winner-cell" : ""}>
                        <span>{row.render(p)}</span>
                        {winner && <span className="winner-badge">{HIGHLIGHT_LABELS[row.winnerKey]}</span>}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Quick Suggestion Chips ───────────────────────────────────────────────────
// Each chip carries explicit search params so it works without the LLM round-trip.
const CHIPS = [
  { label: "Homes in New York", icon: "🏙️", filters: { location: "New York" }                  },
  { label: "Under $500,000",    icon: "💰", filters: { budget: 500000 }                          },
  { label: "3+ bedrooms",       icon: "🛏️", filters: { bedrooms: 3 }                            },
  { label: "Luxury in LA",      icon: "✨", filters: { location: "Los Angeles", budget: 2000000 } },
];

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi! I'm **Mira**, your AI real estate companion 🏠\n\nJust tell me what you're looking for — a city, your budget, how many bedrooms — and I'll find the perfect match for you.",
      id: "init",
    },
  ]);
  const [input, setInput] = useState("");
  const [properties, setProperties] = useState([]);
  const [allProperties, setAllProperties] = useState([]);
  const [thinking, setThinking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resultLabel, setResultLabel] = useState("All Listings");
  const [compareIds, setCompareIds] = useState([]);
  const [compareData, setCompareData] = useState(null);
  const [comparing, setComparing] = useState(false);
  const [compareError, setCompareError] = useState("");
  const [savedIds, setSavedIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem("savedProperties")) || []; }
    catch { return []; }
  });
  const [showSaved, setShowSaved] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const MAX_COMPARE = 4;

  const toggleSave = useCallback((id) => {
    setSavedIds((prev) => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      localStorage.setItem("savedProperties", JSON.stringify(next));
      return next;
    });
  }, []);

  const toggleCompare = useCallback((id) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= MAX_COMPARE) return prev;
      return [...prev, id];
    });
  }, []);

  const clearCompare = useCallback(() => {
    setCompareIds([]);
    setCompareError("");
  }, []);

  const runCompare = useCallback(async () => {
    if (compareIds.length < 2) {
      setCompareError("Select at least 2 properties to compare.");
      return;
    }
    setComparing(true);
    setCompareError("");
    try {
      const res = await fetch(`${BACKEND_URL}/api/compare`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: compareIds }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Compare API error: ${res.status}`);
      }
      const data = await res.json();
      setCompareData(data);
    } catch (err) {
      setCompareError(err.message || "Comparison failed.");
    } finally {
      setComparing(false);
    }
  }, [compareIds]);

  // Load all on mount
  useEffect(() => {
    fetch(`${BACKEND_URL}/api/properties`)
      .then((r) => r.json())
      .then((data) => {
        setAllProperties(data);
        setProperties(data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  const addMessage = useCallback((msg) => {
    setMessages((prev) => [...prev, { ...msg, id: Date.now() + Math.random() }]);
  }, []);

  const sendMessage = useCallback(async (text) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;

    addMessage({ role: "user", content });
    setInput("");
    setLoading(true);
    setThinking(true);

    try {
      // ── Call backend NLP engine (/chat) ─────────────────────────────────────
      const aiRes = await fetch(`${BACKEND_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content }),
      });

      if (!aiRes.ok) throw new Error(`Chat API error: ${aiRes.status}`);

      const parsed = await aiRes.json();
      const { location, budget, bedrooms, isSearch, reply } = parsed;

      setThinking(false);

      if (isSearch) {
        // ── Call backend search ───────────────────────────────────────────────
        const searchRes = await fetch(`${BACKEND_URL}/api/search`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ location, budget, bedrooms }),
        });
        const results = await searchRes.json();
        setProperties(results);

        const parts = [];
        if (location) parts.push(location);
        if (bedrooms) parts.push(`${bedrooms}+ bed`);
        if (budget) parts.push(`under ${USD.format(budget)}`);
        setResultLabel(parts.length ? parts.join(" · ") : "Search Results");

        const count = results.length;
        const countLine =
          count > 0
            ? `\n\nI found **${count} ${count === 1 ? "property" : "properties"}** matching your criteria.`
            : "\n\nNo properties matched those filters — try widening your search!";

        addMessage({ role: "assistant", content: reply + countLine });
      } else {
        setProperties(allProperties);
        setResultLabel("All Listings");
        addMessage({ role: "assistant", content: reply });
      }
    } catch (err) {
      setThinking(false);
      addMessage({
        role: "assistant",
        content:
          "Hmm, something went sideways on my end 🔧 Try asking something like *'2 bedroom homes in Austin under $400,000'*.",
      });
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }, [input, loading, allProperties, addMessage]);

  const runChipSearch = useCallback(async (chip) => {
    if (loading) return;
    const { location, budget, bedrooms } = chip.filters;

    addMessage({ role: "user", content: chip.label });
    setLoading(true);

    try {
      const res = await fetch(`${BACKEND_URL}/api/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location, budget, bedrooms }),
      });
      const results = await res.json();
      setProperties(results);

      const parts = [];
      if (location)  parts.push(location);
      if (bedrooms)  parts.push(`${bedrooms}+ bed`);
      if (budget)    parts.push(`under ${USD.format(budget)}`);
      setResultLabel(parts.length ? parts.join(" · ") : "Search Results");

      const count = results.length;
      const reply =
        count > 0
          ? `Here are **${count} ${count === 1 ? "property" : "properties"}** matching *${chip.label}*.`
          : `No properties matched *${chip.label}* — try widening your search!`;
      addMessage({ role: "assistant", content: reply });
    } catch (err) {
      addMessage({
        role: "assistant",
        content: "Hmm, the search didn't go through 🔧 Please try again in a moment.",
      });
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }, [loading, addMessage]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="app">
      {/* ── Header ── */}
      <header className="site-header">
        <div className="header-left">
          <MiraAvatar size={42} pulse />
          <div className="header-brand">
            <span className="brand-name">AgentMira<span className="brand-ai"> AI</span></span>
            <span className="brand-sub">Intelligent Real Estate Companion</span>
          </div>
        </div>
        <div className="header-right">
          <div className="header-stat">
            <span className="stat-num">{allProperties.length}</span>
            <span className="stat-lbl">Listings</span>
          </div>
          <div className="header-stat">
            <span className="stat-num">AI</span>
            <span className="stat-lbl">Powered</span>
          </div>
          <button
            className={`saved-header-btn ${showSaved ? "active" : ""}`}
            onClick={() => setShowSaved(s => !s)}
            title="View saved properties"
          >
            <svg viewBox="0 0 24 24" width="16" height="16">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="currentColor"/>
            </svg>
            {savedIds.length > 0 && <span className="saved-count-badge">{savedIds.length}</span>}
          </button>
          <div className="online-badge">
            <span className="online-dot" />
            Mira is online
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <div className="layout">
        {/* ── Chat Panel ── */}
        <aside className="chat-panel">
          <div className="chat-header">
            <MiraAvatar size={32} />
            <div>
              <p className="chat-header-name">Mira</p>
              <p className="chat-header-status">
                <span className="online-dot small" /> Always available
              </p>
            </div>
          </div>

          <div className="messages-scroll">
            {messages.map((msg) => (
              <div key={msg.id} className={`message ${msg.role}`}>
                {msg.role === "assistant" && <MiraAvatar size={28} />}
                <div className="message-bubble">
                  <MessageContent content={msg.content} />
                </div>
                {msg.role === "user" && (
                  <div className="user-avatar">
                    <svg viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="8" r="4" fill="currentColor" />
                      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                )}
              </div>
            ))}

            {thinking && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>

          {/* Quick chips */}
          <div className="chips-row">
            {CHIPS.map((c) => (
              <button
                key={c.label}
                className="chip"
                onClick={() => runChipSearch(c)}
                disabled={loading}
              >
                <span>{c.icon}</span> {c.label}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="chat-input-wrap">
            <div className="chat-input-box">
              <textarea
                ref={inputRef}
                className="chat-textarea"
                rows={1}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
                }}
                onKeyDown={handleKeyDown}
                placeholder="Ask Mira about properties…"
                disabled={loading}
              />
              <button
                className={`send-btn ${loading ? "sending" : ""}`}
                onClick={() => sendMessage()}
                disabled={loading}
                aria-label="Send message"
              >
                {loading ? (
                  <span className="spinner" />
                ) : (
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" fill="currentColor" />
                  </svg>
                )}
              </button>
            </div>
            <p className="input-hint">Press Enter to send · Shift+Enter for new line</p>
          </div>
        </aside>

        {/* ── Results Panel ── */}
        <main className="results-panel">
          <div className="results-toolbar">
            <div>
              <h2 className="results-title">{showSaved ? "Saved Properties" : resultLabel}</h2>
              <p className="results-count">
                {showSaved
                  ? `${savedIds.length} saved`
                  : `${properties.length} properties`}
              </p>
            </div>
            <div className="toolbar-actions">
              <button
                className={`saved-filter-btn ${showSaved ? "active" : ""}`}
                onClick={() => setShowSaved(s => !s)}
              >
                <svg viewBox="0 0 24 24" width="14" height="14">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="currentColor"/>
                </svg>
                {showSaved ? "Show All" : `Saved (${savedIds.length})`}
              </button>
              {!showSaved && (
                <button
                  className="reset-btn"
                  onClick={() => {
                    setProperties(allProperties);
                    setResultLabel("All Listings");
                  }}
                >
                  Show All
                </button>
              )}
            </div>
          </div>

          {(() => {
            const displayList = showSaved
              ? allProperties.filter(p => savedIds.includes(p.id))
              : properties;

            return displayList.length > 0 ? (
              <div className="property-grid">
                {displayList.map((p, i) => (
                  <PropertyCard
                    key={p.id}
                    property={p}
                    index={i}
                    selected={compareIds.includes(p.id)}
                    onToggleCompare={toggleCompare}
                    disabled={compareIds.length >= MAX_COMPARE}
                    saved={savedIds.includes(p.id)}
                    onToggleSave={toggleSave}
                  />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">{showSaved ? "💾" : "🏚️"}</div>
                <h3>{showSaved ? "No saved properties yet" : "No properties found"}</h3>
                <p>
                  {showSaved
                    ? "Click the heart icon on any property card to save it here."
                    : "Try asking Mira with different filters — a broader location, higher budget, or fewer bedrooms."}
                </p>
              </div>
            );
          })()}
        </main>
      </div>

      {/* ── Floating Compare Bar ── */}
      {compareIds.length > 0 && (
        <div className="compare-bar">
          <div className="compare-bar-info">
            <span className="compare-count">{compareIds.length}</span>
            <span className="compare-bar-text">
              {compareIds.length === 1 ? "property selected" : "properties selected"}
              <span className="compare-bar-hint"> · select up to {MAX_COMPARE}</span>
            </span>
          </div>
          {compareError && <span className="compare-bar-error">{compareError}</span>}
          <div className="compare-bar-actions">
            <button className="compare-bar-clear" onClick={clearCompare} disabled={comparing}>
              Clear
            </button>
            <button
              className="compare-bar-go"
              onClick={runCompare}
              disabled={comparing || compareIds.length < 2}
            >
              {comparing ? "Comparing…" : `Compare ${compareIds.length}`}
            </button>
          </div>
        </div>
      )}

      <ComparisonModal data={compareData} onClose={() => setCompareData(null)} />
    </div>
  );
}