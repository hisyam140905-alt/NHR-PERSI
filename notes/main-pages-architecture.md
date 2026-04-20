sekarang tolong buatkan 3 main page 
Ini adalah rancangan arsitektur konten dan UX untuk tiga pilar utama web SIAP PERSI. Kita akan menggunakan pendekatan "Single Source of Truth" namun dengan vibe yang berbeda untuk tiap level pengguna.

🎨 Identitas Visual & Warna (The Memorable Palette)
Untuk memberikan kesan profesional namun tidak membosankan, kita gunakan palet "The Trust Spectrum":

Primary: Deep Cobalt (#1E3A8A) – Mewakili otoritas medis dan kepercayaan.

Secondary: Vibrant Teal (#0D9488) – Mewakili kesehatan, kesembuhan, dan inovasi.

Accent: Gold Medal (#D97706) – Khusus untuk elemen Ranking dan skor tertinggi.

Neutral: Ice White (#F8FAFC) – Untuk menjaga kebersihan UI agar tidak melelahkan mata.

1. Public UI: "The Transparency Hub"
Tujuan: Memberikan informasi kepada masyarakat dan media tentang kualitas RS.

Navigation Bar

Logo: SIAP PERSI (dengan ikon detak jantung abstrak).

Menu: Penjelasan Ranking | Metodologi | Berita & Publikasi.

CTA Button (Outline): [Portal Rumah Sakit] – Direct access untuk login RS.

Copywriting Landing Page

Hero Headline: "Pilih Layanan Terbaik, Berdasarkan Data Objektif."

Sub-headline: "Transparansi kualitas RS di Indonesia untuk spesialisasi Jantung, Syaraf, dan Kanker. Standar yang diakui, hasil yang terverifikasi."

Feature (Ranking Table Preview):

"Melihat 5 Rumah Sakit dengan skor Audit Klinis tertinggi bulan ini."

Search Bar: "Cari Rumah Sakit di dekat Anda..."

2. Hospital Portal: "The Excellence Engine"
Tujuan: Memudahkan staf RS memasukkan data tanpa rasa terintimidasi oleh formulir yang panjang.

UX Experience (Parallel Submission)

Dashboard View: Menggunakan Progress Rings. Satu ring untuk Kardiologi, satu untuk Neurologi, dsb.

Status Tags: Belum Diisi | Sedang Berlangsung | Menunggu Review | Telah Terverifikasi.

Copywriting Form Submission

Welcome Back Message: "Selamat datang kembali, Tim Admin [Nama RS]. Mari selesaikan pengisian data untuk meningkatkan standar kesehatan nasional."

Card RSBK: "Kesiapan Sumber Daya – Pastikan input SDM dan Alat Medis sesuai dengan SIP dan Inventaris terbaru."

Card Audit Klinis: "Presisi Diagnosa & Tatalaksana – Masukkan data kepatuhan protokol klinis per pasien secara anonim."

Card PRM: "Voice of Patients – Unggah hasil survei PREM & PROM untuk melihat dampak nyata layanan Anda."

Help Tooltip: "Bingung cara menghitung LOS? Klik di sini untuk panduan cepat."

3. Admin & Reviewer Page: "The Command Center"
Tujuan: Evaluasi cepat, akurat, dan memiliki final authority untuk publikasi.

UX Experience (Audit Flow)

Inbox Style: Menampilkan daftar RS yang sudah submit berdasarkan urutan waktu.

Comparison View: Layar terbagi dua (Kiri: Data yang di-submit RS | Kanan: Standar/Benchmark PERSI).

Action Buttons: Approve | Request Revision | Reject.

Copywriting Admin Dashboard

Headline: "Pusat Kendali Kualitas Nasional."

Stats Overview: "Ada 12 submission baru yang perlu direview dan 5 RS yang siap dipublikasikan ke ranking publik."

Decision Message:

"Anda sedang mengevaluasi data STEMI RS 'X'. Pastikan bukti pendukung Door-to-Balloon sesuai dengan data log sistem."

The "Publish" Button: [Update Ranking Publik] – Tombol ini memiliki konfirmasi double untuk memastikan data sudah final.

🗺️ Alur Navigasi (Site Map)
Role	Entry Point	Key Destination
Publik	Landing Page	Search RS, Tabel Ranking, Detail Metodologi.
Rumah Sakit	Tombol "Portal RS" di Navigasi	Login -> Dashboard -> Form Input (Paralel) -> Submit.
Admin/Reviewer	Hidden URL / Login Khusus	Dashboard Review -> Verifikasi Data -> Publish Ranking.
💡 Tips UX Tambahan
Auto-Save: Pada page submission RS, pastikan ada fitur auto-save. Jangan sampai data hilang saat koneksi tidak stabil.

Interactive Ranking: Di Public UI, biarkan user memfilter ranking berdasarkan daerah (misal: "RS Kardiologi Terbaik di Jawa Timur").

Visual feedback: Gunakan animasi halus (Lottie) saat RS berhasil melakukan Submit untuk memberikan rasa pencapaian (Sense of achievement).

begini user flownya dan buatkan page juga ya untuk setiap yg perlu 
Berikut adalah User Flow Diagram yang dirancang untuk memberikan pengalaman navigasi yang mulus, aman, dan efisien bagi ketiga tipe pengguna (Publik, Rumah Sakit, dan Admin).

🗺️ Master User Flow SIAP PERSI
1. Public Flow: "The Consumer Journey"

Fokus: Kemudahan akses informasi tanpa hambatan.

Landing Page: User masuk ke webnya

Explore Ranking: User memilih spesialisasi (Kardiologi / Neurologi / Onkologi).

Filter & Search: User mencari berdasarkan lokasi atau kelas rumah sakit.

View Details: User klik nama RS untuk melihat detail skor (RSBK, Audit, PRM) dalam bentuk grafik radar atau bar yang interaktif.

Learn Methodology: User membaca cara penilaian agar hasil ranking terasa kredibel.

2. Hospital Flow: "The Submission Engine"

Fokus: Pengisian data paralel yang terstruktur dan minim error.

Entry Point: Di Landing Page, klik tombol [Portal Rumah Sakit].

Authentication: Login menggunakan akun resmi RS yang terdaftar di PERSI.

Main Dashboard: Melihat status pengisian (Misal: Kardiologi 80%, Neurologi 10%).

Parallel Modules (The Core):

Module RSBK: Input jumlah dokter & alat (Auto-scoring).

Module Audit Klinis: Input data pasien (Logika Sesuai/Tidak Sesuai).

Module PRM: Input hasil survei pasien (Skala Likert).

Data Validation: Sistem melakukan pengecekan otomatis (misal: "Jumlah dokter tidak boleh 0").

Final Submit: Klik "Kirim untuk Review". Status berubah menjadi Waiting for Review.

3. Admin & Reviewer Flow: "The Gatekeeper"

Fokus: Objektivitas, akurasi, dan otoritas publikasi.

Internal Login: Akses melalui jalur khusus admin/reviewer.

Review Inbox: Melihat daftar RS yang baru saja melakukan submit (Urut berdasarkan deadline).

Verification Phase:

Membuka dokumen pendukung/bukti input.

Jika data mencurigakan → Klik [Minta Revisi] (Otomatis mengirim notifikasi ke RS terkait).

Jika data valid → Klik [Approve].

Consolidation: Sistem menggabungkan seluruh skor RS yang sudah di-approve.

The Big Button: Admin Senior menekan [Publish Ranking].

Impact: Tabel ranking di Public UI terupdate secara real-time.

🎨 Visualisasi Diagram (Mermaid Logic)
Jika Anda membayangkan alur datanya, akan terlihat seperti ini:

Code snippet
graph TD
    %% Roles
    Public((User Publik))
    RS((Admin Rumah Sakit))
    Admin((Evaluator/Reviewer))

    %% Entry
    Start[Landing Page SIAP PERSI] --> Public
    Start -->|Nav: Portal RS| RS
    
    %% Public Action
    Public --> ViewRanking[Lihat Ranking Nasional]
    ViewRanking --> Search[Filter Daerah/Spesialisasi]
    
    %% RS Action
    RS --> LoginRS[Login Portal]
    LoginRS --> DashboardRS[Dashboard Progres]
    DashboardRS --> Work[Input Data Paralel: RSBK, Audit, PRM]
    Work --> Validate[Self-Validation System]
    Validate --> Submit[Final Submission]
    
    %% Admin Action
    Submit --> AdminInbox[Inbox Reviewer]
    Admin --> AdminInbox
    AdminInbox --> Review{Verifikasi Data?}
    Review -->|Tidak Valid| Revision[Kirim Feedback Revisi ke RS]
    Revision --> DashboardRS
    Review -->|Valid| Approved[Status: Approved]
    
    %% Final Result
    Approved --> Publish[Final Ranking Published]
    Publish --> ViewRanking
💎 Memorable UI Experience Highlights
Untuk membuat pengalaman ini tak terlupakan, kita tambahkan Micro-UX:

The "Living" Navigation: Di Landing Page publik, navigasi [Portal Rumah Sakit] akan memiliki efek pulse lembut atau warna yang sedikit kontras (Vibrant Teal) untuk membedakannya dari menu informasi biasa.

Progressive Loading: Saat RS mengisi data, sistem menampilkan progress bar yang bergerak mengikuti jumlah input. Ini memberikan kepuasan psikologis bahwa tugas hampir selesai.

Glassmorphism Dashboard: Untuk Admin, gunakan UI berbasis kartu transparan agar terlihat modern dan bersih, mengurangi rasa lelah saat me-review banyak data.

Success Animation: Saat Admin menekan tombol "Publish", tampilkan animasi kembang api halus atau transisi grafik yang naik untuk merayakan transparansi data baru.