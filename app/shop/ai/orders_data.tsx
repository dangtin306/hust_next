export type Lang = "en" | "vi";
export type ToolKey = "text_speech" | "speech_text" | "image_text" | "translate_vi_en" | "text_workflow";

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
  practical?: string;
  summary: string[];
  audience: string[];
  examples: string[];
  moduleUsageGuide: string;
  readerValueTitle: string;
  readerValue: string;
  conclusionTitle: string;
  conclusion: string;
  related: Array<{ label: string; href: string }>;
};

export type ToolNoteContent = {
  title: string;
  shortDescription: string;
  articleBody: string[];
  technicalSnapshot: string[];
  setupGuide?: string;
};

export const ALLOWED_TOOLS = new Set(["speech_text", "text_speech", "image_text", "translate_vi_en", "text_workflow"] as const);

export const seoByTool: Record<ToolKey, Record<Lang, SeoItem>> = {
  text_speech: {
    en: {
      title: "Text to Speech (TTS) — AI Voice Generator",
      description: "Turn written text into natural-sounding audio for narration and accessibility. Use cases: voice-over, reading long notes, assisting users with visual impairment.",
      keywords: "text to speech, TTS, AI voice, voice generator, narration, accessibility, Vietnamese TTS",
    },
    vi: {
      title: "Chuyển văn bản thành giọng nói (Text to Speech)",
      description: "Công cụ chuyển văn bản thành giọng nói phục vụ thuyết minh nội dung, học tập và trợ năng.",
      keywords: "chuyển văn bản thành giọng nói, text to speech, TTS, giọng nói AI, đọc văn bản, trợ năng, tiếng Việt",
    },
  },
  speech_text: {
    en: {
      title: "Speech to Text (STT) — Audio Transcription",
      description: "Transcribe speech into text to speed up note-taking, reporting, and content editing.",
      keywords: "speech to text, STT, transcription, audio to text, voice to text, meeting notes, Vietnamese STT",
    },
    vi: {
      title: "Chuyển giọng nói thành văn bản (Speech to Text)",
      description: "Công cụ chuyển giọng nói thành văn bản giúp ghi chú nhanh, tạo báo cáo và chỉnh sửa nội dung.",
      keywords: "chuyển giọng nói thành văn bản, speech to text, STT, phiên âm, ghi chú, audio to text, tiếng Việt",
    },
  },
  image_text: {
    en: {
      title: "Image to Text (OCR) — Extract Text from Images",
      description: "Extract readable text from images and screenshots (OCR) to reduce manual typing and support verification.",
      keywords: "image to text, OCR, extract text, screenshot to text, document OCR, receipt OCR, text recognition",
    },
    vi: {
      title: "Trích xuất chữ từ hình ảnh (OCR)",
      description: "Công cụ OCR trích xuất chữ từ ảnh và ảnh chụp màn hình, hỗ trợ nhập liệu nhanh và kiểm chứng thông tin.",
      keywords: "OCR, chuyển hình ảnh sang chữ, trích xuất chữ, nhận dạng ký tự, ảnh chụp màn hình, tài liệu",
    },
  },
  translate_vi_en: {
    en: {
      title: "Vietnamese to English — Translation Utility",
      description: "Translate Vietnamese text into clear English for practical content workflows.",
      keywords: "vietnamese to english, translation, ai translation, content workflow",
    },
    vi: {
      title: "Dịch tiếng Việt sang tiếng Anh",
      description: "Công cụ dịch tiếng Việt sang tiếng Anh để dùng trong quy trình nội dung.",
      keywords: "dịch tiếng việt sang tiếng anh, translation, ai translation, content workflow",
    },
  },
  text_workflow: {
    en: {
      title: "Text Workflow — Hello World Note",
      description: "A simple hello-world note used to validate orders_once route and article rendering flow.",
      keywords: "text workflow, hello world, route test, article rendering, orders_once",
    },
    vi: {
      title: "Text Workflow — Ghi chú Hello World",
      description: "Ghi chú hello world đơn giản để kiểm tra route orders_once và luồng hiển thị bài viết.",
      keywords: "text workflow, hello world, kiểm tra route, hiển thị bài viết, orders_once",
    },
  },
};

export const contentByTool: Record<ToolKey, Record<Lang, ToolContent>> = {
  text_speech: {
    en: {
      title: "Text to Speech",
      heading: "Introduction",
      practical: "Practical Notes",
      summary: [
        "Text-to-Speech (TTS) is a Digital Suite module that converts text into natural-sounding audio for documentation, guides, narration, and workflow output. It sits after text preparation and before audio export, helping websites reuse content for accessibility, media tasks, and structured delivery.\n\n- Technical context: This workflow includes text input, request handling, model processing, and audio export.\n\n- Technical benefit: It reduces manual recording work, keeps audio output consistent, and makes written content easier to reuse.",
        "In 2024, after joining a media company project, I built this Text-to-Speech module for practical audio generation. It used a Conda-based AI runtime with Torch, CUDA, and GPU acceleration for heavier inference. The setup later became a blueprint for scalable AI-driven media processing. Common use cases come next.",
      ],
      audience: [
        "People who want to turn written content into clear audio for websites, guides, or notes.",
        "Teams that need voice output for tutorials, support pages, or internal content.",
        "Anyone building a web workflow where text can be reused as speech.",
      ],
      examples: [
        "Input: Product description paragraph. Output: Short narrated audio for social posts.",
        "Input: Task instructions. Output: Short voice summary for collaborators.",
      ],
      moduleUsageGuide:
        "After the technical overview above, this guide explains how to use the Text-to-Speech module with short, practical content.\n\n• Enter a product description, guide note, or short instruction.\n• Click Generate Audio to create the voice output.\n• Review the result for clarity, pacing, and consistency.\n• Use different text lengths to see how the module handles common content types.\n\nUse the section below to try the module directly. Start with a short input, then adjust the text based on your workflow needs.",
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
      title: "Chuyển văn bản thành giọng nói",
      heading: "Giới thiệu mô-đun AI",
      practical: "Ghi chú thực tế",
      summary: [
        "Text-to-Speech (TTS) là một mô-đun Digital Suite chuyển văn bản thành âm thanh tự nhiên cho tài liệu, hướng dẫn, thuyết minh và đầu ra workflow. Nó nằm sau bước chuẩn bị văn bản và trước bước xuất âm thanh, giúp website tái sử dụng nội dung cho trợ năng, tác vụ media và phân phối có cấu trúc.\n\n- Bối cảnh kỹ thuật: Workflow này gồm nhập văn bản, xử lý request, xử lý bằng model và xuất âm thanh.\n\n- Lợi ích kỹ thuật: Nó giảm công việc thu âm thủ công, giữ đầu ra âm thanh nhất quán và giúp nội dung văn bản dễ tái sử dụng hơn.",
        "Năm 2024, sau khi tham gia một dự án media company, tôi xây dựng mô-đun Text-to-Speech này để tạo âm thanh thực tế. Mô-đun dùng runtime AI dựa trên Conda với Torch, CUDA và tăng tốc GPU cho các tác vụ suy luận nặng hơn. Cách setup này sau đó trở thành blueprint cho xử lý media bằng AI trong kiến trúc có khả năng mở rộng. Các use case phổ biến nằm ở phần tiếp theo.",
      ],
      audience: [
        "Những người muốn chuyển nội dung viết thành audio rõ ràng cho website, hướng dẫn hoặc ghi chú.",
        "Các team cần đầu ra giọng nói cho tutorial, trang hỗ trợ hoặc nội dung nội bộ.",
        "Bất kỳ ai đang xây dựng web workflow nơi văn bản có thể được tái sử dụng thành giọng nói.",
      ],
      examples: [
        "Input: Mô tả sản phẩm dài. Output: File đọc để gắn vào bài đăng.",
        "Input: Checklist nhiệm vụ. Output: Bản tóm tắt giọng nói cho cộng tác viên.",
      ],
      moduleUsageGuide:
        "Sau phần tổng quan kỹ thuật ở trên, mục này hướng dẫn cách dùng mô-đun Text-to-Speech với nội dung ngắn và thực tế.\n\n• Nhập mô tả sản phẩm, ghi chú hướng dẫn, hoặc chỉ dẫn ngắn.\n• Bấm Generate Audio để tạo đầu ra giọng nói.\n• Kiểm tra kết quả về độ rõ, nhịp đọc và tính nhất quán.\n• Dùng các độ dài văn bản khác nhau để xem mô-đun xử lý các dạng nội dung phổ biến.\n\nDùng phần bên dưới để chạy mô-đun trực tiếp. Bắt đầu với một đoạn ngắn, sau đó điều chỉnh nội dung theo nhu cầu workflow của bạn.",
      readerValueTitle: "Giá trị cho người đọc",
      readerValue:
        "Người đọc có thể dùng pattern mô-đun này để biến nội dung văn bản thành workflow giọng nói có cấu trúc hơn cho hướng dẫn, tài liệu và các tác vụ media ngắn. Trong dự án thực tế, cách này giúp giảm việc thu âm thủ công lặp lại, giữ quá trình xử lý đầu ra nhất quán hơn và hỗ trợ vận hành ổn định trên các luồng nội dung tích hợp.",
      conclusionTitle: "Kết luận",
      conclusion:
        "Mô-đun Text-to-Speech này kết hợp xử lý request có kiểm soát, path model có thể tái sử dụng và luồng xuất âm thanh thực tế vào một service layer dễ bảo trì. Nó vẫn phù hợp với mô hình tích hợp hệ thống và vận hành ổn định rộng hơn của nền tảng.",
      related: [
        { label: "Ghi chú kiến trúc hệ thống", href: "/community/docs/architecture" },
        { label: "Hướng dẫn tham chiếu API", href: "/community/docs/api-reference" },
        { label: "Tổng quan kỹ thuật", href: "/community/docs/overview" },
      ],
    },
  },
  speech_text: {
    en: {
      title: "Speech to Text",
      heading: "Introduction",
      practical: "Practical Notes",
      summary: [
        "Speech-to-Text (STT) is a Digital Suite module that converts audio into structured text for notes, reports, support logs, and searchable records. It sits after audio upload and before text review or reuse, helping websites turn voice input into cleaner output for documentation and workflow support.\n\n- Technical context: This workflow includes audio input, speech recognition, text cleanup, and transcript export.\n\n- Technical benefit: It reduces manual note-taking, improves review, and makes spoken information reusable.",
        "In 2024, while building the Text-to-Speech module, I realized a complete media web system needed the reverse flow too. This Speech-to-Text module converts speech audio into structured text using Conda, Torch, CUDA, and GPU acceleration for heavier transcription. It later became a blueprint for scalable AI-driven audio-to-text processing. Common use cases come next.",
      ],
      audience: [
        "Users who need clear text from voice recordings for notes or records.",
        "Teams that reuse audio from notes, meetings, or support work.",
        "Web projects that need a simple speech-to-text workflow for content processing.",
      ],
      examples: [
        "Input: Short voice note. Output: Draft text for reporting.",
        "Input: Customer call recording. Output: Searchable transcript for support history.",
      ],
      moduleUsageGuide:
        "After the technical overview above, this guide explains how to use the Speech-to-Text module with short voice recordings and supported audio files.\n\n• Upload an MP3, WAV, M4A, or OGG audio file within the duration limit.\n• Click Generate Transcript to process the recording.\n• Review the returned text for clarity, names, and important terms.\n• Use shorter recordings for notes, support logs, or quick reporting tasks.\n\nUse the section below to experience the module directly. Start with a short recording, then adjust the file length based on your workflow needs.",
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
      title: "Chuyển giọng nói thành văn bản",
      heading: "Giới thiệu mô-đun AI",
      practical: "Ghi chú thực tế",
      summary: [
        "Speech-to-Text (STT) là một mô-đun Digital Suite chuyển âm thanh thành văn bản có cấu trúc cho ghi chú, báo cáo, support log và bản ghi có thể tìm kiếm. Nó nằm sau bước upload âm thanh và trước bước review hoặc tái sử dụng văn bản, giúp website biến đầu vào giọng nói thành đầu ra sạch hơn cho tài liệu và hỗ trợ workflow.\n\n- Bối cảnh kỹ thuật: Workflow này gồm đầu vào âm thanh, nhận dạng giọng nói, làm sạch văn bản và xuất transcript.\n\n- Lợi ích kỹ thuật: Nó giảm việc ghi chú thủ công, cải thiện bước review và giúp thông tin nói có thể tái sử dụng.",
        "Năm 2024, trong lúc xây dựng mô-đun Text-to-Speech, tôi nhận ra một hệ media web hoàn chỉnh cũng cần luồng ngược lại. Mô-đun Speech-to-Text này chuyển audio giọng nói thành văn bản có cấu trúc bằng Conda, Torch, CUDA và tăng tốc GPU cho các tác vụ transcription nặng hơn. Sau đó nó trở thành blueprint cho xử lý audio-to-text bằng AI trong kiến trúc có khả năng mở rộng. Các use case phổ biến nằm ở phần tiếp theo.",
      ],
      audience: [
        "Người dùng cần văn bản rõ ràng từ bản ghi âm để ghi chú hoặc lưu hồ sơ.",
        "Các team tái sử dụng audio từ ghi chú, cuộc họp hoặc công việc hỗ trợ.",
        "Các dự án web cần một workflow speech-to-text đơn giản để xử lý nội dung.",
      ],
      examples: [
        "Input: Ghi âm 30 giây. Output: Bản nháp văn bản cho editor.",
        "Input: Tóm tắt cuộc gọi hỗ trợ. Output: Transcript để tìm kiếm lại.",
      ],
      moduleUsageGuide:
        "Sau phần tổng quan kỹ thuật ở trên, mục này hướng dẫn cách dùng mô-đun Speech-to-Text với ghi âm ngắn và tệp âm thanh được hỗ trợ.\n\n• Tải lên tệp MP3, WAV, M4A hoặc OGG trong giới hạn thời lượng.\n• Bấm Generate Transcript để xử lý bản ghi âm.\n• Kiểm tra văn bản trả về về độ rõ, tên riêng và các thuật ngữ quan trọng.\n• Ưu tiên các bản ghi ngắn cho ghi chú, log hỗ trợ hoặc tác vụ báo cáo nhanh.\n\nDùng phần bên dưới để trải nghiệm mô-đun trực tiếp. Bắt đầu với một bản ghi ngắn, sau đó điều chỉnh độ dài tệp theo nhu cầu workflow của bạn.",
      readerValueTitle: "Giá trị cho người đọc",
      readerValue:
        "Người đọc có thể dùng pattern mô-đun này để biến cập nhật bằng giọng nói thành workflow văn bản có cấu trúc hơn cho báo cáo, tài liệu và tác vụ hỗ trợ. Trong dự án thực tế, cách này giúp giảm ghi chú thủ công, giữ việc xử lý transcription nhất quán hơn và hỗ trợ vận hành ổn định trên các luồng nội dung tích hợp.",
      conclusionTitle: "Kết luận",
      conclusion:
        "Mô-đun Speech-to-Text này kết hợp xử lý đầu vào âm thanh có kiểm soát, path transcription có thể tái sử dụng và xử lý đầu ra thực tế vào một service layer dễ bảo trì. Nó giúp workflow transcription nhất quán hơn trong kiến trúc hệ thống rộng hơn.",
      related: [
        { label: "Ghi chú kiến trúc hệ thống", href: "/community/docs/architecture" },
        { label: "Hướng dẫn tham chiếu API", href: "/community/docs/api-reference" },
        { label: "Tổng quan kỹ thuật", href: "/community/docs/overview" },
      ],
    },
  },
  image_text: {
    en: {
      title: "Image to Text",
      heading: "Introduction",
      practical: "Practical Notes",
      summary: [
        "This Image-to-Text (OCR) microservice is engineered for the HUST Media ecosystem. Designed for scalable platforms, it extracts structured text from unstructured image data. As a core pipeline component, it automates document processing and indexing for production environments.",
        "Leveraging advanced OCR models on a dedicated Flask AI server, the module uses standardized server-side structures (e.g., <Project_Path>/python/module_tts) and environment-based configurations. This setup serves as a blueprint for integrating AI-driven analysis into high-traffic, scalable architectures.",
      ],
      audience: [
        "Developers integrating automated OCR capabilities into high-traffic document processing pipelines.",
        "Architects seeking a production-ready Image-to-Text microservice for scalable data verification.",
        "Engineering teams optimizing unstructured image data extraction with stable, low-latency AI models.",
      ],
      examples: [
        "Input: Screenshot of a receipt. Output: Readable text for checking details.",
        "Input: Image of instructions. Output: Editable text for later updates.",
      ],
      moduleUsageGuide:
        "After the technical overview above, this guide explains how to use the Image-to-Text module with screenshots, receipts, forms, or simple document images.\n\n• Upload a PNG or JPG image that contains clear, readable text.\n• Click Extract Text to process the image through the OCR workflow.\n• Review the extracted result for missing words, numbers, and formatting.\n• Use clean screenshots or document images for more consistent output.\n\nUse the section below to experience the module directly. Start with a simple image, then adjust the input based on your review, documentation, or verification workflow.",
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
      title: "Chuyển hình ảnh thành văn bản",
      heading: "Giới thiệu mô-đun AI",
      summary: [
        "OCR giúp trích xuất chữ từ ảnh, ảnh chụp màn hình và tài liệu để giảm thao tác nhập liệu thủ công trong các bước kiểm chứng.",
        "Thông tin dạng ảnh sẽ được chuyển thành văn bản có thể tìm kiếm, lọc và tái sử dụng trong quy trình xử lý nội dung.",
        "Đặc biệt hiệu quả khi xử lý số lượng lớn ảnh minh chứng cần chuẩn hóa trước khi đưa vào các bước vận hành tiếp theo.",
      ],
      audience: [
        "Nhóm kiểm duyệt cần đọc nhanh nội dung từ ảnh minh chứng.",
        "Editor cần số hóa chữ từ ảnh trước khi biên tập.",
        "CSKH cần tra cứu thông tin người dùng gửi bằng screenshot.",
      ],
      examples: [
        "Input: Ảnh biên lai. Output: Text số tiền/ngày tháng để đối soát.",
        "Input: Ảnh hướng dẫn cũ. Output: Văn bản chỉnh sửa để cập nhật bài viết.",
      ],
      moduleUsageGuide:
        "Sau phần tổng quan kỹ thuật ở trên, mục này hướng dẫn cách dùng mô-đun Image-to-Text với ảnh chụp màn hình, biên lai, biểu mẫu hoặc ảnh tài liệu đơn giản.\n\n• Tải lên ảnh PNG hoặc JPG có chứa chữ rõ ràng, dễ đọc.\n• Bấm Extract Text để xử lý ảnh qua luồng OCR.\n• Kiểm tra kết quả trích xuất để phát hiện thiếu từ, số hoặc lỗi định dạng.\n• Ưu tiên ảnh sạch, chữ rõ để đầu ra ổn định hơn.\n\nDùng phần bên dưới để trải nghiệm mô-đun trực tiếp. Bắt đầu với một ảnh đơn giản, sau đó điều chỉnh dữ liệu đầu vào theo nhu cầu rà soát, tài liệu hóa hoặc kiểm chứng của bạn.",
      readerValueTitle: "Giá trị cho người đọc",
      readerValue: "",
      conclusionTitle: "Kết luận",
      conclusion: "",
      related: [
        { label: "Ghi chú kiến trúc hệ thống", href: "/community/docs/architecture" },
        { label: "Hướng dẫn tham chiếu API", href: "/community/docs/api-reference" },
        { label: "Tổng quan kỹ thuật", href: "/community/docs/overview" },
      ],
    },
  },
  translate_vi_en: {
    en: {
      title: "Vietnamese to English",
      heading: "Introduction",
      practical: "Practical Notes",
      summary: [
        "This VI-to-EN translation module is a high-performance microservice in the HUST Media ecosystem. Built for scalable platforms, it translates Vietnamese text and HTML content into English. As a core pipeline component, it automates content localization for production environments.",
        "Implementation leverages advanced translation models via a dedicated Flask AI server. It utilizes standardized server structures (e.g., <Project_Path>/python/module_tts) and supports both raw text and HTML parsing. This setup serves as a blueprint for integrating AI-driven localization into high-traffic, scalable architectures.",
      ],
      audience: [
        "Developers integrating automated VI-to-EN translation into high-traffic content pipelines.",
        "Architects seeking a production-ready localization microservice for scalable web platforms.",
        "Engineering teams optimizing multilingual content delivery with stable AI models.",
      ],
      examples: [
        "Input: Vietnamese draft note. Output: English version for review.",
        "Input: Vietnamese product or support text. Output: English for publishing.",
      ],
      moduleUsageGuide:
        "After the technical overview above, this guide explains how to use the Vietnamese-to-English module with short notes, drafts, product text, or support content.\n\n• Paste Vietnamese text or a simple HTML/text snippet into the input field.\n• Click Translate to English to generate the English version.\n• Review the output for meaning, names, product terms, and sentence clarity.\n• Use shorter sections when preparing content for review, documentation, or publishing.\n\nUse the section below to experience the module directly. Start with a short Vietnamese draft, then adjust the input based on your content workflow.",
      readerValueTitle: "Reader Value",
      readerValue:
        "Readers can use this module pattern to turn Vietnamese notes, drafts, and support content into a more structured English workflow for review and publishing. In real projects, that helps reduce manual rewriting, keep translation handling more consistent, and support stable operation across content-focused workflows.",
      conclusionTitle: "Conclusion",
      conclusion:
        "This Vietnamese-to-English module combines controlled translation routing, fixed language direction, and practical text handling into one maintainable service layer. It remains aligned with the platform's broader system integration and stable operation model.",
      related: [{ label: "Vietnamese-to-English Translation Note", href: "/next/orders_once/translate_vi_en" }],
    },
    vi: {
      title: "Dịch tiếng Việt sang tiếng Anh",
      heading: "Giới thiệu mô-đun AI",
      summary: [
        "Mô-đun dịch Việt-Anh là một tiện ích thực dụng trong bộ công cụ nội dung. Nó giúp chuyển văn bản tiếng Việt sang tiếng Anh rõ ràng cho tài liệu, bài viết và nội dung sản phẩm.",
        "Công cụ phù hợp khi bạn cần giữ nguyên quy trình làm việc hiện có nhưng vẫn tạo được đầu ra tiếng Anh nhanh, nhất quán và dễ rà soát.",
        "Ở phiên bản hiện tại, mô-đun chạy trên Flask AI server với hướng dịch cố định Việt sang Anh, hỗ trợ cả văn bản thuần và nội dung HTML.",
      ],
      audience: [
        "Người cần chuyển ghi chú hoặc bản nháp tiếng Việt sang tiếng Anh.",
        "Nhóm biên tập nội dung, tài liệu hoặc hỗ trợ bằng tiếng Anh.",
        "Người dùng cần một bước dịch Việt-Anh đơn giản để rà soát và xuất bản.",
      ],
      examples: [
        "Input: Ghi chú nháp tiếng Việt. Output: Bản tiếng Anh để rà soát.",
        "Input: Nội dung sản phẩm/hỗ trợ tiếng Việt. Output: Bản tiếng Anh để xuất bản.",
      ],
      moduleUsageGuide:
        "Sau phần tổng quan kỹ thuật ở trên, mục này hướng dẫn cách dùng mô-đun Vietnamese-to-English với ghi chú ngắn, bản nháp, nội dung sản phẩm hoặc nội dung hỗ trợ.\n\n• Dán văn bản tiếng Việt hoặc đoạn HTML/text đơn giản vào ô nhập liệu.\n• Bấm Translate to English để tạo bản tiếng Anh.\n• Kiểm tra đầu ra về ý nghĩa, tên riêng, thuật ngữ sản phẩm và độ rõ câu.\n• Nên chia nội dung thành đoạn ngắn khi chuẩn bị cho bước rà soát, tài liệu hóa hoặc xuất bản.\n\nDùng phần bên dưới để trải nghiệm mô-đun trực tiếp. Bắt đầu với một bản nháp tiếng Việt ngắn, sau đó điều chỉnh đầu vào theo workflow nội dung của bạn.",
      readerValueTitle: "Giá trị cho người đọc",
      readerValue: "",
      conclusionTitle: "Kết luận",
      conclusion: "",
      related: [{ label: "Tổng quan dịch Việt - Anh", href: "/next/orders_once/translate_vi_en" }],
    },
  },
  text_workflow: {
    en: {
      title: "Text Workflow",
      heading: "Introduction",
      practical: "Practical Notes",
      summary: [
        "Hello world. This article is a compact workflow note used to confirm that the text_workflow route is connected and rendered correctly in the Orders Once system.",
        "It follows the same article architecture as other modules, including metadata, documentation notes, footer actions, and helpful feedback placement.",
      ],
      audience: [
        "People who need clearer writing for websites, notes, or documentation.",
        "People building automatic support replies for web pages or online services.",
        "Anyone using a web workflow where text needs rewriting, summarizing, cleaning, or formatting.",
      ],
      examples: [
        "Input: open /next/orders_once/text_workflow. Output: article renders with title, summary, and footer actions.",
        "Input: click footer like/share. Output: local actions work without backend dependency.",
      ],
      moduleUsageGuide:
        "This hello-world workflow note is intentionally minimal and stable.\n\n• Open the route and verify title, summary, and article sections render.\n• Check TOC and related insights behavior.\n• Confirm footer actions (like/share) respond correctly.\n• Use this as a baseline when adding new orders_once tool routes.",
      readerValueTitle: "Reader Value",
      readerValue:
        "This note gives teams a fast, low-risk baseline for validating routing and shared article UI behavior before expanding into full feature content.",
      conclusionTitle: "Conclusion",
      conclusion:
        "The text_workflow entry proves the new route is integrated correctly and can be extended into a full technical article whenever needed.",
      related: [{ label: "Technical Overview", href: "/community/docs/overview" }],
    },
    vi: {
      title: "Text Workflow",
      heading: "Giới thiệu",
      practical: "Ghi chú thực tế",
      summary: [
        "Hello world. Đây là bài ghi chú ngắn để xác nhận route text_workflow đã được nối đúng trong hệ thống Orders Once.",
        "Bài viết dùng cùng kiến trúc hiển thị với các mô-đun khác: metadata, phần ghi chú, footer action và khối phản hồi người đọc.",
      ],
      audience: [
        "Những người cần nội dung rõ ràng hơn cho website, ghi chú hoặc tài liệu.",
        "Những người xây dựng phản hồi hỗ trợ tự động cho trang web hoặc dịch vụ online.",
        "Bất kỳ ai dùng web workflow nơi văn bản cần viết lại, tóm tắt, làm sạch hoặc định dạng.",
      ],
      examples: [
        "Input: mở /next/orders_once/text_workflow. Output: hiển thị bài với tiêu đề, mô tả, section đầy đủ.",
        "Input: bấm tim/share ở footer. Output: hành vi local chạy đúng không cần backend.",
      ],
      moduleUsageGuide:
        "Ghi chú hello-world này được thiết kế tối giản và ổn định.\n\n• Mở route và kiểm tra tiêu đề, mô tả, các section hiển thị đúng.\n• Kiểm tra TOC và khu vực related insights.\n• Xác nhận footer action (tim/share) hoạt động bình thường.\n• Dùng làm mốc chuẩn khi thêm route tool mới cho orders_once.",
      readerValueTitle: "Giá trị cho người đọc",
      readerValue:
        "Ghi chú này cung cấp mốc kiểm tra nhanh, ít rủi ro để xác nhận route và UI bài viết dùng chung trước khi mở rộng nội dung kỹ thuật đầy đủ.",
      conclusionTitle: "Kết luận",
      conclusion:
        "Entry text_workflow xác nhận route mới đã tích hợp đúng và có thể mở rộng thành bài kỹ thuật đầy đủ khi cần.",
      related: [{ label: "Tổng quan kỹ thuật", href: "/community/docs/overview" }],
    },
  },
};

export const toolTabs: Array<{ key: ToolKey; en: string; vi: string }> = [
  {
    key: "text_speech",
    en: "Text to Speech",
    vi: "Chuyển văn bản thành giọng nói",
  },
  {
    key: "speech_text",
    en: "Speech to Text",
    vi: "Chuyển giọng nói thành văn bản",
  },
  {
    key: "image_text",
    en: "Image to Text",
    vi: "Chuyển hình ảnh thành văn bản",
  },
];

export const toolProcessCards: ToolProcessCard[] = [
  {
    key: "text_speech",
    image: "https://hust.media/img/text_speech_thumbnail.png",
    href: (routeRoot) => `/${routeRoot}/text_speech`,
    title: { en: "Text to Speech", vi: "Văn bản thành giọng nói" },
    description: {
      en: "Turn written text into natural-sounding audio for narration and accessibility.",
      vi: "Chuyển văn bản thành âm thanh tự nhiên để thuyết minh và trợ năng.",
    },
    badge: { en: "Integration", vi: "Tích hợp" },
  },
  {
    key: "speech_text",
    image: "https://hust.media/img/speech_text_thumbnail.png",
    href: (routeRoot) => `/${routeRoot}/speech_text`,
    title: { en: "Speech to Text", vi: "Giọng nói thành văn bản" },
    description: {
      en: "Transcribe spoken audio into editable text to speed up notes and reporting.",
      vi: "Phiên âm giọng nói thành văn bản để ghi chú và báo cáo nhanh hơn.",
    },
    badge: { en: "Integration", vi: "Tích hợp" },
  },
  {
    key: "image_text",
    image: "https://hust.media/img/image_text_thumbnail.png",
    href: (routeRoot) => `/${routeRoot}/image_text`,
    title: { en: "Image to Text", vi: "Hình ảnh thành văn bản" },
    description: {
      en: "Extract readable text from images (OCR) to reduce manual typing.",
      vi: "Trích xuất chữ từ ảnh (OCR) để giảm nhập liệu thủ công.",
    },
    badge: { en: "Integration", vi: "Tích hợp" },
  },
  {
    key: "translate_vi_en",
    image: "https://hust.media/img/translate_vi_en_thumb.png",
    href: () => "/next/orders_once/translate_vi_en",
    title: { en: "Vietnamese to English", vi: "Dịch Việt sang Anh" },
    description: {
      en: "Translate Vietnamese text into clear English for docs and content.",
      vi: "Dịch văn bản tiếng Việt sang tiếng Anh rõ ràng cho nội dung và tài liệu.",
    },
    badge: { en: "Integration", vi: "Tích hợp" },
  },
  {
    key: "text_workflow",
    image: "https://hust.media/img/text_speech_thumbnail.png",
    href: () => "/next/orders_once/text_workflow",
    title: { en: "Text Workflow", vi: "Text Workflow" },
    description: {
      en: "Hello-world workflow note used to validate route and article rendering.",
      vi: "Ghi chú hello-world dùng để kiểm tra route và hiển thị bài viết.",
    },
    badge: { en: "Integration", vi: "Tích hợp" },
  },
];
