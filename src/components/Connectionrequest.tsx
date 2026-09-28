import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";
import { setPendingCount, decrementPendingCount } from "../utils/Requestslice"; // <- adjust path to match where you place it

const API_URL = import.meta.env.VITE_API_URL ?? "";

type Decision = "accepted" | "rejected";
type Status = "loading" | "ready" | "error";

interface RequestUser {
  _id: string;
  firstName: string;
  lastName: string;
  age?: number;
  skills?: string[];
  about?: string;
  photoUrl?: string;
}

interface PendingRequest {
  _id: string; // the ConnectionRequest document's id
  fromUserId: RequestUser; // populated by the backend
  status: string;
}

// the backend sends errors as either plain text (`.send("...")`) or JSON (`.json({ message })`) —
// this reads whichever shape actually comes back instead of assuming one
const readErrorMessage = (err: unknown, fallback: string): string => {
  if (!axios.isAxiosError(err)) return fallback;
  const data = err.response?.data;
  if (typeof data === "string" && data.trim()) return data;
  if (data && typeof data === "object" && typeof data.message === "string") return data.message;
  return fallback;
};

/* ---------- one request card ---------- */
interface RequestCardProps {
  request: PendingRequest;
  onDecide: (request: PendingRequest, decision: Decision) => void;
  pending: Decision | null; // which button (if any) is mid-flight for this card
}

const RequestCard = ({ request, onDecide, pending }: RequestCardProps) => {
  const [imgFailed, setImgFailed] = useState(false);
  const user = request.fromUserId;

  const first = user?.firstName?.trim() ?? "";
  const last = user?.lastName?.trim() ?? "";
  const initials = `${first[0] ?? ""}${last[0] ?? ""}` || "?";
  const showPhoto = !!user?.photoUrl && !imgFailed;
  const skills = user?.skills ?? [];
  const isBusy = pending !== null;

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
          {user?.age != null && <span className="text-sm text-slate-400">{user.age}</span>}
        </div>

        {user?.about && <p className="mt-1 line-clamp-2 text-sm text-slate-400">{user.about}</p>}

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

        <div className="mt-3 flex gap-2">
          <button
            onClick={() => onDecide(request, "accepted")}
            disabled={isBusy}
            className="rounded-full bg-emerald-400 px-4 py-1.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 active:scale-95 disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200"
          >
            {pending === "accepted" ? "Accepting..." : "Accept"}
          </button>
          <button
            onClick={() => onDecide(request, "rejected")}
            disabled={isBusy}
            className="rounded-full border border-white/15 px-4 py-1.5 text-sm font-medium text-slate-300 transition hover:bg-white/5 active:scale-95 disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
          >
            {pending === "rejected" ? "Rejecting..." : "Reject"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ---------- main component ---------- */
const ConnectionRequests = () => {
  const dispatch = useDispatch();
  const [requests, setRequests] = useState<PendingRequest[]>([]);
  const [status, setStatus] = useState<Status>("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [pendingIds, setPendingIds] = useState<Record<string, Decision>>({}); // requestId -> decision in flight
  const [notice, setNotice] = useState<string | null>(null);

  const loadRequests = useCallback(async () => {
    setStatus("loading");
    try {
      const res = await axios.get(`${API_URL}/user/requests/pendingrequests`, {
        withCredentials: true,
        timeout: 10000,
      });
      const data = Array.isArray(res.data?.data) ? res.data.data : [];
      setRequests(data);
      // this page has the real, current list — resync the navbar badge to match exactly
      dispatch(setPendingCount(data.length));
      setStatus("ready");
    } catch (err) {
      setErrorMsg(readErrorMessage(err, "Couldn't load requests."));
      setStatus("error");
    }
  }, [dispatch]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 3500);
    return () => clearTimeout(t);
  }, [notice]);

  const handleDecide = async (request: PendingRequest, decision: Decision) => {
    if (pendingIds[request._id]) return; // already mid-flight for this card

    setPendingIds((prev) => ({ ...prev, [request._id]: decision }));
    try {
      await axios.post(
        `${API_URL}/user/requests/${decision}/${request.fromUserId._id}`,
        {},
        { withCredentials: true, timeout: 10000 }
      );
      // success: remove the card from the list and update the shared badge count immediately
      setRequests((prev) => prev.filter((r) => r._id !== request._id));
      dispatch(decrementPendingCount());
      setNotice(decision === "accepted" ? "Request accepted" : "Request rejected");
    } catch (err) {
      setNotice(readErrorMessage(err, "Couldn't process that request. Try again."));
    } finally {
      setPendingIds((prev) => {
        const next = { ...prev };
        delete next[request._id];
        return next;
      });
    }
  };

  return (
    <section className="mx-auto w-full max-w-2xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-100">Connection requests</h1>
        <p className="mt-1 text-sm text-slate-400">People who are interested in connecting with you.</p>
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
            onClick={loadRequests}
            className="mt-4 rounded-full bg-emerald-400 px-6 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200"
          >
            Try again
          </button>
        </div>
      )}

      {status === "ready" && requests.length === 0 && (
        <div className="rounded-2xl border border-dashed border-white/15 py-16 text-center">
          <p className="text-slate-300">No pending requests right now.</p>
          <p className="mt-1 text-sm text-slate-500">New requests will show up here.</p>
        </div>
      )}

      {status === "ready" && requests.length > 0 && (
        <div className="space-y-3">
          {requests.map((r) => (
            <RequestCard key={r._id} request={r} onDecide={handleDecide} pending={pendingIds[r._id] ?? null} />
          ))}
        </div>
      )}

      {notice && (
        <div role="status" className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-xl border border-white/10 bg-slate-800 px-4 py-2.5 text-sm text-slate-100 shadow-xl">
          {notice}
        </div>
      )}
    </section>
  );
};

export default ConnectionRequests;