import {
  Shield,
  FileText,
  Users,
  CheckCircle2,
  ArrowRight,
  Info,
  BookOpen,
  BarChart3,
  Target,
} from "lucide-react";
import { Link } from "react-router";
import { Button } from "../components/ui/button";

export function MethodologyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#1E3A8A] to-[#0D9488] text-white">
        <div className="max-w-5xl mx-auto px-6 py-16 text-center">
          <span className="inline-block text-[#D97706] text-sm font-[600] uppercase tracking-wider mb-4">
            Metodologi Penilaian
          </span>
          <h1 className="text-4xl font-[700] mb-4">
            NHR PERSI Assessment
          </h1>
          <p className="text-lg text-white/80 max-w-3xl mx-auto leading-relaxed">
            Sistem penilaian kualitas rumah sakit berbasis evidence dengan tiga
            pilar utama yang mengevaluasi kesiapan sumber daya, audit klinis,
            dan pengalaman pasien secara komprehensif.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Overview */}
        <div className="bg-white rounded-xl border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-[700] text-gray-900 mb-4">Overview</h2>
          <p className="text-gray-700 mb-4 leading-relaxed">
            NHR PERSI (National Hospital Ranking PERSI) adalah
            framework penilaian yang dirancang khusus untuk mengevaluasi
            kualitas layanan rumah sakit di Indonesia. Sistem ini menggunakan
            pendekatan <strong>100% berbasis NHR PERSI Assessment</strong>{" "}
            tanpa general assessment, memastikan penilaian yang fokus, objektif,
            dan terstandar.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Setiap rumah sakit dinilai berdasarkan <strong>tiga pilar utama</strong>{" "}
            dengan bobot yang berbeda, dimana Clinical Audit memiliki bobot terbesar (60%)
            karena merupakan indikator utama kualitas klinis rumah sakit.
          </p>
        </div>

        {/* Three Pillars */}
        <div className="mb-8">
          <h2 className="text-2xl font-[700] text-gray-900 mb-6 text-center">
            Tiga Pilar Penilaian NHR PERSI
          </h2>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl border-2 border-[#1E3A8A]/20 p-6 text-center hover:border-[#1E3A8A] transition-colors">
              <div className="w-16 h-16 bg-[#1E3A8A] rounded-xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-[700] text-[#D97706] mb-2">
                15%
              </div>
              <h3 className="font-[700] text-gray-900 mb-1">Hospital Structure</h3>
              <p className="text-sm text-[#0D9488] font-[500]">
                Rumah Sakit Berstandar Kemampuan
              </p>
            </div>

            <div className="bg-white rounded-xl border-2 border-[#0D9488]/20 p-6 text-center hover:border-[#0D9488] transition-colors">
              <div className="w-16 h-16 bg-[#0D9488] rounded-xl flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-[700] text-[#D97706] mb-2">
                60%
              </div>
              <h3 className="font-[700] text-gray-900 mb-1">Clinical Audit</h3>
              <p className="text-sm text-[#0D9488] font-[500]">
                Audit Klinis
              </p>
            </div>

            <div className="bg-white rounded-xl border-2 border-[#D97706]/20 p-6 text-center hover:border-[#D97706] transition-colors">
              <div className="w-16 h-16 bg-[#D97706] rounded-xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-[700] text-[#D97706] mb-2">
                25%
              </div>
              <h3 className="font-[700] text-gray-900 mb-1">Patient Report</h3>
              <p className="text-sm text-[#0D9488] font-[500]">
                PREM & PROM
              </p>
            </div>
          </div>
        </div>

        {/* Detailed Pillars */}
        <div className="space-y-6">
          {/* Pillar 1: RSBK */}
          <div className="bg-white rounded-xl border border-gray-200 p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-[#1E3A8A] rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-[700] text-gray-900">
                  Pilar 1: Hospital Structure
                </h3>
                <p className="text-sm text-[#D97706] font-[600]">
                  Bobot: 15%
                </p>
              </div>
            </div>

            <p className="text-gray-700 mb-4 leading-relaxed">
              Pilar ini menilai kesiapan sumber daya rumah sakit dalam
              memberikan layanan spesialistik. Penilaian mencakup ketersediaan
              SDM medis, peralatan, dan infrastruktur yang sesuai dengan standar
              kemampuan yang ditetapkan.
            </p>

            <div className="mb-6">
              <h4 className="font-[600] text-gray-900 mb-3">
                Indikator Penilaian:
              </h4>
              <ul className="space-y-2">
                {[
                  "Jumlah dan kualifikasi dokter spesialis sesuai SIP terbaru",
                  "Ketersediaan peralatan medis esensial sesuai inventaris",
                  "Ketersediaan fasilitas penunjang (laboratorium, radiologi, dll)",
                  "Infrastruktur dan sistem pendukung layanan",
                ].map((item, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-gray-700"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#0D9488] mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-[#1E3A8A] mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-700">
                  <strong>Sumber Data:</strong> Data diinput langsung oleh admin
                  RS melalui formulir Hospital Structure. Sistem melakukan auto-scoring
                  berdasarkan kesesuaian data dengan standar PERSI.
                </p>
              </div>
            </div>
          </div>

          {/* Pillar 2: Clinical Audit */}
          <div className="bg-white rounded-xl border border-gray-200 p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-[#0D9488] rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-[700] text-gray-900">
                  Pilar 2: Clinical Audit (Audit Klinis)
                </h3>
                <p className="text-sm text-[#D97706] font-[600]">
                  Bobot: 60%
                </p>
              </div>
            </div>

            <p className="text-gray-700 mb-4 leading-relaxed">
              Pilar ini mengevaluasi kepatuhan rumah sakit terhadap protokol
              klinis yang telah ditetapkan. Penilaian menggunakan metode audit
              30 rekam medis per pelayanan untuk mengukur presisi diagnosa
              dan tatalaksana.
            </p>

            <div className="mb-6">
              <h4 className="font-[600] text-gray-900 mb-3">
                Indikator Penilaian:
              </h4>
              <ul className="space-y-2">
                {[
                  "Kepatuhan terhadap protokol klinis per pelayanan",
                  "Kesesuaian diagnosa dengan standar (misal: Door-to-Balloon untuk STEMI)",
                  "Ketepatan tatalaksana berdasarkan evidence-based medicine",
                  "Dokumentasi rekam medis yang lengkap dan akurat",
                  "Kepatuhan terhadap clinical pathway yang ditetapkan",
                  "Outcome klinis pasien (mortality rate, complication rate)",
                ].map((item, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-gray-700"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#0D9488] mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-teal-50 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-[#0D9488] mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-700">
                  <strong>Metode:</strong> Review 30 rekam medis per
                  pelayanan. Setiap rekam medis dinilai berdasarkan apakah indikator
                  dilaksanakan dengan 3 pilihan: &quot;Sesuai&quot;, &quot;Tidak Sesuai namun Sesuai dengan Pengecualian Klinis&quot;,
                  atau &quot;Tidak Sesuai&quot;. Data
                  dimasukkan secara anonim.
                </p>
              </div>
            </div>
          </div>

          {/* Pillar 3: Patient Report */}
          <div className="bg-white rounded-xl border border-gray-200 p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-[#D97706] rounded-lg flex items-center justify-center flex-shrink-0">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-[700] text-gray-900">
                  Pilar 3: Patient Report (PREM & PROM)
                </h3>
                <p className="text-sm text-[#D97706] font-[600]">
                  Bobot: 25%
                </p>
              </div>
            </div>

            <p className="text-gray-700 mb-4 leading-relaxed">
              Pilar ini mengukur pengalaman dan outcome dari perspektif pasien
              menggunakan dua instrumen terstandar: PREM (Patient Reported
              Experience Measures) dan PROM (Patient Reported Outcome Measures).
            </p>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-amber-50 rounded-lg p-4">
                <h5 className="font-[600] text-gray-900 mb-2">
                  PREM - Pengalaman Pasien
                </h5>
                <ul className="space-y-1.5 text-sm text-gray-700">
                  <li>- Komunikasi dengan tenaga medis</li>
                  <li>- Waktu tunggu dan aksesibilitas</li>
                  <li>- Kenyamanan fasilitas</li>
                  <li>- Kejelasan informasi yang diberikan</li>
                  <li>- Keterlibatan dalam keputusan perawatan</li>
                </ul>
              </div>
              <div className="bg-amber-50 rounded-lg p-4">
                <h5 className="font-[600] text-gray-900 mb-2">
                  PROM - Hasil Kesehatan Pasien
                </h5>
                <ul className="space-y-1.5 text-sm text-gray-700">
                  <li>- Perubahan kondisi kesehatan setelah perawatan</li>
                  <li>- Kemampuan aktivitas sehari-hari</li>
                  <li>- Tingkat nyeri dan ketidaknyamanan</li>
                  <li>- Kualitas hidup pasca perawatan</li>
                  <li>- Kepuasan terhadap hasil perawatan</li>
                </ul>
              </div>
            </div>

            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-[#D97706] mt-0.5 flex-shrink-0" />
                <div className="text-sm text-gray-700 space-y-2">
                  <p>
                    <strong>Metode Pengumpulan Data:</strong> Terdapat dua metode pelaksanaan survei yang dapat dipilih oleh rumah sakit (minimum 30 responden per pelayanan):
                  </p>
                  <ol className="list-decimal pl-4 space-y-2 ml-1">
                    <li>
                      <strong>Survei Digital Terintegrasi:</strong> Rumah sakit dapat mengunduh QR Code atau menyalin tautan survei yang dihasilkan langsung oleh portal NHR PERSI untuk dibagikan kepada pasien. Jawaban responden akan masuk otomatis ke dalam server dan langsung mendapatkan <i>auto-scoring</i>.
                    </li>
                    <li>
                      <strong>Unggah Dokumen Survei Independen:</strong> Jika rumah sakit telah melaksanakan survei kepuasan pasien internal secara mandiri, rekapitulasi hasilnya dapat diunggah terpisah. Tim reviewer PERSI akan mengevaluasi dokumen tersebut dan memberikan penilaian yang sesuai.
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scoring Formula */}
        <div className="bg-gradient-to-br from-blue-50 to-teal-50 rounded-xl p-8 mt-8">
          <div className="flex items-start gap-3 mb-6">
            <BarChart3 className="w-6 h-6 text-[#1E3A8A] mt-0.5" />
            <h2 className="text-2xl font-[700] text-gray-900">
              Perhitungan Skor
            </h2>
          </div>

          <p className="text-gray-700 mb-6 leading-relaxed">
            Setiap pilar menghasilkan skor 0-100. Skor final dihitung dengan
            bobot berbeda sesuai tingkat kepentingan masing-masing pilar:
          </p>

          <div className="bg-white rounded-lg p-6 font-mono text-sm mb-6">
            <div className="font-[700] mb-3 text-[#1E3A8A]">
              Formula Skor Final NHR PERSI:
            </div>
            <div className="text-gray-700">
              <div>
                Skor Final = (Hospital Structure &times; 0.15) + (Clinical Audit &times;
                0.60) + (Patient Report &times; 0.25)
              </div>
            </div>
          </div>

          {/* Grading */}
          <h4 className="font-[600] text-gray-900 mb-3">Sistem Grading:</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white rounded-lg p-4 text-center border border-green-200">
              <div className="text-2xl font-[700] text-green-600 mb-1">A</div>
              <div className="text-sm text-gray-600">85 - 100</div>
              <div className="text-xs text-gray-400">Excellent</div>
            </div>
            <div className="bg-white rounded-lg p-4 text-center border border-blue-200">
              <div className="text-2xl font-[700] text-blue-600 mb-1">B</div>
              <div className="text-sm text-gray-600">70 - 84</div>
              <div className="text-xs text-gray-400">Good</div>
            </div>
            <div className="bg-white rounded-lg p-4 text-center border border-yellow-200">
              <div className="text-2xl font-[700] text-yellow-600 mb-1">C</div>
              <div className="text-sm text-gray-600">55 - 69</div>
              <div className="text-xs text-gray-400">Average</div>
            </div>
            <div className="bg-white rounded-lg p-4 text-center border border-red-200">
              <div className="text-2xl font-[700] text-red-600 mb-1">D</div>
              <div className="text-sm text-gray-600">0 - 54</div>
              <div className="text-xs text-gray-400">Below Standard</div>
            </div>
          </div>
        </div>

        {/* Pelayanan */}
        <div className="bg-white rounded-xl border border-gray-200 p-8 mt-8">
          <div className="flex items-start gap-3 mb-6">
            <Target className="w-6 h-6 text-[#0D9488] mt-0.5" />
            <h2 className="text-2xl font-[700] text-gray-900">
              Pelayanan yang Dinilai
            </h2>
          </div>
          <p className="text-gray-700 mb-6 leading-relaxed">
            Pada fase awal, NHR PERSI menilai tiga pelayanan utama:
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-red-50 rounded-lg p-5 border border-red-100">
              <div className="text-2xl mb-2">&#x2764;&#xFE0F;</div>
              <h4 className="font-[600] text-gray-900 mb-1">Kardiologi</h4>
              <p className="text-sm text-gray-600">
                Layanan jantung dan pembuluh darah termasuk penanganan STEMI,
                kateterisasi, dan bedah jantung.
              </p>
            </div>
            <div className="bg-purple-50 rounded-lg p-5 border border-purple-100">
              <div className="text-2xl mb-2">&#x1F9E0;</div>
              <h4 className="font-[600] text-gray-900 mb-1">Neurologi</h4>
              <p className="text-sm text-gray-600">
                Layanan syaraf termasuk penanganan stroke, epilepsi, dan
                gangguan neurodegeneratif.
              </p>
            </div>
            <div className="bg-blue-50 rounded-lg p-5 border border-blue-100">
              <div className="text-2xl mb-2">&#x1F52C;</div>
              <h4 className="font-[600] text-gray-900 mb-1">Onkologi</h4>
              <p className="text-sm text-gray-600">
                Layanan kanker termasuk kemoterapi, radioterapi, dan bedah
                onkologi.
              </p>
            </div>
          </div>
        </div>

        {/* Data Collection */}
        <div className="bg-white rounded-xl border border-gray-200 p-8 mt-8">
          <div className="flex items-start gap-3 mb-6">
            <BookOpen className="w-6 h-6 text-[#1E3A8A] mt-0.5" />
            <h2 className="text-2xl font-[700] text-gray-900">
              Pengumpulan & Verifikasi Data
            </h2>
          </div>
          <div className="space-y-4 text-gray-700">
            <p className="leading-relaxed">
              <strong>Submission:</strong> Data dikumpulkan melalui portal SIAP
              PERSI oleh admin RS yang telah terverifikasi. RS harus mengisi
              data dasar rumah sakit terlebih dahulu sebelum dapat mengakses
              formulir assessment.
            </p>
            <p className="leading-relaxed">
              <strong>Verifikasi & Audit Validasi:</strong> Setelah RS melakukan submission,
              seluruh data akan diverifikasi awal oleh tim reviewer. Khusus untuk rumah sakit terbaik, akan diadakan tahapan validasi lanjutan:
            </p>
            <ul className="list-disc pl-5 mb-4 space-y-2 text-gray-700 leading-relaxed">
              <li>Untuk <strong>Top 100 Nasional</strong>, akan dilakukan review, audit, dan validasi data secara menyeluruh oleh PERSI Pusat.</li>
              <li>Untuk <strong>3 Rumah Sakit Terbaik Per Provinsi</strong>, akan direview ulang dan melalui proses audit validasi langsung oleh PERSI Wilayah setempat.</li>
            </ul>
            <p className="leading-relaxed">
              <strong>Publikasi:</strong> Setelah data diverifikasi dan
              di-approve, skor dan ranking RS akan dipublikasikan di halaman
              ranking publik. Ranking diupdate secara rolling setiap kali ada
              submission baru yang di-approve.
            </p>
            <p className="leading-relaxed">
              <strong>Transparansi:</strong> Setiap RS dapat melihat detail
              breakdown skor mereka dan membandingkan dengan rata-rata nasional.
              Metodologi ini tersedia secara publik untuk menjamin
              akuntabilitas.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-[#1E3A8A] to-[#0D9488] rounded-xl p-8 mt-8 text-white text-center">
          <h3 className="text-2xl font-[700] mb-3">
            Siap Mengikuti Assessment?
          </h3>
          <p className="text-white/80 mb-6 max-w-xl mx-auto">
            Daftarkan rumah sakit Anda dan mulai proses NHR PERSI Assessment
            untuk masuk ke ranking nasional.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/hospital-login">
              <Button className="bg-white text-[#1E3A8A] hover:bg-white/90 h-11 px-6 font-[600]">
                Portal Rumah Sakit
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 p-6 bg-gray-100 rounded-xl">
          <p className="text-sm text-gray-600 text-center">
            Untuk pertanyaan tentang metodologi atau submission data, hubungi
            Tim Riset PERSI di{" "}
            <a
              href="mailto:ranking@persi.or.id"
              className="text-[#1E3A8A] font-[600]"
            >
              ranking@persi.or.id
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}