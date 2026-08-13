import React from "react";
import { NavLink } from "react-router-dom";
import { Home, Compass, Plus, Trophy, User } from "lucide-react";
import { useLang } from "@/context/LanguageContext";

const items = [
  { to: "/", icon: Home, key: "nav_home", testid: "nav-home" },
  { to: "/discover", icon: Compass, key: "nav_discover", testid: "nav-discover" },
  { to: "/upload", icon: Plus, key: "nav_upload", testid: "nav-upload", primary: true },
  { to: "/leaderboard", icon: Trophy, key: "nav_leaderboard", testid: "nav-leaderboard" },
  { to: "/profile", icon: User, key: "nav_profile", testid: "nav-profile" },
];

export function BottomNav() {
  const { t } = useLang();
  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50 px-3 pb-3 pt-2"
      data-testid="bottom-nav"
    >
      <div className="flex items-center justify-between rounded-3xl bg-zinc-950/80 backdrop-blur-xl border border-zinc-800/80 px-2 py-2 shadow-2xl">
        {items.map((it) => {
          const Icon = it.icon;
          if (it.primary) {
            return (
              <NavLink
                key={it.to}
                to={it.to}
                data-testid={it.testid}
                className="flex items-center justify-center h-12 w-12 rounded-2xl bg-[#FFE800] text-black transition-transform duration-200 active:scale-90 hover:shadow-[0_0_20px_rgba(255,232,0,0.5)]"
              >
                <Icon size={26} strokeWidth={2.6} />
              </NavLink>
            );
          }
          return (
            <NavLink
              key={it.to}
              to={it.to}
              data-testid={it.testid}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-3 py-1 transition-colors duration-200 ${
                  isActive ? "text-[#FFE800]" : "text-zinc-500 hover:text-zinc-300"
                }`
              }
            >
              <Icon size={22} strokeWidth={2.2} />
              <span className="text-[10px] font-semibold">{t(it.key)}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
