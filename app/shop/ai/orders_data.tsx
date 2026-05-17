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
};

export const ALLOWED_TOOLS = new Set(["speech_text", "text_speech", "image_text", "translate_vi_en"] as const);

export const toolNotesByKey: Record<ToolKey, ToolNoteContent> = {
  text_speech: {
    title: "How My Vietnamese Text-to-Speech Pipeline Runs on a Flask AI Server",
    shortDescription:
      "This article explains how my Vietnamese Text-to-Speech module works on a Flask-based AI server, from request routing and model selection to waveform generation and MP3 export. It also outlines the current runtime settings, voice generation flow, and a few practical limits in the version I am using now.",
    articleBody: [
      "My Text-to-Speech module runs on a Python Flask AI server inside /opt/hustmedia/python/. The service is exposed on 0.0.0.0:8789, and the main POST /tts route works as a dispatcher between two Vietnamese TTS engines: a local F5-based pipeline and an alternative path based on facebook/mms-tts-vie. The API requires a non-empty text field, reads a servicecode, and falls back to the F5 engine unless the request explicitly asks for the Facebook path. In the current version, the request is processed synchronously and the API returns a success payload rather than streaming the audio directly.",
      "The main voice generation path is F5_vie. Before synthesis begins, the module converts numeric strings into Vietnamese words so phone numbers, quantities, and short operational text sound more natural. The server then calls f5-tts_infer-cli with a fixed reference voice file, the F5TTS_Base model, speed 0.5, the vocos vocoder, a local vocabulary file, and the checkpoint model_500000.pt. After inference, the generated WAV file is converted to MP3 with pydub and saved to /opt/hustmedia/python/tts/output/output.mp3.",
      "Inside the F5 pipeline, the processing flow is more than a simple wrapper call. The CLI loads its config, model backbone, and checkpoint, preprocesses the reference audio by trimming silence and adding about 50 ms of padding, and can infer missing reference text with Whisper. The generation text is then split into batches, normalized, resampled to 24 kHz, and passed through the sampling path before the waveform is decoded by the vocoder. When multiple chunks are produced, they are joined with a default cross-fade of 0.15 seconds to reduce audible breaks.",
      "I also keep a second engine based on facebook/mms-tts-vie. In this path, the tokenizer and model are loaded from Hugging Face, the text is converted into a waveform, and the result is exported through the same output pipeline. This version is useful as an alternative engine, but in the current code it reloads the model on each request, so latency and memory usage can vary more than a persistent in-memory design. Both engines also write to the same output MP3 path, which means concurrent requests need tighter output isolation in future revisions.",
    ],
    technicalSnapshot: [
      "Runtime: Python Flask server on 0.0.0.0:8789",
      "Main route: POST /tts",
      "Default engine: F5_vie",
      "Alternate engine: facebook/mms-tts-vie",
      "Model path: F5TTS_Base",
      "Vocoder: vocos",
      "Checkpoint: model_500000.pt",
      "Speed: 0.5",
      "Audio resample target: 24 kHz",
      "Chunk merge: 0.15 s cross-fade",
      "Export: WAV to MP3 via pydub",
    ],
  },
  speech_text: {
    title: "How My Vietnamese Speech-to-Text Pipeline Runs on a Flask AI Server",
    shortDescription:
      "This article explains how my Speech-to-Text module processes Vietnamese audio on a Flask AI server, from file input and waveform normalization to transcription output. It also outlines the current model choice, API behavior, and practical runtime limits.",
    articleBody: [
      "My Speech-to-Text module runs on the same Python Flask AI server used for the other media utilities in this workflow. The main API entry point is GET/POST /wav2vec2, served through Flask on port 8789. In the current version, the endpoint reads an audio path from form data or query parameters, and if no path is provided, it falls back to a default local file. The response returns JSON with status, transcript, and the processed file path.",
      "The transcription engine is based on the Hugging Face model khanhld/wav2vec2-base-vietnamese-160h. Both the processor and model are loaded once when the module starts, rather than reloading on every request. The runtime device is selected automatically, using GPU when CUDA is available and CPU otherwise. This keeps repeated requests more stable, although it also means the service keeps a memory footprint while running.",
      "For audio processing, the file is loaded with librosa, converted to mono, and resampled to 16 kHz, which matches the model input. A normalized intermediate WAV file can also be written to /opt/hustmedia/python/tts/wav2vec2/run.wav for inspection or reuse. Before inference, the waveform is converted to float32, checked to avoid empty input, and normalized by peak amplitude.",
      "Once prepared, the audio is tokenized with sampling_rate=16000 and passed through the model under torch.no_grad(). The output logits are decoded with greedy CTC argmax, then converted into text with batch_decode. In its current form, this module does not use beam search, VAD chunking, or language-model rescoring, so long files are still processed in one pass and may increase latency or memory usage.",
      "This module is mainly intended for practical Vietnamese transcription tasks such as voice notes, support logs, internal updates, and simple content preparation. It is not designed as a full enterprise ASR platform, but as a working in-house component that I built and maintain for my own workflow.",
    ],
    technicalSnapshot: [
      "Server runtime: Flask on port 8789",
      "Main endpoint: GET/POST /wav2vec2",
      "STT model: khanhld/wav2vec2-base-vietnamese-160h",
      "Device selection: automatic GPU / CPU",
      "Input normalization: mono audio, 16 kHz",
      "Intermediate WAV path: /opt/hustmedia/python/tts/wav2vec2/run.wav",
      "Decode method: greedy CTC argmax",
      "Inference mode: torch.no_grad()",
      "Current limitation: no chunking, no VAD, no beam search",
    ],
  },
  image_text: {
    title: "How My Image-to-Text Module Works in a Rule-Based OCR Workflow",
    shortDescription:
      "This article explains how my Image-to-Text workflow extracts text from screenshots through a local OCR pipeline, from screen capture and region detection to text extraction and post-checking. It also outlines the OCR stack, processing rules, and practical limits.",
    articleBody: [
      "My current Image-to-Text workflow is built around a local OCR pipeline rather than a general upload-and-read service. In the repo under /opt/hustmedia/python/, the working path uses local Tesseract OCR, while PaddleOCR and EasyOCR only appear as external service references, not as full OCR logic in this codebase.",
      "The flow starts with a Selenium script that opens the target chat interface and saves a screenshot as screenshot.png. A second script then processes that image with pytesseract, using the fixed Tesseract binary at /opt/hustmedia/application/Tesseract-OCR/tesseract.exe. Before OCR runs, the image is cropped to the expected chat area, then refined by detecting a gray edge region to isolate the relevant message area.",
      "The pipeline detects candidate text boxes using contour detection on an Otsu-thresholded image. The boxes are merged by row and horizontal spacing, then filtered with rules for gray regions, uniform backgrounds, and a LINE_THRESHOLD step that removes noisy rows. Instead of reading the whole image, the script keeps only the lowest valid box, expands it with PAD = 5, and runs OCR on that region with pytesseract.image_to_string(..., --psm 7). The extracted text and coordinates are then written to center.json.",
      "This means the current module is not a broad OCR engine for all image types. It is a rule-based OCR workflow designed for a specific chat-style UI, where the goal is to capture the final relevant text line rather than read the full screenshot. That makes it practical for controlled verification tasks, but also dependent on layout consistency.",
      "After OCR, the workflow reads center.json, applies a computer-vision check for a red heart icon, and when needed, sends the extracted text into a lightweight classification step before writing the final check_content result back to JSON. This gives the module both an extraction layer and a validation layer.",
      "At the current stage, the main Flask AI server does not expose a direct public /ocr or /image2text endpoint. So this module should be understood as a working internal OCR component with specific UI-oriented logic, not yet as a universal OCR API.",
    ],
    technicalSnapshot: [
      "OCR stack: local Tesseract OCR",
      "Python wrapper: pytesseract",
      "Tesseract binary: /opt/hustmedia/application/Tesseract-OCR/tesseract.exe",
      "Screenshot source: Selenium capture to screenshot.png",
      "Region output: chat_region.png",
      "OCR target: lowest valid filtered text box",
      "Threshold method: Otsu",
      "OCR mode: --psm 7",
      "Padding value: PAD = 5",
      "Output file: center.json",
      "Extra validation: CV rule check + content classification",
      "Current limitation: no direct public OCR endpoint",
    ],
  },
  translate_vi_en: {
    title: "How My Vietnamese-to-English Module Runs on a Flask AI Server",
    shortDescription:
      "This article explains how my Vietnamese-to-English module runs on a Flask AI server, from route dispatch and model loading to text and HTML translation output. It also outlines the current translation direction, runtime flow, and practical limits.",
    articleBody: [
      "My Vietnamese-to-English module runs inside the current Flask server, not as a separate public app. In the repo, the server adds the translate directory to sys.path, and the /translate route dispatches requests through translate_fb(...), which maps to main(...) in translate/server_4.py. The route reads content and category from form or query input and does not parse JSON body data.",
      "The wrapper is fixed to Vietnamese-to-English by default. In server_4.py, the main entry uses src_lang=\"vi\" and tgt_lang=\"en\", and the /translate route does not override them. Because of that, requests sent to /translate follow one default direction unless the code is changed.",
      "Translation uses facebook/nllb-200-distilled-600M. The tokenizer is loaded globally once, while the model pipeline is lazy-loaded through _get_pipeline() with a lock to avoid race conditions during first initialization. This lets later requests reuse the same pipeline in memory.",
      "Language direction is enforced through the NLLB language map and generation settings. Vietnamese maps to vie_Latn, English to eng_Latn, the tokenizer source language is set before generation, and output is forced by forced_bos_token_id. This keeps the module returning English output when the target remains en.",
      "For normal text, the module preserves leading and trailing spacing, translates only the stripped core content, and returns the original input unchanged if the text is empty after stripping. For HTML, it parses the document with BeautifulSoup, skips nodes such as script, style, and source, translates valid text nodes in batch, then writes them back while preserving node spacing. If category is not html, the dispatcher falls back to the text path.",
      "The translation path also has limits. Input is truncated at max_length=512, output is capped by max_new_tokens=50, and long content can be cut on both sides. Cache and temp paths are moved to drive F: by default, or to HUSTMEDIA_AI_CACHE if that environment variable is set. The model normally stays in memory for faster reuse, but if TRANSLATE_RESET_EACH_CALL=1 is enabled, the pipeline resets and cleans memory after each request.",
    ],
    technicalSnapshot: [
      "Server route: /translate",
      "Route input: content, category from form/query",
      "Main wrapper: main(content, src_lang=\"vi\", tgt_lang=\"en\", category=\"text\")",
      "Translation model: facebook/nllb-200-distilled-600M",
      "Source language map: vi -> vie_Latn",
      "Target language map: en -> eng_Latn",
      "Direction control: forced_bos_token_id",
      "Text mode: translate stripped core, preserve outer spacing",
      "HTML mode: BeautifulSoup parse + batch text-node translation",
      "Input limit: max_length=512",
      "Output limit: max_new_tokens=50",
      "Cache path: F: or HUSTMEDIA_AI_CACHE",
      "Optional reset mode: TRANSLATE_RESET_EACH_CALL=1",
      "Current limitation: fixed VI -> EN, no JSON POST parsing, invalid target may return 500",
    ],
  },
};

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
};

export const contentByTool: Record<ToolKey, Record<Lang, ToolContent>> = {
  text_speech: {
    en: {
      title: "Text to Speech",
      heading: "Introduction",
      practical: "Practical Notes",
      summary: [
        "This Text-to-Speech (TTS) module is engineered as a high-performance microservice within the HUST Media ecosystem. Designed for scalable web platforms, it ensures high stability and low latency. As a core component of larger media pipelines, it converts technical documentation into natural audio for production environments.",
        "The implementation leverages advanced speech synthesis models on a dedicated Flask AI server. For deployment, it utilizes standardized server structures (e.g., /opt/hustmedia/python) and environment-based configurations. This setup serves as a practical blueprint for developers integrating AI-driven media processing into high-traffic, scalable architectures.",
      ],
      audience: [
        "Developers integrating automated audio narration into high-traffic media pipelines.",
        "Architects seeking a production-ready TTS microservice for technical platforms.",
        "Engineering teams optimizing content delivery with stable, low-latency voice synthesis.",
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
      summary: [
        "Mô-đun này chuyển văn bản thành giọng nói để đội vận hành và người tạo nội dung xuất bản bản đọc nhanh hơn, đồng thời cải thiện trợ năng cho người dùng thích nghe hơn đọc.",
        "Công cụ được thiết kế theo hướng tiện ích thực dụng trong luồng Hust: mô tả sản phẩm, hướng dẫn, nội dung nhiệm vụ và thông tin hỗ trợ đều có thể tạo bản audio ngắn.",
        "Khi dùng thực tế, công cụ giúp giảm thao tác thu âm lặp lại và giữ chất lượng giọng đọc ổn định giữa nhiều chiến dịch.",
      ],
      audience: [
        "Người làm nội dung cần tạo giọng đọc cho bài hướng dẫn.",
        "Team CSKH cần audio onboarding hoặc hướng dẫn nhanh.",
        "Người dùng mobile/sinh viên muốn tiếp nhận nội dung bằng nghe.",
      ],
      examples: [
        "Input: Mô tả sản phẩm dài. Output: File đọc để gắn vào bài đăng.",
        "Input: Checklist nhiệm vụ. Output: Bản tóm tắt giọng nói cho cộng tác viên.",
      ],
      moduleUsageGuide:
        "Sau phần tổng quan kỹ thuật ở trên, mục này hướng dẫn cách dùng mô-đun Text-to-Speech với nội dung ngắn và thực tế.\n\n• Nhập mô tả sản phẩm, ghi chú hướng dẫn, hoặc chỉ dẫn ngắn.\n• Bấm Generate Audio để tạo đầu ra giọng nói.\n• Kiểm tra kết quả về độ rõ, nhịp đọc và tính nhất quán.\n• Dùng các độ dài văn bản khác nhau để xem mô-đun xử lý các dạng nội dung phổ biến.\n\nDùng phần bên dưới để chạy mô-đun trực tiếp. Bắt đầu với một đoạn ngắn, sau đó điều chỉnh nội dung theo nhu cầu workflow của bạn.",
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
  speech_text: {
    en: {
      title: "Speech to Text",
      heading: "Introduction",
      practical: "Practical Notes",
      summary: [
        "This Speech-to-Text (STT) module is engineered as a high-performance microservice within the HUST Media ecosystem. Designed for scalable platforms, it converts unstructured audio into accurate, structured text. As a core component of data pipelines, it automates transcription and indexing for production environments.",
        "The implementation leverages advanced speech recognition on a dedicated Flask AI server. It utilizes standardized server-side structures (e.g., /opt/hustmedia/python) and environment-based configurations. This setup serves as a blueprint for developers integrating AI-driven transcription into high-traffic, scalable architectures.",
      ],
      audience: [
        "Developers integrating automated audio transcription into high-traffic data pipelines.",
        "Architects seeking a production-ready STT microservice for scalable content management.",
        "Engineering teams optimizing unstructured audio processing with stable, low-latency AI models.",
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
      summary: [
        "Speech-to-Text chuyển ghi âm thành văn bản có thể chỉnh sửa để rút ngắn thời gian nhập liệu trong các luồng báo cáo và vận hành.",
        "Trong thực tế, người dùng thường ghi âm nhanh trên điện thoại rồi cần chuyển thành văn bản chuẩn để lưu trữ, tìm kiếm và xử lý tiếp.",
        "Công cụ cũng tăng khả năng truy vết vì thông tin giọng nói được chuyển thành dữ liệu văn bản có thể tìm lại dễ dàng.",
      ],
      audience: [
        "Điều phối viên cần ghi nhận thông tin sự cố nhanh.",
        "Team vận hành cần tạo báo cáo hằng ngày từ voice note.",
        "Người dùng làm việc chủ yếu trên mobile.",
      ],
      examples: [
        "Input: Ghi âm 30 giây. Output: Bản nháp văn bản cho editor.",
        "Input: Tóm tắt cuộc gọi hỗ trợ. Output: Transcript để tìm kiếm lại.",
      ],
      moduleUsageGuide:
        "Sau phần tổng quan kỹ thuật ở trên, mục này hướng dẫn cách dùng mô-đun Speech-to-Text với ghi âm ngắn và tệp âm thanh được hỗ trợ.\n\n• Tải lên tệp MP3, WAV, M4A hoặc OGG trong giới hạn thời lượng.\n• Bấm Generate Transcript để xử lý bản ghi âm.\n• Kiểm tra văn bản trả về về độ rõ, tên riêng và các thuật ngữ quan trọng.\n• Ưu tiên các bản ghi ngắn cho ghi chú, log hỗ trợ hoặc tác vụ báo cáo nhanh.\n\nDùng phần bên dưới để trải nghiệm mô-đun trực tiếp. Bắt đầu với một bản ghi ngắn, sau đó điều chỉnh độ dài tệp theo nhu cầu workflow của bạn.",
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
  image_text: {
    en: {
      title: "Image to Text",
      heading: "Introduction",
      practical: "Practical Notes",
      summary: [
        "This Image-to-Text (OCR) microservice is engineered for the HUST Media ecosystem. Designed for scalable platforms, it extracts structured text from unstructured image data. As a core pipeline component, it automates document processing and indexing for production environments.",
        "Leveraging advanced OCR models on a dedicated Flask AI server, the module uses standardized server-side structures (e.g., /opt/hustmedia/python) and environment-based configurations. This setup serves as a blueprint for integrating AI-driven analysis into high-traffic, scalable architectures.",
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
        "Implementation leverages advanced translation models via a dedicated Flask AI server. It utilizes standardized server structures (e.g., /opt/hustmedia/python) and supports both raw text and HTML parsing. This setup serves as a blueprint for integrating AI-driven localization into high-traffic, scalable architectures.",
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
];
