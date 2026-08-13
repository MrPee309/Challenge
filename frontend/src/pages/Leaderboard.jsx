import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, mediaSrc } from "@/lib/api";
import { useLang } from "@/context/LanguageContext";
import { AppHeader } from "@/components/AppHeader";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Heart, Trophy, MapPin } from "lucide-react";

const medal = (rank) => (rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : null);

export default function Leaderboard() {
  const { t } = useLang();
  const [data, setData] = useState({ participations: [], creators: [] });

  useEffect(() => {
    api.get("/leaderboard").then((r) => setData(r.data));
  }, []);

  return (
    <div>
      <AppHeader />
      <div className="px-4 pt-4">
        <div className="flex items-center gap-2">
          <Trophy className="text-[#FFE800]" size={26} />
          <h2 className="font-display text-2xl font-black tracking-tight text-white">{t("top10")}</h2>
        </div>

        <Tabs defaultValue="posts" className="mt-4">
          <TabsList className="w-full bg-zinc-900 rounded-full p-1 h-12">
            <TabsTrigger value="posts" data-testid="tab-top-posts"
              className="flex-1 rounded-full font-display font-bold data-[state=active]:bg-[#FFE800] data-[state=active]:text-black text-zinc-400">
              {t("topParticipations")}
            </TabsTrigger>
            <TabsTrigger value="creators" data-testid="tab-top-creators"
              className="flex-1 rounded-full font-display font-bold data-[state=active]:bg-[#FFE800] data-[state=active]:text-black text-zinc-400">
              {t("topCreators")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="mt-4 space-y-2">
            {data.participations.map((p) => (
              <Link
                key={p.id}
                to={`/challenge/${p.challenge_id}`}
                data-testid={`lb-post-${p.id}`}
                className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900 p-2.5 transition-colors hover:bg-zinc-800/70 tchak-rise"
              >
                <div className="w-7 text-center font-display text-lg font-black text-zinc-500">
                  {medal(p.rank) || p.rank}
                </div>
                <img src={mediaSrc(p.media_url)} alt="" className="h-14 w-14 rounded-xl object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-white">@{p.username}</p>
                  <p className="truncate text-xs text-zinc-400">{p.challenge_title}</p>
                </div>
                <div className="flex items-center gap-1 font-bold text-[#FF4D4D]">
                  <Heart size={15} fill="#FF4D4D" /> {p.votes}
                </div>
              </Link>
            ))}
          </TabsContent>

          <TabsContent value="creators" className="mt-4 space-y-2">
            {data.creators.map((c) => (
              <Link
                key={c.id}
                to={`/u/${c.username}`}
                data-testid={`lb-creator-${c.username}`}
                className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900 p-2.5 transition-colors hover:bg-zinc-800/70 tchak-rise"
              >
                <div className="w-7 text-center font-display text-lg font-black text-zinc-500">
                  {medal(c.rank) || c.rank}
                </div>
                <img src={mediaSrc(c.avatar)} alt="" className="h-12 w-12 rounded-full object-cover border-2 border-[#FFE800]" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-white">{c.name}</p>
                  <p className="flex items-center gap-1 text-xs text-zinc-400">
                    <MapPin size={10} /> {c.location}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#FFE800]">{c.total_votes}</p>
                  <p className="text-[10px] text-zinc-500">{t("votes")}</p>
                </div>
              </Link>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
