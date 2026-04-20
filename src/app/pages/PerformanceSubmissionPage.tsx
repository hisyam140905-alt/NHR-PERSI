import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Building2, CheckCircle2 } from "lucide-react";
import { Button } from "../components/ui/button";

export function PerformanceSubmissionPage() {
  const navigate = useNavigate();
  const [authData, setAuthData] = useState<{ hospitalName: string; picName: string } | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    const auth = sessionStorage.getItem("hospitalAuth");
    if (!auth) {
      navigate("/hospital-login");
      return;
    }
    const parsedAuth = JSON.parse(auth);
    setAuthData(parsedAuth);
  }, [navigate]);

  if (!authData) {
    return null;
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Submission Berhasil!
          </h1>
          <p className="text-gray-700 mb-8">
            Data performa rumah sakit Anda telah dikirim dan sedang dalam proses review.
            Tim reviewer akan menghubungi Anda dalam 5-7 hari kerja.
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => navigate("/")} variant="outline">
              Kembali ke Homepage
            </Button>
            <Button onClick={() => navigate("/submit")} className="bg-[#0F4C81]">
              Submit Data Lainnya
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="bg-white rounded-xl border border-gray-200 p-8 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-[#0F4C81] rounded-xl flex items-center justify-center">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Submit Data Performa
              </h1>
              <p className="text-gray-600">
                {authData.hospitalName} - Data untuk Ranking Nasional PERSI
              </p>
            </div>
          </div>
        </div>

        {/* Form Placeholder */}
        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Form Data Kinerja Rumah Sakit
          </h2>
          <p className="text-gray-600 mb-8">
            Form lengkap untuk submit data clinical performance, research, facilities, dan patient
            safety akan tersedia di sini.
          </p>

          {/* Demo Button */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
            <p className="text-gray-700 mb-4">
              <strong>Demo Mode:</strong> Untuk keperluan demo, klik tombol di bawah untuk
              mensimulasikan pengisian form lengkap.
            </p>
            <Button
              onClick={() => setSubmitted(true)}
              className="bg-[#0F4C81] hover:bg-[#0d3d66]"
            >
              Simulasi Submit Data Performa
            </Button>
          </div>

          {/* Actual form would go here */}
          <div className="space-y-6">
            <div className="border-t border-gray-200 pt-6">
              <h3 className="font-bold text-gray-900 mb-4">Bagian Form:</h3>
              <div className="grid gap-3 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#0F4C81] rounded-full"></div>
                  <span>Informasi Dasar Rumah Sakit</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#0F4C81] rounded-full"></div>
                  <span>Clinical Performance Metrics</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#0F4C81] rounded-full"></div>
                  <span>Research & Education Data</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#0F4C81] rounded-full"></div>
                  <span>Patient Experience Indicators</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#0F4C81] rounded-full"></div>
                  <span>Facilities & Infrastructure</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#0F4C81] rounded-full"></div>
                  <span>Safety & Quality Metrics</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-6">
          <Button
            variant="outline"
            onClick={() => navigate("/submit")}
            className="border-2 border-gray-300"
          >
            ← Kembali ke Pilihan Submission
          </Button>
        </div>
      </div>
    </div>
  );
}
