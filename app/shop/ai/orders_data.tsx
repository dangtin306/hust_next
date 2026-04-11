export type Lang = "en" | "vi";
export type ToolKey = "text_speech" | "speech_text" | "image_text";

export type SeoItem = {
  title: string;
  description: string;
  keywords: string;
};

export type ToolContent = {
  heading: string;
  summary: string[];
  audience: string[];
  examples: string[];
  related: Array<{ label: string; href: string }>;
};

export const ALLOWED_TOOLS = new Set(["speech_text", "text_speech", "image_text"] as const);

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
};

export const contentByTool: Record<ToolKey, Record<Lang, ToolContent>> = {
  text_speech: {
    en: {
      heading: "About this AI module",
      summary: [
        "This Text-to-Speech module is part of the small set of practical tools I maintain for simple media and content work. It turns written text into spoken audio for narration, accessibility, and faster content preparation.",
        "I first built this utility in an AI-related working environment and later rebuilt it into a more stable version for my own workflow. It now runs on my physical server and supports practical use cases such as guides, product descriptions, short scripts, and task documentation.",
        "It helps reduce repetitive recording work and makes voice output easier to prepare for simple content formats such as Reels and YouTube Shorts.",
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
      related: [
        { label: "System Architecture Notes", href: "/community/docs/architecture" },
        { label: "API Reference Guide", href: "/community/docs/api-reference" },
        { label: "Technical Overview", href: "/community/docs/overview" },
      ],
    },
    vi: {
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
      related: [
        { label: "System Architecture Notes", href: "/community/docs/architecture" },
        { label: "API Reference Guide", href: "/community/docs/api-reference" },
        { label: "Technical Overview", href: "/community/docs/overview" },
      ],
    },
  },
  speech_text: {
    en: {
      heading: "About this AI module",
      summary: [
        "This Speech-to-Text module is part of the small set of practical tools I maintain for simple media and content work. It turns spoken audio into editable text for faster transcription, note-taking, and everyday content preparation.",
        "I use it in workflows where audio is recorded on mobile and later converted into structured text for support, moderation, documentation, or publishing tasks. It helps reduce manual typing and makes spoken updates easier to process.",
        "For simple content and operations work, it also turns voice recordings into searchable text that can be reviewed, edited, and reused later.",
      ],
      audience: [
        "Moderators collecting incident notes quickly.",
        "Operators creating daily reports from voice memos.",
        "Users with mobile-first workflows.",
      ],
      examples: [
        "Input: 30-second voice note. Output: draft text for report editor.",
        "Input: customer call summary. Output: searchable transcript for support history.",
      ],
      related: [
        { label: "System Architecture Notes", href: "/community/docs/architecture" },
        { label: "API Reference Guide", href: "/community/docs/api-reference" },
        { label: "Technical Overview", href: "/community/docs/overview" },
      ],
    },
    vi: {
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
      related: [
        { label: "System Architecture Notes", href: "/community/docs/architecture" },
        { label: "API Reference Guide", href: "/community/docs/api-reference" },
        { label: "Technical Overview", href: "/community/docs/overview" },
      ],
    },
  },
  image_text: {
    en: {
      heading: "About this AI module",
      summary: [
        "Image-to-Text (OCR) extracts readable text from screenshots and documents, reducing manual typing in proof and verification workflows in a clean, reliable flow.",
        "Teams can convert visual evidence into searchable text, making auditing and review significantly faster and easier to manage.",
        "This is especially helpful when handling large batches of screenshots that need to be normalized before processing across different internal steps.",
      ],
      audience: [
        "Teams verifying receipts and screenshots.",
        "Editors digitizing text from images before publishing.",
        "Support teams checking user-submitted proof files.",
      ],
      examples: [
        "Input: receipt screenshot. Output: extracted amount/date text for verification.",
        "Input: image of instructions. Output: editable text for article updates.",
      ],
      related: [
        { label: "System Architecture Notes", href: "/community/docs/architecture" },
        { label: "API Reference Guide", href: "/community/docs/api-reference" },
        { label: "Technical Overview", href: "/community/docs/overview" },
      ],
    },
    vi: {
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
      related: [
        { label: "System Architecture Notes", href: "/community/docs/architecture" },
        { label: "API Reference Guide", href: "/community/docs/api-reference" },
        { label: "Technical Overview", href: "/community/docs/overview" },
      ],
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
