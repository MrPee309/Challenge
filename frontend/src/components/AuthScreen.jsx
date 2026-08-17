import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLang } from "@/context/LanguageContext";
import { LangSwitcher } from "@/components/AppHeader";
import { formatApiError } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const LOCATIONS = [
  "Abricots", "Anse-à-Foleur", "Anse-à-Galets", "Anse-à-Pitres", "Anse-à-Veau",
  "Anse-d'Hainault", "Anse-Rouge", "Aquin", "Arcahaie", "Arniquet",
  "Bahon", "Bainet", "Baie-de-Henne", "Baradères", "Bas-Limbé",
  "Bassin-Bleu", "Beaumont", "Belladère", "Belle-Anse", "Bombardopolis",
  "Borgne", "Boucan-Carré", "Cabaret", "Camp-Perrin", "Cap-Haïtien",
  "Capotille", "Caracol", "Carrefour", "Cavaillon", "Cayes-Jacmel",
  "Cerca-Carvajal", "Cerca-la-Source", "Chambellan", "Chansolme", "Chantal",
  "Chardonnières", "Cité Soleil", "Corail", "Cornillon", "Côtes-de-Fer",
  "Croix-des-Bouquets", "Dame-Marie", "Delmas", "Desdunes", "Dessalines",
  "Dondon", "Ennery", "Fermathe", "Ferrier", "Fonds-des-Nègres",
  "Fonds-Verrettes", "Fort-Liberté", "Ganthier", "Gonaïves", "Grand-Goâve",
  "Grande-Rivière-du-Nord", "Grande-Saline", "Gressier", "Gros-Morne",
  "Hinche", "Île-à-Vache", "Jacmel", "Jean-Rabel", "Jérémie", "Kenscoff",
  "L'Asile", "L'Estère", "La Chapelle", "La Tortue", "La Vallée",
  "Lascahobas", "Léogâne", "Les Anglais", "Les Cayes", "Les Irois",
  "Limbé", "Limonade", "Maïssade", "Maniche", "Marigot", "Marmelade",
  "Miragoâne", "Milot", "Mirebalais", "Mombin-Crochu", "Môle-Saint-Nicolas",
  "Mont-Organisé", "Moron", "Ouanaminthe", "Paillant", "Perches",
  "Pestel", "Petit-Goâve", "Petit-Trou-de-Nippes", "Petite-Rivière-de-l'Artibonite",
  "Petite-Rivière-de-Nippes", "Pétion-Ville", "Pignon", "Pilate",
  "Plaine-du-Nord", "Plaisance", "Pointe-à-Raquette", "Port-à-Piment",
  "Port-au-Prince", "Port-de-Paix", "Port-Margot", "Port-Salut",
  "Ranquitte", "Roche-à-Bateau", "Roseaux", "Saint-Jean-du-Sud",
  "Saint-Louis-du-Sud", "Saint-Marc", "Saint-Michel-de-l'Attalaye",
  "Saint-Raphaël", "Sainte-Suzanne", "Saut-d'Eau", "Savanette", "Tabarre",
  "Terre-Neuve", "Terrier-Rouge", "Thiotte", "Thomassique", "Thomazeau",
  "Thomonde", "Torbeck", "Trou-du-Nord", "Vallières", "Verrettes",
  "Vieux-Bourg-d'Aquin",
];

export function AuthScreen() {
  const { login, register } = useAuth();
  const { t } = useLang();
  const [mode, setMode] = useState("register");
  const [form, setForm] = useState({
    email: "", password: "", name: "", username: "", location: "Port-au-Prince",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [justRegistered, setJustRegistered] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const v = params.get("verify");
    if (v === "ok") {
      toast.success("Imel konfime! Ou ka konekte kounye a. 🔥");
      setMode("login");
    } else if (v === "invalid") {
      toast.error("Lyen konfimasyon an pa valab oswa li deja itilize.");
    }
    if (v) {
      params.delete("verify");
      const rest = params.toString();
      window.history.replaceState({}, "", window.location.pathname + (rest ? `?${rest}` : ""));
    }
  }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    if (e) e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (mode === "login") {
        await login(form.email, form.password);
        toast.success("🔥");
      } else {
        await register(form);
        setJustRegistered(true);
      }
    } catch (err) {
      const msg = err.response
        ? formatApiError(err.response?.data?.detail)
        : (err.message || "Yon erè rive. Eseye ankò.");
      setError(msg);
    } finally {
      setBusy(false);
    }
  };

  if (justRegistered) {
    return (
      <div className="grain relative min-h-screen w-full max-w-md mx-auto overflow-hidden bg-[#050505]">
        <div className="pointer-events-none absolute -top-24 -right-16 h-64 w-64 rounded-full bg-[#FFE800] opacity-20 blur-[90px]" />
        <div className="relative flex min-h-screen flex-col items-center justify-center px-6 py-8 text-center">
          <span className="text-6xl">📬</span>
          <h1 className="mt-5 font-display text-2xl font-black text-white">Tcheke imel ou!</h1>
          <p className="mt-3 text-sm text-zinc-400">
            Nou voye yon lyen konfimasyon nan <span className="font-bold text-white">{form.email}</span>.
            Klike sou lyen an pou aktive kont ou anvan w ka konekte.
          </p>
          <button
            onClick={() => { setJustRegistered(false); setMode("login"); setError(""); }}
            className="mt-8 h-12 w-full rounded-2xl bg-[#FFE800] font-display text-base font-black text-black"
          >
            Ale nan paj konekte
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grain relative min-h-screen w-full max-w-md mx-auto overflow-hidden bg-[#050505]">
      {/* glow accents */}
      <div className="pointer-events-none absolute -top-24 -right-16 h-64 w-64 rounded-full bg-[#FFE800] opacity-20 blur-[90px]" />
      <div className="pointer-events-none absolute top-40 -left-20 h-56 w-56 rounded-full bg-[#FF4D4D] opacity-20 blur-[90px]" />

      <div className="relative flex min-h-screen flex-col px-6 py-8">
        <div className="flex justify-end">
          <LangSwitcher />
        </div>

        <div className="mt-8 mb-8 tchak-rise">
          <div className="flex items-baseline gap-2">
            <h1 className="font-display font-black text-6xl tracking-tighter text-[#FFE800]">
              TCHAK
            </h1>
            <span className="text-3xl">🔥</span>
          </div>
          <p className="mt-2 font-display text-xl font-bold text-white">{t("authWelcome")}</p>
          <p className="mt-1 text-sm text-zinc-400">{t("authSub")}</p>
          <p className="mt-3 inline-block rounded-full bg-zinc-900 border border-zinc-800 px-3 py-1 text-xs font-bold text-[#00E5FF]">
            {t("slogan")}
          </p>
        </div>

        <form onSubmit={submit} className="space-y-3 tchak-rise" style={{ animationDelay: "0.1s" }}>
          {mode === "register" && (
            <>
              <Input
                data-testid="auth-name"
                placeholder={t("name")}
                value={form.name}
                onChange={set("name")}
                required
                className="h-12 rounded-2xl bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 focus-visible:ring-[#FFE800]"
              />
              <Input
                data-testid="auth-username"
                placeholder={t("username")}
                value={form.username}
                onChange={set("username")}
                required
                className="h-12 rounded-2xl bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 focus-visible:ring-[#FFE800]"
              />
              <select
                data-testid="auth-location"
                value={form.location}
                onChange={set("location")}
                className="h-12 w-full rounded-2xl bg-zinc-900 border border-zinc-800 px-3 text-white focus:outline-none focus:ring-2 focus:ring-[#FFE800]"
              >
                {LOCATIONS.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </>
          )}
          <Input
            data-testid="auth-email"
            type="email"
            placeholder={t("email")}
            value={form.email}
            onChange={set("email")}
            required
            className="h-12 rounded-2xl bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 focus-visible:ring-[#FFE800]"
          />
          <Input
            data-testid="auth-password"
            type="password"
            placeholder={t("password")}
            value={form.password}
            onChange={set("password")}
            required
            className="h-12 rounded-2xl bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 focus-visible:ring-[#FFE800]"
          />

          {error && (
            <p data-testid="auth-error" className="text-sm font-semibold text-[#FF4D4D]">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            data-testid="auth-submit"
            className="h-13 w-full rounded-2xl bg-[#FFE800] py-3.5 font-display text-base font-black text-black transition-transform duration-200 active:scale-95 hover:shadow-[0_0_28px_rgba(255,232,0,0.45)] disabled:opacity-60"
          >
            {busy ? "..." : mode === "login" ? t("login") : t("register")}
          </button>
        </form>

        <button
          data-testid="auth-toggle"
          onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
          className="mt-5 text-center text-sm font-semibold text-zinc-400 transition-colors hover:text-[#FFE800]"
        >
          {mode === "login" ? t("createBtn") : t("loginBtn")}
        </button>

        <p className="mt-auto pt-8 text-center text-xs text-zinc-600">
          {t("tagline")} · #TCHAK
        </p>
      </div>
    </div>
  );
}
