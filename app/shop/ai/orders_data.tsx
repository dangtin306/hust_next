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
        "This module converts plain text into speech so teams can publish narrated content faster and improve accessibility for users who prefer listening.",
        "It is designed as a practical utility inside the Hust workflow, where creators, students, and operations teams need quick voice output for guides, product descriptions, and task documentation.",
        "In production use, this helps reduce repetitive recording work and keeps voice quality consistent across different campaigns.",
      ],
      audience: [
        "Content creators writing tutorials and explainer posts.",
        "Support teams producing short voice guides for onboarding.",
        "Students and mobile users who prefer listening over reading.",
      ],
      examples: [
        "Input: Product description paragraph. Output: playable narration for social posts.",
        "Input: Task instructions. Output: short voice briefing for collaborators.",
      ],
      related: [
        { label: "Development services", href: "/services/development" },
        { label: "Support workflow guidelines", href: "/support" },
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
        { label: "Tong quan tinh nang cong dong", href: "/community/features" },
        { label: "Trang ho tro ky thuat", href: "/support" },
      ],
    },
  },
  speech_text: {
    en: {
      heading: "About this AI module",
      summary: [
        "Speech-to-Text turns voice notes into editable text so teams can draft reports and logs faster without heavy typing, in a simple and practical way.",
        "This is useful in real operations where users capture audio on mobile and then need structured text for moderation, support, or publishing flows with less manual effort.",
        "It also improves traceability because spoken updates become searchable records that can be reviewed later by relevant team members.",
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
        { label: "Development services", href: "/services/development" },
        { label: "Community docs", href: "/docs" },
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
        { label: "Dich vu phat trien", href: "/services/development" },
        { label: "Kho tai lieu", href: "/docs" },
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
        { label: "Development services", href: "/services/development" },
        { label: "Support page", href: "/support" },
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
        { label: "Tong quan tinh nang", href: "/features" },
        { label: "Trang ho tro", href: "/support" },
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
