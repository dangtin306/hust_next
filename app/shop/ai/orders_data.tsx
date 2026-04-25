export type Lang = "en" | "vi";
export type ToolKey = "text_speech" | "speech_text" | "image_text" | "translate_vi_en";

export type SeoItem = {
  title: string;
  description: string;
  keywords: string;
};

export type ToolProcessCard = {
  key: ToolKey;
  image: string;
  href: (routeRoot: "plans" | "orders_once") => string;
  title: Record<Lang, string>;
  description: Record<Lang, string>;
  badge: Record<Lang, string>;
};

export type ToolContent = {
  title: string;
  heading: string;
  summary: string[];
  audience: string[];
  examples: string[];
  readerValueTitle: string;
  readerValue: string;
  conclusionTitle: string;
  conclusion: string;
  related: Array<{ label: string; href: string }>;
};

export const ALLOWED_TOOLS = new Set(["speech_text", "text_speech", "image_text", "translate_vi_en"] as const);

export const seoByTool: Record<ToolKey, Record<Lang, SeoItem>> = {
  text_speech: {
    en: {
      title: "Text to Speech (TTS) — AI Voice Generator",
      description: "Convert text into natural-sounding speech for narration, learning, and accessibility.",
      keywords: "text to speech, TTS, AI voice, voice generator, narration, accessibility, Vietnamese TTS",
    },
    vi: {
      title: "Chuyen van ban thanh giong noi (Text to Speech)",
      description: "Cong cu chuyen van ban thanh giong noi phuc vu thuyet minh noi dung, hoc tap va tro nang.",
      keywords: "chuyen van ban thanh giong noi, text to speech, TTS, giong noi AI, doc van ban, tro nang, tieng Viet",
    },
  },
  speech_text: {
    en: {
      title: "Speech to Text (STT) — Audio Transcription",
      description: "Transcribe speech into text to speed up note-taking, reporting, and content editing.",
      keywords: "speech to text, STT, transcription, audio to text, voice to text, meeting notes, Vietnamese STT",
    },
    vi: {
      title: "Chuyen giong noi thanh van ban (Speech to Text)",
      description: "Cong cu chuyen giong noi thanh van ban giup ghi chu nhanh, tao bao cao va chinh sua noi dung.",
      keywords: "chuyen giong noi thanh van ban, speech to text, STT, phien am, ghi chu, audio to text, tieng Viet",
    },
  },
  image_text: {
    en: {
      title: "Image to Text (OCR) — Extract Text from Images",
      description: "Extract readable text from images and screenshots (OCR) to reduce manual typing and support verification.",
      keywords: "image to text, OCR, extract text, screenshot to text, document OCR, receipt OCR, text recognition",
    },
    vi: {
      title: "Trich xuat chu tu hinh anh (OCR)",
      description: "Cong cu OCR trich xuat chu tu anh va anh chup man hinh, ho tro nhap lieu nhanh va kiem chung thong tin.",
      keywords: "OCR, chuyen hinh anh sang chu, trich xuat chu, nhan dang ky tu, anh chup man hinh, tai lieu",
    },
  },
  translate_vi_en: {
    en: {
      title: "Vietnamese to English — Translation Utility",
      description: "Translate Vietnamese text into clear English for practical content workflows.",
      keywords: "vietnamese to english, translation, ai translation, content workflow",
    },
    vi: {
      title: "Dich tieng Viet sang tieng Anh",
      description: "Cong cu dich tieng Viet sang tieng Anh de dung trong quy trinh noi dung.",
      keywords: "dich tieng viet sang tieng anh, translation, ai translation, content workflow",
    },
  },
};

export const contentByTool: Record<ToolKey, Record<Lang, ToolContent>> = {
  text_speech: {
    en: {
      title: "Text to Speech",
      heading: "About this AI module",
      summary: [
        "This Text-to-Speech module is one of the practical utilities I maintain for simple media and content work. It turns written text into spoken audio for narration, accessibility, and faster content preparation.",
        "I first built it in an AI-related working environment and later rebuilt it into a more stable version for my own use. It now runs on my physical server and supports guides, product descriptions, short scripts, and task documentation.",
        "It helps reduce repetitive recording work and makes voice output easier to prepare for Reels and YouTube Shorts.",
      ],
      audience: [
        "Creators working on tutorials, explainers, and short social content.",
        "Support teams that need quick voice output for guides and onboarding.",
        "Students and mobile users who prefer listening instead of reading.",
      ],
      examples: [
        "Input: Product description paragraph. Output: Short narrated audio for social posts.",
        "Input: Task instructions. Output: Short voice summary for collaborators.",
      ],
      readerValueTitle: "Reader Value",
      readerValue:
        "Readers can use this module pattern to turn text-based content into a more structured voice workflow for guides, documentation, and short-form media tasks. In real projects, that helps reduce repetitive manual recording, keep output handling more consistent, and support stable operation across integrated content flows.",
      conclusionTitle: "Conclusion",
      conclusion:
        "This Text-to-Speech module combines controlled request handling, reusable model paths, and a practical export flow into one maintainable service layer. It stays aligned with the platform’s broader system integration and stable operation model.",
      related: [
        { label: "System Architecture Notes", href: "/community/docs/architecture" },
        { label: "API Reference Guide", href: "/community/docs/api-reference" },
        { label: "Technical Overview", href: "/community/docs/overview" },
      ],
    },
    vi: {
      title: "Chuyen van ban thanh giong noi",
      heading: "Gioi thieu mo-dun AI",
      summary: [
        "Mo-dun nay chuyen van ban thanh giong noi de doi van hanh va nguoi tao noi dung xuat ban ban doc nhanh hon, dong thoi cai thien tro nang cho nguoi dung thich nghe hon doc.",
        "Cong cu duoc thiet ke theo huong tien ich thuc dung trong luong Hust: mo ta san pham, huong dan, noi dung nhiem vu va thong tin ho tro deu co the tao ban audio ngan.",
        "Khi dung thuc te, cong cu giup giam thao tac thu am lap lai va giu chat luong giong doc on dinh giua nhieu chien dich.",
      ],
      audience: [
        "Nguoi lam noi dung can tao giong doc cho bai huong dan.",
        "Team CSKH can audio onboarding hoac huong dan nhanh.",
        "Nguoi dung mobile/sinh vien muon tiep nhan noi dung bang nghe.",
      ],
      examples: [
        "Input: Mo ta san pham dai. Output: File doc de gan vao bai dang.",
        "Input: Checklist nhiem vu. Output: Ban tom tat giong noi cho cong tac vien.",
      ],
      readerValueTitle: "Reader Value",
      readerValue: "",
      conclusionTitle: "Conclusion",
      conclusion: "",
      related: [
        { label: "System Architecture Notes", href: "/community/docs/architecture" },
        { label: "API Reference Guide", href: "/community/docs/api-reference" },
        { label: "Technical Overview", href: "/community/docs/overview" },
      ],
    },
  },
  speech_text: {
    en: {
      title: "Speech to Text",
      heading: "About this AI module",
      summary: [
        "This Speech-to-Text module is part of the small set of practical utilities I maintain for simple media and content work. It turns spoken audio into editable text for faster transcription, note-taking, and content preparation.",
        "I use it where audio is recorded on mobile and later converted into structured text for support, documentation, moderation, or publishing tasks. It helps reduce manual typing and makes spoken updates easier to handle.",
        "It also turns voice recordings into searchable text that can be reviewed, edited, and reused later.",
      ],
      audience: [
        "People who need to turn short voice recordings into editable text.",
        "Teams handling notes, updates, or simple reporting from audio.",
        "Mobile users who prefer speaking first and editing later.",
      ],
      examples: [
        "Input: Short voice note. Output: Draft text for reporting.",
        "Input: Customer call recording. Output: Searchable transcript for support history.",
      ],
      readerValueTitle: "Reader Value",
      readerValue:
        "Readers can use this module pattern to turn spoken updates into a more structured text workflow for reporting, documentation, and support tasks. In real projects, that helps reduce manual note-taking, keep transcription handling more consistent, and support stable operation across integrated content flows.",
      conclusionTitle: "Conclusion",
      conclusion:
        "This Speech-to-Text module combines controlled audio input handling, a reusable transcription path, and practical output processing into one maintainable service layer. It keeps the transcription workflow more consistent within the broader system architecture.",
      related: [
        { label: "System Architecture Notes", href: "/community/docs/architecture" },
        { label: "API Reference Guide", href: "/community/docs/api-reference" },
        { label: "Technical Overview", href: "/community/docs/overview" },
      ],
    },
    vi: {
      title: "Chuyen giong noi thanh van ban",
      heading: "Gioi thieu mo-dun AI",
      summary: [
        "Speech-to-Text chuyen ghi am thanh van ban co the chinh sua de rut ngan thoi gian nhap lieu trong cac luong bao cao va van hanh.",
        "Trong thuc te, nguoi dung thuong ghi am nhanh tren dien thoai roi can chuyen thanh van ban chuan de luu tru, tim kiem va xu ly tiep.",
        "Cong cu cung tang kha nang truy vet vi thong tin giong noi duoc chuyen thanh du lieu van ban co the tim lai de dang.",
      ],
      audience: [
        "Dieu phoi vien can ghi nhan thong tin su co nhanh.",
        "Team van hanh can tao bao cao hang ngay tu voice note.",
        "Nguoi dung lam viec chu yeu tren mobile.",
      ],
      examples: [
        "Input: Ghi am 30 giay. Output: Ban nhap van ban cho editor.",
        "Input: Tom tat cuoc goi ho tro. Output: Transcript de tim kiem lai.",
      ],
      readerValueTitle: "Reader Value",
      readerValue: "",
      conclusionTitle: "Conclusion",
      conclusion: "",
      related: [
        { label: "System Architecture Notes", href: "/community/docs/architecture" },
        { label: "API Reference Guide", href: "/community/docs/api-reference" },
        { label: "Technical Overview", href: "/community/docs/overview" },
      ],
    },
  },
  image_text: {
    en: {
      title: "Image to Text",
      heading: "About this AI module",
      summary: [
        "This Image-to-Text module is part of the small set of practical utilities I maintain for simple media and content work. It extracts readable text from screenshots and documents for faster verification, note-taking, and content preparation.",
        "I use it when image files need to be turned into searchable text for review, documentation, or simple processing tasks. It helps reduce manual typing and makes text checking easier.",
        "It is especially useful for screenshots, receipts, forms, and other image-based records.",
      ],
      audience: [
        "People who need to extract text from screenshots and documents.",
        "Teams reviewing receipts, forms, or proof images.",
        "Editors and support teams working with image-based records.",
      ],
      examples: [
        "Input: Screenshot of a receipt. Output: Readable text for checking details.",
        "Input: Image of instructions. Output: Editable text for later updates.",
      ],
      readerValueTitle: "Reader Value",
      readerValue:
        "Readers can use this module pattern to turn screenshots, receipts, and image-based records into a more structured text workflow for review, documentation, and verification tasks. In real projects, that helps reduce manual typing, keep extraction handling more consistent, and support stable operation across image-based content flows.",
      conclusionTitle: "Conclusion",
      conclusion:
        "This Image-to-Text module combines a controlled OCR path, rule-based region handling, and post-check processing into one maintainable service layer. It remains a practical internal OCR component aligned with the platform's broader system integration and stable operation model.",
      related: [
        { label: "System Architecture Notes", href: "/community/docs/architecture" },
        { label: "API Reference Guide", href: "/community/docs/api-reference" },
        { label: "Technical Overview", href: "/community/docs/overview" },
      ],
    },
    vi: {
      title: "Chuyen hinh anh thanh van ban",
      heading: "Gioi thieu mo-dun AI",
      summary: [
        "OCR giup trich xuat chu tu anh, anh chup man hinh va tai lieu de giam thao tac nhap lieu thu cong trong cac buoc kiem chung.",
        "Thong tin dang anh se duoc chuyen thanh van ban co the tim kiem, loc va tai su dung trong quy trinh xu ly noi dung.",
        "Dac biet hieu qua khi xu ly so luong lon anh minh chung can chuan hoa truoc khi dua vao cac buoc van hanh tiep theo.",
      ],
      audience: [
        "Nhom kiem duyet can doc nhanh noi dung tu anh minh chung.",
        "Editor can so hoa chu tu anh truoc khi bien tap.",
        "CSKH can tra cuu thong tin nguoi dung gui bang screenshot.",
      ],
      examples: [
        "Input: Anh bien lai. Output: Text so tien/ngay thang de doi soat.",
        "Input: Anh huong dan cu. Output: Van ban chinh sua de cap nhat bai viet.",
      ],
      readerValueTitle: "Reader Value",
      readerValue: "",
      conclusionTitle: "Conclusion",
      conclusion: "",
      related: [
        { label: "System Architecture Notes", href: "/community/docs/architecture" },
        { label: "API Reference Guide", href: "/community/docs/api-reference" },
        { label: "Technical Overview", href: "/community/docs/overview" },
      ],
    },
  },
  translate_vi_en: {
    en: {
      title: "Vietnamese to English",
      heading: "About this AI module",
      summary: [
        "This Vietnamese-to-English module is one of the practical utilities I maintain for content work. It translates Vietnamese text into English for articles, documentation, product content, and internal use.",
        "I use it when Vietnamese notes, drafts, or HTML content need English output without changing the rest of the workflow. It reduces manual rewriting and supports review and publishing.",
        "In the current version, the module runs on my Flask AI server with a fixed VI-to-EN path. It supports both text and HTML input.",
      ],
      audience: [
        "People turning Vietnamese notes or drafts into English.",
        "Teams preparing English articles, docs, or support content.",
        "Users who need a simple VI-to-EN step for review or publishing.",
      ],
      examples: [
        "Input: Vietnamese draft note. Output: English version for review.",
        "Input: Vietnamese product or support text. Output: English for publishing.",
      ],
      readerValueTitle: "Reader Value",
      readerValue:
        "Readers can use this module pattern to turn Vietnamese notes, drafts, and support content into a more structured English workflow for review and publishing. In real projects, that helps reduce manual rewriting, keep translation handling more consistent, and support stable operation across content-focused workflows.",
      conclusionTitle: "Conclusion",
      conclusion:
        "This Vietnamese-to-English module combines controlled translation routing, fixed language direction, and practical text handling into one maintainable service layer. It remains aligned with the platform's broader system integration and stable operation model.",
      related: [{ label: "hello world", href: "/next/orders_once/translate_vi_en" }],
    },
    vi: {
      title: "Dich tieng Viet sang tieng Anh",
      heading: "Gioi thieu mo-dun AI",
      summary: ["hello world"],
      audience: ["hello world"],
      examples: [
        "Input: Vietnamese draft note. Output: English version for review.",
        "Input: Vietnamese product or support text. Output: English for publishing.",
      ],
      readerValueTitle: "Reader Value",
      readerValue: "",
      conclusionTitle: "Conclusion",
      conclusion: "",
      related: [{ label: "hello world", href: "/next/orders_once/translate_vi_en" }],
    },
  },
};

export const toolTabs: Array<{ key: ToolKey; en: string; vi: string }> = [
  {
    key: "text_speech",
    en: "Text to Speech",
    vi: "Chuyen van ban thanh giong noi",
  },
  {
    key: "speech_text",
    en: "Speech to Text",
    vi: "Chuyen giong noi thanh van ban",
  },
  {
    key: "image_text",
    en: "Image to Text",
    vi: "Chuyen hinh anh thanh van ban",
  },
];

export const toolProcessCards: ToolProcessCard[] = [
  {
    key: "text_speech",
    image: "https://hust.media/img/text_speech_thumbnail.png",
    href: (routeRoot) => `/${routeRoot}/text_speech`,
    title: { en: "Text to Speech", vi: "Van ban to Giong noi" },
    description: {
      en: "Turn written text into natural-sounding audio for narration and accessibility.",
      vi: "Chuyen van ban thanh am thanh tu nhien de thuyet minh va tro nang.",
    },
    badge: { en: "Integration", vi: "Integration" },
  },
  {
    key: "speech_text",
    image: "https://hust.media/img/speech_text_thumbnail.png",
    href: (routeRoot) => `/${routeRoot}/speech_text`,
    title: { en: "Speech to Text", vi: "Giong noi to Van ban" },
    description: {
      en: "Transcribe spoken audio into editable text to speed up notes and reporting.",
      vi: "Phien am giong noi thanh van ban de ghi chu va bao cao nhanh hon.",
    },
    badge: { en: "Integration", vi: "Integration" },
  },
  {
    key: "image_text",
    image: "https://hust.media/img/image_text_thumbnail.png",
    href: (routeRoot) => `/${routeRoot}/image_text`,
    title: { en: "Image to Text", vi: "Hinh anh to Van ban" },
    description: {
      en: "Extract readable text from images (OCR) to reduce manual typing.",
      vi: "Trich xuat chu tu anh (OCR) de giam nhap lieu thu cong.",
    },
    badge: { en: "Integration", vi: "Integration" },
  },
  {
    key: "translate_vi_en",
    image: "https://hust.media/img/translate_vi_en_thumb.png",
    href: () => "/next/orders_once/translate_vi_en",
    title: { en: "Vietnamese to English", vi: "Dich Viet sang Anh" },
    description: {
      en: "Translate Vietnamese text into clear English for docs and content.",
      vi: "Dich van ban tieng Viet sang tieng Anh ro rang cho noi dung va tai lieu.",
    },
    badge: { en: "Integration", vi: "Integration" },
  },
];
