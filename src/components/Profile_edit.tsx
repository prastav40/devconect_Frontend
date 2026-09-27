import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import axios from "axios";
import { addUser } from "../utils/userslice"; // <- change to the real path of your slice

const API_URL = import.meta.env.VITE_API_URL ?? "";
const MAX_SKILLS = 10;
const MIN_AGE = 18;
const MAX_AGE = 65;

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_MB = 1; // final size sent to the backend, after compression
const MAX_ORIGINAL_MB = 15; // reject outright above this; nothing sensible to compress
const MAX_DIMENSION = 1280; // longest side, in pixels, after resizing

/* ---------- types ---------- */
interface ProfileForm {
  firstName: string;
  lastName: string;
  age: string; // kept as a string while typing; converted to a number on save
  gender: string;
  photoUrl: string;
  photoId: string; // Cloudinary public_id, kept so a future re-upload/delete can target it
  skills: string[];
}

// shape of state.user in the Redux store — adjust field names if yours differ.
// These are required (not optional) because the real User type used by addUser
// requires them — a logged-in user's profile always has these fields populated.
interface StoreUser {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  age: number | string;
  gender: string;
  photoUrl: string;
  skills: string[];
  photoId?: string; // optional: only present once a user has uploaded via this feature
}

type SaveStatus = "idle" | "saving" | "saved" | "error";
type UploadStatus = "idle" | "compressing" | "uploading" | "error";

const toForm = (u: StoreUser | null | undefined): ProfileForm => ({
  firstName: u?.firstName ?? "",
  lastName: u?.lastName ?? "",
  age: u?.age != null ? String(u.age) : "",
  gender: (u?.gender ?? "male").toLowerCase(),
  photoUrl: u?.photoUrl ?? "",
  photoId: u?.photoId ?? "",
  skills: Array.isArray(u?.skills) ? u!.skills! : [],
});

/* ---------- validation ---------- */
const validate = (f: ProfileForm) => {
  const errors: Partial<Record<keyof ProfileForm, string>> = {};
  if (!f.firstName.trim()) errors.firstName = "First name is required";
  if (!f.lastName.trim()) errors.lastName = "Last name is required";

  const age = Number(f.age);
  if (!f.age) errors.age = "Age is required";
  else if (age < MIN_AGE) errors.age = `You must be ${MIN_AGE} or older to use this app`;
  else if (age > MAX_AGE) errors.age = "Enter a valid age";

  const photo = f.photoUrl.trim();
  if (photo) {
    try {
      const u = new URL(photo);
      if (u.protocol !== "http:" && u.protocol !== "https:") throw new Error();
    } catch {
      errors.photoUrl = "That doesn't look like a valid image link";
    }
  }
  return errors;
};

/* ---------- image compression ---------- */
// Resizes to at most MAX_DIMENSION on the longest side, then re-encodes as JPEG,
// lowering quality step by step until the result fits under MAX_IMAGE_MB.
// Runs entirely in the browser — nothing is uploaded until this resolves.
const compressImage = (file: File): Promise<File> =>
  new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        const scale = MAX_DIMENSION / Math.max(width, height);
        width = Math.round(width * scale);
        height = Math.round(height * scale);
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Your browser can't process images here"));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);

      const maxBytes = MAX_IMAGE_MB * 1024 * 1024;

      const tryQuality = (quality: number) => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Compression failed"));
              return;
            }
            if (blob.size <= maxBytes || quality <= 0.4) {
              const compressed = new File([blob], file.name.replace(/\.\w+$/, ".jpg"), {
                type: "image/jpeg",
              });
              resolve(compressed);
            } else {
              tryQuality(quality - 0.15);
            }
          },
          "image/jpeg",
          quality
        );
      };
      tryQuality(0.85);
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Couldn't read that image"));
    };

    img.src = objectUrl;
  });

/* ---------- preview card (display only, no dragging) ---------- */
const ProfileCard = ({ profile }: { profile: ProfileForm }) => {
  const [imgFailed, setImgFailed] = useState(false);

  // a new image source deserves a fresh attempt
  useEffect(() => setImgFailed(false), [profile.photoUrl]);

  const first = profile.firstName.trim();
  const last = profile.lastName.trim();
  const initials = `${first[0] ?? ""}${last[0] ?? ""}` || "?";
  const showPhoto = profile.photoUrl.trim() && !imgFailed;

  return (
    <div className="relative w-[min(90vw,360px)] h-[min(68vh,540px)] rounded-[2rem] overflow-hidden bg-slate-900 border border-white/10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.7)]">
      {showPhoto ? (
        <img
          src={profile.photoUrl.trim()}
          alt={`${first} ${last}`}
          onError={() => setImgFailed(true)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
          <span className="text-7xl font-bold text-slate-600">{initials}</span>
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent via-40%" />

      <div className="absolute bottom-0 inset-x-0 p-6 pb-7">
        <div className="flex items-baseline gap-3">
          <h2 className="text-white text-[1.75rem] leading-tight font-bold tracking-tight">
            {first || last ? `${first} ${last}` : <span className="text-slate-500">Your name</span>}
          </h2>
          <span className="text-slate-300 text-xl font-medium">{profile.age || "--"}</span>
        </div>

        <p className="mt-2 text-sm capitalize text-slate-300">{profile.gender}</p>

        <div className="flex flex-wrap gap-2 mt-4">
          {profile.skills.length === 0 && <span className="text-xs text-slate-500">Your skills will appear here</span>}
          {profile.skills.slice(0, 3).map((s) => (
            <span key={s} className="px-2.5 py-1 rounded-lg bg-white/10 border border-white/10 text-slate-100 text-xs font-medium">
              {s}
            </span>
          ))}
          {profile.skills.length > 3 && (
            <span className="px-2.5 py-1 text-slate-400 text-xs font-medium">+{profile.skills.length - 3} more</span>
          )}
        </div>
      </div>
    </div>
  );
};

/* ---------- small form helpers ---------- */
const inputClass =
  "w-full rounded-xl bg-slate-900 border border-white/10 px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/60";

const Field = ({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) => (
  <label className="block">
    <span className="mb-1.5 block text-sm font-medium text-slate-300">{label}</span>
    {children}
    {error && <span className="mt-1 block text-xs text-rose-400">{error}</span>}
  </label>
);

/* ---------- main component ---------- */
const ProfileEdit = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // read the logged-in user straight from the Redux store — rename `user` if your slice key differs
  const storeUser = useSelector((store: { user: StoreUser | null }) => store.user);

  const [form, setForm] = useState<ProfileForm>(() => toForm(storeUser)); // what the user is typing (drives form AND preview)
  const [saved, setSaved] = useState<ProfileForm>(() => toForm(storeUser)); // last version confirmed saved
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [skillInput, setSkillInput] = useState("");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  // gallery photo upload (Cloudinary, via our own /profile/upload-photo route)
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
  const [uploadError, setUploadError] = useState("");

  /* if the store user changes from elsewhere (e.g. a fresh login), resync the form */
  useEffect(() => {
    const next = toForm(storeUser);
    setForm(next);
    setSaved(next);
  }, [storeUser]);

  const errors = useMemo(() => validate(form), [form]);
  const isValid = Object.keys(errors).length === 0;
  const isDirty = JSON.stringify(form) !== JSON.stringify(saved);

  /* warn before closing the tab with unsaved changes */
  useEffect(() => {
    if (!isDirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [isDirty]);

  /* one helper updates any field: this is what keeps the preview live */
  const setField = <K extends keyof ProfileForm>(key: K, value: ProfileForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaveStatus("idle");
  };
  const touch = (key: string) => setTouched((t) => ({ ...t, [key]: true }));
  // age errors show as soon as something is typed, the rest after leaving the field
  const showError = (key: keyof ProfileForm) =>
    touched[key] || (key === "age" && form.age !== "") ? errors[key] : undefined;

  /* age: digits only, max 3 characters */
  const handleAge = (raw: string) => setField("age", raw.replace(/\D/g, "").slice(0, 3));

  /* gallery picking: upload straight to Cloudinary via our backend, then store the returned URL/id */
  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // lets the user pick the same file again later
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setUploadError("Choose a JPG, PNG or WebP image");
      return;
    }
    if (file.size > MAX_ORIGINAL_MB * 1024 * 1024) {
      setUploadError(`Image is too large (max ${MAX_ORIGINAL_MB} MB before compression)`);
      return;
    }

    setUploadError("");

    // compress first if the file is already over the limit — most phone photos are
    let toUpload = file;
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
      setUploadStatus("compressing");
      try {
        toUpload = await compressImage(file);
      } catch {
        setUploadError("Couldn't compress that image. Try a different file.");
        setUploadStatus("error");
        return;
      }
      // compression has a floor (quality 0.4); a very large or busy photo can still land above the limit
      if (toUpload.size > MAX_IMAGE_MB * 1024 * 1024) {
        setUploadError(`Still too large after compression. Try a smaller image (max ${MAX_IMAGE_MB} MB).`);
        setUploadStatus("error");
        return;
      }
    }

    setUploadStatus("uploading");
    try {
      const data = new FormData();
      data.append("photo", toUpload); // field name must match multer's upload.single("photo") on the backend

      const res = await axios.post(`${API_URL}/profile/upload-photo`, data, {
        withCredentials: true,
        timeout: 30000,
      });

      setField("photoUrl", res.data?.url ?? "");
      setField("photoId", res.data?.photoId ?? "");
      setUploadStatus("idle");
    } catch (err) {
      const serverMsg = axios.isAxiosError(err) ? err.response?.data?.message : undefined;
      setUploadError(serverMsg || "Upload failed. Try again.");
      setUploadStatus("error");
    }
  };

  const clearPhoto = () => {
    setField("photoUrl", "");
    setField("photoId", "");
    setUploadError("");
    setUploadStatus("idle");
  };

  /* skills */
  const addSkill = (raw: string) => {
    const s = raw.trim();
    if (!s) return;
    if (form.skills.length >= MAX_SKILLS) return;
    if (form.skills.some((x) => x.toLowerCase() === s.toLowerCase())) return;
    setField("skills", [...form.skills, s]);
    setSkillInput("");
  };
  const removeSkill = (s: string) =>
    setField(
      "skills",
      form.skills.filter((x) => x !== s)
    );

  /* save: PATCH /profile/update -> dispatch addUser -> go home */
  const handleSave = async () => {
    setTouched({ firstName: true, lastName: true, age: true, photoUrl: true });
    if (!isValid || saveStatus === "saving" || uploadStatus === "uploading" || uploadStatus === "compressing") return;

    setSaveStatus("saving");
    setErrorMsg("");
    try {
      const payload = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        age: Number(form.age),
        gender: form.gender,
        photoUrl: form.photoUrl.trim(),
        photoId: form.photoId,
        skills: form.skills,
      };

      const res = await axios.patch(`${API_URL}/profile/update`, payload, { withCredentials: true, timeout: 10000 });

      // merge onto the existing store user so _id/email always survive, even if the
      // server response is partial or falls back to `payload` (which has neither)
      const serverUser = res.data?.data ?? res.data?.user;
      const updatedUser: StoreUser = { ...(storeUser as StoreUser), ...(serverUser ?? payload) };
      dispatch(addUser(updatedUser));

      setSaved(toForm(updatedUser));
      setSaveStatus("saved");
      navigate("/");
    } catch (err) {
      const serverMsg = axios.isAxiosError(err) ? err.response?.data?.message : undefined;
      setErrorMsg(serverMsg || "Couldn't save. Try again.");
      setSaveStatus("error");
    }
  };

  const handleReset = () => {
    setForm(saved);
    setUploadError("");
    setUploadStatus("idle");
    setTouched({});
    setSaveStatus("idle");
  };

  return (
    <section className="mx-auto grid w-full max-w-5xl gap-10 px-4 py-8 lg:grid-cols-[1fr_auto] lg:items-start">
      {/* ---------- form ---------- */}
      <div className="space-y-5">
        <header>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">Edit profile</h1>
          <p className="mt-1 text-sm text-slate-400">The card updates as you type, so you see what others will see.</p>
        </header>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="First name" error={showError("firstName")}>
            <input
              className={inputClass}
              value={form.firstName}
              onChange={(e) => setField("firstName", e.target.value)}
              onBlur={() => touch("firstName")}
              maxLength={30}
              placeholder="Aarav"
            />
          </Field>
          <Field label="Last name" error={showError("lastName")}>
            <input
              className={inputClass}
              value={form.lastName}
              onChange={(e) => setField("lastName", e.target.value)}
              onBlur={() => touch("lastName")}
              maxLength={30}
              placeholder="Sharma"
            />
          </Field>
          <Field label={`Age (${MIN_AGE}+)`} error={showError("age")}>
            <input
              className={inputClass}
              type="text"
              inputMode="numeric"
              value={form.age}
              onChange={(e) => handleAge(e.target.value)}
              onBlur={() => touch("age")}
              placeholder="22"
            />
          </Field>
          <Field label="Gender">
            <select className={inputClass} value={form.gender} onChange={(e) => setField("gender", e.target.value)}>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </Field>
        </div>

        {/* photo: gallery upload only, backed by Cloudinary */}
        <div>
          <span className="mb-1.5 block text-sm font-medium text-slate-300">Photo</span>

          <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFile} className="hidden" />

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadStatus === "uploading" || uploadStatus === "compressing"}
              className="rounded-xl border border-white/15 bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-white/5 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60"
            >
              {uploadStatus === "compressing" ? "Compressing..." : uploadStatus === "uploading" ? "Uploading..." : "Choose from gallery"}
            </button>
            {form.photoUrl && uploadStatus === "idle" && (
              <button type="button" onClick={clearPhoto} className="text-sm text-slate-400 hover:text-rose-400">
                Remove photo
              </button>
            )}
          </div>
          {uploadError && <span className="mt-1 block text-xs text-rose-400">{uploadError}</span>}
          {showError("photoUrl") && <span className="mt-1 block text-xs text-rose-400">{showError("photoUrl")}</span>}
        </div>

        <Field label={`Skills (${form.skills.length}/${MAX_SKILLS})`}>
          <div className="flex flex-wrap gap-2 rounded-xl border border-white/10 bg-slate-900 p-2.5 focus-within:ring-2 focus-within:ring-emerald-400/60">
            {form.skills.map((s) => (
              <span key={s} className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1 text-xs font-medium text-slate-100">
                {s}
                <button type="button" onClick={() => removeSkill(s)} aria-label={`Remove ${s}`} className="text-slate-400 hover:text-rose-400">
                  ×
                </button>
              </span>
            ))}
            <input
              className="min-w-[8rem] flex-1 bg-transparent px-1 py-1 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === ",") {
                  e.preventDefault();
                  addSkill(skillInput);
                } else if (e.key === "Backspace" && !skillInput && form.skills.length) {
                  removeSkill(form.skills[form.skills.length - 1]);
                }
              }}
              onBlur={() => addSkill(skillInput)}
              placeholder={form.skills.length ? "" : "Type a skill and press Enter"}
              disabled={form.skills.length >= MAX_SKILLS}
            />
          </div>
        </Field>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleSave}
            disabled={!isDirty || !isValid || saveStatus === "saving" || uploadStatus === "uploading" || uploadStatus === "compressing"}
            className="rounded-full bg-emerald-400 px-6 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 active:scale-95 disabled:opacity-40 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200"
          >
            {saveStatus === "saving" ? "Saving..." : "Save changes"}
          </button>
          <button
            onClick={handleReset}
            disabled={!isDirty || saveStatus === "saving"}
            className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/5 disabled:opacity-40 disabled:pointer-events-none"
          >
            Discard
          </button>
          <span role="status" className="text-sm">
            {saveStatus === "error" && <span className="text-rose-400">{errorMsg}</span>}
            {saveStatus !== "error" && isDirty && <span className="text-slate-500">Unsaved changes</span>}
          </span>
        </div>
      </div>

      {/* ---------- live preview ---------- */}
      <aside className="flex flex-col items-center gap-3 lg:sticky lg:top-6">
        <p className="text-sm font-medium text-slate-400">Live preview</p>
        <ProfileCard profile={form} />
      </aside>
    </section>
  );
};

export default ProfileEdit;