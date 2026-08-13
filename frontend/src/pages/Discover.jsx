import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { useLang } from "@/context/LanguageContext";
import { AppHeader } from "@/components/AppHeader";
import { Users } from "lucide-react";

export default function Discover() {
  const { t, lang } = useLang();
  const [cats, setCats] = useState([]);
  const [active, setActive] = useState("all");
  const [challenges, setChallenges] = useState([]);

  useEffect(() => {
    api.get("/categories").then((r) => setCats(r.data));
  }, []);

  useEffect(() => {
    api.get("/challenges", { params: { category: active } }).then((r) => setChallenges(r.data));
  }, [active]);

  const label = (c) => (c ? c[lang] || c.ht : "");

  return (
    <div>
      <AppHeader />
      <div className="px-4 pt-4">
        <h2 className="font-display text-2xl font-black tracking-tight text-white">
          {t("categories")}
        </h2>
        <p className="text-sm text-zinc-400">{t("discoverSub")}</p>

        {/* category chips */}
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            data-testid="cat-all"
            onClick={() => setActive("all")}
            className={`rounded-full px-4 py-2 text-sm font-bold transition-transform active:scale-95 ${
              active === "all" ? "bg-[#FFE800] text-black" : "bg-zinc-900 border border-zinc-800 text-zinc-300"
            }`}
          >
            ✨ {t("allCategories")}
          </button>
          {cats.map((c) => (
            <button
              key={c.key}
              data-testid={`cat-${c.key}`}
              onClick={() => setActive(c.key)}
              className={`rounded-full px-4 py-2 text-sm font-bold transition-transform active:scale-95 ${
                active === c.key ? "bg-[#FFE800] text-black" : "bg-zinc-900 border border-zinc-800 text-zinc-300"
              }`}
            >
              {c.emoji} {label(c)}
            </button>
          ))}
        </div>

        {/* grid */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          {challenges.map((ch) => {
            const cat = cats.find((c) => c.key === ch.category);
            return (
              <Link
                key={ch.id}
                to={`/challenge/${ch.id}`}
                data-testid={`discover-challenge-${ch.id}`}
                className="relative block overflow-hidden rounded-2xl border border-zinc-800 tchak-rise"
              >
                <div className="relative aspect-square w-full">
                  <img src={ch.cover_image} alt={ch.title} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-[10px] font-bold text-[#00E5FF]">{cat?.emoji} {label(cat)}</p>
                    <p className="font-display text-sm font-black leading-tight text-white line-clamp-2">
                      {ch.title}
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-[10px] text-zinc-300">
                      <Users size={10} /> {ch.participations_count}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
