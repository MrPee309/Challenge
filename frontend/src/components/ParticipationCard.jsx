import React, { useState } from "react";
import { Heart, MapPin, Play } from "lucide-react";
import { api, mediaSrc } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useLang } from "@/context/LanguageContext";
import { toast } from "sonner";

export function ParticipationCard({ p, showRank = false }) {
  const { user } = useAuth();
  const { t } = useLang();
  const [voted, setVoted] = useState(p.has_voted);
  const [votes, setVotes] = useState(p.votes);
  const [busy, setBusy] = useState(false);
  const [pop, setPop] = useState(false);

  const vote = async () => {
    if (!user) {
      toast.error(t("mustLogin"));
      return;
    }
    if (busy) return;
    setBusy(true);
    try {
      const res = await api.post("/votes", { participation_id: p.id });
      setVoted(res.data.has_voted);
      setVotes(res.data.votes);
      if (res.data.has_voted) {
        setPop(true);
        setTimeout(() => setPop(false), 400);
        toast.success(t("voteAdded"));
      }
    } catch (e) {
      toast.error("Erè vòt la");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900 tchak-rise"
      data-testid={`participation-${p.id}`}
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-zinc-950">
        {p.media_type === "video" ? (
          <video
            src={mediaSrc(p.media_url)}
            className="h-full w-full object-cover"
            playsInline
            muted
            loop
          />
        ) : (
          <img
            src={mediaSrc(p.media_url)}
            alt={p.caption}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

        {showRank && p.rank && (
          <div className="absolute top-3 left-3 flex h-9 w-9 items-center justify-center rounded-full bg-[#FFE800] font-display font-black text-black">
            {p.rank}
          </div>
        )}
        {p.media_type === "video" && (
          <div className="absolute top-3 right-3 rounded-full bg-black/60 p-2 backdrop-blur">
            <Play size={16} className="text-white" fill="white" />
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-center gap-2">
            <img
              src={mediaSrc(p.avatar)}
              alt={p.name}
              className="h-9 w-9 rounded-full object-cover border-2 border-[#FFE800]"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-white">@{p.username}</p>
              <p className="flex items-center gap-1 text-[11px] text-zinc-300">
                <MapPin size={10} /> {p.location}
              </p>
            </div>
          </div>
          {p.caption && (
            <p className="mt-2 line-clamp-2 text-sm text-zinc-100">{p.caption}</p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-xs font-semibold text-zinc-400">
          {p.challenge_title}
        </span>
        <button
          onClick={vote}
          disabled={busy}
          data-testid={`vote-button-${p.id}`}
          className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold transition-transform duration-200 active:scale-90 ${
            voted
              ? "bg-[#FF4D4D] text-white"
              : "bg-zinc-800 text-zinc-100 hover:bg-zinc-700"
          }`}
        >
          <Heart
            size={16}
            className={pop ? "tchak-pop" : ""}
            fill={voted ? "white" : "none"}
          />
          <span data-testid={`vote-count-${p.id}`}>{votes}</span>
        </button>
      </div>
    </div>
  );
}
