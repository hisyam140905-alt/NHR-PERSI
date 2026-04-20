import { useNavigate } from "react-router";
import { CheckCircle2, Clock, Mail, ArrowRight, Heart, Brain, Activity } from "lucide-react";
import { Button } from "../components/ui/button";
import { specialtyAuditData } from "../data/specialtyAuditData";

export function SubmissionSuccessPage() {
  const navigate = useNavigate();

  // Get submitted data from session before it was cleared
  // In real app, this would come from API/database
  const authData = JSON.parse(sessionStorage.getItem("hospitalAuth") || "{}");
  const hospitalName = authData.hospitalName || "Rumah Sakit";

  // Try to get specialty data (this would be stored before clearing in real app
  const lastSpecialties = JSON.parse(sessionStorage.getItem("last_submitted_specialties") || "[]");
  const submissionData = { selectedSpecialties: lastSpecialties };
  const submittedSpecialties = submissionData?.selectedSpecialties || [];

  const specialtyIcons: Record<string, React.ReactNode> = {
    cardiology: <Heart className="w-5 h-5" />,
    neurology: <Brain className="w-5 h-5" />,
    oncology: <Activity className="w-5 h-5" />,
  };

  const specialtyColors: Record<string, string> = {
    cardiology: "from-red-500 to-pink-500",
    neurology: "from-blue-500 to-cyan-500",
    oncology: "from-purple-500 to-indigo-500",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 flex items-center justify-center p-6">
      <div className="max-w-3xl w-full">
        {/* Success Card */}
        <div className="bg-white rounded-2xl shadow-xl p-12 text-center mb-6">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 className="w-14 h-14 text-green-600" />
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Submission Berhasil!
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Data NHR PERSI Assessment Anda telah diterima dan sedang dalam proses review
          </p>
          <p className="text-gray-500 mb-8">
            {hospitalName}
          </p>

          {/* Submitted Specialties Summary */}
          <div className="bg-gradient-to-r from-blue-500 to-teal-500 rounded-xl p-6 mb-8 text-white">
            <h3 className="text-lg font-bold mb-4">
              Data yang Disubmit
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {submittedSpecialties.map((spec: string) => {
                const info = specialtyAuditData[spec as keyof typeof specialtyAuditData];
                return (
                  <div
                    key={spec}
                    className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-center"
                  >
                    <div className={`w-12 h-12 mx-auto mb-2 bg-gradient-to-br ${specialtyColors[spec]} rounded-lg flex items-center justify-center`}>
                      {specialtyIcons[spec]}
                    </div>
                    <p className="font-semibold text-sm">{info.name}</p>
                    <p className="text-xs text-white/80">{info.disease}</p>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 bg-white/10 rounded-lg p-3">
              <p className="text-sm">
                <strong>{submittedSpecialties.length} Pelayanan</strong> telah disubmit untuk review
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <div className="inline-flex items-center gap-3 bg-yellow-50 border-2 border-yellow-200 rounded-xl px-6 py-4 mb-8">
            <Clock className="w-6 h-6 text-yellow-600" />
            <div className="text-left">
              <p className="text-sm text-gray-600">Status Submission</p>
              <p className="text-lg font-bold text-yellow-700">Under Review</p>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-8 text-left">
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Mail className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-bold text-gray-900">Notifikasi Email</h3>
              </div>
              <p className="text-sm text-gray-700">
                Anda akan menerima email ketika review selesai dan skor sudah tersedia
              </p>
            </div>

            <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="font-bold text-gray-900">Waktu Review</h3>
              </div>
              <p className="text-sm text-gray-700">
                Proses review membutuhkan waktu 5-7 hari kerja
              </p>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left">
            <h3 className="font-bold text-gray-900 mb-4">Langkah Selanjutnya:</h3>
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="w-6 h-6 bg-[#0F4C81] text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                  1
                </div>
                <p className="text-gray-700">
                  Tim reviewer PERSI akan memverifikasi kelengkapan dan keakuratan data Anda
                </p>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 bg-[#0F4C81] text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                  2
                </div>
                <p className="text-gray-700">
                  Perhitungan skor dilakukan sesuai metodologi NHR PERSI
                </p>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 bg-[#0F4C81] text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                  3
                </div>
                <p className="text-gray-700">
                  Jika disetujui, Anda akan menerima sertifikasi dan skor dapat dilihat
                </p>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 bg-[#0F4C81] text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                  4
                </div>
                <p className="text-gray-700">
                  Jika ada data yang perlu dilengkapi, kami akan menghubungi Anda
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={() => navigate("/")}
              variant="outline"
              className="flex-1 h-12 border-2 border-gray-300 font-semibold"
            >
              Kembali ke Homepage
            </Button>
            <Button
              onClick={() => navigate("/submit")}
              className="flex-1 h-12 bg-[#0F4C81] hover:bg-[#0d3d66] font-semibold"
            >
              Submit Data Lainnya
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>

        {/* Info Note */}
        <div className="bg-white/80 rounded-xl border border-gray-200 p-6 text-center">
          <p className="text-sm text-gray-600">
            Untuk pertanyaan atau informasi lebih lanjut, hubungi{" "}
            <a href="mailto:persi@persi.co.id" className="text-[#0F4C81] font-semibold hover:underline">
              persi@persi.co.id
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}