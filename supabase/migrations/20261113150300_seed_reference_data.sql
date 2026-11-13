-- KAMY Merchant Studio — reference data
-- Categories, the first versions of the seller agreement and ownership declaration,
-- and platform license templates.
-- NOTE: policy text is a plain-language working draft (version "1.0-draft") and must be
-- reviewed by counsel before KAMY accepts real sellers.

-- ---------------------------------------------------------------------------
-- Categories
-- ---------------------------------------------------------------------------
insert into public.categories (id, parent_id, name_id, name_en, icon, sort_order) values
  ('3d-game',       null, '3D & Game',          '3D & Game',       '3d', 10),
  ('ui-ux',         null, 'UI / UX',            'UI / UX',         'uiux', 20),
  ('templates',     null, 'Template',           'Templates',       'templates', 30),
  ('graphics',      null, 'Grafis',             'Graphics',        'graphics', 40),
  ('audio-video',   null, 'Audio & Video',      'Audio & Video',   'audio', 50),
  ('tools-plugins', null, 'Tools & Plugin',     'Tools & Plugins', 'plugins', 60),

  ('3d-models',        '3d-game', 'Model 3D',              '3D models',          'model3d', 11),
  ('roblox-assets',    '3d-game', 'Aset Roblox',           'Roblox assets',      'asset', 12),
  ('unity-assets',     '3d-game', 'Aset Unity',            'Unity assets',       'asset', 13),
  ('textures',         '3d-game', 'Tekstur & material',    'Textures & materials','image', 14),
  ('ui-kits',          'ui-ux',   'UI kit',                'UI kits',            'uiux', 21),
  ('web-templates',    'ui-ux',   'Template website',      'Website templates',  'desktop', 22),
  ('code-snippets',    'ui-ux',   'Potongan kode',         'Code snippets',      'file', 23),
  ('canva',            'templates','Template Canva',       'Canva templates',    'templates', 31),
  ('figma',            'templates','Template Figma',       'Figma templates',    'templates', 32),
  ('presentations',    'templates','Presentasi',           'Presentations',      'templates', 33),
  ('social-kits',      'templates','Kit media sosial',     'Social media kits',  'templates', 34),
  ('illustrations',    'graphics','Ilustrasi',             'Illustrations',      'graphics', 41),
  ('icons',            'graphics','Ikon',                  'Icons',              'graphics', 42),
  ('logos-branding',   'graphics','Logo & branding',       'Logos & branding',   'graphics', 43),
  ('music',            'audio-video','Musik',              'Music',              'audio', 51),
  ('sound-effects',    'audio-video','Efek suara',         'Sound effects',      'audio', 52),
  ('video-assets',     'audio-video','Aset video',         'Video assets',       'video', 53),
  ('scripts',          'tools-plugins','Script',           'Scripts',            'tools', 61),
  ('plugins',          'tools-plugins','Plugin',           'Plugins',            'plugins', 62),
  ('services',         'tools-plugins','Jasa kreatif',     'Creative services',  'tools', 63);

-- ---------------------------------------------------------------------------
-- Seller agreement v1.0-draft
-- ---------------------------------------------------------------------------
insert into public.policy_documents
  (kind, version, title_id, title_en, summary_id, summary_en, body_id, body_en, is_current)
values (
  'seller_agreement',
  '1.0-draft',
  'Perjanjian Penjual KAMY',
  'KAMY Seller Agreement',
  array[
    'Kamu hanya menjual karya yang kamu buat sendiri atau yang hak distribusinya kamu miliki.',
    'Setiap produk ditinjau sebelum tayang. Jika ada yang perlu diubah, kami tunjukkan bagian mana dan alasannya.',
    'Pembeli mendapat lisensi sesuai yang kamu pilih. Lisensi yang sudah terbit tidak berubah walau kamu memperbarui template.',
    'Biaya platform dan biaya pembayaran ditampilkan terbuka di setiap pesanan.',
    'Pelanggaran ditangani bertahap: peringatan, penurunan listing, lalu penangguhan. Kamu selalu bisa mengajukan banding.'
  ],
  array[
    'You only sell work you created or have the right to distribute.',
    'Every product is reviewed before it goes live. If something needs changing, we show you which part and why.',
    'Buyers receive the license you choose. Issued licenses never change, even if you later edit a template.',
    'Platform and payment fees are shown openly on every order.',
    'Violations are handled step by step: warning, listing removal, then suspension. You can always appeal.'
  ],
  $body$## 1. Tentang perjanjian ini
Perjanjian ini mengatur hubunganmu sebagai penjual dengan KAMY. Dengan menyetujuinya, kamu membuka toko dan dapat mengajukan produk digital untuk dijual di KAMY.

## 2. Apa yang boleh dijual
Kamu hanya boleh menjual karya yang kamu buat sendiri, atau karya yang hak distribusinya kamu miliki secara sah. Kamu bertanggung jawab atas kebenaran informasi di setiap listing, termasuk format, kompatibilitas, dan isi paket.

## 3. Barang yang dilarang
Tidak boleh menjual: perangkat lunak bajakan, akun curian, item game tanpa izin pemiliknya, aset yang diambil (ripped) dari game atau karya lain, dan listing yang menyesatkan atau curang. Daftar lengkap ada di halaman Kebijakan Barang Terlarang.

## 4. Peninjauan
Setiap produk baru dan setiap perubahan penting (file, lisensi, atau harga di atas batas tertentu) ditinjau sebelum tayang. Jika kami meminta perubahan, komentar kami merujuk ke bagian listing yang spesifik. Penolakan selalu menyebut pasal kebijakan yang relevan dan cara mengajukan banding.

## 5. Lisensi untuk pembeli
Pembeli menerima lisensi yang kamu pilih saat membeli. Lisensi yang sudah diterbitkan tidak berubah meskipun kamu memperbarui template lisensi di kemudian hari.

## 6. Biaya dan pembayaran
Persentase biaya platform dan biaya pemrosesan pembayaran ditampilkan pada setiap pesanan. Data rekening hanya diproses oleh penyedia pembayaran pihak ketiga yang patuh regulasi; KAMY hanya menyimpan referensinya. Selama penyedia pembayaran belum terhubung, tidak ada transaksi nyata yang diproses.

## 7. Pengembalian dana
Kamu memilih kebijakan pengembalian dana dari opsi yang disetujui KAMY. Permintaan pengembalian dana harus ditanggapi dalam batas waktu yang ditampilkan di pesanan.

## 8. Pelanggaran dan banding
Pelanggaran ditangani bertahap: peringatan, penurunan listing, lalu penangguhan akun. Setiap tindakan disertai alasan dan jalur banding. Kamu juga dapat mengajukan counter-notice jika listingmu dilaporkan secara keliru.

## 9. Perubahan perjanjian
Jika perjanjian ini diperbarui, kami akan memintamu meninjau dan menyetujui versi baru. Versi dan waktu persetujuanmu disimpan dan dapat kamu lihat kapan saja.$body$,
  $body$## 1. About this agreement
This agreement covers your relationship with KAMY as a seller. By accepting it, you open a store and can submit digital products for sale on KAMY.

## 2. What you can sell
You may only sell work you created yourself, or work you legally have the right to distribute. You are responsible for the accuracy of every listing, including formats, compatibility, and what the package contains.

## 3. Prohibited items
You may not sell: pirated software, stolen accounts, game items without the owner's permission, assets ripped from games or other works, or misleading and fraudulent listings. The full list is on the Prohibited Items policy page.

## 4. Review
Every new product, and every material change (files, license, or price beyond a set threshold), is reviewed before it goes live. When we request changes, our comments point to the specific part of the listing. Rejections always cite the relevant policy section and explain how to appeal.

## 5. Licenses for buyers
Buyers receive the license you selected at the time of purchase. Issued licenses never change, even if you later update a license template.

## 6. Fees and payouts
Platform fee and payment processing fee percentages are shown on every order. Bank details are handled only by a compliant third-party payment provider; KAMY stores references only. Until a payment provider is connected, no real transactions are processed.

## 7. Refunds
You choose a refund policy from KAMY-approved options. Refund requests must be answered within the deadline shown on the order.

## 8. Violations and appeals
Violations are handled step by step: warning, listing removal, then account suspension. Every action comes with a reason and an appeal path. You can also file a counter-notice if your listing was reported in error.

## 9. Changes to this agreement
If this agreement is updated, we will ask you to review and accept the new version. The version and the time you accepted it are stored and visible to you at any time.$body$,
  true
);

-- ---------------------------------------------------------------------------
-- Ownership declaration v1.0-draft
-- ---------------------------------------------------------------------------
insert into public.policy_documents
  (kind, version, title_id, title_en, summary_id, summary_en, body_id, body_en, is_current)
values (
  'ownership_declaration',
  '1.0-draft',
  'Pernyataan Kepemilikan',
  'Ownership Declaration',
  array[
    'Saya membuat sendiri karya yang saya jual, atau saya memiliki izin tertulis untuk mendistribusikannya.',
    'Saya tidak akan menjual aset bajakan, aset yang diambil dari game atau karya lain, atau akun dan item milik orang lain.',
    'Jika ada laporan pelanggaran hak cipta, saya bersedia memberikan bukti kepemilikan.'
  ],
  array[
    'I created the work I sell, or I hold written permission to distribute it.',
    'I will not sell pirated assets, assets ripped from games or other works, or accounts and items that belong to others.',
    'If a copyright report is filed, I will provide proof of ownership.'
  ],
  $body$Dengan pernyataan ini, saya menyatakan bahwa saya adalah pembuat karya yang saya jual di KAMY, atau saya memiliki hak yang sah untuk mendistribusikannya. Saya memahami bahwa listing yang melanggar hak pihak lain dapat diturunkan, dan bahwa pernyataan ini disimpan beserta waktu persetujuannya. Untuk setiap produk, saya akan kembali mengonfirmasi kepemilikan sebelum mengajukannya untuk ditinjau.$body$,
  $body$With this declaration, I state that I am the creator of the work I sell on KAMY, or that I hold the legal right to distribute it. I understand that listings infringing on others' rights can be removed, and that this declaration is stored together with the time I accepted it. For every product, I will confirm ownership again before submitting it for review.$body$,
  true
);

-- ---------------------------------------------------------------------------
-- Platform license templates
-- ---------------------------------------------------------------------------
insert into public.licenses
  (merchant_id, key, version, name_id, name_en, summary_id, summary_en, can_id, can_en, cannot_id, cannot_en)
values
  (null, 'personal', 1, 'Personal', 'Personal',
   'Untuk proyek pribadi yang tidak menghasilkan uang.',
   'For personal projects that do not make money.',
   array['Dipakai di proyek pribadi', 'Diubah untuk kebutuhan sendiri', 'Dipakai di portofolio non-komersial'],
   array['Use in personal projects', 'Modify for your own needs', 'Show in a non-commercial portfolio'],
   array['Dipakai untuk klien atau proyek berbayar', 'Dijual ulang atau dibagikan, termasuk setelah diubah', 'Dipakai di produk yang dijual'],
   array['Use for clients or paid projects', 'Resell or share, even after modifying', 'Use in a product you sell']),
  (null, 'commercial', 1, 'Komersial', 'Commercial',
   'Untuk satu proyek komersial, termasuk pekerjaan klien.',
   'For one commercial project, including client work.',
   array['Dipakai di satu proyek komersial atau klien', 'Diubah dan digabung dengan karyamu', 'Dipakai di iklan dan media sosial'],
   array['Use in one commercial or client project', 'Modify and combine with your own work', 'Use in ads and social media'],
   array['Dijual ulang sebagai aset atau template', 'Dipakai di produk yang dijual dalam jumlah tak terbatas', 'Dibagikan file sumbernya'],
   array['Resell as an asset or template', 'Use in a product sold in unlimited copies', 'Share the source files']),
  (null, 'extended', 1, 'Extended', 'Extended',
   'Untuk produk yang dijual berulang kali, seperti game, aplikasi, atau merchandise.',
   'For products sold many times, such as games, apps, or merchandise.',
   array['Dipakai di produk yang dijual berulang kali', 'Dipakai di beberapa proyek komersial', 'Diubah tanpa batas'],
   array['Use in products sold many times', 'Use across multiple commercial projects', 'Modify without limits'],
   array['Dijual ulang sebagai aset mentah atau template', 'Diklaim sebagai karya buatanmu sendiri'],
   array['Resell as a raw asset or template', 'Claim as your own original work']);
