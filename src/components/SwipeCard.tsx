import { motion, useMotionValue, useTransform } from "framer-motion";
import type { PanInfo } from "framer-motion";
import { useState } from "react";


const SWIPE_DISTANCE = 120; 
const SWIPE_VELOCITY = 500;

type Dir = 1 | -1; // 1 = interested, -1 = ignore

interface UserProfile {
  _id: string;
  firstName: string;
  lastName: string;
  age: number;
  gender: string;
  photoUrl: string;
  skills: string[];
}

const GenderIcon = ({ gender }: { gender: string }) => {
  const common = {
    xmlns: "http://www.w3.org/2000/svg",
    width: 12,
    height: 12,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  if (gender === "male")
    return (
      <svg {...common}>
        <circle cx="10" cy="14" r="6" />
        <path d="M14 10l6-6" />
        <path d="M15 4h5v5" />
      </svg>
    );
  if (gender === "female")
    return (
      <svg {...common}>
        <circle cx="12" cy="10" r="6" />
        <path d="M12 16v6" />
        <path d="M9 19h6" />
      </svg>
    );
  return (
    <svg {...common}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
};

const genderStyles: Record<string, string> = {
  male: "bg-sky-400/15 text-sky-300 border-sky-300/30",
  female: "bg-rose-400/15 text-rose-300 border-rose-300/30",
  other: "bg-violet-400/15 text-violet-300 border-violet-300/30",
};


interface SwipeCardProps {
  profile: UserProfile;
  index: number;
  direction: Dir;
  removeCard: (id: string, dir: Dir) => void;
}

const SwipeCard = ({ profile, index, direction, removeCard }: SwipeCardProps) => {
  const [imgFailed, setImgFailed] = useState(false);

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-14, 14]);
  const interestedOpacity = useTransform(x, [40, 130], [0, 1]);
  const ignoreOpacity = useTransform(x, [-40, -130], [0, 1]);
  const tintRight = useTransform(x, [0, 150], [0, 0.35]);
  const tintLeft = useTransform(x, [0, -150], [0, 0.35]);

  const isFront = index === 0;
  const gender = profile.gender?.toLowerCase() ?? "";
  const genderKey = gender;
  const initials = `${profile.firstName?.[0] ?? ""}${profile.lastName?.[0] ?? ""}`;

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (!isFront) return;
    const { offset, velocity } = info;
    if (Math.abs(offset.x) > SWIPE_DISTANCE || Math.abs(velocity.x) > SWIPE_VELOCITY) {
      removeCard(profile._id, offset.x > 0 ? 1 : -1);
    }
  };

  return (
    <motion.div
      className={`absolute inset-0 rounded-4xl overflow-hidden bg-slate-900 border border-white/10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.7)] touch-pan-y select-none`}
      style={{ x, rotate, zIndex: 100 - index, cursor: isFront ? "grab" : "default" }}
      whileDrag={{ cursor: "grabbing" }}
      animate={{
        scale: isFront ? 1 : 1 - index * 0.05,
        y: isFront ? 0 : index * 16,
        opacity: 1,
      }}
      initial={{ scale: 0.9, y: 30, opacity: 0 }}
      custom={direction}
      variants={{ exit: (dir: Dir) => ({ x: dir * 520, opacity: 0, transition: { duration: 0.25 } }) }}
      exit="exit"
      drag={isFront ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={handleDragEnd}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
    >
      {/* photo, or an initials avatar if the image is missing/broken */}
      {profile.photoUrl && !imgFailed ? (
        <img
          src={profile.photoUrl}
          alt={`${profile.firstName} ${profile.lastName}`}
          loading="lazy"
          draggable={false}
          onError={() => setImgFailed(true)}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-slate-800 to-slate-900 pointer-events-none">
          <span className="text-7xl font-bold text-slate-600">{initials}</span>
        </div>
      )}

      {/* readability gradient */}
      <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/50 to-transparent via-40% pointer-events-none" />

      {/* colour wash that grows as you drag */}
      <motion.div style={{ opacity: tintRight }} className="absolute inset-0 bg-emerald-400 mix-blend-soft-light pointer-events-none" />
      <motion.div style={{ opacity: tintLeft }} className="absolute inset-0 bg-rose-400 mix-blend-soft-light pointer-events-none" />

      {/* swipe stamps */}
      <motion.div
        style={{ opacity: interestedOpacity }}
        className="absolute top-8 left-6 -rotate-12 px-4 py-1.5 rounded-lg border-[3px] border-emerald-400 text-emerald-400 text-2xl font-extrabold pointer-events-none"
      >
        Interested
      </motion.div>
      <motion.div
        style={{ opacity: ignoreOpacity }}
        className="absolute top-8 right-6 rotate-12 px-4 py-1.5 rounded-lg border-[3px] border-rose-400 text-rose-400 text-2xl font-extrabold pointer-events-none"
      >
        Ignore
      </motion.div>

      {/* profile info */}
      <div className="absolute bottom-0 inset-x-0 p-6 pb-7 pointer-events-none">
        <div className="flex items-baseline gap-3">
          <h2 className="text-white text-[1.75rem] leading-tight font-bold tracking-tight drop-shadow">
            {profile.firstName} {profile.lastName}
          </h2>
          <span className="text-slate-300 text-xl font-medium">{profile.age}</span>
        </div>

        <div
          className={`mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium capitalize backdrop-blur-md ${genderStyles[genderKey]}`}
        >
          <GenderIcon gender={genderKey} />
          <span>{profile.gender || "Not specified"}</span>
        </div>

        {profile.skills?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {profile.skills.slice(0, profile.skills?.length).map((skill) => (
              <span
                key={skill}
                className="px-2.5 py-1 rounded-lg bg-white/10 backdrop-blur-md border border-white/10 text-slate-100 text-xs font-medium"
              >
                {skill}
              </span>
            ))}
           
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default SwipeCard