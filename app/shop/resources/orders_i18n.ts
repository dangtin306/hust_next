import ordersLanguageRaw from "../../../../react_app/src/order/orders_language.json";

type TranslationMap = Record<string, string>;
type OrdersLanguageConfig = {
  default_lang?: string;
  supported_langs?: string[];
  lang_alias?: Record<string, string>;
  translations?: Record<string, TranslationMap>;
};

const config = ordersLanguageRaw as OrdersLanguageConfig;

const normalizeLang = (value: string | undefined | null) =>
  String(value || "")
    .trim()
    .toLowerCase();

const defaultLang = normalizeLang(config.default_lang || "en") || "en";

const supportedLangs = new Set(
  Array.isArray(config.supported_langs)
    ? config.supported_langs.map((lang) => normalizeLang(lang)).filter(Boolean)
    : []
);

const aliasMap: Record<string, string> = Object.entries(config.lang_alias || {}).reduce(
  (acc, [from, to]) => {
    const normalizedFrom = normalizeLang(from);
    const normalizedTo = normalizeLang(to);
    if (normalizedFrom) acc[normalizedFrom] = normalizedTo || defaultLang;
    return acc;
  },
  {} as Record<string, string>
);

const translations: Record<string, TranslationMap> = Object.entries(
  config.translations || {}
).reduce((acc, [lang, table]) => {
  const normalizedLang = normalizeLang(lang);
  if (!normalizedLang) return acc;
  acc[normalizedLang] = table || {};
  return acc;
}, {} as Record<string, TranslationMap>);

const formatTemplate = (template: string, params?: Record<string, string | number>) => {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_match, key: string) => {
    const value = params[key];
    return value === undefined || value === null ? "" : String(value);
  });
};

export const resolveOrderLang = (inputLang?: string) => {
  const normalized = normalizeLang(inputLang);
  const mapped = aliasMap[normalized] || normalized;

  if (translations[mapped]) return mapped;
  if (translations[normalized]) return normalized;
  if (supportedLangs.has(normalized) && translations[defaultLang]) return defaultLang;
  return translations[defaultLang] ? defaultLang : "en";
};

export const createOrderTranslator = (inputLang?: string) => {
  const lang = resolveOrderLang(inputLang);
  const primary = translations[lang] || {};
  const fallback = translations[defaultLang] || {};

  return (key: string, params?: Record<string, string | number>) => {
    const template = primary[key] || fallback[key] || key;
    return formatTemplate(template, params);
  };
};
