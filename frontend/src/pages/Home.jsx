import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { useLang } from "@/context/LanguageContext";
import { AppHeader } from "@/components/AppHeader";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Flame, Users, ChevronRight } from "lucide-react";

function catLabel(cat, lang) {
  return cat ? cat[lang] || cat.ht : "";
}

function ChallengeRow({ ch, cats, lang }) {
  const cat = cats.find((c) => c.key === ch.category);
  return (
    <Link
      to={`/challenge/${ch.id}`}
      data-testid={`challenge-row-${ch.id}`}
      className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900 p-3 transition-colors hover:bg-zinc-800/70 tchak-rise"
    >
      <img src={ch.cover_image} alt={ch.title} className="h-16 w-16 flex-shrink-0 rounded-xl object-cover" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-[#00E5FF]">
            {cat?.emoji} {catLabel(cat, lang)}
          </span>
        </div>
        <p className="truncate font-display font-bold text-white">{ch.title}</p>
        <p className="flex items-center gap-1 text-xs text-zinc-400">
          <Users size={11} /> {ch.participations_count}
        </p>
      </div>
      <ChevronRight className="text-zinc-600" size={20} />
    </Link>
  );
}

export default function Home() {
  const { t, lang } = useLang();
  const [featured, setFeatured] = useState(null);
  const [cats, setCats] = useState([]);
  const [today, setToday] = useState([]);
  const [trending, setTrending] = useState([]);

  useEffect(() => {
    api.get("/challenges/featured").then((r) => setFeatured(r.data));
    api.get("/categories").then((r) => setCats(r.data));
    api.get("/challenges", { params: { sort: "today" } }).then((r) => setToday(r.data));
    api.get("/challenges", { params: { sort: "trending" } }).then((r) => setTrending(r.data));
  }, []);

  const featCat = cats.find((c) => c.key === featured?.category);

  return (
    <div>
      <AppHeader />
      <div className="px-4 pt-4">
        {/* Featured */}
        {featured && (
          <Link
            to={`/challenge/${featured.id}`}
            data-testid="featured-challenge"
            className="relative block overflow-hidden rounded-3xl border border-zinc-800 tchak-rise"
          >
            <div className="relative aspect-[16/12] w-full">
              <img src={featured.cover_image} alt={featured.title} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
              <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-[#FFE800] px-3 py-1 text-xs font-black text-black">
                <Flame size={13} /> {t("challengeToday")}
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <p className="text-xs font-bold text-[#00E5FF]">
                  {featCat?.emoji} {catLabel(featCat, lang)}
                </p>
                <h2 className="font-display text-3xl font-black leading-tight tracking-tight text-white">
                  {featured.title}
                </h2>
                <p className="mt-1 line-clamp-2 text-sm text-zinc-300">{featured.description}</p>
                <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#FFE800] px-5 py-2.5 font-display text-sm font-black text-black transition-transform active:scale-95">
                  {t("joinChallenge")}
                </div>
              </div>
            </div>
          </Link>
        )}
      </div>

      {/* Trending marquee */}
      <div className="mt-5 overflow-hidden border-y border-zinc-800 bg-zinc-950/60 py-2.5">
        <div className="tchak-marquee">
          {[...trending, ...trending].map((ch, i) => (
            <span key={i} className="mx-4 font-display text-sm font-bold text-zinc-300">
              <span className="text-[#FF4D4D]">🔥</span> {ch.title}
            </span>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 pt-5">
        <Tabs defaultValue="today">
          <TabsList className="w-full bg-zinc-900 rounded-full p-1 h-12">
            <TabsTrigger
              value="today"
              data-testid="tab-today"
              className="flex-1 rounded-full font-display font-bold data-[state=active]:bg-[#FFE800] data-[state=active]:text-black text-zinc-400"
            >
              {t("todayTab")}
            </TabsTrigger>
            <TabsTrigger
              value="trending"
              data-testid="tab-trending"
              className="flex-1 rounded-full font-display font-bold data-[state=active]:bg-[#FFE800] data-[state=active]:text-black text-zinc-400"
            >
              {t("trendingTab")} 🔥
            </TabsTrigger>
          </TabsList>
          <TabsContent value="today" className="mt-4 space-y-3">
            {today.map((ch) => (
              <ChallengeRow key={ch.id} ch={ch} cats={cats} lang={lang} />
            ))}
          </TabsContent>
          <TabsContent value="trending" className="mt-4 space-y-3">
            {trending.map((ch) => (
              <ChallengeRow key={ch.id} ch={ch} cats={cats} lang={lang} />
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
