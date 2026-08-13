import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api, mediaSrc } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useLang } from "@/context/LanguageContext";
import { AppHeader, LangSwitcher } from "@/components/AppHeader";
import { ParticipationCard } from "@/components/ParticipationCard";
import { MapPin, LogOut, Trophy, Heart, Grid3x3 } from "lucide-react";

export default function Profile() {
  const { username } = useParams();
  const { user, logout } = useAuth();
  const { t } = useLang();
  const [data, setData] = useState(null);

  const targetUsername = username || user?.username;
  const isOwn = !username || username === user?.username;

  useEffect(() => {
    if (!targetUsername) return;
    api.get(`/users/${targetUsername}`).then((r) => setData(r.data));
  }, [targetUsername]);

  if (!data) return <div className="p-8 text-center text-zinc-500">...</div>;
  const u = data.user;

  const Stat = ({ icon: Icon, value, label, testid }) => (
    <div className="flex-1 rounded-2xl bg-zinc-900 border border-zinc-800 py-3 text-center" data-testid={testid}>
      <Icon size={18} className="mx-auto text-[#FFE800]" />
      <p className="mt-1 font-display text-xl font-black text-white">{value}</p>
      <p className="text-[10px] uppercase tracking-wide text-zinc-500">{label}</p>
    </div>
  );

  return (
    <div>
      <AppHeader />
      <div className="px-4 pt-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <img
              src={mediaSrc(u.avatar)}
              alt={u.name}
              className="h-20 w-20 rounded-2xl object-cover border-2 border-[#FFE800]"
              data-testid="profile-avatar"
            />
            <div>
              <h2 className="font-display text-xl font-black text-white" data-testid="profile-name">{u.name}</h2>
              <p className="text-sm text-zinc-400">@{u.username}</p>
              <p className="mt-1 flex items-center gap-1 text-xs text-zinc-400">
                <MapPin size={12} /> {u.location}
              </p>
            </div>
          </div>
          {isOwn && <LangSwitcher />}
        </div>

        {u.bio && <p className="mt-3 text-sm text-zinc-300">{u.bio}</p>}

        <div className="mt-4 flex gap-2">
          <Stat icon={Trophy} value={u.wins} label={t("stats_wins")} testid="stat-wins" />
          <Stat icon={Heart} value={u.total_votes} label={t("stats_votes")} testid="stat-votes" />
          <Stat icon={Grid3x3} value={u.participations_count} label={t("stats_posts")} testid="stat-posts" />
        </div>

        {isOwn && (
          <button
            onClick={logout}
            data-testid="logout-button"
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-900 py-3 font-bold text-[#FF4D4D] transition-colors hover:bg-zinc-800"
          >
            <LogOut size={18} /> {t("logout")}
          </button>
        )}

        <h3 className="mt-6 mb-3 font-display text-lg font-black text-white">{t("yourParticipations")}</h3>
        {data.participations.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-zinc-800 p-8 text-center text-sm text-zinc-500">
            {t("noParticipations")}
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {data.participations.map((p) => (
              <ParticipationCard key={p.id} p={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
