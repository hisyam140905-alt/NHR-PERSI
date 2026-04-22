import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Building2,
  User,
  Mail,
  ArrowRight,
  LogOut,
  Shield,
  ClipboardCheck,
  Calendar,
  FileText,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { useData } from "../context/DataContext";

export function HospitalSubmissionPage() {
  const navigate = useNavigate();
  const { currentHospital, hospitalLogout } = useData();
  const [authData, setAuthData] = useState<{ hospitalName: string; picName: string } | null>(null);

  // Check authentication on mount
  useEffect(() => {
    const auth = sessionStorage.getItem("hospitalAuth");
    if (!auth && !currentHospital) {
      navigate("/hospital-login");
      return;
    }
    if (auth) {
      setAuthData(JSON.parse(auth));
    } else if (currentHospital) {
      setAuthData({
        hospitalName: currentHospital.hospitalName,
        picName: currentHospital.picName,
      });
    }
  }, [navigate, currentHospital]);

  if (!authData) {
    return null;
  }

 // 1. Calculate the code dynamically using our rock-solid currentHospital state!
  const realHospitalName = currentHospital?.hospitalName || "Unknown Hospital";
  
  // 1. Extract up to the first 2 words and format with hyphen
  const nameParts = realHospitalName.replace(/[^a-zA-Z0-9\s]/g, '').trim().split(/\s+/);
  const shortName = nameParts.slice(0, 2).join('-').toUpperCase() || "HOS";
  
  // 2. Strip out the annoying "hosp-" string from the database ID
  const cleanId = currentHospital?.id ? String(currentHospital.id).replace('hosp-', '') : '';

  // 3. Combine into the clean format
  const hospitalCode = cleanId 
    ? `${shortName}-${cleanId}` 
    : currentHospital?.email
      ? `${shortName}-${currentHospital.email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "").toUpperCase()}`
      : `${shortName}-001`;
      
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 py-12">
      <div className="max-w-4xl mx-auto px-6">
        {/* Hospital Profile Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden mb-8">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-[#0F4C81] to-[#14B8A6] p-8 text-white">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Building2 className="w-10 h-10 text-white" />
              </div>
              <div>
                {/* 2. Display the real name with a bulletproof fallback */}
                <h1 className="text-3xl font-bold mb-1">
                  {currentHospital?.hospitalName || "Nama Rumah Sakit Tidak Diketahui"}
                </h1>
                <p className="text-white/80 text-sm">Kode RS: {hospitalCode}</p>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Informasi Rumah Sakit</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Penanggung Jawab (PIC)</p>
                  <p className="font-semibold text-gray-900">{currentHospital?.picName || "Tidak ada PIC"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="font-semibold text-gray-900">{currentHospital?.email || "—"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Status Akun</p>
                  <p className="font-semibold text-green-600">Aktif & Terverifikasi</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Terdaftar Sejak</p>
                  <p className="font-semibold text-gray-900">
                    {currentHospital?.registeredAt
                      ? new Date(currentHospital.registeredAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                      : "—"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* NHR PERSI Assessment CTA */}
        <div className="bg-white rounded-2xl border-2 border-[#14B8A6] p-8 mb-6 hover:shadow-xl transition-all">
          <div className="flex items-start gap-6">
            <div className="w-16 h-16 bg-gradient-to-br from-[#0F4C81] to-[#14B8A6] rounded-2xl flex items-center justify-center flex-shrink-0">
              <ClipboardCheck className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                NHR PERSI Assessment
              </h2>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Mulai penilaian layanan spesialistik rumah sakit Anda. Pilih pelayanan
                (Kardiologi, Neurologi, atau Onkologi) dan isi form RSBK, Clinical Audit,
                serta Patient Report.
              </p>
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-blue-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">Hospital Structure</p>
                  <p className="font-bold text-[#0F4C81]">15%</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">Clinical Audit</p>
                  <p className="font-bold text-purple-700">60%</p>
                </div>
                <div className="bg-teal-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">Patient Report</p>
                  <p className="font-bold text-teal-700">25%</p>
                </div>
              </div>
              <Button
                onClick={() => navigate("/siap-persi/select-specialty")}
                className="h-14 px-10 bg-gradient-to-r from-[#0F4C81] to-[#14B8A6] hover:from-[#0d3d66] hover:to-[#0d9488] font-semibold text-lg"
              >
                Pilih Pelayanan & Mulai Assessment
                <ArrowRight className="w-6 h-6 ml-3" />
              </Button>
            </div>
          </div>
        </div>

        {/* Hasil Penilaian CTA */}
        <div
          onClick={() => navigate("/hospital/hasil-penilaian")}
          className="bg-white rounded-2xl border border-gray-200 p-6 mb-8 flex items-center justify-between hover:shadow-md hover:border-[#0F4C81] transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
              <FileText className="w-7 h-7 text-[#0F4C81]" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-[#0F4C81] transition-colors">Hasil Penilaian & Review</h3>
              <p className="text-sm text-gray-600">Pantau status submission dan lihat catatan revisi dari tim validator</p>
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-[#0F4C81] transition-colors">
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-white" />
          </div>
        </div>

        {/* Info */}
        <div className="bg-white rounded-xl border border-blue-200 p-6 mb-8">
          <h3 className="font-bold text-gray-900 mb-3">Informasi Penting</h3>
          <div className="space-y-2 text-sm text-gray-700">
            <p>
              • Submission akan direview oleh tim PERSI sebelum dipublikasikan
            </p>
            <p>
              • Waktu review: 5-7 hari kerja setelah submission
            </p>
            <p>
              • Anda dapat menyimpan draft dan melanjutkan pengisian di lain waktu
            </p>
          </div>
        </div>

        {/* Logout */}
        <div className="text-center">
          <Button
            variant="outline"
            onClick={() => {
              hospitalLogout();
              sessionStorage.removeItem("hospitalAuth");
              navigate("/");
            }}
            className="border-2 border-gray-300"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}