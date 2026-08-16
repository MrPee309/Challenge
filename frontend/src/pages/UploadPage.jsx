
import React, { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useLang } from "@/context/LanguageContext";
import { AppHeader } from "@/components/AppHeader";
import { Textarea } from "@/components/ui/textarea";
import { UploadCloud, ImagePlus, X } from "lucide-react";
import { toast } from "sonner";

export default function UploadPage() {
  const { t, lang } = useLang();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const fileRef = useRef();

  const [challenges, setChallenges] = useState([]);
  const [cats, setCats] = useState([]);
  const [challengeId, setChallengeId] = useState(params.get("challenge") || "");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [caption, setCaption] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get("/categories").then((r) => setCats(r.data));
    api.get("/challenges").then((r) => {
      setChallenges(r.data);
      if (!challengeId && r.data.length) setChallengeId(r.data[0].id);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const submit = async () => {
    if (!challengeId) return toast.error(t("chooseChallenge"));
    if (!file) return toast.error(t("addMedia"));
    setBusy(true);
    const fd = new FormData();
    fd.append("challenge_id", challengeId);
    fd.append("caption", caption);
    fd.append("file", file);
    try {
      await api.post("/participations", fd, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success(t("posted"));
      navigate(`/challenge/${challengeId}`);
    } catch (e) {
      toast.error("Erè pandan pibliye a");
    } finally {
      setBusy(false);
    }
  };

  const label = (c) => (c ? c[lang] || c.ht : "");
  const isVideo = file && file.type.startsWith("video");

  return (
    <div>
      <AppHeader />
      <div className="px-4 pt-4">
        <h2 className="font-display text-2xl font-black tracking-tight text-white">{t("uploadTitle")}</h2>
        <p className="text-sm text-zinc-400">{t("uploadSub")}</p>

        {/* challenge select */}
        <label className="mt-5 block text-sm font-bold text-zinc-300">{t("chooseChallenge")}</label>
        <select
          data-testid="upload-challenge-select"
          value={challengeId}
          onChange={(e) => setChallengeId(e.target.value)}
          className="mt-2 h-12 w-full rounded-2xl bg-zinc-900 border border-zinc-800 px-3 text-white focus:outline-none focus:ring-2 focus:ring-[#FFE800]"
        >
          {challenges.map((ch) => {
            const cat = cats.find((c) => c.key === ch.category);
            return (
              <option key={ch.id} value={ch.id}>
                {cat?.emoji} {ch.title}
              </option>
            );
          })}
        </select>

        {/* media */}
        <label className="mt-5 block text-sm font-bold text-zinc-300">{t("addMedia")}</label>
        <input
          ref={fileRef}
          type="file"
          accept="image/*,video/*"
          onChange={onFile}
          className="hidden"
          data-testid="upload-file-input"
        />
        {!preview ? (
          <button
            data-testid="upload-file-trigger"
            onClick={() => fileRef.current?.click()}
            className="mt-2 flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-zinc-700 bg-zinc-900/50 text-zinc-400 transition-colors hover:border-[#FFE800] hover:text-[#FFE800]"
          >
            <ImagePlus size={40} />
            <span className="font-bold">{t("selectFile")}</span>
          </button>
        ) : (
          <div className="relative mt-2 overflow-hidden rounded-2xl border border-zinc-800">
            {isVideo ? (
              <video src={preview} className="aspect-[4/3] w-full object-cover" controls playsInline />
            ) : (
              <img src={preview} alt="preview" className="aspect-[4/3] w-full object-cover" />
            )}
            <button
              onClick={() => { setFile(null); setPreview(""); }}
              className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-black/70 text-white"
              data-testid="upload-remove"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* caption */}
        <Textarea
          data-testid="upload-caption"
          placeholder={t("caption")}
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          className="mt-4 rounded-2xl bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 focus-visible:ring-[#FFE800]"
        />

        <button
          onClick={submit}
          disabled={busy}
          data-testid="upload-submit"
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#FFE800] py-3.5 font-display text-base font-black text-black transition-transform active:scale-95 hover:shadow-[0_0_24px_rgba(255,232,0,0.4)] disabled:opacity-60"
        >
          <UploadCloud size={20} /> {busy ? t("posting") : t("post")}
        </button>
      </div>
    </div>
  );
}
