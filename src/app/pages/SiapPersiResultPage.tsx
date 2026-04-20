import { useParams, useNavigate } from "react-router";
import { CheckCircle2, Clock, FileText, ChevronRight, ArrowRight } from "lucide-react";
import { Button } from "../components/ui/button";
import { specialtyAuditData } from "../data/specialtyAuditData";
import { SpecialtyProgressTracker } from "../components/SpecialtyProgressTracker";
import { useData } from "../context/DataContext";
import { draftManager } from "../utils/draftManager";

export function SiapPersiResultPage() {
  const { specialty } = useParams<{ specialty: string }>();
  const navigate = useNavigate();
  const { addSubmission } = useData();
  const specialtyInfo = specialtyAuditData[specialty as keyof typeof specialtyAuditData];

  // Get selected specialties
  const selectedSpecialtiesStr = sessionStorage.getItem("selectedSpecialties");
  const selectedSpecialties: string[] = selectedSpecialtiesStr
    ? JSON.parse(selectedSpecialtiesStr)
    : [specialty];

  const currentIndex = selectedSpecialties.indexOf(specialty || "");
  const isLastSpecialty = currentIndex === selectedSpecialties.length - 1;
  const nextSpecialty = !isLastSpecialty ? selectedSpecialties[currentIndex + 1] : null;

  // Get scores from session (Specialty Specific)
  const rsbkScore = parseFloat(sessionStorage.getItem(`${specialty}_rsbkScore`) || "0");
  const clinicalAuditScore = parseFloat(sessionStorage.getItem(`${specialty}_clinicalAuditScore`) || "0");
  const patientReportScore = parseFloat(sessionStorage.getItem(`${specialty}_patientReportScore`) || "0");

  // Calculate weighted total: RSBK 15%, Clinical Audit 60%, Patient Report 25%
  const rsbkWeighted = Number((rsbkScore * 0.15).toFixed(2));
  const auditWeighted = Number((clinicalAuditScore * 0.60).toFixed(2));
  const prmWeighted = Number((patientReportScore * 0.25).toFixed(2));
  const totalSiapScore = Number((rsbkWeighted + auditWeighted + prmWeighted).toFixed(2));

  const handleContinueToNext = () => {
    if (nextSpecialty) {
      navigate(`/siap-persi/rsbk/${nextSpecialty}`);
    }
  };

  const handleSubmit = () => {
    const draftId = draftManager.getCurrentDraftId();
    const draft = draftId ? draftManager.getDraftById(draftId) : null;

    // Loop through all selected specialties and create a submission for each
    selectedSpecialties.forEach((spec) => {
      const info = specialtyAuditData[spec as keyof typeof specialtyAuditData];
      if (!info) return;

      const rsbk = parseFloat(sessionStorage.getItem(`${spec}_rsbkScore`) || "0");
      const audit = parseFloat(sessionStorage.getItem(`${spec}_clinicalAuditScore`) || "0");
      const report = parseFloat(sessionStorage.getItem(`${spec}_patientReportScore`) || "0");
      const final = Number(((rsbk * 0.15) + (audit * 0.60) + (report * 0.25)).toFixed(2));

      // Get real raw data from draft
      const specProgress = draft?.progress[spec];

      // --- THE SAFETY NET: Grab the most reliable session data ---
      const sessionData = JSON.parse(
        sessionStorage.getItem("hospitalAuth") ||
        sessionStorage.getItem("persi_hospital_session") ||
        "{}"
      );

      const realHospitalName = sessionData.hospitalName || sessionData.hospital_name || "Unknown Hospital";
      const realPicName = sessionData.picName || sessionData.pic_name || "Unknown PIC";

      // --- SEND THE PACKAGE ---
      addSubmission({
        hospitalName: realHospitalName, // <--- Safely attached!
        picName: realPicName,           // <--- Safely attached!
        specialty: info.name,
        submittedDate: new Date().toISOString().split("T")[0],
        status: "Pending",
        scores: {
          rsbk,
          clinicalAudit: audit,
          patientReport: report,
          final,
        },
        details: {
          specialties: [{ specialty: info.name, disease: info.disease }],
          rsbkData: specProgress?.rsbk.data || {},
          auditData: specProgress?.clinicalAudit.data || {},
          prmData: specProgress?.patientReport.data || {},
        },
      });

      // Cleanup specialty-specific scores
      sessionStorage.removeItem(`${spec}_rsbkScore`);
      sessionStorage.removeItem(`${spec}_clinicalAuditScore`);
      sessionStorage.removeItem(`${spec}_patientReportScore`);
    });

    // Cleanup draft
    if (draftId) {
      draftManager.deleteDraft(draftId);
      draftManager.clearCurrentDraftId();
    }

    // General cleanup
    sessionStorage.removeItem("currentSpecialty");
    sessionStorage.setItem("last_submitted_specialties", JSON.stringify(selectedSpecialties));
    sessionStorage.removeItem("selectedSpecialties");

    navigate("/siap-persi/submission-success");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Multi-Specialty Progress */}
        <SpecialtyProgressTracker currentSpecialty={specialty || ""} currentStage="result" />

        {/* Header */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-6">
          <div className="text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-10 h-10 text-[#0F4C81]" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              Review Data Submission
            </h1>
            <p className="text-gray-600 text-lg">
              {specialtyInfo.name} - {specialtyInfo.disease}
            </p>
            {selectedSpecialties.length > 1 && (
              <p className="text-sm text-gray-500 mt-2">
                Pelayanan {currentIndex + 1} dari {selectedSpecialties.length}
              </p>
            )}
          </div>
        </div>

        {/* Score Recapitulation */}
        <div className="bg-white rounded-2xl border-2 border-[#0F4C81] p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Rekapitulasi Nilai</h2>
            <div className="bg-[#0F4C81] text-white px-5 py-2 rounded-xl">
              <span className="text-sm">Total NHR PERSI</span>
              <span className="text-3xl font-bold ml-3">{totalSiapScore}</span>
            </div>
          </div>

          {/* Weighted Score Table */}
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-[#0F4C81]">
                  <th className="text-left py-3 px-4 font-bold text-[#0F4C81]">Komponen Penilaian</th>
                  <th className="text-center py-3 px-4 font-bold text-[#0F4C81]">Nilai</th>
                  <th className="text-center py-3 px-4 font-bold text-[#0F4C81]">Bobot</th>
                  <th className="text-center py-3 px-4 font-bold text-[#0F4C81]">Nilai Berbobot</th>
                  <th className="text-center py-3 px-4 font-bold text-[#0F4C81]">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200 bg-blue-50/50">
                  <td className="py-4 px-4">
                    <div className="font-medium text-gray-900">Hospital Structure Form</div>
                    <div className="text-xs text-gray-500">Tenaga medis & sarana prasarana</div>
                  </td>
                  <td className="py-4 px-4 text-center font-bold text-blue-700">{rsbkScore}</td>
                  <td className="py-4 px-4 text-center text-gray-600">15%</td>
                  <td className="py-4 px-4 text-center font-bold text-blue-700">{rsbkWeighted}</td>
                  <td className="py-4 px-4 text-center">
                    <span className="inline-flex items-center gap-1 text-green-700 text-xs font-semibold">
                      <CheckCircle2 className="w-4 h-4" /> Selesai
                    </span>
                  </td>
                </tr>
                <tr className="border-b border-gray-200 bg-purple-50/50">
                  <td className="py-4 px-4">
                    <div className="font-medium text-gray-900">Clinical Audit</div>
                    <div className="text-xs text-gray-500">30 rekam medis pasien</div>
                  </td>
                  <td className="py-4 px-4 text-center font-bold text-purple-700">{clinicalAuditScore}</td>
                  <td className="py-4 px-4 text-center text-gray-600">60%</td>
                  <td className="py-4 px-4 text-center font-bold text-purple-700">{auditWeighted}</td>
                  <td className="py-4 px-4 text-center">
                    <span className="inline-flex items-center gap-1 text-green-700 text-xs font-semibold">
                      <CheckCircle2 className="w-4 h-4" /> Selesai
                    </span>
                  </td>
                </tr>
                <tr className="border-b border-gray-200 bg-teal-50/50">
                  <td className="py-4 px-4">
                    <div className="font-medium text-gray-900">Patient Report (PREM & PROM)</div>
                    <div className="text-xs text-gray-500">Target optimal 30 pasien</div>
                  </td>
                  <td className="py-4 px-4 text-center font-bold text-teal-700">{patientReportScore}</td>
                  <td className="py-4 px-4 text-center text-gray-600">25%</td>
                  <td className="py-4 px-4 text-center font-bold text-teal-700">{prmWeighted}</td>
                  <td className="py-4 px-4 text-center">
                    <span className="inline-flex items-center gap-1 text-green-700 text-xs font-semibold">
                      <CheckCircle2 className="w-4 h-4" /> Selesai
                    </span>
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="bg-[#0F4C81]/10">
                  <td className="py-4 px-4 font-bold text-[#0F4C81] text-lg" colSpan={3}>
                    Total Skor NHR PERSI
                  </td>
                  <td className="py-4 px-4 text-center font-bold text-[#0F4C81] text-3xl">
                    {totalSiapScore}
                  </td>
                  <td className="py-4 px-4"></td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600">
            <p><strong>Rumus:</strong> Total = (RSBK x 15%) + (Clinical Audit x 60%) + (Patient Report x 25%)</p>
          </div>
        </div>

        {/* Ringkasan Submission */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Ringkasan Submission</h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
                <div>
                  <p className="font-semibold text-gray-900">Hospital Structure Form</p>
                  <p className="text-sm text-gray-600">Tenaga medis & sarana prasarana</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-green-700 font-semibold block">Selesai</span>
                <span className="text-sm text-gray-500">Skor: {rsbkScore}</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
                <div>
                  <p className="font-semibold text-gray-900">Clinical Audit</p>
                  <p className="text-sm text-gray-600">30 rekam medis pasien</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-green-700 font-semibold block">Selesai</span>
                <span className="text-sm text-gray-500">Skor: {clinicalAuditScore}</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
                <div>
                  <p className="font-semibold text-gray-900">Patient Report (PREM & PROM)</p>
                  <p className="text-sm text-gray-600">Target optimal 30 pasien</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-green-700 font-semibold block">Selesai</span>
                <span className="text-sm text-gray-500">Skor: {patientReportScore}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Next Specialty Banner */}
        {!isLastSpecialty && nextSpecialty && (
          <div className="bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl p-8 mb-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold mb-2">
                  Lanjut ke Pelayanan Berikutnya
                </h3>
                <p className="text-white/90 mb-4">
                  Anda masih memiliki {selectedSpecialties.length - currentIndex - 1} pelayanan lagi yang perlu diisi
                </p>
                <div className="flex items-center gap-2 bg-white/20 rounded-lg px-4 py-2 inline-flex">
                  <ArrowRight className="w-5 h-5" />
                  <span className="font-semibold">
                    Berikutnya: {specialtyAuditData[nextSpecialty as keyof typeof specialtyAuditData].name}
                  </span>
                </div>
              </div>
              <Button
                onClick={handleContinueToNext}
                className="h-14 px-8 bg-white text-purple-600 hover:bg-white/90 font-semibold text-lg"
              >
                Lanjut Mengisi
                <ChevronRight className="w-6 h-6 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Important Notice - Only show on last specialty */}
        {isLastSpecialty && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-8 mb-6">
            <div className="flex gap-4">
              <Clock className="w-8 h-8 text-blue-600 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Proses Review oleh Tim PERSI
                </h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Setelah Anda submit, data dari <strong>{selectedSpecialties.length} pelayanan</strong> akan
                  direview oleh tim ahli PERSI untuk verifikasi dan validasi. Proses ini memastikan
                  kualitas dan kredibilitas penilaian.
                </p>
                <div className="space-y-2 text-sm text-gray-700">
                  <p className="flex items-start gap-2">
                    <span className="font-bold text-blue-600">1.</span>
                    <span>Tim reviewer akan memverifikasi kelengkapan dan keakuratan data</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="font-bold text-blue-600">2.</span>
                    <span>Perhitungan skor dilakukan sesuai metodologi NHR PERSI</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="font-bold text-blue-600">3.</span>
                    <span>Anda akan menerima notifikasi email setelah review selesai (5-7 hari kerja)</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="font-bold text-blue-600">4.</span>
                    <span>Skor dan sertifikasi akan tersedia setelah approval</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => navigate("/siap-persi/select-specialty")}
            className="h-12 px-8 border-2 border-gray-300 font-semibold"
          >
            Kembali
          </Button>

          {!isLastSpecialty ? (
            <Button
              onClick={handleContinueToNext}
              className="flex-1 h-12 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 font-semibold"
            >
              Lanjut ke {specialtyAuditData[nextSpecialty as keyof typeof specialtyAuditData].name}
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              className="flex-1 h-12 bg-gradient-to-r from-[#0F4C81] to-[#14B8A6] hover:from-[#0d3d66] hover:to-[#0d9488] font-semibold"
            >
              Submit Semua untuk Review ({selectedSpecialties.length} Pelayanan)
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
