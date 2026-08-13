import React, { createContext, useContext, useState, useCallback } from "react";
import { translations } from "@/i18n/translations";

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem("tchak_lang") || "ht");

  const changeLang = useCallback((code) => {
    localStorage.setItem("tchak_lang", code);
    setLang(code);
  }, []);

  const t = useCallback(
    (key) => (translations[lang] && translations[lang][key]) || translations.ht[key] || key,
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, changeLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLang = () => useContext(LanguageContext);
