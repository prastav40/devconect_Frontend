import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import axios from "axios";
import SwipeCard from "./SwipeCard";

const API_URL = import.meta.env.VITE_API_URL;; 
const PAGE_SIZE = 10;
const VISIBLE_CARDS = 3;
const CARD_SIZE = "w-[min(90vw,360px)] h-[min(68vh,540px)]";

type Dir = 1 | -1; // 1 = interested, -1 = ignore
type Status = "loading" | "ready" | "error";

interface UserProfile {
  _id: string;
  firstName: string;
  lastName: string;
  age: number;
  gender: string;
  photoUrl: string;
  skills: string[];
}

const Feed = () => {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [status, setStatus] = useState<Status>("loading");
  const [hasMore, setHasMore] = useState(true);
  const [direction, setDirection] = useState<Dir>(-1);
  const [notice, setNotice] = useState<string | null>(null);

  const page = useRef(1);
  const inFlight = useRef(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const loadPage = useCallback(async (reset = false) => {
    if (inFlight.current) return;
    inFlight.current = true;
    if (reset) {
      page.current = 1;
      setHasMore(true);
    }
    setStatus("loading");
    try {
      const res = await axios.get(`${API_URL}/feed`, {
        params: { page: page.current, limit: PAGE_SIZE },
        withCredentials: true,
        timeout: 10000,
      });
      if (!mounted.current) return;
      const data: UserProfile[] = Array.isArray(res.data?.data) ? res.data.data : [];
      setProfiles(data);
      setHasMore(data.length === PAGE_SIZE);
      page.current += 1;
      setStatus("ready");
    } catch {
      if (mounted.current) setStatus("error");
    } finally {
      inFlight.current = false;
    }
  }, []);

  useEffect(() => {
    loadPage(true);
  }, [loadPage]);

  useEffect(() => {
    if (status === "ready" && profiles.length === 0 && hasMore) loadPage();
  }, [status, profiles.length, hasMore, loadPage]);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 3500);
    return () => clearTimeout(t);
  }, [notice]);

  const removeCard = useCallback(
    (id: string, dir: Dir) => {
      const target = profiles.find((p) => p._id === id);
      setDirection(dir);
      setProfiles((prev) => prev.filter((p) => p._id !== id));
      // adjust this URL to match your backend
      axios
        .post(`${API_URL}/request/send/${dir === 1 ? "interested" : "ignored"}/${id}`, {}, { withCredentials: true })
        .catch(() => {
          if (!mounted.current || !target) return;
          setProfiles((prev) => [target, ...prev]);
          setNotice("Couldn't save that swipe. The profile is back on top.");
        });
    },
    [profiles]
  );

  const swipeTop = useCallback(
    (dir: Dir) => {
      if (profiles[0]) removeCard(profiles[0]._id, dir);
    },
    [profiles, removeCard]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.closest?.("input, textarea, select, [contenteditable]")) return;
      if (e.key === "ArrowRight") swipeTop(1);
      if (e.key === "ArrowLeft") swipeTop(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [swipeTop]);

  const canSwipe = status === "ready" && profiles.length > 0;
  const showSkeleton = status === "loading" && profiles.length === 0;
  const showError = status === "error" && profiles.length === 0;
  const showEmpty = status === "ready" && profiles.length === 0 && !hasMore;

  return (
    <section className="relative flex flex-col items-center gap-6 w-full min-h-[80vh] py-6 px-4 overflow-hidden">
      {/* single soft glow behind the stack */}
      <div className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[420px] w-[420px] rounded-full bg-emerald-500/10 blur-3xl" />

      <header className="relative z-10 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-slate-100">Discover developers</h1>
        <p className="mt-1 text-sm text-slate-400" aria-live="polite">
          {canSwipe ? `${profiles.length} left in this batch` : "Find people to build with"}
        </p>
      </header>

      {/* card stack */}
      <div className={`relative z-10 ${CARD_SIZE}`}>
        {showSkeleton && (
          <div className="absolute inset-0 rounded-[2rem] border border-white/10 bg-slate-900 animate-pulse overflow-hidden">
            <div className="absolute bottom-0 inset-x-0 p-6 space-y-3">
              <div className="h-7 w-2/3 rounded-lg bg-slate-800" />
              <div className="h-5 w-1/4 rounded-full bg-slate-800" />
              <div className="flex gap-2 pt-2">
                <div className="h-6 w-16 rounded-lg bg-slate-800" />
                <div className="h-6 w-20 rounded-lg bg-slate-800" />
                <div className="h-6 w-14 rounded-lg bg-slate-800" />
              </div>
            </div>
          </div>
        )}

        <AnimatePresence custom={direction}>
          {profiles.slice(0, VISIBLE_CARDS).map((profile, index) => (
            <SwipeCard key={profile._id} profile={profile} index={index} direction={direction} removeCard={removeCard} />
          ))}
        </AnimatePresence>

        {showError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8 gap-2">
            <h3 className="text-xl font-bold text-slate-100">Couldn't load the feed</h3>
            <p className="text-sm text-slate-400">Check your connection, then try again.</p>
            <button
              onClick={() => loadPage(true)}
              className="mt-4 px-6 py-2.5 rounded-full bg-emerald-400 text-slate-950 text-sm font-semibold hover:bg-emerald-300 active:scale-95 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              Try again
            </button>
          </div>
        )}

        {showEmpty && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 flex flex-col items-center justify-center text-center px-8 rounded-[2rem] border border-dashed border-white/15"
          >
            <div className="w-16 h-16 mb-5 rounded-full bg-slate-800/70 border border-white/10 flex items-center justify-center text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-100">You're all caught up</h3>
            <p className="mt-2 text-sm text-slate-400 leading-relaxed">
              New developers appear as people join. Check back later or reload now.
            </p>
            <button
              onClick={() => loadPage(true)}
              className="mt-6 px-6 py-2.5 rounded-full bg-emerald-400 text-slate-950 text-sm font-semibold hover:bg-emerald-300 active:scale-95 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              Reload feed
            </button>
          </motion.div>
        )}
      </div>

      {/* action buttons */}
      <div className="relative z-10 flex items-center gap-6">
        <button
          onClick={() => swipeTop(-1)}
          disabled={!canSwipe}
          aria-label="Ignore"
          className="grid place-items-center h-16 w-16 rounded-full border border-rose-400/40 bg-slate-900 text-rose-400 shadow-lg hover:bg-rose-400/10 active:scale-90 transition disabled:opacity-30 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
        <button
          onClick={() => swipeTop(1)}
          disabled={!canSwipe}
          aria-label="Interested"
          className="grid place-items-center h-16 w-16 rounded-full bg-emerald-400 text-slate-950 shadow-[0_10px_30px_-5px_rgba(52,211,153,0.5)] hover:bg-emerald-300 active:scale-90 transition disabled:opacity-30 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </button>
      </div>

      <p className="relative z-10 hidden sm:block text-xs text-slate-500">Drag the card, or use the ← → arrow keys or click the Buttons.</p>

      <AnimatePresence>
        {notice && (
          <motion.div
            role="status"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="fixed bottom-6 z-50 px-4 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-sm text-slate-100 shadow-xl"
          >
            {notice}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Feed;