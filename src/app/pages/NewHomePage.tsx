import { Link } from "react-router";
import {
  TrendingUp,
  Shield,
  Award,
  Building2,
  ChevronRight,
  Sparkles,
  BarChart3,
  Newspaper,
  Calendar,
  BookOpen,
  Users,
  ArrowRight,
  MapPin,
  Heart,
  Activity,
  FileText,
  Globe,
} from "lucide-react";
import { Button } from "../components/ui/button";

import { useData } from "../context/DataContext";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { motion } from "framer-motion";

export function NewHomePage() {
  const { news, events, approvedRankings } = useData();
  const hasRankings = approvedRankings.length > 0;
  const latestNews = news.slice(0, 3);
  const upcomingEvents = events
    .filter((e) => new Date(e.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  return (
    <div className="min-h-screen">
      {/* Announcement Banner */}
      <div className="bg-[#1E3A8A] text-white py-3">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <p className="flex items-center gap-2 text-sm">
            <Sparkles className="w-4 h-4 text-[#D97706]" />
            <span>
              NHR PERSI Assessment 2026 kini terbuka untuk seluruh rumah sakit
              anggota PERSI.
            </span>
          </p>
          <div className="flex items-center gap-4">
            <Link
              to="/hospital-login"
              className="text-sm font-[600] border border-white/40 rounded-lg px-4 py-1.5 hover:bg-white/10 transition-colors"
            >
              Ikuti Assessment
            </Link>
            <Link
              to="/methodology"
              className="text-sm text-white/70 hover:text-white transition-colors"
            >
              Pelajari lebih lanjut
            </Link>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#1E3A8A] via-[#1E3A8A] to-[#0D9488] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-[#0D9488] rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-6 py-20 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-white/20">
                <Activity className="w-4 h-4 text-[#0D9488]" />
                <span className="text-sm font-[500]">
                  Platform Resmi PERSI
                </span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-[700] mb-6 leading-tight">
                Pilih Layanan Terbaik,
                <br />
                <span className="text-[#0D9488]">Berdasarkan Data Objektif.</span>
              </h1>
              <p className="text-lg text-white/80 mb-8 leading-relaxed max-w-xl">
                Transparansi kualitas rumah sakit di Indonesia untuk pelayanan
                Jantung, Syaraf, dan Kanker. Standar yang diakui, hasil yang
                terverifikasi.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/rankings">
                  <Button className="bg-white text-[#1E3A8A] hover:bg-white/90 h-12 px-8 font-[600]">
                    Lihat Ranking
                    <ChevronRight className="w-5 h-5 ml-1" />
                  </Button>
                </Link>
                <Link to="/hospital-login">
                  <Button
                    variant="outline"
                    className="bg-transparent border-white/40 text-white hover:bg-white/10 h-12 px-8 font-[600]"
                  >
                    Portal Rumah Sakit
                  </Button>
                </Link>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="relative">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-[#D97706] rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-[600]">NHR PERSI Assessment 2026</p>
                      <p className="text-sm text-white/60">
                        Submit data untuk ranking nasional
                      </p>
                    </div>
                    <Link to="/hospital-login" className="ml-auto">
                      <ArrowRight className="w-5 h-5 text-white/60 hover:text-white" />
                    </Link>
                  </div>

                  {/* Quick Nav Cards */}
                  <div className="grid grid-cols-2 gap-3">
                    <QuickNavCard
                      icon={<Newspaper className="w-5 h-5" />}
                      title="Berita"
                      desc="Berita kesehatan & RS"
                      to="/news"
                    />
                    <QuickNavCard
                      icon={<BarChart3 className="w-5 h-5" />}
                      title="Rankings"
                      desc="Ranking RS nasional"
                      to="/rankings"
                    />
                    <QuickNavCard
                      icon={<Calendar className="w-5 h-5" />}
                      title="Events"
                      desc="Kegiatan PERSI"
                      to="/events"
                    />
                    <QuickNavCard
                      icon={<BookOpen className="w-5 h-5" />}
                      title="Metodologi"
                      desc="Cara penilaian"
                      to="/methodology"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NHR PERSI Three Pillars */}
      <section className="max-w-7xl mx-auto px-6 -mt-10 relative z-10">
        <div className="grid md:grid-cols-3 gap-6">
          <PillarCard
            icon={<Shield className="w-7 h-7" />}
            title="Hospital Structure"
            subtitle="Rumah Sakit Berstandar Kemampuan"
            description="Penilaian kesiapan sumber daya manusia, peralatan medis, dan infrastruktur rumah sakit."
            weight="15%"
            color="bg-[#1E3A8A]"
          />
          <PillarCard
            icon={<FileText className="w-7 h-7" />}
            title="Clinical Audit"
            subtitle="Audit Klinis"
            description="Evaluasi kepatuhan terhadap protokol klinis melalui review 30 rekam medis per pelayanan."
            weight="60%"
            color="bg-[#0D9488]"
          />
          <PillarCard
            icon={<Users className="w-7 h-7" />}
            title="Patient Report"
            subtitle="PREM & PROM"
            description="Pengukuran pengalaman dan hasil kesehatan pasien melalui survei terstandar."
            weight="25%"
            color="bg-[#D97706]"
          />
        </div>
      </section>

      {/* Rankings Preview */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl font-[700] text-gray-900 mb-2">
              Hospital Rankings
            </h2>
            <p className="text-gray-600">
              Ranking rumah sakit nasional berdasarkan NHR PERSI Assessment
            </p>
          </div>
          <Link
            to="/rankings"
            className="text-[#1E3A8A] font-[600] text-sm flex items-center gap-1 hover:underline"
          >
            Lihat Semua <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {hasRankings ? (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-[600] text-gray-500 uppercase">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-[600] text-gray-500 uppercase">
                    Rumah Sakit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-[600] text-gray-500 uppercase">
                    Pelayanan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-[600] text-gray-500 uppercase">
                    Skor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-[600] text-gray-500 uppercase">
                    Grade
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {approvedRankings.slice(0, 5).map((r, idx) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-[700] text-sm ${
                          idx < 3
                            ? "bg-[#D97706] text-white"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {idx + 1}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-[600] text-gray-900">
                        {r.hospitalName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {r.city}, {r.province}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {r.specialty}
                    </td>
                    <td className="px-6 py-4 font-[700] text-[#1E3A8A]">
                      {r.finalScore.toFixed(1)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-md text-xs font-[600] ${
                          r.grade === "A"
                            ? "bg-green-100 text-green-700"
                            : r.grade === "B"
                            ? "bg-blue-100 text-blue-700"
                            : r.grade === "C"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {r.grade}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-[#F8FAFC] to-blue-50 rounded-2xl border-2 border-dashed border-blue-200 p-10">
            <div className="max-w-xl mx-auto text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <BarChart3 className="w-10 h-10 text-[#1E3A8A]" />
              </div>
              <h3 className="text-xl font-[700] text-gray-900 mb-3">
                Belum Ada Data Ranking
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Platform NHR PERSI baru diluncurkan. Data ranking akan muncul
                setelah rumah sakit menyelesaikan{" "}
                <strong>NHR PERSI Assessment</strong> dan proses review oleh
                tim ahli PERSI selesai.
              </p>
              <div className="flex gap-3 justify-center">
                <Link to="/hospital-login">
                  <Button className="bg-[#1E3A8A] hover:bg-[#1a3278] h-11 px-6 font-[600]">
                    Submit Assessment
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
                <Link to="/methodology">
                  <Button
                    variant="outline"
                    className="h-11 px-6 font-[600] border-2"
                  >
                    Cara Penilaian
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* News Section */}
      <section className="bg-[#F8FAFC] py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl font-[700] text-gray-900 mb-2">
                Berita & Publikasi
              </h2>
              <p className="text-gray-600">
                Berita terkini seputar kesehatan dan dunia perumahsakitan
                Indonesia
              </p>
            </div>
            <Link
              to="/news"
              className="text-[#1E3A8A] font-[600] text-sm flex items-center gap-1 hover:underline"
            >
              Semua Berita <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <motion.div 
            className="grid md:grid-cols-3 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          >
            {latestNews.map((item) => (
              <motion.div 
                key={item.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { type: "spring", damping: 20 } }
                }}
                className="h-full"
              >
                <Link to={`/news/${item.id}`} className="group block h-full">
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all h-full flex flex-col">
                    <div className="aspect-[16/10] overflow-hidden">
                      <ImageWithFallback
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <span
                        className={`inline-block w-fit text-[10px] font-[600] uppercase px-2 py-0.5 rounded mb-2 ${
                          item.category === "berita"
                            ? "bg-blue-100 text-blue-700"
                            : item.category === "publikasi"
                            ? "bg-green-100 text-green-700"
                            : item.category === "regulasi"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {item.category}
                      </span>
                      <h3 className="font-[600] text-gray-900 mb-2 group-hover:text-[#1E3A8A] transition-colors line-clamp-2 leading-snug flex-1">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                        {item.excerpt}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-400 mt-auto">
                        <span>{item.author}</span>
                        <span>&bull;</span>
                        <span>
                          {new Date(item.publishedAt).toLocaleDateString(
                            "id-ID",
                            { day: "numeric", month: "short", year: "numeric" }
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Events Section */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl font-[700] text-gray-900 mb-2">
              Events PERSI
            </h2>
            <p className="text-gray-600">
              Seminar, workshop, congress, dan kegiatan PERSI mendatang
            </p>
          </div>
          <Link
            to="/events"
            className="text-[#1E3A8A] font-[600] text-sm flex items-center gap-1 hover:underline"
          >
            Semua Events <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {upcomingEvents.length > 0 ? (
          <motion.div 
            className="grid md:grid-cols-3 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          >
            {upcomingEvents.map((event) => {
              const dateObj = new Date(event.date);
              return (
                <motion.div
                  key={event.id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0, transition: { type: "spring", damping: 20 } }
                  }}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all"
                >
                  <div className="relative h-44 overflow-hidden">
                    <ImageWithFallback
                      src={event.imageUrl}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3">
                      <span
                        className={`px-2.5 py-1 rounded-md text-xs font-[600] ${
                          event.type === "congress"
                            ? "bg-[#1E3A8A] text-white"
                            : event.type === "workshop"
                            ? "bg-[#0D9488] text-white"
                            : event.type === "seminar"
                            ? "bg-[#D97706] text-white"
                            : "bg-purple-600 text-white"
                        }`}
                      >
                        {event.type.charAt(0).toUpperCase() +
                          event.type.slice(1)}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3 bg-white rounded-lg px-3 py-2 text-center shadow-md">
                      <div className="text-xl font-[700] text-[#1E3A8A] leading-none">
                        {dateObj.getDate()}
                      </div>
                      <div className="text-[10px] text-gray-500 font-[600] uppercase">
                        {dateObj.toLocaleDateString("id-ID", {
                          month: "short",
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-[600] text-gray-900 mb-2 line-clamp-2 leading-snug">
                      {event.title}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                      {event.description}
                    </p>
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">{event.location}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <div className="bg-gray-50 rounded-xl p-10 text-center">
            <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Belum ada event mendatang.</p>
          </div>
        )}
      </section>

      {/* About PERSI */}
      <section className="bg-[#1E3A8A] text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block text-[#D97706] text-sm font-[600] uppercase tracking-wider mb-4">
                Tentang Kami
              </span>
              <h2 className="text-3xl font-[700] mb-6 leading-snug">
                Perhimpunan Rumah Sakit
                <br />
                Seluruh Indonesia (PERSI)
              </h2>
              <p className="text-white/80 mb-6 leading-relaxed">
                PERSI didirikan pada tahun 1978 sebagai organisasi profesi yang
                menaungi seluruh rumah sakit di Indonesia. Dengan lebih dari
                2.900 rumah sakit anggota, PERSI berperan aktif dalam
                meningkatkan mutu layanan kesehatan nasional.
              </p>
              <p className="text-white/80 mb-8 leading-relaxed">
                Platform NHR PERSI merupakan inisiatif terbaru dalam
                mewujudkan transparansi dan akuntabilitas kualitas rumah sakit
                melalui sistem penilaian berbasis evidence yang diakui secara
                nasional.
              </p>

              <div className="grid grid-cols-3 gap-6">
                <div>
                  <div className="text-3xl font-[700] text-[#0D9488]">
                    2,900+
                  </div>
                  <div className="text-sm text-white/60">RS Anggota</div>
                </div>
                <div>
                  <div className="text-3xl font-[700] text-[#0D9488]">34</div>
                  <div className="text-sm text-white/60">Provinsi</div>
                </div>
                <div>
                  <div className="text-3xl font-[700] text-[#0D9488]">
                    1978
                  </div>
                  <div className="text-sm text-white/60">Didirikan</div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#0D9488]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Globe className="w-6 h-6 text-[#0D9488]" />
                  </div>
                  <div>
                    <h4 className="font-[600] mb-1">Visi</h4>
                    <p className="text-sm text-white/70 leading-relaxed">
                      Menjadi organisasi rumah sakit yang terkemuka dalam
                      mewujudkan rumah sakit bermutu dan berdaya saing global.
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#D97706]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Heart className="w-6 h-6 text-[#D97706]" />
                  </div>
                  <div>
                    <h4 className="font-[600] mb-1">Misi</h4>
                    <p className="text-sm text-white/70 leading-relaxed">
                      Meningkatkan mutu pelayanan rumah sakit, memperjuangkan
                      kepentingan anggota, dan mendorong transformasi digital
                      layanan kesehatan Indonesia.
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-[600] mb-1">NHR PERSI</h4>
                    <p className="text-sm text-white/70 leading-relaxed">
                      Sistem penilaian kualitas RS berbasis tiga pilar: Hospital Structure, Clinical Audit, dan Patient Report (PREM & PROM).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-[700] text-gray-900 mb-2">
            Bagaimana Cara Kerja NHR PERSI?
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Proses penilaian yang transparan dan terstruktur untuk memastikan
            objektivitas ranking
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          <StepCard
            number={1}
            title="Registrasi"
            description="Rumah sakit mendaftar melalui portal NHR PERSI dengan mengunggah surat tugas PIC"
            icon={<Building2 className="w-6 h-6" />}
          />
          <StepCard
            number={2}
            title="Isi Assessment"
            description="Lengkapi data Hospital Structure, Clinical Audit, dan Patient Report per pelayanan"
            icon={<FileText className="w-6 h-6" />}
          />
          <StepCard
            number={3}
            title="Review & Verifikasi"
            description="Tim reviewer PERSI memverifikasi seluruh data yang telah disubmit (5-7 hari)"
            icon={<Shield className="w-6 h-6" />}
          />
          <StepCard
            number={4}
            title="Ranking Dipublikasi"
            description="Setelah approval, rumah sakit masuk ranking nasional dan bisa dilihat publik"
            icon={<Award className="w-6 h-6" />}
          />
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 pb-16">
        <div className="bg-gradient-to-r from-[#1E3A8A] to-[#0D9488] rounded-2xl p-10 text-white text-center">
          <h2 className="text-3xl font-[700] mb-4">
            Siap Meningkatkan Standar RS Anda?
          </h2>
          <p className="text-white/80 mb-8 max-w-2xl mx-auto">
            Bergabunglah dengan rumah sakit terbaik di Indonesia. Submit SIAP
            PERSI Assessment dan tunjukkan keunggulan institusi Anda kepada
            masyarakat.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/hospital-login" className="w-full sm:w-auto">
              <Button className="w-full bg-white text-[#1E3A8A] hover:bg-white/90 h-12 px-6 font-[600]">
                Portal Rumah Sakit
                <ChevronRight className="w-5 h-5 ml-1" />
              </Button>
            </Link>
            <Link to="/methodology" className="w-full sm:w-auto">
              <Button
                variant="outline"
                className="w-full bg-transparent border-white/40 text-white hover:bg-white/10 h-12 px-6 font-[600]"
              >
                Pelajari Metodologi
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function QuickNavCard({
  icon,
  title,
  desc,
  to,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  to: string;
}) {
  return (
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="h-full">
      <Link
        to={to}
        className="flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-3 transition-colors group h-full"
      >
        <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center text-white/80 group-hover:text-white">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-[600] text-white">{title}</div>
          <div className="text-xs text-white/50 truncate">{desc}</div>
        </div>
        <ArrowRight className="w-4 h-4 text-white/30 group-hover:text-white/60" />
      </Link>
    </motion.div>
  );
}

function PillarCard({
  icon,
  title,
  subtitle,
  description,
  weight,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  description: string;
  weight: string;
  color: string;
}) {
  return (
    <motion.div 
      whileHover={{ y: -8 }}
      className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all"
    >
      <div className="flex items-center justify-between mb-4">
        <div
          className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center text-white`}
        >
          {icon}
        </div>
        <span className="text-2xl font-[700] text-[#D97706]">{weight}</span>
      </div>
      <h3 className="font-[700] text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-[#0D9488] font-[500] mb-2">{subtitle}</p>
      <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
    </motion.div>
  );
}

function StepCard({
  number,
  title,
  description,
  icon,
}: {
  number: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <motion.div whileHover={{ y: -8 }} className="relative h-full">
      <div className="bg-white rounded-xl border border-gray-200 p-6 h-full hover:shadow-lg transition-all">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-[#1E3A8A] text-white rounded-full flex items-center justify-center font-[700]">
            {number}
          </div>
          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-[#1E3A8A]">
            {icon}
          </div>
        </div>
        <h4 className="font-[600] text-gray-900 mb-2">{title}</h4>
        <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}