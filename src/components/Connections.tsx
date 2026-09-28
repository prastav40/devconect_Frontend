import { useCallback, useEffect, useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL ?? "";

type Status = "loading" | "ready" | "error";

interface ConnectionUser {
  _id: string;
  firstName: string;
  lastName: string;
  age?: number;
  skills?: string[];
  about?: string;
  photoUrl?: string;
}

// the backend sends errors as either plain text (`.send("...")`) or JSON (`.json({ message })`)
const readErrorMessage = (err: unknown, fallback: string): string => {
  if (!axios.isAxiosError(err)) return fallback;
  const data = err.response?.data;
  if (typeof data === "string" && data.trim()) return data;
  if (data && typeof data === "object" && typeof data.message === "string") return data.message;
  return fallback;
};

/* ---------- one connection card ---------- */
const ConnectionCard = ({ user }: { user: ConnectionUser }) => {
  const [imgFailed, setImgFailed] = useState(false);

  const first = user.firstName?.trim() ?? "";
  const last = user.lastName?.trim() ?? "";
  const initials = `${first[0] ?? ""}${last[0] ?? ""}` || "?";
  const showPhoto = !!user.photoUrl && !imgFailed;
  const skills = user.skills ?? [];

  return (
    <div className="flex gap-4 rounded-2xl border border-white/10 bg-slate-900 p-4 sm:p-5">
      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 sm:h-20 sm:w-20">
        {showPhoto ? (
          <img
            src={user.photoUrl}
            alt={`${first} ${last}`}
            onError={() => setImgFailed(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xl font-bold text-slate-600">{initials}</div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <h3 className="truncate text-base font-semibold text-slate-100">
            {first} {last}
          </h3>
          {user.age != null && <span className="text-sm text-slate-400">{user.age}</span>}
        </div>

        {user.about && <p className="mt-1 line-clamp-2 text-sm text-slate-400">{user.about}</p>}

        {skills.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {skills.slice(0, 4).map((s) => (
              <span key={s} className="rounded-lg bg-white/10 px-2 py-0.5 text-xs font-medium text-slate-200">
                {s}
              </span>
            ))}
            {skills.length > 4 && <span className="px-1 text-xs text-slate-500">+{skills.length - 4}</span>}
          </div>
        )}
      </div>
    </div>
  );
};

/* ---------- main component ---------- */
const Connections = () => {
  const [connections, setConnections] = useState<ConnectionUser[]>([]);
  const [status, setStatus] = useState<Status>("loading");
  const [errorMsg, setErrorMsg] = useState("");

  const loadConnections = useCallback(async () => {
    setStatus("loading");
    try {
      const res = await axios.get(`${API_URL}/user/connections`, {
        withCredentials: true,
        timeout: 10000,
      });
      setConnections(Array.isArray(res.data?.data) ? res.data.data : []);
      setStatus("ready");
    } catch (err) {
      setErrorMsg(readErrorMessage(err, "Couldn't load your connections."));
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    loadConnections();
  }, [loadConnections]);

  return (
    <section className="mx-auto w-full max-w-2xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-100">Your connections</h1>
        <p className="mt-1 text-sm text-slate-400">
          {status === "ready" && connections.length > 0
            ? `${connections.length} connection${connections.length === 1 ? "" : "s"}`
            : "People you've matched with."}
        </p>
      </header>

      {status === "loading" && (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl border border-white/10 bg-slate-900" />
          ))}
        </div>
      )}

      {status === "error" && (
        <div className="rounded-2xl border border-white/10 py-16 text-center">
          <p className="text-slate-300">{errorMsg}</p>
          <button
            onClick={loadConnections}
            className="mt-4 rounded-full bg-emerald-400 px-6 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200"
          >
            Try again
          </button>
        </div>
      )}

      {status === "ready" && connections.length === 0 && (
        <div className="rounded-2xl border border-dashed border-white/15 py-16 text-center">
          <p className="text-slate-300">No connections yet.</p>
          <p className="mt-1 text-sm text-slate-500">Accepted requests will show up here.</p>
        </div>
      )}

      {status === "ready" && connections.length > 0 && (
        <div className="space-y-3">
          {connections.map((user) => (
            <ConnectionCard key={user._id} user={user} />
          ))}
        </div>
      )}
    </section>
  );
};

export default Connections;