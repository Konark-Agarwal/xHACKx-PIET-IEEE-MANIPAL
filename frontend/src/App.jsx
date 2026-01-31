import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { supabase } from "./supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import { Routes, Route, Link, NavLink, useNavigate } from "react-router-dom";
import "./App.css";

const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:5000";

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function postWithRetry(url, data, { timeoutMs = 5000, retries = 2 } = {}) {
  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await axios.post(url, data, { timeout: timeoutMs });
      return res.data;
    } catch (err) {
      lastErr = err;
      console.error("POST failed", { attempt, message: err?.message, code: err?.code });
      if (attempt < retries) await sleep(400 * (attempt + 1));
    }
  }
  throw lastErr;
}

// Guest mode only (used in feed). Dashboard will require real login.
async function ensureAnonSession() {
  const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
  if (sessionErr) throw sessionErr;
  if (sessionData?.session) return sessionData.session;

  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) throw error;
  return data.session;
}

function Shell({ children, session, onLogout }) {
  return (
    <div className="shell">
      <motion.header
        className="topbar"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22 }}
      >
        <div className="brand">
          <div className="logoDot" />
          <span className="brandName">YakSafe</span>
          <span className="badge">AI safety gate: ON</span>
        </div>

        <nav className="nav">
          <NavLink to="/" className={({ isActive }) => `navLink ${isActive ? "active" : ""}`}>
            Home
          </NavLink>
          <NavLink to="/app" className={({ isActive }) => `navLink ${isActive ? "active" : ""}`}>
            App
          </NavLink>
          <NavLink to="/dashboard" className={({ isActive }) => `navLink ${isActive ? "active" : ""}`}>
            Dashboard
          </NavLink>
          <NavLink to="/privacy" className={({ isActive }) => `navLink ${isActive ? "active" : ""}`}>
            Privacy
          </NavLink>

          <NavLink to="/auth" className={({ isActive }) => `navLink ${isActive ? "active" : ""}`}>
            {session ? "Account" : "Login"}
          </NavLink>

          <a className="navLink" href={`${API_BASE}/health`} target="_blank" rel="noreferrer">
            API
          </a>

          {session ? (
            <button
              className="navLink"
              type="button"
              onClick={onLogout}
              style={{ background: "transparent", border: "none" }}
            >
              Logout
            </button>
          ) : null}
        </nav>
      </motion.header>

      <main className="shellMain">{children}</main>
    </div>
  );
}

function Home() {
  const navigate = useNavigate();

  const container = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { staggerChildren: 0.08, duration: 0.25 } },
  };
  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.22 } },
  };

  return (
    <motion.div className="home" variants={container} initial="hidden" animate="show">
      <div className="homeHero">
        <div className="homeHeroGrid">
          <div className="homeLeft">
            <motion.div variants={item} className="kicker">
              <span className="dot" /> Hyper‑local • Anonymous • Safer by default
            </motion.div>

            <motion.h1 variants={item} className="homeTitle">
              Reviving Yik Yak, safely.
            </motion.h1>

            <motion.p variants={item} className="homeSub">
              YakSafe is a hyper‑local feed with AI moderation, rewards and realtime updates.
            </motion.p>

            <motion.div variants={item} className="homeCtas">
              <button className="btn btnPrimary" onClick={() => navigate("/app")} type="button">
                Open Live Demo
              </button>
              <button className="pill pillLink" onClick={() => navigate("/dashboard")} type="button">
                Dashboard →
              </button>
              <button className="pill pillLink" onClick={() => navigate("/auth")} type="button">
                Login / Register →
              </button>
              <a className="pill pillLink" href={`${API_BASE}/health`} target="_blank" rel="noreferrer">
                Backend health →
              </a>
            </motion.div>

            <motion.div variants={item} className="homeGrid">
              {[
                { t: "AI moderation", d: "Blocks toxic content before it hits the feed." },
                { t: "Hyper‑local zones", d: "Campus / Bagru / Jaipur feeds." },
                { t: "YakPoints", d: "Earn points for safe posts." },
                { t: "Realtime", d: "New posts appear instantly." },
              ].map((f) => (
                <motion.div
                  key={f.t}
                  className="featureCard interactive"
                  whileHover={{ y: -2, scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  transition={{ type: "spring", stiffness: 260, damping: 18 }}
                >
                  <div className="featureTitle">{f.t}</div>
                  <div className="featureText">{f.d}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          <motion.div variants={item} className="homeRight">
            <motion.div className="demoPanel glass" whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 260, damping: 18 }}>
              <div className="demoTitle">Demo in 30 seconds</div>
              <ol className="demoSteps">
                <li>Open App and pick a zone.</li>
                <li>Seed demo or post a safe message.</li>
                <li>Login to view Dashboard.</li>
              </ol>
              <div className="demoNote">Tip: open two tabs to show realtime insert.</div>
            </motion.div>

            <motion.div variants={item} className="statRow">
              <div className="statCard">
                <div className="statLabel">Safety gate</div>
                <div className="statValue">ON</div>
              </div>
              <div className="statCard">
                <div className="statLabel">Realtime</div>
                <div className="statValue">Live</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <div className="homeFooter">
        <span className="mutedSmall">Hackathon MVP • Supabase + Flask + React</span>
        <span className="mutedSmall">
          <Link to="/app" className="inlineLink">
            Go to the feed →
          </Link>{" "}
          <Link to="/privacy" className="inlineLink">
            Privacy
          </Link>
        </span>
      </div>
    </motion.div>
  );
}

function Privacy() {
  return (
    <div className="card">
      <h1>Privacy</h1>
      <p className="muted">YakSafe is a hackathon MVP. We minimize data collection and don’t require real names.</p>
    </div>
  );
}

function AuthPage({ session }) {
  const navigate = useNavigate();

  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (session?.user?.email) setMsg(`Signed in as: ${session.user.email}`);
  }, [session]);

  async function doLogin() {
    setMsg("");
    setLoading(true);
    try {
      const cleanEmail = (email || "").trim();
      const cleanPass = password || "";
      const { error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password: cleanPass });
      if (error) throw error;
      navigate("/dashboard", { replace: true });
    } catch (e) {
      setMsg(e?.message || "Invalid login credentials");
    } finally {
      setLoading(false);
    }
  }

  async function doRegister() {
    setMsg("");
    setLoading(true);
    try {
      const cleanEmail = (email || "").trim();
      const cleanPass = password || "";

      const { data, error } = await supabase.auth.signUp({ email: cleanEmail, password: cleanPass });
      if (error) throw error;

      // If email confirmation is enabled, session may be null until confirmed.
      if (!data?.session) {
        setMsg("Registered! Check your email to confirm, then come back and login.");
        return;
      }

      const uid = data?.user?.id;
      if (uid) {
        const name = (displayName || "").trim().slice(0, 24) || "Student";
        await supabase.from("profiles").upsert({ id: uid, display_name: name }, { onConflict: "id" });
      }

      navigate("/dashboard", { replace: true });
    } catch (e) {
      setMsg(e?.message || "Register failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div className="card" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }}>
      <div className="titleRow">
        <h1>{session ? "Account" : mode === "login" ? "Login" : "Register"}</h1>
        <span className="badge">Supabase Auth</span>
      </div>

      {msg ? <div className="warn">{msg}</div> : null}

      {session ? (
        <div className="muted">
          You are signed in. Go to{" "}
          <Link className="inlineLink" to="/dashboard">
            Dashboard
          </Link>
          .
        </div>
      ) : (
        <>
          <div className="quickRow" style={{ marginBottom: 12 }}>
            <button className="pill pillLink" type="button" onClick={() => setMode("login")} disabled={loading}>
              Login
            </button>
            <button className="pill pillLink" type="button" onClick={() => setMode("register")} disabled={loading}>
              Register
            </button>
          </div>

          {mode === "register" ? (
            <div className="composer" style={{ marginBottom: 10 }}>
              <input
                className="input"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Display name (optional)"
                maxLength={24}
                disabled={loading}
              />
            </div>
          ) : null}

          <div className="composer" style={{ marginBottom: 10 }}>
            <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" disabled={loading} />
          </div>

          <div className="composer" style={{ marginBottom: 10 }}>
            <input
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              type="password"
              disabled={loading}
            />
          </div>

          <div className="quickRow">
            {mode === "login" ? (
              <button className="btn" type="button" onClick={doLogin} disabled={loading || !email || !password}>
                {loading ? "..." : "Login"}
              </button>
            ) : (
              <button className="btn" type="button" onClick={doRegister} disabled={loading || !email || !password}>
                {loading ? "..." : "Create account"}
              </button>
            )}
          </div>
        </>
      )}
    </motion.div>
  );
}

function Dashboard({ session }) {
  const navigate = useNavigate();

  const [booting, setBooting] = useState(true);
  const [errMsg, setErrMsg] = useState("");

  const [profile, setProfile] = useState(null);
  const [editingName, setEditingName] = useState("");

  const [myPostCount, setMyPostCount] = useState(0);
  const [myReportCount, setMyReportCount] = useState(0);
  const [walletPoints, setWalletPoints] = useState(0);

  async function loadDashboard() {
    setErrMsg("");
    setBooting(true);

    try {
      const uid = session?.user?.id || "";
      if (!uid) throw new Error("Please login first");

      await supabase.from("profiles").upsert({ id: uid, display_name: "Anonymous Yak" }, { onConflict: "id" });

      const { data: p, error: pErr } = await supabase.from("profiles").select("*").eq("id", uid).maybeSingle();
      if (pErr) throw pErr;

      setProfile(p || { id: uid, display_name: "Anonymous Yak", points_total: 0 });
      setEditingName((p?.display_name || "Anonymous Yak").slice(0, 24));

      const { count: postCount } = await supabase.from("posts").select("id", { count: "exact", head: true }).eq("user_id", uid);
      setMyPostCount(postCount || 0);

      const { count: rptCount } = await supabase.from("post_reports").select("id", { count: "exact", head: true }).eq("reporter_id", uid);
      setMyReportCount(rptCount || 0);

      try {
        const w = await axios.post(`${API_BASE}/wallet`, { device_id: uid }, { timeout: 8000 });
        if (w.data?.ok) setWalletPoints(w.data.wallet?.points || 0);
      } catch {
        setWalletPoints(0);
      }
    } catch (e) {
      setErrMsg(e?.message || "Dashboard failed to load");
    } finally {
      setBooting(false);
    }
  }

  async function saveName() {
    setErrMsg("");
    try {
      const uid = session?.user?.id || "";
      if (!uid) throw new Error("Please login first");

      const next = (editingName || "").trim().slice(0, 24) || "Anonymous Yak";
      const { error } = await supabase.from("profiles").update({ display_name: next }).eq("id", uid);
      if (error) throw error;

      setProfile((p) => ({ ...(p || {}), display_name: next }));
    } catch (e) {
      setErrMsg(e?.message || "Failed to save name");
    }
  }

  useEffect(() => {
    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id]);

  if (!session?.user?.id) {
    return (
      <motion.div className="card" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }}>
        <div className="titleRow">
          <h1>Dashboard</h1>
          <span className="badge">Login required</span>
        </div>

        <div className="muted" style={{ marginTop: 8 }}>
          You are logged out. Please login to view your dashboard.
        </div>

        <div className="quickRow" style={{ marginTop: 12 }}>
          <button className="btn" type="button" onClick={() => navigate("/auth", { replace: true })}>
            Go to Login
          </button>
          <Link className="pill pillLink" to="/app">
            Continue as guest →
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div className="dashWrap" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }}>
      <div className="dashHeader">
        <div>
          <h1 className="dashTitle">Dashboard</h1>
          <p className="dashSub">Profile + quick stats.</p>
        </div>
        <span className="chip chipOk">Signed in</span>
      </div>

      {booting ? <div className="muted">Loading dashboard…</div> : null}
      {errMsg ? <div className="warn">{errMsg}</div> : null}

      {!booting && !errMsg ? (
        <div className="dashGrid">
          <section className="panel">
            <div className="panelTop">
              <div className="avatar">Y</div>
              <div>
                <div className="panelTitle">{profile?.display_name || "Anonymous Yak"}</div>
                <div className="panelHint">{session?.user?.email}</div>
              </div>
            </div>

            <div className="formRow">
              <input
                className="input"
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                placeholder="Anonymous Yak"
                maxLength={24}
              />
              <button className="btn" type="button" onClick={saveName}>
                Save
              </button>
            </div>

            <div className="panelActions">
              <button className="pill pillLink" type="button" onClick={loadDashboard}>
                Refresh
              </button>
              <Link className="pill pillLink" to="/app">
                Go to feed →
              </Link>
              <a className="pill pillLink" href={`${API_BASE}/health`} target="_blank" rel="noreferrer">
                API Health →
              </a>
            </div>

            <div className="mutedSmall" style={{ marginTop: 8 }}>
              Tip: Keep display names short. Real identities are not required.
            </div>
          </section>

          <section className="kpiGrid">
            <div className="kpiCard">
              <div className="kpiLabel">Feed points</div>
              <div className="kpiValue">{profile?.points_total ?? 0}</div>
            </div>
            <div className="kpiCard">
              <div className="kpiLabel">Wallet coins</div>
              <div className="kpiValue">{walletPoints}</div>
            </div>
            <div className="kpiCard">
              <div className="kpiLabel">My posts</div>
              <div className="kpiValue">{myPostCount}</div>
            </div>
            <div className="kpiCard">
              <div className="kpiLabel">Reports filed</div>
              <div className="kpiValue">{myReportCount}</div>
            </div>
          </section>
        </div>
      ) : null}
    </motion.div>
  );
}

function YakSafeApp({ session }) {
  const [input, setInput] = useState("");
  const [posts, setPosts] = useState([]);
  const [myPoints, setMyPoints] = useState(0);

  const [loading, setLoading] = useState(false);
  const [booting, setBooting] = useState(true);

  const [zone, setZone] = useState("Campus");
  const [lastBlock, setLastBlock] = useState("");
  const [adminMode, setAdminMode] = useState(false);

  const channelRef = useRef(null);

  const adSlots = useMemo(
    () => [
      {
        id: "ad-1",
        brand: "Campus Cafe",
        title: "Free chai refills today (5–7 PM)",
        body: "Show this screen for 10% off. Keep it local, keep it kind.",
        cta: "Get directions",
        href: "https://www.google.com/maps",
        zone: "Campus",
      },
      {
        id: "ad-2",
        brand: "Bagru Prints",
        title: "Workshop: Block printing basics",
        body: "Limited seats. Learn, vibe, and meet locals.",
        cta: "Register",
        href: "https://example.com",
        zone: "Bagru",
      },
      {
        id: "ad-3",
        brand: "Jaipur Events",
        title: "Weekend open-mic near you",
        body: "A safe space for creators. Starts 6 PM.",
        cta: "See details",
        href: "https://example.com",
        zone: "Jaipur",
      },
    ],
    []
  );

  function buildFeedWithAds(postsList, currentZone) {
    const adForZone = adSlots.find((a) => a.zone === currentZone) || adSlots[0];
    const out = [];
    for (let i = 0; i < postsList.length; i++) {
      out.push({ type: "post", ...postsList[i] });
      if ((i + 1) % 5 === 0) out.push({ type: "ad", ...adForZone });
    }
    return out;
  }

  const feedItems = useMemo(() => buildFeedWithAds(posts, zone), [posts, zone, adSlots]);

  async function loadPosts() {
    setBooting(true);
    try {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("zone", zone)
        .eq("hidden", false)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) {
        setPosts([]);
        setMyPoints(0);
        alert(`Supabase load error: ${error.message}`);
        return;
      }

      setPosts(data || []);
      const total = (data || []).reduce((sum, p) => sum + (p?.points || 0), 0);
      setMyPoints(total);
    } finally {
      setBooting(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    const boot = async () => {
      setLastBlock("");
      setBooting(true);

      try {
        if (!session?.user?.id) await ensureAnonSession();

        await loadPosts();
        if (cancelled) return;

        if (channelRef.current) {
          supabase.removeChannel(channelRef.current);
          channelRef.current = null;
        }

        const channel = supabase
          .channel(`posts-zone-${zone}`)
          .on("postgres_changes", { event: "INSERT", schema: "public", table: "posts", filter: `zone=eq.${zone}` }, (payload) => {
            const row = payload?.new;
            if (!row || row.hidden) return;

            setPosts((prev) => {
              if (prev.some((p) => p.id === row.id)) return prev;
              return [row, ...prev].slice(0, 50);
            });
            setMyPoints((prev) => prev + (row.points || 0));
          })
          .subscribe();

        channelRef.current = channel;
      } catch (e) {
        alert(e?.message || "Boot failed.");
      } finally {
        setBooting(false);
      }
    };

    boot();

    return () => {
      cancelled = true;
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zone, session?.user?.id]);

  async function seedPosts() {
    if (loading) return;
    setLastBlock("");
    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData?.user?.id;

      const rows = [
        { text: "Welcome to YakSafe — keep it kind.", author: "Anonymous", points: 10, zone, user_id: uid || null },
        { text: "Best chai spot near here?", author: "Anonymous", points: 10, zone, user_id: uid || null },
        { text: "Shoutout to everyone grinding today.", author: "Anonymous", points: 10, zone, user_id: uid || null },
      ];

      const { data, error } = await supabase.from("posts").insert(rows).select();
      if (error) throw error;

      const visible = (data || []).filter((r) => !r.hidden);
      setPosts((p) => [...visible, ...p].slice(0, 50));
      const added = visible.reduce((sum, r) => sum + (r?.points || 0), 0);
      setMyPoints((prev) => prev + added);
    } catch (e) {
      alert(e?.message || "Seed failed.");
    } finally {
      setLoading(false);
    }
  }

  async function reportPost(id) {
    const { error } = await supabase.from("posts").update({ reported: true }).eq("id", id);
    if (error) alert(error.message);
    else setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, reported: true } : p)));
  }

  async function toggleHidden(id, nextHidden) {
    const { error } = await supabase.from("posts").update({ hidden: nextHidden }).eq("id", id);
    if (error) alert(error.message);
    else {
      if (nextHidden) setPosts((prev) => prev.filter((p) => p.id !== id));
      else await loadPosts();
    }
  }

  async function handleSubmit() {
    const text = input.trim();
    if (!text || loading) return;

    setLastBlock("");
    setLoading(true);

    try {
      const mod = await postWithRetry(`${API_BASE}/moderate`, { text }, { timeoutMs: 8000, retries: 1 });
      if (!mod?.safe) {
        setLastBlock(mod?.reason || "Blocked");
        return;
      }

      const { data: userData } = await supabase.auth.getUser();
      const uid = userData?.user?.id;

      const insertDoc = { text, author: "Anonymous", points: 10, zone, user_id: uid || null };
      const { data, error } = await supabase.from("posts").insert(insertDoc).select();
      if (error) {
        alert(`Supabase insert error: ${error.message}`);
        return;
      }

      const row = Array.isArray(data) ? data[0] : null;
      if (row && !row.hidden) setPosts((p) => (p.some((x) => x.id === row.id) ? p : [row, ...p].slice(0, 50)));
      else await loadPosts();

      setInput("");
    } catch (err) {
      alert(err?.message || "Submit failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div className="card" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }}>
      <header className="header">
        <div className="titleRow">
          <h1>YakSafe</h1>
          <span className="badge">Realtime + Moderation</span>
        </div>

        <div className="subRow">
          <div className="sub">
            Nearby Zone:{" "}
            <select value={zone} onChange={(e) => setZone(e.target.value)} disabled={booting || loading}>
              <option value="Campus">Campus</option>
              <option value="Bagru">Bagru</option>
              <option value="Jaipur">Jaipur</option>
            </select>
          </div>
          <div className="mutedSmall">{session?.user?.email ? `Signed in: ${session.user.email}` : "Guest mode"}</div>
        </div>
      </header>

      <div className="stats">
        <div className="pill">YakPoints (feed): {myPoints}</div>
        <button className="pill pillLink" onClick={loadPosts} disabled={booting || loading} type="button">
          Refresh
        </button>
        <button className="pill pillLink" onClick={seedPosts} disabled={booting || loading} type="button">
          Seed demo
        </button>
        <button className="pill pillLink" onClick={() => setAdminMode((v) => !v)} disabled={booting} type="button">
          Admin: {adminMode ? "ON" : "OFF"}
        </button>
        <Link className="pill pillLink" to="/dashboard">
          Dashboard →
        </Link>
      </div>

      <div className="composer">
        <input
          className="input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Share a safe thought..."
          maxLength={280}
          disabled={loading || booting}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        />
        <button className="btn" onClick={handleSubmit} disabled={loading || booting} type="button">
          {loading ? "Checking..." : "Post"}
        </button>
      </div>

      {lastBlock ? <div className="warn">Blocked: {lastBlock}</div> : null}

      <div className="quickRow">
        <button className="pill pillLink" onClick={() => setInput("hate")} disabled={loading || booting} type="button">
          Try blocked example
        </button>
        <button className="pill pillLink" onClick={() => setInput("This is awesome")} disabled={loading || booting} type="button">
          Try safe example
        </button>
      </div>

      <section className="section">
        <div className="sectionTitleRow">
          <h2>Local Feed</h2>
          <span className="pill soft">Zone: {zone}</span>
        </div>

        {booting ? (
          <div className="muted">Loading posts…</div>
        ) : posts.length === 0 ? (
          <div className="muted">No posts yet. Click “Seed demo”.</div>
        ) : (
          <ul className="feed">
            <AnimatePresence initial={false}>
              {feedItems.map((item) => {
                if (item.type === "ad") {
                  return (
                    <motion.li
                      key={item.id}
                      className="post adCard"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.16 }}
                    >
                      <div className="adTop">
                        <span className="adBadge">Sponsored</span>
                        <span className="adBrand">{item.brand}</span>
                      </div>
                      <div className="postText">{item.title}</div>
                      <div className="adBody">{item.body}</div>
                      <div className="postMeta">
                        <a className="pill pillLink" href={item.href} target="_blank" rel="noreferrer">
                          {item.cta} →
                        </a>
                      </div>
                    </motion.li>
                  );
                }

                const p = item;
                return (
                  <motion.li
                    key={p.id}
                    className="post"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.16 }}
                  >
                    <div className="postText">{p.text}</div>
                    <div className="postMeta">
                      <span>{p.author || "Anonymous"}</span>
                      <span>•</span>
                      <span>{p.created_at ? new Date(p.created_at).toLocaleTimeString() : "now"}</span>
                      <span className="glow">+{p.points || 10} YakPoints</span>

                      <button
                        className="pill pillLink"
                        style={{ padding: "6px 10px", fontSize: 12 }}
                        onClick={() => reportPost(p.id)}
                        type="button"
                        disabled={booting || p.reported}
                        aria-pressed={!!p.reported}
                      >
                        {p.reported ? "Reported" : "Report"}
                      </button>

                      {adminMode ? (
                        <button
                          className="pill pillLink"
                          style={{ padding: "6px 10px", fontSize: 12 }}
                          onClick={() => toggleHidden(p.id, true)}
                          type="button"
                          disabled={booting}
                        >
                          Hide
                        </button>
                      ) : null}
                    </div>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        )}
      </section>
    </motion.div>
  );
}

function AppInner() {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session || null));

    // Keep session synced with auth events + unsubscribe. [web:708]
    const { data } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (event === "SIGNED_OUT") setSession(null);
      else setSession(nextSession);
    });

    return () => {
      data?.subscription?.unsubscribe();
    };
  }, []);

  async function onLogout() {
    // Sign out and redirect. [web:737]
    const { error } = await supabase.auth.signOut();
    if (error) console.error(error);
    navigate("/auth", { replace: true });
  }

  return (
    <Shell session={session} onLogout={onLogout}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<AuthPage session={session} />} />
        <Route path="/app" element={<YakSafeApp session={session} />} />
        <Route path="/dashboard" element={<Dashboard session={session} />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route
          path="*"
          element={
            <div className="muted">
              Page not found.{" "}
              <Link className="inlineLink" to="/">
                Go Home
              </Link>
            </div>
          }
        />
      </Routes>
    </Shell>
  );
}

export default function App() {
  return <AppInner />;
}
