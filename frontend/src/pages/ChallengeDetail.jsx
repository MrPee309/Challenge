import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "@/lib/api";
import { useLang } from "@/context/LanguageContext";
import { ParticipationCard } from "@/components/ParticipationCard";
import { ArrowLeft, Users, Clock } from "lucide-react";

export default function ChallengeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, lang } = useLang();
  const [ch, setCh] = useState(null);
  const [parts, setParts] = useState([]);
  const [cats, setCats] = useState([]);

  useEffect(() => {
    api.get("/categories").then((r) => setCats(r.data));
    api.get(`/challenges/${id}`).then((r) => setCh(r.data));
    api.get(`/challenges/${id}/participations`).then((r) => setParts(r.data));
  }, [id]);

  if (!ch) return <div className="p-8 text-center text-zinc-500">...</div>;

  const cat = cats.find((c) => c.key === ch.category);
  const label = cat ? cat[lang] || cat.ht : "";

  return (
    <div>
      {/* hero */}
      <div className="relative">
        <div className="relative aspect-[16/12] w-full">
          <img src={ch.cover_image} alt={ch.title} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/20" />
        </div>
        <button
          onClick={() => navigate(-1)}
          data-testid="back-button"
          className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 backdrop-blur text-white transition-transform active:scale-90"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <p className="text-xs font-bold text-[#00E5FF]">{cat?.emoji} {label}</p>
          <h1 className="font-display text-3xl font-black leading-tight tracking-tight text-white">
            {ch.title}
          </h1>
          <p className="mt-1 text-sm text-zinc-300">{ch.description}</p>
          <div className="mt-3 flex items-center gap-4 text-xs text-zinc-300">
            <span className="flex items-center gap-1"><Users size={13} /> {ch.participations_count} {t("participants")}</span>
            <span className="flex items-center gap-1"><Clock size={13} /> {t("endsIn")} 3 {t("days")}</span>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4">
        <Link
          to={`/upload?challenge=${ch.id}`}
          data-testid="participate-button"
          className="flex w-full items-center justify-center rounded-2xl bg-[#FFE800] py-3.5 font-display text-base font-black text-black transition-transform active:scale-95 hover:shadow-[0_0_24px_rgba(255,232,0,0.4)]"
        >
          {t("joinChallenge")}
        </Link>

        <h3 className="mt-6 mb-3 font-display text-lg font-black text-white">
          {t("whoWins")}
        </h3>

        {parts.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-zinc-800 p-8 text-center text-sm text-zinc-500">
            {t("noParticipations")}
          </p>
        ) : (
          <div className="space-y-4">
            {parts.map((p) => (
              <ParticipationCard key={p.id} p={p} showRank />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
