/**
 * KAMY marketplace catalogue — STAGING / TEST DATA.
 *
 * Every creator, product, price, sales figure and review in this file is fictional and exists
 * only so the marketplace can be designed and tested privately. Nothing here is a real listing.
 * The category taxonomy mirrors `public.categories` in Supabase; products will move to the
 * `products` tables once the listing wizard and moderation flow are live.
 */

export const STAGING_NOTICE = "STAGING / TEST DATA";

export type ArtKind = "cube" | "ui" | "template" | "graphic" | "pattern" | "audio" | "video" | "plugin" | "code" | "service";
export type ArtHue = "amber" | "coral" | "sky" | "violet" | "rose" | "emerald" | "mint";
export type LicenseId = "personal" | "commercial" | "extended" | "service";
export type Delivery = "instant" | "manual";

export type Category = {
  id: string;
  parentId: string | null;
  name: { id: string; en: string };
  description?: { id: string; en: string };
  icon: string;
  code: string;
};

export type Creator = {
  slug: string;
  name: string;
  tagline: string;
  bio: string;
  specialties: string[];
  verification: "unverified" | "pending";
  joinedAt: string;
  location: string;
  hue: ArtHue;
};

export type Review = { productSlug: string; author: string; rating: number; body: string; createdAt: string };

export type Product = {
  slug: string;
  sku: string;
  title: string;
  creator: string;
  category: string;
  subcategory: string;
  price: number;
  salePrice?: number;
  licenses: LicenseId[];
  formats: string[];
  compatibility: string[];
  delivery: Delivery;
  deliveryDays?: number;
  fileSize?: string;
  tags: string[];
  summary: string;
  description: string[];
  includes: string[];
  createdAt: string;
  updatedAt: string;
  version: string;
  sold: number;
  available: boolean;
  art: { kind: ArtKind; hue: ArtHue; seed: number };
};

export const CATEGORIES: Category[] = [
  { id: "3d-game", parentId: null, icon: "3d", code: "3DG", name: { id: "3D & Aset Game", en: "3D & Game Assets" }, description: { id: "Model, props, lingkungan, karakter, tekstur, dan aset Roblox.", en: "Models, props, environments, characters, textures and Roblox assets." } },
  { id: "templates", parentId: null, icon: "templates", code: "TPL", name: { id: "Template", en: "Templates" }, description: { id: "Presentasi, pitch deck, CV, dan kit konten media sosial.", en: "Presentations, pitch decks, CVs and social media kits." } },
  { id: "graphics", parentId: null, icon: "graphics", code: "GFX", name: { id: "Desain Grafis", en: "Graphic Design" }, description: { id: "Ilustrasi, set ikon, logo, dan kit branding.", en: "Illustrations, icon sets, logos and branding kits." } },
  { id: "ui-ux", parentId: null, icon: "uiux", code: "UIX", name: { id: "UI/UX & Web", en: "UI/UX & Web" }, description: { id: "UI kit, template website, dashboard, dan komponen kode.", en: "UI kits, website templates, dashboards and code components." } },
  { id: "audio-video", parentId: null, icon: "audio", code: "AVM", name: { id: "Audio & Video", en: "Audio & Video" }, description: { id: "Efek suara, musik berlisensi, template video, dan motion.", en: "Sound effects, licensed music, video templates and motion." } },
  { id: "tools-plugins", parentId: null, icon: "plugins", code: "SWT", name: { id: "Software & Tools", en: "Software & Tools" }, description: { id: "Plugin resmi, script, dan utilitas produktivitas.", en: "Authorised plugins, scripts and productivity utilities." } },
  { id: "creative-services", parentId: null, icon: "services", code: "SRV", name: { id: "Jasa Kreatif", en: "Creative Services" }, description: { id: "Desain kustom, pengembangan website, dan 3D sesuai pesanan.", en: "Custom design, website development and made-to-order 3D." } },

  { id: "3d-models", parentId: "3d-game", icon: "model3d", code: "3DG-MDL", name: { id: "Model 3D", en: "3D models" } },
  { id: "roblox-assets", parentId: "3d-game", icon: "asset", code: "3DG-RBX", name: { id: "Aset Roblox", en: "Roblox assets" } },
  { id: "unity-assets", parentId: "3d-game", icon: "asset", code: "3DG-UNY", name: { id: "Aset Unity", en: "Unity assets" } },
  { id: "textures", parentId: "3d-game", icon: "image", code: "3DG-TEX", name: { id: "Tekstur & material", en: "Textures & materials" } },
  { id: "canva", parentId: "templates", icon: "templates", code: "TPL-CNV", name: { id: "Template Canva", en: "Canva templates" } },
  { id: "figma", parentId: "templates", icon: "templates", code: "TPL-FIG", name: { id: "Template Figma", en: "Figma templates" } },
  { id: "presentations", parentId: "templates", icon: "templates", code: "TPL-PRS", name: { id: "Presentasi", en: "Presentations" } },
  { id: "social-kits", parentId: "templates", icon: "templates", code: "TPL-SOC", name: { id: "Kit media sosial", en: "Social media kits" } },
  { id: "illustrations", parentId: "graphics", icon: "graphics", code: "GFX-ILL", name: { id: "Ilustrasi", en: "Illustrations" } },
  { id: "icons", parentId: "graphics", icon: "graphics", code: "GFX-ICN", name: { id: "Ikon", en: "Icons" } },
  { id: "logos-branding", parentId: "graphics", icon: "graphics", code: "GFX-BRD", name: { id: "Logo & branding", en: "Logos & branding" } },
  { id: "ui-kits", parentId: "ui-ux", icon: "uiux", code: "UIX-KIT", name: { id: "UI kit", en: "UI kits" } },
  { id: "web-templates", parentId: "ui-ux", icon: "desktop", code: "UIX-WEB", name: { id: "Template website", en: "Website templates" } },
  { id: "code-snippets", parentId: "ui-ux", icon: "file", code: "UIX-CDE", name: { id: "Komponen kode", en: "Code components" } },
  { id: "music", parentId: "audio-video", icon: "music", code: "AVM-MUS", name: { id: "Musik", en: "Music" } },
  { id: "sound-effects", parentId: "audio-video", icon: "audio", code: "AVM-SFX", name: { id: "Efek suara", en: "Sound effects" } },
  { id: "video-assets", parentId: "audio-video", icon: "video", code: "AVM-VID", name: { id: "Aset video", en: "Video assets" } },
  { id: "plugins", parentId: "tools-plugins", icon: "plugins", code: "SWT-PLG", name: { id: "Plugin", en: "Plugins" } },
  { id: "scripts", parentId: "tools-plugins", icon: "tools", code: "SWT-SCR", name: { id: "Script", en: "Scripts" } },
  { id: "services", parentId: "creative-services", icon: "services", code: "SRV-DSN", name: { id: "Desain kustom", en: "Custom design" } },
  { id: "web-development", parentId: "creative-services", icon: "desktop", code: "SRV-WEB", name: { id: "Pengembangan website", en: "Website development" } },
  { id: "custom-3d", parentId: "creative-services", icon: "model3d", code: "SRV-3DK", name: { id: "3D kustom", en: "Custom 3D" } },
];

export const CREATORS: Creator[] = [
  { slug: "nusantara-lowpoly", name: "Nusantara Lowpoly", tagline: "Aset 3D lowpoly bertema Nusantara untuk game indie.", bio: "Studio dua orang yang membuat props, lingkungan, dan karakter lowpoly dengan nuansa Indonesia. Semua aset dibuat sendiri dari nol.", specialties: ["3d-game"], verification: "pending", joinedAt: "2026-03-04", location: "Yogyakarta", hue: "amber" },
  { slug: "rimba-pixel", name: "Rimba Pixel", tagline: "UI kit dan template web yang rapi dan siap dipakai tim produk.", bio: "Desainer produk dan frontend engineer yang merilis UI kit Figma serta template Next.js berlisensi jelas.", specialties: ["ui-ux", "creative-services"], verification: "pending", joinedAt: "2026-02-18", location: "Bandung", hue: "sky" },
  { slug: "studio-kawi", name: "Studio Kawi", tagline: "Template presentasi dan konten untuk UMKM dan startup.", bio: "Kami membantu bisnis kecil tampil profesional lewat template yang mudah diedit di Canva, Figma, dan PowerPoint.", specialties: ["templates"], verification: "unverified", joinedAt: "2026-05-22", location: "Malang", hue: "violet" },
  { slug: "sora-audio", name: "Sora Audio", tagline: "Efek suara dan musik latar dengan lisensi yang jelas.", bio: "Perekam lapangan dan komposer. Setiap file direkam atau dikomposisi sendiri, lengkap dengan dokumen lisensi.", specialties: ["audio-video"], verification: "pending", joinedAt: "2026-04-10", location: "Denpasar", hue: "emerald" },
  { slug: "lentera-motion", name: "Lentera Motion", tagline: "Template video dan motion graphics untuk kreator konten.", bio: "Editor video yang mengemas transisi, lower third, dan judul animasi untuk Premiere Pro, After Effects, dan DaVinci Resolve.", specialties: ["audio-video"], verification: "unverified", joinedAt: "2026-06-30", location: "Jakarta", hue: "coral" },
  { slug: "garda-tools", name: "Garda Tools", tagline: "Plugin dan script untuk Roblox Studio dan Blender.", bio: "Developer game yang merilis alat bantu produksi: script Luau bertipe ketat, plugin Studio, dan add-on Blender.", specialties: ["tools-plugins", "3d-game"], verification: "pending", joinedAt: "2026-01-27", location: "Surabaya", hue: "violet" },
  { slug: "tumbuh-studio", name: "Tumbuh Studio", tagline: "Ilustrasi, ikon, dan identitas merek yang hangat.", bio: "Studio desain grafis yang mengerjakan ilustrasi, set ikon, dan identitas visual untuk brand lokal.", specialties: ["graphics", "creative-services"], verification: "unverified", joinedAt: "2026-07-14", location: "Semarang", hue: "rose" },
];

const P = (p: Omit<Product, "updatedAt" | "available" | "version"> & Partial<Pick<Product, "updatedAt" | "available" | "version">>): Product => ({
  updatedAt: p.createdAt,
  available: true,
  version: "1.0",
  ...p,
});

const ASSET: LicenseId[] = ["personal", "commercial", "extended"];

export const PRODUCTS: Product[] = [
  P({ slug: "rumah-adat-lowpoly-pack", sku: "KMY-3DG-0001", title: "Rumah Adat Lowpoly Pack", creator: "nusantara-lowpoly", category: "3d-game", subcategory: "3d-models", price: 189000, salePrice: 149000, licenses: ASSET, formats: ["FBX", "OBJ", "GLB", "BLEND"], compatibility: ["Blender 4.x", "Unity 6", "Unreal Engine 5", "Roblox Studio"], delivery: "instant", fileSize: "84 MB", tags: ["lowpoly", "rumah adat", "nusantara", "environment", "props"], summary: "18 rumah adat dari berbagai provinsi dalam gaya lowpoly, siap pakai di game.", description: ["Paket berisi 18 rumah adat Indonesia dalam gaya lowpoly yang konsisten. Setiap model memakai satu atlas tekstur 2K sehingga ringan untuk game mobile.", "Model sudah diberi pivot di dasar bangunan dan skala 1 unit = 1 meter, jadi bisa langsung diletakkan di scene."], includes: ["18 model bangunan", "Atlas tekstur 2K", "File .blend sumber", "Panduan impor untuk Unity dan Roblox"], createdAt: "2026-10-02", updatedAt: "2026-11-01", version: "1.2", sold: 214, art: { kind: "cube", hue: "amber", seed: 11 } }),
  P({ slug: "pasar-malam-environment-kit", sku: "KMY-3DG-0002", title: "Pasar Malam Environment Kit", creator: "nusantara-lowpoly", category: "3d-game", subcategory: "3d-models", price: 249000, licenses: ASSET, formats: ["FBX", "GLB"], compatibility: ["Unity 6", "Unreal Engine 5", "Godot 4"], delivery: "instant", fileSize: "132 MB", tags: ["environment", "pasar malam", "lampu", "stall"], summary: "Lapak, gerobak, lampu gantung, dan wahana untuk scene pasar malam.", description: ["Lebih dari 60 props modular untuk membangun pasar malam: lapak makanan, gerobak, tenda, lampu gantung, dan bianglala sederhana.", "Disertakan scene contoh dan pengaturan lightmap untuk Unity."], includes: ["64 props modular", "Scene contoh Unity", "Material emissive untuk lampu"], createdAt: "2026-09-12", sold: 96, art: { kind: "cube", hue: "coral", seed: 27 } }),
  P({ slug: "roblox-obby-starter-kit", sku: "KMY-3DG-0003", title: "Obby Starter Kit untuk Roblox", creator: "garda-tools", category: "3d-game", subcategory: "roblox-assets", price: 99000, licenses: ASSET, formats: ["RBXM", "Luau"], compatibility: ["Roblox Studio"], delivery: "instant", fileSize: "6 MB", tags: ["roblox", "obby", "checkpoint", "starter", "luau"], summary: "40 rintangan modular, checkpoint, dan leaderboard waktu untuk game obby.", description: ["Bangun game obby lebih cepat: 40 rintangan siap pakai, sistem checkpoint yang tersimpan, dan leaderboard waktu terbaik.", "Semua script memakai Luau strict dan validasi di server."], includes: ["40 model rintangan", "Sistem checkpoint", "Leaderboard waktu", "Dokumentasi pemasangan"], createdAt: "2026-11-05", sold: 341, art: { kind: "cube", hue: "sky", seed: 3 } }),
  P({ slug: "batik-pbr-texture-set", sku: "KMY-3DG-0004", title: "Batik PBR Texture Set", creator: "nusantara-lowpoly", category: "3d-game", subcategory: "textures", price: 129000, licenses: ASSET, formats: ["PNG 4K", "EXR"], compatibility: ["Blender", "Unity", "Unreal Engine", "Substance Painter"], delivery: "instant", fileSize: "1,1 GB", tags: ["tekstur", "batik", "pbr", "material", "kain"], summary: "24 material kain batik seamless dengan peta PBR lengkap.", description: ["Material kain bermotif batik yang dibuat ulang secara digital dan seamless, lengkap dengan peta albedo, normal, roughness, dan height.", "Motif digambar sendiri oleh kreator, bukan pindaian dari karya pihak lain."], includes: ["24 material", "Peta PBR 4K", "Preset Blender"], createdAt: "2026-08-21", sold: 58, art: { kind: "pattern", hue: "violet", seed: 41 } }),
  P({ slug: "karakter-chibi-rigged", sku: "KMY-3DG-0005", title: "Karakter Chibi Rigged (5 karakter)", creator: "nusantara-lowpoly", category: "3d-game", subcategory: "3d-models", price: 279000, licenses: ASSET, formats: ["FBX", "BLEND"], compatibility: ["Blender 4.x", "Unity 6", "Mixamo"], delivery: "instant", fileSize: "48 MB", tags: ["karakter", "chibi", "rigged", "animasi"], summary: "Lima karakter chibi berpakaian daerah, sudah di-rig dan siap dianimasikan.", description: ["Lima karakter dengan rig humanoid yang kompatibel dengan Mixamo dan Unity Mecanim.", "Termasuk 12 animasi dasar: idle, jalan, lari, lompat, dan melambai."], includes: ["5 karakter rigged", "12 animasi dasar", "Tekstur 2K"], createdAt: "2026-11-09", sold: 22, art: { kind: "cube", hue: "rose", seed: 58 } }),

  P({ slug: "nimbus-dashboard-ui-kit", sku: "KMY-UIX-0001", title: "Nimbus — Dashboard UI Kit", creator: "rimba-pixel", category: "ui-ux", subcategory: "ui-kits", price: 349000, salePrice: 279000, licenses: ASSET, formats: ["FIG"], compatibility: ["Figma"], delivery: "instant", fileSize: "38 MB", tags: ["dashboard", "ui kit", "figma", "admin", "saas"], summary: "320 komponen dan 60 layar dashboard dengan mode gelap dan terang.", description: ["UI kit dashboard berbasis variable dan auto layout Figma. Semua komponen punya status hover, fokus, nonaktif, dan error.", "Termasuk 60 layar contoh: analitik, tabel data, pengaturan, dan alur onboarding."], includes: ["320 komponen", "60 layar", "Token warna dan tipografi", "Mode gelap dan terang"], createdAt: "2026-10-18", updatedAt: "2026-11-10", version: "2.1", sold: 187, art: { kind: "ui", hue: "sky", seed: 7 } }),
  P({ slug: "template-website-toko-online", sku: "KMY-UIX-0002", title: "Template Website Toko Online", creator: "rimba-pixel", category: "ui-ux", subcategory: "web-templates", price: 299000, licenses: ASSET, formats: ["Next.js", "Tailwind CSS"], compatibility: ["Node.js 20+", "Vercel", "Netlify"], delivery: "instant", fileSize: "4 MB", tags: ["template", "website", "toko online", "nextjs", "tailwind"], summary: "Template toko online responsif: katalog, detail produk, keranjang, dan halaman checkout.", description: ["Template Next.js App Router dengan Tailwind CSS. Data produk diambil dari file JSON sehingga mudah dihubungkan ke backend apa pun.", "Integrasi pembayaran tidak disertakan; template menyediakan halaman dan komponennya."], includes: ["12 halaman", "Komponen keranjang", "Dokumentasi deploy"], createdAt: "2026-09-30", sold: 73, art: { kind: "ui", hue: "emerald", seed: 19 } }),
  P({ slug: "paket-komponen-form-react", sku: "KMY-UIX-0003", title: "Paket Komponen Form React", creator: "rimba-pixel", category: "ui-ux", subcategory: "code-snippets", price: 149000, licenses: ASSET, formats: ["TSX"], compatibility: ["React 19", "Next.js 16"], delivery: "instant", fileSize: "1 MB", tags: ["react", "form", "komponen", "validasi", "aksesibilitas"], summary: "24 komponen form yang aksesibel dengan validasi dan pesan error yang jelas.", description: ["Input, select, combobox, upload file, dan date picker yang mengikuti WCAG 2.2 AA.", "Ditulis dalam TypeScript tanpa dependensi UI eksternal."], includes: ["24 komponen", "Contoh validasi", "Tes unit"], createdAt: "2026-11-11", sold: 18, art: { kind: "code", hue: "sky", seed: 33 } }),
  P({ slug: "kit-ui-aplikasi-kasir", sku: "KMY-UIX-0004", title: "Kit UI Aplikasi Kasir (Mobile)", creator: "rimba-pixel", category: "ui-ux", subcategory: "ui-kits", price: 259000, licenses: ASSET, formats: ["FIG"], compatibility: ["Figma"], delivery: "instant", fileSize: "22 MB", tags: ["mobile", "kasir", "pos", "umkm", "ui kit"], summary: "Desain aplikasi kasir untuk UMKM: transaksi, stok, laporan, dan struk.", description: ["48 layar aplikasi kasir mobile yang dirancang untuk alur kerja warung dan kafe kecil.", "Termasuk komponen struk dan laporan harian."], includes: ["48 layar", "Komponen struk", "Prototipe interaktif"], createdAt: "2026-08-05", sold: 64, art: { kind: "ui", hue: "amber", seed: 52 } }),

  P({ slug: "pitch-deck-startup", sku: "KMY-TPL-0001", title: "Pitch Deck Startup — 24 Slide", creator: "studio-kawi", category: "templates", subcategory: "presentations", price: 159000, licenses: ASSET, formats: ["PPTX", "KEY", "Google Slides"], compatibility: ["PowerPoint", "Keynote", "Google Slides"], delivery: "instant", fileSize: "18 MB", tags: ["pitch deck", "presentasi", "startup", "investor"], summary: "Struktur pitch deck yang teruji: masalah, solusi, pasar, traksi, dan pendanaan.", description: ["24 slide dengan alur cerita investor yang umum dipakai, lengkap dengan catatan penjelasan di setiap slide.", "Grafik dapat diedit langsung dari data."], includes: ["24 slide", "3 varian warna", "Catatan pembicara"], createdAt: "2026-10-25", sold: 129, art: { kind: "template", hue: "violet", seed: 15 } }),
  P({ slug: "kit-konten-instagram-umkm", sku: "KMY-TPL-0002", title: "Kit Konten Instagram UMKM", creator: "studio-kawi", category: "templates", subcategory: "social-kits", price: 89000, salePrice: 69000, licenses: ASSET, formats: ["Canva"], compatibility: ["Canva Free", "Canva Pro"], delivery: "instant", tags: ["instagram", "canva", "umkm", "konten", "promo"], summary: "90 desain feed dan story untuk promo, testimoni, dan katalog produk.", description: ["Template Canva yang bisa dipakai dengan akun gratis. Tinggal ganti foto produk, harga, dan warna merek.", "Link template diberikan setelah pembelian."], includes: ["60 feed", "30 story", "Panduan warna merek"], createdAt: "2026-09-08", sold: 402, art: { kind: "template", hue: "coral", seed: 22 } }),
  P({ slug: "template-cv-modern", sku: "KMY-TPL-0003", title: "Template CV Modern", creator: "studio-kawi", category: "templates", subcategory: "figma", price: 49000, licenses: ["personal", "commercial"], formats: ["FIG", "DOCX"], compatibility: ["Figma", "Microsoft Word"], delivery: "instant", fileSize: "3 MB", tags: ["cv", "resume", "lamaran kerja", "figma", "word"], summary: "CV satu halaman yang rapi dan ramah ATS, dalam Figma dan Word.", description: ["Tata letak satu kolom yang mudah dibaca sistem ATS, dengan varian dua kolom untuk portofolio kreatif."], includes: ["4 varian CV", "Surat lamaran", "File Word"], createdAt: "2026-07-19", sold: 233, art: { kind: "template", hue: "sky", seed: 9 } }),

  P({ slug: "set-ikon-garis-nusantara", sku: "KMY-GFX-0001", title: "Set Ikon Garis Nusantara (320 ikon)", creator: "tumbuh-studio", category: "graphics", subcategory: "icons", price: 119000, licenses: ASSET, formats: ["SVG", "PNG", "FIG"], compatibility: ["Figma", "Illustrator", "Web"], delivery: "instant", fileSize: "12 MB", tags: ["ikon", "svg", "garis", "nusantara", "kuliner"], summary: "320 ikon garis 24px: kuliner, transportasi, budaya, dan layanan publik.", description: ["Ikon dengan grid 24px dan stroke 2px yang konsisten, dioptimalkan untuk antarmuka web dan mobile."], includes: ["320 ikon SVG", "Komponen Figma", "Font ikon"], createdAt: "2026-10-10", sold: 155, art: { kind: "graphic", hue: "emerald", seed: 44 } }),
  P({ slug: "ilustrasi-kota-tropis", sku: "KMY-GFX-0002", title: "Ilustrasi Kota Tropis", creator: "tumbuh-studio", category: "graphics", subcategory: "illustrations", price: 179000, licenses: ASSET, formats: ["AI", "SVG", "PNG"], compatibility: ["Illustrator", "Figma", "Affinity Designer"], delivery: "instant", fileSize: "64 MB", tags: ["ilustrasi", "kota", "tropis", "landing page"], summary: "16 ilustrasi suasana kota tropis untuk landing page dan presentasi.", description: ["Ilustrasi vektor dengan layer terpisah sehingga warna dan elemen bisa diubah."], includes: ["16 ilustrasi", "File sumber berlayer"], createdAt: "2026-09-02", sold: 47, art: { kind: "graphic", hue: "amber", seed: 61 } }),
  P({ slug: "brand-kit-kedai-kopi", sku: "KMY-GFX-0003", title: "Brand Kit Kedai Kopi", creator: "tumbuh-studio", category: "graphics", subcategory: "logos-branding", price: 229000, licenses: ["personal", "commercial"], formats: ["AI", "PDF", "PNG"], compatibility: ["Illustrator", "Canva"], delivery: "instant", fileSize: "28 MB", tags: ["branding", "logo", "kopi", "kafe", "menu"], summary: "Logo yang bisa diedit, menu, kartu nama, dan kemasan untuk kedai kopi.", description: ["Kit identitas untuk usaha kopi kecil. Nama dan warna mudah diganti; logo bukan merek dagang terdaftar milik siapa pun."], includes: ["3 konsep logo", "Menu A4", "Kartu nama", "Label gelas"], createdAt: "2026-11-02", sold: 39, art: { kind: "graphic", hue: "rose", seed: 5 } }),

  P({ slug: "sfx-antarmuka-klik-notifikasi", sku: "KMY-AVM-0001", title: "SFX Antarmuka: Klik & Notifikasi", creator: "sora-audio", category: "audio-video", subcategory: "sound-effects", price: 79000, licenses: ASSET, formats: ["WAV 48 kHz", "OGG"], compatibility: ["Semua DAW", "Unity", "Roblox Studio"], delivery: "instant", fileSize: "210 MB", tags: ["sfx", "ui", "klik", "notifikasi", "game"], summary: "150 efek suara antarmuka yang bersih untuk aplikasi dan game.", description: ["Klik, toggle, notifikasi, sukses, dan error yang direkam dan didesain sendiri. Tiap suara tersedia dalam tiga variasi."], includes: ["150 file WAV", "Versi OGG", "Lembar lisensi"], createdAt: "2026-10-28", sold: 268, art: { kind: "audio", hue: "sky", seed: 13 } }),
  P({ slug: "musik-lofi-latar", sku: "KMY-AVM-0002", title: "Musik Lo-fi Latar (12 lagu)", creator: "sora-audio", category: "audio-video", subcategory: "music", price: 199000, salePrice: 159000, licenses: ASSET, formats: ["WAV", "MP3"], compatibility: ["YouTube", "TikTok", "Podcast"], delivery: "instant", fileSize: "540 MB", tags: ["musik", "lofi", "latar", "youtube", "konten"], summary: "12 lagu lo-fi untuk video dan streaming, dengan stem terpisah.", description: ["Dikomposisi sendiri oleh kreator. Lisensi komersial mencakup monetisasi video; detailnya ada di bagian lisensi.", "Lagu tidak terdaftar di Content ID, jadi tidak memicu klaim otomatis."], includes: ["12 lagu", "Stem drum, bass, melodi", "Versi loop 30 detik"], createdAt: "2026-09-21", sold: 176, art: { kind: "audio", hue: "violet", seed: 37 } }),
  P({ slug: "ambience-hutan-hujan", sku: "KMY-AVM-0003", title: "Ambience Hutan Hujan Kalimantan", creator: "sora-audio", category: "audio-video", subcategory: "sound-effects", price: 99000, licenses: ASSET, formats: ["WAV 96 kHz"], compatibility: ["Semua DAW", "Unreal Engine", "Unity"], delivery: "instant", fileSize: "1,4 GB", tags: ["ambience", "hutan", "alam", "field recording"], summary: "Rekaman lapangan 3 jam: pagi, siang, hujan, dan malam di hutan tropis.", description: ["Direkam dengan mikrofon stereo dan ambisonik. Cocok untuk game, film dokumenter, dan meditasi."], includes: ["24 rekaman", "Versi ambisonik", "Catatan lokasi rekam"], createdAt: "2026-11-12", sold: 12, art: { kind: "audio", hue: "emerald", seed: 71 } }),
  P({ slug: "paket-transisi-video-glitch", sku: "KMY-AVM-0004", title: "Paket Transisi Video Glitch", creator: "lentera-motion", category: "audio-video", subcategory: "video-assets", price: 139000, licenses: ASSET, formats: ["MOGRT", "AEP", "DRFX"], compatibility: ["Premiere Pro", "After Effects", "DaVinci Resolve"], delivery: "instant", fileSize: "760 MB", tags: ["transisi", "glitch", "video", "premiere", "davinci"], summary: "60 transisi glitch drag-and-drop untuk tiga aplikasi editing.", description: ["Tidak perlu plugin tambahan. Durasi dan intensitas bisa diatur langsung dari panel."], includes: ["60 transisi", "SFX pendamping", "Tutorial singkat"], createdAt: "2026-10-06", sold: 88, art: { kind: "video", hue: "coral", seed: 26 } }),
  P({ slug: "lower-third-gaya-berita", sku: "KMY-AVM-0005", title: "Lower Third Gaya Berita", creator: "lentera-motion", category: "audio-video", subcategory: "video-assets", price: 89000, licenses: ASSET, formats: ["MOGRT", "AEP"], compatibility: ["Premiere Pro", "After Effects"], delivery: "instant", fileSize: "120 MB", tags: ["lower third", "berita", "judul", "motion graphics"], summary: "24 lower third dan judul animasi bergaya siaran berita.", description: ["Teks, warna, dan durasi dapat diubah dari Essential Graphics."], includes: ["24 lower third", "6 bumper judul"], createdAt: "2026-07-30", sold: 51, art: { kind: "video", hue: "amber", seed: 48 } }),

  P({ slug: "penata-pencahayaan-roblox-studio", sku: "KMY-SWT-0001", title: "Penata Pencahayaan untuk Roblox Studio", creator: "garda-tools", category: "tools-plugins", subcategory: "plugins", price: 149000, licenses: ["personal", "commercial"], formats: ["Plugin .rbxmx"], compatibility: ["Roblox Studio"], delivery: "instant", fileSize: "2 MB", tags: ["roblox", "plugin", "lighting", "atmosphere", "preset"], summary: "Plugin Studio dengan 30 preset pencahayaan dan atmosfer, bisa diatur ulang sekali klik.", description: ["Simpan, bandingkan, dan terapkan preset Lighting, Atmosphere, dan post-processing langsung dari panel plugin.", "Plugin tidak meminta izin HTTP dan tidak mengirim data apa pun ke luar."], includes: ["Plugin", "30 preset", "Dokumentasi"], createdAt: "2026-10-15", sold: 119, art: { kind: "plugin", hue: "sky", seed: 17 } }),
  P({ slug: "sistem-inventori-luau", sku: "KMY-SWT-0002", title: "Sistem Inventori Luau (strict)", creator: "garda-tools", category: "tools-plugins", subcategory: "scripts", price: 179000, licenses: ASSET, formats: ["Luau"], compatibility: ["Roblox Studio", "Rojo"], delivery: "instant", fileSize: "300 KB", tags: ["roblox", "luau", "inventori", "datastore", "script"], summary: "Inventori dengan penyimpanan DataStore yang aman, session lock, dan UI contoh.", description: ["Server-authoritative: semua perubahan inventori divalidasi di server dan disimpan dengan retry serta session lock.", "Kode bertipe ketat (--!strict) dan disertai tes."], includes: ["Modul server", "Controller klien", "UI contoh", "Tes TestEZ"], createdAt: "2026-11-07", sold: 34, art: { kind: "code", hue: "violet", seed: 63 } }),
  P({ slug: "batch-exporter-blender", sku: "KMY-SWT-0003", title: "Batch Exporter untuk Blender", creator: "garda-tools", category: "tools-plugins", subcategory: "plugins", price: 129000, licenses: ["personal", "commercial"], formats: ["Add-on Python"], compatibility: ["Blender 4.x"], delivery: "instant", fileSize: "180 KB", tags: ["blender", "add-on", "export", "fbx", "batch"], summary: "Ekspor puluhan objek sekaligus ke FBX/GLB dengan aturan nama dan pivot.", description: ["Atur preset ekspor per koleksi, termasuk skala, sumbu, dan pivot. Cocok untuk pipeline aset game."], includes: ["Add-on", "Preset Unity dan Roblox"], createdAt: "2026-06-14", sold: 77, art: { kind: "plugin", hue: "amber", seed: 29 } }),

  P({ slug: "jasa-desain-logo-identitas", sku: "KMY-SRV-0001", title: "Jasa Desain Logo & Identitas", creator: "tumbuh-studio", category: "creative-services", subcategory: "services", price: 1500000, licenses: ["service"], formats: ["AI", "PDF", "PNG"], compatibility: ["Diserahkan dalam format siap cetak dan web"], delivery: "manual", deliveryDays: 10, tags: ["jasa", "logo", "branding", "identitas"], summary: "Logo, palet warna, dan panduan merek singkat. Dua kali revisi.", description: ["Proses dimulai dengan brief singkat, lalu tiga konsep logo. Konsep terpilih dikembangkan menjadi identitas dasar.", "Hak penggunaan logo diserahkan penuh kepada pembeli setelah pekerjaan selesai."], includes: ["3 konsep", "2 revisi", "Panduan merek 8 halaman"], createdAt: "2026-10-20", sold: 9, art: { kind: "service", hue: "rose", seed: 2 } }),
  P({ slug: "jasa-pembuatan-landing-page", sku: "KMY-SRV-0002", title: "Jasa Pembuatan Landing Page", creator: "rimba-pixel", category: "creative-services", subcategory: "web-development", price: 3500000, licenses: ["service"], formats: ["Next.js", "Kode sumber"], compatibility: ["Hosting pilihan pembeli"], delivery: "manual", deliveryDays: 14, tags: ["jasa", "landing page", "website", "nextjs"], summary: "Desain dan pengembangan satu landing page responsif, termasuk copywriting dasar.", description: ["Mencakup desain di Figma, pengembangan, dan bantuan deploy. Domain dan hosting tidak termasuk."], includes: ["Desain Figma", "Kode sumber", "1 kali revisi besar"], createdAt: "2026-09-16", sold: 6, art: { kind: "service", hue: "sky", seed: 8 } }),
  P({ slug: "jasa-model-3d-kustom", sku: "KMY-SRV-0003", title: "Jasa Model 3D Kustom", creator: "nusantara-lowpoly", category: "creative-services", subcategory: "custom-3d", price: 750000, licenses: ["service"], formats: ["FBX", "GLB", "BLEND"], compatibility: ["Blender", "Unity", "Unreal Engine", "Roblox Studio"], delivery: "manual", deliveryDays: 7, tags: ["jasa", "3d", "kustom", "lowpoly", "props"], summary: "Model props lowpoly sesuai referenmu, hingga 5 objek per pesanan.", description: ["Kirim referensi gambar dan ukuran; kreator mengirim draf dalam 3 hari kerja."], includes: ["Hingga 5 objek", "Tekstur", "2 revisi"], createdAt: "2026-11-03", sold: 4, art: { kind: "service", hue: "emerald", seed: 66 } }),
];

export const REVIEWS: Review[] = [
  { productSlug: "rumah-adat-lowpoly-pack", author: "Pembeli uji A", rating: 5, body: "Model ringan dan skalanya pas. Atlas teksturnya memudahkan optimasi di mobile.", createdAt: "2026-10-20" },
  { productSlug: "rumah-adat-lowpoly-pack", author: "Pembeli uji B", rating: 4, body: "Bagus untuk prototipe. Semoga nanti ada versi interior.", createdAt: "2026-10-28" },
  { productSlug: "roblox-obby-starter-kit", author: "Pembeli uji C", rating: 5, body: "Checkpoint langsung jalan, dokumentasinya jelas.", createdAt: "2026-11-08" },
  { productSlug: "nimbus-dashboard-ui-kit", author: "Pembeli uji D", rating: 5, body: "Variabel warnanya rapi, tinggal ganti token untuk brand kami.", createdAt: "2026-11-02" },
  { productSlug: "nimbus-dashboard-ui-kit", author: "Pembeli uji E", rating: 4, body: "Lengkap. Beberapa layar tabel masih kurang varian kosongnya.", createdAt: "2026-11-06" },
  { productSlug: "kit-konten-instagram-umkm", author: "Pembeli uji F", rating: 5, body: "Bisa dipakai di Canva gratis, sangat membantu.", createdAt: "2026-09-30" },
  { productSlug: "sfx-antarmuka-klik-notifikasi", author: "Pembeli uji G", rating: 4, body: "Suaranya bersih, variasinya pas untuk game kasual.", createdAt: "2026-11-04" },
  { productSlug: "musik-lofi-latar", author: "Pembeli uji H", rating: 5, body: "Stem terpisah sangat berguna untuk podcast.", createdAt: "2026-10-12" },
  { productSlug: "pitch-deck-startup", author: "Pembeli uji I", rating: 4, body: "Struktur ceritanya membantu, grafik mudah diedit.", createdAt: "2026-11-01" },
  { productSlug: "penata-pencahayaan-roblox-studio", author: "Pembeli uji J", rating: 5, body: "Preset senjanya langsung dipakai di map kami.", createdAt: "2026-10-30" },
];

export const LICENSE_MULTIPLIER: Record<LicenseId, number> = { personal: 1, commercial: 2, extended: 4, service: 1 };

export const HOMEPAGE = {
  announcement: "Pratinjau pengembangan privat. Produk, harga, dan ulasan adalah data uji.",
  trendingSearches: ["roblox", "ui kit dashboard", "pitch deck", "sfx game", "lowpoly", "template canva", "luau"],
  campaigns: [
    { id: "pekan-nusantara", code: "CMP-2611", period: "17–30 Nov 2026", title: "Aset bertema Nusantara, siap masuk game-mu.", body: "Rumah adat, pasar malam, dan tekstur batik dari kreator lokal. Beberapa sedang diskon.", cta: "Lihat yang diskon", href: "/collections/discounts", productSlug: "rumah-adat-lowpoly-pack", hue: "amber" as ArtHue, kind: "cube" as ArtKind },
    { id: "roblox-dev", code: "CMP-2612", period: null, title: "Bangun game Roblox lebih cepat.", body: "Starter kit, script Luau bertipe ketat, dan plugin Studio dari developer Indonesia.", cta: "Jelajahi aset Roblox", href: "/category/3d-game/roblox-assets", productSlug: "roblox-obby-starter-kit", hue: "sky" as ArtHue, kind: "plugin" as ArtKind },
    { id: "tim-produk", code: "CMP-2613", period: null, title: "UI kit dan template untuk tim produk.", body: "Komponen Figma dan template Next.js dengan lisensi yang tertulis jelas.", cta: "Lihat UI/UX & Web", href: "/category/ui-ux", productSlug: "nimbus-dashboard-ui-kit", hue: "violet" as ArtHue, kind: "ui" as ArtKind },
  ],
  featured: ["nimbus-dashboard-ui-kit", "rumah-adat-lowpoly-pack", "musik-lofi-latar", "pitch-deck-startup", "penata-pencahayaan-roblox-studio"],
  spotlight: ["nusantara-lowpoly", "rimba-pixel", "sora-audio", "garda-tools"],
};

// ---------- queries (pure, usable on server and client) ----------

export const topCategories = () => CATEGORIES.filter((c) => c.parentId === null);
export const subcategoriesOf = (id: string) => CATEGORIES.filter((c) => c.parentId === id);
export const getCategory = (id: string) => CATEGORIES.find((c) => c.id === id);
export const getProduct = (slug: string) => PRODUCTS.find((p) => p.slug === slug);
export const getCreator = (slug: string) => CREATORS.find((c) => c.slug === slug);
export const productsByCreator = (slug: string) => PRODUCTS.filter((p) => p.creator === slug);
export const countInCategory = (id: string) => PRODUCTS.filter((p) => p.category === id || p.subcategory === id).length;
export const reviewsFor = (slug: string) => REVIEWS.filter((r) => r.productSlug === slug);

export function ratingFor(slug: string): { average: number; count: number } | null {
  const list = reviewsFor(slug);
  if (list.length === 0) return null;
  return { average: list.reduce((s, r) => s + r.rating, 0) / list.length, count: list.length };
}

export const effectivePrice = (p: Product) => p.salePrice ?? p.price;
export const discountPercent = (p: Product) => (p.salePrice ? Math.round((1 - p.salePrice / p.price) * 100) : 0);
export const licensePrice = (p: Product, license: LicenseId) => effectivePrice(p) * LICENSE_MULTIPLIER[license];

const NEW_CUTOFF = "2026-11-01";
export const isNew = (p: Product) => p.createdAt >= NEW_CUTOFF;
export const bestSellers = () => [...PRODUCTS].sort((a, b) => b.sold - a.sold);
export const newest = () => [...PRODUCTS].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
export const discounted = () => PRODUCTS.filter((p) => p.salePrice);

export function relatedProducts(p: Product, limit = 6) {
  return PRODUCTS.filter((x) => x.slug !== p.slug)
    .map((x) => ({ x, score: (x.subcategory === p.subcategory ? 3 : 0) + (x.category === p.category ? 2 : 0) + (x.creator === p.creator ? 1 : 0) + x.tags.filter((t) => p.tags.includes(t)).length }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || b.x.sold - a.x.sold)
    .slice(0, limit)
    .map((r) => r.x);
}

// ---------- search & filtering ----------

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

export function searchScore(p: Product, query: string): number {
  const q = norm(query.trim());
  if (!q) return 1;
  if (norm(p.sku) === q) return 100;
  const creator = getCreator(p.creator);
  const cats = [getCategory(p.category), getCategory(p.subcategory)].filter(Boolean) as Category[];
  let score = 0;
  for (const term of q.split(/\s+/).filter(Boolean)) {
    let hit = 0;
    if (norm(p.title).includes(term)) hit = Math.max(hit, 6);
    if (p.tags.some((t) => norm(t).includes(term))) hit = Math.max(hit, 4);
    if (creator && norm(creator.name).includes(term)) hit = Math.max(hit, 4);
    if (cats.some((c) => norm(c.name.id).includes(term) || norm(c.name.en).includes(term))) hit = Math.max(hit, 3);
    if (p.formats.some((f) => norm(f).includes(term)) || p.compatibility.some((f) => norm(f).includes(term))) hit = Math.max(hit, 2);
    if (norm(p.summary).includes(term) || norm(p.sku).includes(term)) hit = Math.max(hit, 1);
    if (hit === 0) return 0; // every term must match something
    score += hit;
  }
  return score;
}

export type SortKey = "relevance" | "newest" | "price-asc" | "price-desc" | "best-selling" | "rating";
export const SORT_KEYS: SortKey[] = ["relevance", "newest", "price-asc", "price-desc", "best-selling", "rating"];

export type CatalogQuery = {
  q?: string;
  category?: string;
  sub?: string;
  min?: number;
  max?: number;
  formats?: string[];
  license?: LicenseId;
  creator?: string;
  rating?: number;
  discount?: boolean;
  newOnly?: boolean;
  delivery?: Delivery;
  sort?: SortKey;
};

export function queryCatalog(query: CatalogQuery): Product[] {
  const scored = PRODUCTS.map((p) => ({ p, s: searchScore(p, query.q ?? "") })).filter(({ p, s }) => {
    if (s <= 0) return false;
    if (query.category && p.category !== query.category) return false;
    if (query.sub && p.subcategory !== query.sub) return false;
    const price = effectivePrice(p);
    if (query.min != null && price < query.min) return false;
    if (query.max != null && price > query.max) return false;
    if (query.formats?.length && !query.formats.some((f) => formatGroup(p).includes(f))) return false;
    if (query.license && !p.licenses.includes(query.license)) return false;
    if (query.creator && p.creator !== query.creator) return false;
    if (query.rating && (ratingFor(p.slug)?.average ?? 0) < query.rating) return false;
    if (query.discount && !p.salePrice) return false;
    if (query.newOnly && !isNew(p)) return false;
    if (query.delivery && p.delivery !== query.delivery) return false;
    return true;
  });
  const sort = query.sort ?? (query.q ? "relevance" : "best-selling");
  scored.sort((a, b) => {
    switch (sort) {
      case "newest": return b.p.createdAt.localeCompare(a.p.createdAt);
      case "price-asc": return effectivePrice(a.p) - effectivePrice(b.p);
      case "price-desc": return effectivePrice(b.p) - effectivePrice(a.p);
      case "best-selling": return b.p.sold - a.p.sold;
      case "rating": return (ratingFor(b.p.slug)?.average ?? 0) - (ratingFor(a.p.slug)?.average ?? 0) || b.p.sold - a.p.sold;
      default: return b.s - a.s || b.p.sold - a.p.sold;
    }
  });
  return scored.map(({ p }) => p);
}

/** Format families used by the filter (raw formats vary, e.g. "WAV 48 kHz"). */
export const FORMAT_GROUPS = ["FBX", "GLB", "BLEND", "FIG", "PSD/AI", "SVG", "PNG", "Canva", "PPTX", "WAV", "MP3", "MOGRT", "Luau", "Next.js"] as const;
export function formatGroup(p: Product): string[] {
  const out = new Set<string>();
  for (const f of p.formats) {
    const u = f.toUpperCase();
    for (const g of FORMAT_GROUPS) {
      if (g === "PSD/AI" ? /^(AI|PSD)\b/.test(u) : u.startsWith(g.toUpperCase())) out.add(g);
    }
  }
  return [...out];
}

export type Suggestion =
  | { type: "product"; slug: string; title: string; price: number; art: Product["art"]; creator: string }
  | { type: "creator"; slug: string; name: string }
  | { type: "category"; id: string; parentId: string | null; name: { id: string; en: string } };

export function suggest(query: string, limit = 5): Suggestion[] {
  const q = norm(query.trim());
  if (!q) return [];
  const products = queryCatalog({ q, sort: "relevance" }).slice(0, limit).map<Suggestion>((p) => ({ type: "product", slug: p.slug, title: p.title, price: effectivePrice(p), art: p.art, creator: getCreator(p.creator)?.name ?? "" }));
  const creators = CREATORS.filter((c) => norm(c.name).includes(q)).slice(0, 3).map<Suggestion>((c) => ({ type: "creator", slug: c.slug, name: c.name }));
  const categories = CATEGORIES.filter((c) => norm(c.name.id).includes(q) || norm(c.name.en).includes(q)).slice(0, 3).map<Suggestion>((c) => ({ type: "category", id: c.id, parentId: c.parentId, name: c.name }));
  return [...categories, ...products, ...creators];
}

export const categoryHref = (c: Pick<Category, "id" | "parentId">) => (c.parentId ? `/category/${c.parentId}/${c.id}` : `/category/${c.id}`);
