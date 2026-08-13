import React from "react";
import { useLang } from "@/context/LanguageContext";
import { LANGS } from "@/i18n/translations";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe } from "lucide-react";

export function LangSwitcher() {
  const { lang, changeLang } = useLang();
  const current = LANGS.find((l) => l.code === lang) || LANGS[0];
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          data-testid="lang-switcher"
          className="flex items-center gap-1.5 rounded-full bg-zinc-900 border border-zinc-800 px-3 py-1.5 text-sm font-semibold text-zinc-200 transition-colors hover:bg-zinc-800 active:scale-95"
        >
          <Globe size={15} />
          <span>{current.flag}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800 text-zinc-100">
        {LANGS.map((l) => (
          <DropdownMenuItem
            key={l.code}
            data-testid={`lang-option-${l.code}`}
            onClick={() => changeLang(l.code)}
            className={`cursor-pointer gap-2 ${lang === l.code ? "text-[#FFE800]" : ""}`}
          >
            <span>{l.flag}</span> {l.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AppHeader({ title }) {
  return (
    <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/60">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-baseline gap-1.5">
          <span className="font-display font-black text-2xl tracking-tighter text-[#FFE800]">
            TCHAK
          </span>
          <span className="text-[#FF4D4D] text-lg">🔥</span>
        </div>
        {title ? (
          <span className="font-display font-bold text-sm text-zinc-300">{title}</span>
        ) : (
          <LangSwitcher />
        )}
      </div>
    </header>
  );
}
