import { useState } from "react";
import { Link } from "react-router";
import {
  Search,
  BarChart3,
  ChevronRight,
  MapPin,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useData } from "../context/DataContext";
import { motion } from "framer-motion";

export function RankingListPage() {
  const { approvedRankings } = useData();
  const [searchTerm, setSearchTerm] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("all");
  const [provinceFilter, setProvinceFilter] = useState("all");

  const hasRankings = approvedRankings.length > 0;

  const filtered = approvedRankings.filter((r) => {
    const matchSearch =
      r.hospitalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchSpecialty =
      specialtyFilter === "all" || r.specialty === specialtyFilter;
    const matchProvince =
      provinceFilter === "all" || r.province === provinceFilter;
    return matchSearch && matchSpecialty && matchProvince;
  });

  const specialties = [
    ...new Set(approvedRankings.map((r) => r.specialty)),
  ];
  const provinces = [...new Set(approvedRankings.map((r) => r.province))];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#1E3A8A] to-[#0D9488] text-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <h1 className="text-3xl font-[700] mb-2">
            Hospital Rankings Indonesia
          </h1>
          <p className="text-white/80">
            Ranking rumah sakit nasional berdasarkan NHR PERSI Assessment
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {hasRankings ? (
          <>
            {/* Filters */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-[240px] relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Cari rumah sakit atau kota..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-10"
                  />
                </div>
                <select
                  value={specialtyFilter}
                  onChange={(e) => setSpecialtyFilter(e.target.value)}
                  className="h-10 px-4 rounded-lg border border-gray-200 text-sm text-gray-700 bg-white"
                >
                  <option value="all">Semua Pelayanan</option>
                  {specialties.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <select
                  value={provinceFilter}
                  onChange={(e) => setProvinceFilter(e.target.value)}
                  className="h-10 px-4 rounded-lg border border-gray-200 text-sm text-gray-700 bg-white"
                >
                  <option value="all">Semua Provinsi</option>
                  {provinces.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500">
                Menampilkan {filtered.length} dari {approvedRankings.length}{" "}
                rumah sakit
              </p>
            </div>

            {/* Ranking Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-[600] text-gray-500 uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-[600] text-gray-500 uppercase tracking-wider">
                      Rumah Sakit
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-[600] text-gray-500 uppercase tracking-wider">
                      Pelayanan
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-[600] text-gray-500 uppercase tracking-wider">
                      RSBK
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-[600] text-gray-500 uppercase tracking-wider">
                      Clinical Audit
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-[600] text-gray-500 uppercase tracking-wider">
                      Patient Report
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-[600] text-gray-500 uppercase tracking-wider">
                      Skor Final
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-[600] text-gray-500 uppercase tracking-wider">
                      Grade
                    </th>
                  </tr>
                </thead>
                <motion.tbody 
                  className="divide-y divide-gray-100"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    visible: { transition: { staggerChildren: 0.05 } },
                  }}
                >
                  {filtered.map((r, idx) => (
                    <motion.tr 
                      key={r.id} 
                      className="hover:bg-gray-50 transition-colors"
                      variants={{
                        hidden: { opacity: 0, y: 15 },
                        visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
                      }}
                    >
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
                        <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3" />
                          {r.city}, {r.province}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">
                          {r.specialty}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-[500] text-gray-700">
                        {r.rsbkScore.toFixed(1)}
                      </td>
                      <td className="px-6 py-4 text-sm font-[500] text-gray-700">
                        {r.clinicalAuditScore.toFixed(1)}
                      </td>
                      <td className="px-6 py-4 text-sm font-[500] text-gray-700">
                        {r.patientReportScore.toFixed(1)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-lg font-[700] text-[#1E3A8A]">
                          {r.finalScore.toFixed(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-lg text-xs font-[600] ${
                            r.grade === "Platinum" || r.grade === "Tier 1"
                              ? "bg-purple-100 text-purple-700"
                              : r.grade === "Outstanding" || r.grade === "Tier 2"
                              ? "bg-blue-100 text-blue-700"
                              : r.grade === "Excellent" || r.grade === "Tier 3"
                              ? "bg-emerald-100 text-emerald-700"
                              : r.grade === "Commendable" || r.grade === "Tier 4"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {r.grade}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </motion.tbody>
              </table>
            </div>

              {filtered.length === 0 && (
                <div className="py-12 text-center">
                  <Search className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">
                    Tidak ada rumah sakit yang sesuai filter.
                  </p>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-12">
            <div className="max-w-3xl mx-auto text-center">
              <div className="w-28 h-28 bg-gradient-to-br from-blue-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-8">
                <BarChart3 className="w-14 h-14 text-[#1E3A8A]" />
              </div>

              <h2 className="text-3xl font-[700] text-gray-900 mb-4">
                Ranking Belum Tersedia
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Platform NHR PERSI baru diluncurkan. Data ranking akan muncul
                setelah rumah sakit menyelesaikan assessment dan proses review
                oleh tim ahli PERSI selesai.
              </p>

              {/* Timeline */}
              <div className="bg-gradient-to-br from-blue-50 to-teal-50 rounded-xl p-8 mb-8">
                <h3 className="font-[700] text-gray-900 mb-6 text-lg">
                  Proses untuk Masuk Ranking:
                </h3>
                <div className="space-y-6 text-left max-w-lg mx-auto">
                  <TimelineStep
                    number={1}
                    title="Rumah Sakit Submit Assessment"
                    description="Lengkapi NHR PERSI Assessment: RSBK, Clinical Audit, dan Patient Report"
                    status="current"
                  />
                  <TimelineStep
                    number={2}
                    title="Tim PERSI Review Data"
                    description="Proses verifikasi dan validasi oleh tim ahli PERSI (5-7 hari kerja)"
                    status="upcoming"
                  />
                  <TimelineStep
                    number={3}
                    title="Ranking Dipublikasi"
                    description="Setelah approval, rumah sakit akan masuk ranking dan dapat dilihat publik"
                    status="upcoming"
                  />
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <Link to="/hospital-login">
                  <Button className="h-12 px-8 bg-[#1E3A8A] hover:bg-[#1a3278] font-[600]">
                    Submit Assessment Sekarang
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link to="/methodology">
                  <Button
                    variant="outline"
                    className="h-12 px-8 border-2 font-[600]"
                  >
                    Pelajari Metodologi
                  </Button>
                </Link>
              </div>

              <p className="text-sm text-gray-500 mt-8">
                Untuk informasi lebih lanjut, hubungi{" "}
                <a
                  href="mailto:persi@persi.or.id"
                  className="text-[#1E3A8A] font-[600] hover:underline"
                >
                  persi@persi.or.id
                </a>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TimelineStep({
  number,
  title,
  description,
  status,
}: {
  number: number;
  title: string;
  description: string;
  status: "current" | "upcoming";
}) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center font-[700] ${
            status === "current"
              ? "bg-[#1E3A8A] text-white"
              : "bg-gray-200 text-gray-500"
          }`}
        >
          {number}
        </div>
        {number < 3 && (
          <div
            className={`w-0.5 h-10 ${
              status === "current"
                ? "bg-gradient-to-b from-[#1E3A8A] to-gray-300"
                : "bg-gray-300"
            }`}
          />
        )}
      </div>
      <div className="flex-1 pb-2">
        <h4
          className={`font-[600] mb-1 ${
            status === "current" ? "text-gray-900" : "text-gray-500"
          }`}
        >
          {title}
        </h4>
        <p
          className={`text-sm ${
            status === "current" ? "text-gray-700" : "text-gray-500"
          }`}
        >
          {description}
        </p>
      </div>
    </div>
  );
}
