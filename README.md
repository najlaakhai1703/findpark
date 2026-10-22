# FindPark - Smart Parking Solutions Prototype Website

Prototype website interaktif berdasarkan desain Figma **FindPark - Smart Parking Solutions**.

## 🚀 Cara Menjalankan Prototype

Buka file berikut langsung di peramban (browser) Anda (Google Chrome, Safari, Edge, Firefox):
```bash
open /Users/mymac/.gemini/antigravity/scratch/findpark/index.html
```
Atau klik ganda (double click) file `index.html` pada Finder di direktori:
`/Users/mymac/.gemini/antigravity/scratch/findpark/index.html`

---

## 📱 Halaman yang Tersedia (Sesuai Desain Figma):

1. **Beranda (`#home`) - Figma Image 2**:
   - Hero Banner "Solusi Parkir Pintar Tanpa Ribet Keliling Cari Slot".
   - Widget Live Monitor & Kendaraan Terpilih (`B 1256 AY`).
   - Quick Search Box: Kota (Semarang), Mall (DP Mall), Kendaraan (Mobil/Motor), Jam Tiba (13:00).
   - Rekomendasi Terdekat (DP Mall G3, The Park Mall A34, Pollux Paragon A6, Mall Ciputra B14).
   - 3 Langkah Mudah Parkir, Inovasi Cerdas IoT, Testimoni Komuter, dan Banner CTA Unduh Aplikasi.

2. **Cari Parkir & Peta Interaktif (`#explore`) - Figma Image 3**:
   - Filter bar: Kota Semarang, Jadwal Kedatangan, Stepper Estimasi Durasi, Switcher Kendaraan, Reservasi Cepat.
   - Split layout: Daftar spot parkir di Semarang vs Peta Interaktif Semarang.
   - Kartu info tujuan terpilih dengan indikator kapasitas lantai (Total 120 slot, 42 tersedia, sensor aktif).

3. **Booking & Reservasi (`#booking`) - Figma Image 1**:
   - Visual slot parkir indoor dengan label `Nomor Slot: G3-B14 • Khusus Roda Empat`.
   - Informasi Pemesan tersinkronisasi akun (Angelica Prameswari).
   - Pilihan Kendaraan interaktif (`B 1256 AY` SUV & `H 8421 KT` Crossover) + Modal Tambah Kendaraan Baru.
   - Jadwal & Stepper Durasi Parkir dengan kalkulasi otomatis jam keluar dan tarif per jam.
   - Layanan Tambahan (Add-ons): Valet Parking VIP (+Rp 25.000), EV Charging Station (+Rp 30.000), Car Wash Express (+Rp 40.000).
   - Ringkasan Biaya real-time dengan jaminan slot aman 30 menit.

4. **Halaman Pembayaran & E-Tiket (`#payment`) - Figma Image 5 (HALAMAN & MENU BARU DENGAN FITUR MENARIK)**:
   - Header status transaksi aktif: `Order #FPK-78829` berenkripsi 256-bit BI.
   - Pilihan Multi-Metode Pembayaran:
     - Dompet Digital (GoPay terhubung dengan saldo Rp 150.000, DANA, OVO).
     - QRIS Standar Nasional (dengan modal simulasi scan QRIS & timer).
     - Virtual Account Bank Transfer (BCA, Mandiri, BRI dengan nomor VA siap salin).
   - Input Kode Promo (contoh: `FINDPARKHEMAT` / `HEMAT5K`).
   - Tombol interaktif **"Bayar & Amankan Slot Sekarang"**:
     - Efek suara chime konfirmasi transaksi (Web Audio API).
     - Pemotongan saldo otomatis dari GoPay.
     - Penerbitan otomatis **Digital Smart-Pass (E-Tiket)** dengan status *ENTRY READY*.
     - Countdown timer jaminan slot 30 menit.
   - **Fitur-Fitur Menarik Tambahan**:
     1. 🗺️ **Buka Navigasi ke Lokasi / Slot**: Simulator denah lantai indoor DP Mall G3 dengan jalur animasi mobil menuju Slot G3-12.
     2. 🚧 **Simulasi Palang Otomatis ANPR**: Uji coba kamera pendeteksi plat nomor mobil `B 1256 AY` dan buka-tutup palang otomatis.
     3. 📄 **Download E-Tiket PDF / Cetak Tiket**: Tampilan invoice & tiket resmi ber-barcode siap cetak.
     4. 💬 **Kirim E-Tiket ke WhatsApp**: Integrasi pengiriman ringkasan reservasi ke WhatsApp pengemudi.
     5. 📘 **Panduan Masuk Tanpa Karcis Fisik (FindPark Seamless)**: Panduan 3 tahap mudah masuk gerbang.

5. **Riwayat Transaksi (`#history`)**:
   - Monitoring pesanan aktif, pesanan selesai, dan riwayat pembayaran.

6. **Modal Autentikasi Login / Daftar (Figma Image 4)**:
   - Layout split modern, benefit Auto-Pass, Google SSO, dan WhatsApp OTP.

---

## 🛠️ Perbaikan Fitur yang Sebelumnya Salah / Kurang Sempurna:
- ✅ Kalkulasi tarif dan perkiraan jam keluar kini dinamis mengikuti stepper durasi jam.
- ✅ Penambahan add-ons (Valet, EV, Cuci Mobil) langsung mengubah rincian harga secara instan.
- ✅ Pemilihan kendaraan tersinkronisasi di header, kartu reservasi, e-tiket, dan simulator palang otomatis.
- ✅ Saldo GoPay terpotong secara riil dalam simulasi aplikasi saat pembayaran dikonfirmasi.
- ✅ Navigasi menu instan dengan hash URL (`#home`, `#explore`, `#booking`, `#payment`, `#history`) dan floating quick navigator.
