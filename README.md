<div align="center">
  <img src="logo.svg" alt="Logo Baz-On" width="110" />

  # Baz-On

  Toko online statis. Nggak ada backend, nggak ada database — pembeli milih barang, masukin ke keranjang, lalu checkout-nya dikirim sebagai pesan WhatsApp ke penjual.

  [Lihat demo](https://aqles.github.io/baz-on)

  <img src="images/desktop-preview.png" alt="Tampilan Baz-On di desktop" width="800" />
</div>

## Isinya apa aja

Barang yang dijual campur-campur kayak bazaar beneran: fashion, jam tangan, sneakers, tas, headset, kue, sampai jasa bungkus kado dan cuci sepatu. Total 12 produk contoh, semuanya diatur dari satu file `data.js`.

Yang bisa dilakukan pengunjung:

- Liat-liat katalog, cari produk, filter per kategori, urutkan dari harga atau nama
- Buka detail produk: foto, rating, stok, spesifikasi, pilihan ukuran/warna/rasa (beberapa varian punya harga sendiri)
- Simpan produk ke favorit/wishlist
- Masukkan ke keranjang, atur jumlahnya, pakai kode kupon (`BAZON10` diskon 10%, `HEMAT50` potongan Rp50.000)
- Checkout: isi nama, nomor WhatsApp, alamat, metode pembayaran — pesanan terkirim ke WhatsApp penjual dalam bentuk pesan yang sudah rapi
- Ganti bahasa Indonesia/Inggris dan ganti tema gelap/terang (pilihannya diingat browser)
- Keranjang, wishlist, dan alamat pembeli tersimpan di localStorage, jadi nggak hilang pas halaman ditutup

Ada juga slider banner di halaman depan, hitung mundur flash sale, testimoni, halaman Tentang/Kontak/Syarat & Ketentuan, dan halaman panduan install.

## Jalanin di komputer sendiri

Nggak perlu install apa-apa. Cukup server statis biasa:

```bash
git clone https://github.com/aqles/baz-on.git
cd baz-on
python3 -m http.server 8000
```

Lalu buka `http://localhost:8000`. Pakai server lokal kayak gini (bukan klik dua kali file-nya) supaya service worker dan fitur PWA-nya jalan beneran.

## Ngatur isinya

Hampir semua isi toko diatur dari **`data.js`**:

- `products` — daftar produk. Tiap produk punya `name`, `price` (angka, tanpa titik), `category`, `image`, `description`, plus pilihan `rating`, `reviews`, `stock`, `specs`, `badge` (`best-seller` atau `limited`), dan `variants` (ukuran, warna, rasa).
- `heroSlides` — banner geser di halaman depan.
- `testimonials` — testimoni pembeli.
- `config` — pengaturan toko:
  - `whatsappNumber` — nomor tujuan checkout. **Nomor bawaan `6281234567890` itu cuma contoh. Wajib diganti nomor aslimu sebelum toko ini dipakai jualan beneran**, kalau nggak pesanan pembeli nyasar ke nomor contoh itu.
  - `enableFlashSale` dan `flashSaleDurationHours` — nyala/mati dan durasi flash sale.
  - `maxProducts` — jumlah produk yang tampil sebelum tombol "Muat Lebih Banyak" (isi `0` untuk tampilkan semua).
  - `coupons` — daftar kode kupon, tipe `percent` atau `fixed`.

Teks antarmuka dua bahasa diatur di **`translations.js`** (kunci `id` dan `en`). Warna dan tema diatur dari variabel CSS paling atas di **`style.css`** — satu warna aksen, satu warna latar, sisanya mengikuti.

Nomor WhatsApp contoh yang sama juga masih tampil di halaman Kontak dan data JSON-LD di `index.html`. Kalau ganti nomor, ganti di tiga tempat itu sekalian.

## PWA dan offline

`manifest.json` + `sw.js` bikin toko ini bisa di-install kayak aplikasi (ada panduan langkah-langkahnya di `install.html` untuk Android, iOS, dan desktop). Service worker menyimpan file-file inti, jadi halaman yang sudah pernah dibuka tetap bisa diakses pas offline; kalau koneksinya putus di tengah jalan, yang muncul halaman `offline.html`.

## Struktur file

```
index.html        halaman utama (katalog, keranjang, checkout)
about.html        tentang toko
contact.html      kontak + form pesan
install.html      panduan install PWA
terms.html        syarat & ketentuan
404.html          halaman tidak ditemukan
offline.html      halaman saat offline
data.js           produk, banner, testimoni, dan config toko
translations.js   teks Bahasa Indonesia & Inggris
script.js         semua logika (keranjang, wishlist, slider, kupon, checkout)
style.css         semua gaya, termasuk tema gelap/terang
sw.js             service worker (cache offline)
manifest.json     manifest PWA
images/           foto produk
```

Teknologinya sengaja polos: HTML, CSS, dan JavaScript biasa tanpa framework dan tanpa proses build. Ikon pakai Font Awesome dari CDN, font-nya Outfit dari Google Fonts.

## Lisensi

MIT — lihat [LICENSE](LICENSE).
