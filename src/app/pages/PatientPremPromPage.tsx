import { useState } from "react";
import { useParams, useSearchParams } from "react-router";
import { Heart, MessageSquare, CheckCircle2, Building2, Shield } from "lucide-react";
import { Button } from "../components/ui/button";
import { specialtyAuditData } from "../data/specialtyAuditData";
import { submitSurvey } from "../utils/api";

// ===== LIKERT SCALE 1-5 =====
// Based on NHS PREM framework & validated patient experience instruments
// 5=Sangat Setuju (100pts), 4=Setuju (75pts), 3=Netral (50pts), 2=Tidak Setuju (25pts), 1=Sangat Tidak Setuju (0pts)
const ratingOptions = [
  { value: "5", label: "Sangat Setuju", emoji: "⭐⭐⭐⭐⭐", score: 100, color: "green" },
  { value: "4", label: "Setuju", emoji: "⭐⭐⭐⭐", score: 75, color: "teal" },
  { value: "3", label: "Netral", emoji: "⭐⭐⭐", score: 50, color: "yellow" },
  { value: "2", label: "Tidak Setuju", emoji: "⭐⭐", score: 25, color: "orange" },
  { value: "1", label: "Sangat Tidak Setuju", emoji: "⭐", score: 0, color: "red" },
];

// Default generic questions (fallback if no specialty selected)
const defaultPremQuestions = [
  { id: "prem-1", question: "Komunikasi dokter jelas dan mudah dipahami" },
  { id: "prem-2", question: "Waktu tunggu pelayanan sesuai harapan" },
  { id: "prem-3", question: "Kenyamanan fasilitas rumah sakit" },
  { id: "prem-4", question: "Kejelasan penjelasan tentang kondisi dan pengobatan" },
  { id: "prem-5", question: "Kemudahan akses dan prosedur administratif" },
  { id: "prem-6", question: "Keramahan dan responsivitas petugas" },
];

const defaultPromQuestions = [
  { id: "prom-1", question: "Perbaikan gejala setelah perawatan" },
  { id: "prom-2", question: "Peningkatan kualitas hidup pasien" },
  { id: "prom-3", question: "Kemampuan melakukan aktivitas sehari-hari" },
  { id: "prom-4", question: "Kepuasan terhadap hasil pengobatan" },
];

// LocalStorage key for patient survey responses
export function getPatientSurveyKey(hospitalCode: string, specialty: string) {
  return `patient-surveys-${hospitalCode}-${specialty}`;
}

export interface PatientSurveyResponse {
  id: string;
  patientName: string;
  medicalRecordNumber: string;
  specialty: string;
  answers: Record<string, string>; // questionId -> "puas" | "cukup" | "kurang"
  premScore: number;
  promScore: number;
  overallScore: number;
  submittedAt: string;
}

export function PatientPremPromPage() {
  const { hospitalCode, specialty: urlSpecialty } = useParams<{ hospitalCode: string; specialty?: string }>();
  const [searchParams] = useSearchParams();

  // Read personalized patient info from URL query params
  const qName = searchParams.get("name") || "";
  const qRm = searchParams.get("rm") || "";
  const qDisease = parseInt(searchParams.get("disease") || "0", 10);

  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const selectedSpecialty = urlSpecialty || "";

  // Get specialty-specific questions from the disease
  const specData = selectedSpecialty ? specialtyAuditData[selectedSpecialty as keyof typeof specialtyAuditData] : null;
  const disease = specData?.diseases[qDisease];
  const diseaseName = disease?.diseaseName || "";

  // Use disease-specific PREM/PROM questions
  const premQuestions = disease?.premQuestions?.length
    ? disease.premQuestions.map(q => ({ id: q.id, question: q.question, subCategory: q.subCategory }))
    : defaultPremQuestions.map(q => ({ ...q, subCategory: undefined }));
  const promQuestions = disease?.promQuestions?.length
    ? disease.promQuestions.map(q => ({ id: q.id, question: q.question, subCategory: q.subCategory }))
    : defaultPromQuestions.map(q => ({ ...q, subCategory: undefined }));

  // Use disease-specific specialty key for API
  const diseaseSpecialtyKey = `${selectedSpecialty}-d${qDisease}`;

  const handleChange = (id: string, value: string) => {
    setFormData({ ...formData, [id]: value });
  };

  const isComplete =
    selectedSpecialty &&
    qName &&
    qRm &&
    premQuestions.every((q) => formData[q.id]) &&
    promQuestions.every((q) => formData[q.id]);

  // Calculate scores
  const calculateScores = () => {
    const getScore = (val: string) => {
      const opt = ratingOptions.find(o => o.value === val);
      return opt ? opt.score : 0;
    };

    const premScores = premQuestions.map(q => getScore(formData[q.id] || ""));
    const promScores = promQuestions.map(q => getScore(formData[q.id] || ""));

    const premAvg = premScores.length > 0 ? premScores.reduce((a, b) => a + b, 0) / premScores.length : 0;
    const promAvg = promScores.length > 0 ? promScores.reduce((a, b) => a + b, 0) / promScores.length : 0;

    // PREM 60% + PROM 40%
    const overall = Math.round(premAvg * 0.6 + promAvg * 0.4);

    return { premScore: Math.round(premAvg), promScore: Math.round(promAvg), overallScore: overall };
  };

  const handleSubmit = () => {
    if (!isComplete || !hospitalCode) return;

    const scores = calculateScores();

    const response: PatientSurveyResponse = {
      id: `survey-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      patientName: qName,
      medicalRecordNumber: qRm,
      specialty: selectedSpecialty,
      answers: { ...formData },
      premScore: scores.premScore,
      promScore: scores.promScore,
      overallScore: scores.overallScore,
      submittedAt: new Date().toISOString(),
    };

    // Submit to server with disease-specific key (fire and forget, show success immediately)
    submitSurvey(hospitalCode, diseaseSpecialtyKey, response).catch((err) => {
      console.error("Failed to submit survey to server:", err);
    });

    setIsSubmitted(true);
  };

  // Invalid link - no patient info
  if (!qName || !qRm || !hospitalCode || !selectedSpecialty) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-10 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <Shield className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Link Survei Tidak Valid
          </h1>
          <p className="text-gray-600 leading-relaxed mb-6">
            Link ini tidak mengandung data pasien yang lengkap. Silakan minta petugas rumah sakit untuk men-generate QR code baru untuk Anda.
          </p>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-500 text-left space-y-1">
            <p><strong>Yang dibutuhkan:</strong></p>
            <ul className="list-disc pl-4 space-y-0.5">
              <li>Nama pasien</li>
              <li>Nomor rekam medis</li>
              <li>Kode rumah sakit</li>
              <li>Pelayanan</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    const scores = calculateScores();
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 flex items-center justify-center p-6">
        <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-12 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Terima Kasih!
          </h1>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Jawaban Anda telah berhasil disimpan. Masukan Anda sangat berharga untuk
            membantu meningkatkan kualitas pelayanan rumah sakit.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-gray-700 space-y-1">
            <p><strong>Nama:</strong> {qName}</p>
            <p><strong>Nomor Rekam Medis:</strong> {qRm}</p>
            <p><strong>Skor PREM:</strong> {scores.premScore}/100</p>
            <p><strong>Skor PROM:</strong> {scores.promScore}/100</p>
            <p><strong>Tanggal:</strong> {new Date().toLocaleDateString("id-ID")}</p>
          </div>
          <p className="text-xs text-gray-400 mt-6">
            PERSI National Hospital Ranking Indonesia
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 p-4 md:p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-5">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-[#0F4C81] rounded-xl flex items-center justify-center">
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                Survei Kepuasan Pasien
              </h1>
              <p className="text-gray-500 text-sm">PREM & PROM Assessment</p>
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-gray-700">
            <p className="leading-relaxed">
              Survei ini mengevaluasi pengalaman dan hasil perawatan Anda.
              Jawaban bersifat <strong>rahasia</strong> dan akan membantu meningkatkan kualitas pelayanan.
            </p>
          </div>
        </div>

        {/* Patient Info (Read-only) */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-5">
          <h3 className="font-bold text-gray-900 mb-4">Data Pasien</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Nama Lengkap</label>
              <div className="h-11 px-4 bg-gray-50 border-2 border-gray-200 rounded-lg flex items-center text-gray-900 font-medium">
                {qName}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Nomor Rekam Medis</label>
              <div className="h-11 px-4 bg-gray-50 border-2 border-gray-200 rounded-lg flex items-center text-gray-900 font-medium font-mono">
                {qRm}
              </div>
            </div>
          </div>
          {specData && (
            <div className="mt-4 flex items-center gap-3 p-3 bg-[#0F4C81]/5 rounded-lg border border-[#0F4C81]/10">
              <Heart className="w-4 h-4 text-[#0F4C81]" />
              <div>
                <span className="font-medium text-gray-900 text-sm">Pelayanan: {specData.name}</span>
                {diseaseName && <span className="text-xs text-gray-500 ml-2">Penyakit: {diseaseName}</span>}
              </div>
            </div>
          )}
        </div>

        {/* Rating Guide */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-5">
          <h3 className="font-bold text-gray-900 mb-3">Panduan Penilaian</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
            {ratingOptions.map((opt) => (
              <div
                key={opt.value}
                className={`rounded-xl p-3 md:p-4 text-center border-2 ${
                  opt.color === "green" ? "bg-green-50 border-green-200" :
                  opt.color === "teal" ? "bg-teal-50 border-teal-200" :
                  opt.color === "yellow" ? "bg-yellow-50 border-yellow-200" :
                  opt.color === "orange" ? "bg-orange-50 border-orange-200" :
                  "bg-red-50 border-red-200"
                }`}
              >
                <div className="text-2xl md:text-3xl mb-0.5">{opt.emoji}</div>
                <div className="font-bold text-gray-800 text-sm md:text-base">{opt.label}</div>
                <div className="text-xs text-gray-500 mt-1">{opt.score} poin</div>
              </div>
            ))}
          </div>
        </div>

        {/* PREM Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2.5 rounded-xl bg-blue-100 text-blue-600">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold text-gray-900">PREM - Pengalaman Pasien</h2>
              <p className="text-xs text-gray-500">Patient Reported Experience (Bobot 60%)</p>
            </div>
          </div>
          <div className="space-y-4">
            {premQuestions.map((q, index) => (
              <SurveyQuestion
                key={q.id}
                number={index + 1}
                question={q.question}
                subCategory={q.subCategory}
                value={formData[q.id] || ""}
                onChange={(value) => handleChange(q.id, value)}
              />
            ))}
          </div>
        </div>

        {/* PROM Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2.5 rounded-xl bg-teal-100 text-teal-600">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold text-gray-900">PROM - Hasil Pengobatan</h2>
              <p className="text-xs text-gray-500">Patient Reported Outcome (Bobot 40%)</p>
            </div>
          </div>
          <div className="space-y-4">
            {promQuestions.map((q, index) => (
              <SurveyQuestion
                key={q.id}
                number={index + 1}
                question={q.question}
                subCategory={q.subCategory}
                value={formData[q.id] || ""}
                onChange={(value) => handleChange(q.id, value)}
              />
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <Button
            onClick={handleSubmit}
            disabled={!isComplete}
            className="w-full h-14 text-lg bg-gradient-to-r from-[#0F4C81] to-[#14B8A6] hover:from-[#0d3d66] hover:to-[#0d9488] font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {!isComplete ? "Lengkapi semua pertanyaan" : "Kirim Jawaban"}
          </Button>
          {!isComplete && (
            <p className="text-sm text-gray-500 text-center mt-3">
              Pastikan semua pertanyaan telah dijawab
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-400 pb-6">
          NHR PERSI - National Hospital Ranking Indonesia
        </div>
      </div>
    </div>
  );
}

function SurveyQuestion({
  number,
  question,
  subCategory,
  value,
  onChange,
}: {
  number: number;
  question: string;
  subCategory?: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
      <div className="flex items-start gap-3">
        <div className="w-7 h-7 bg-[#0F4C81] text-white rounded-lg flex items-center justify-center font-bold flex-shrink-0 text-sm">
          {number}
        </div>
        <div className="flex-1">
          {subCategory && (
            <div className="inline-block px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded mb-1.5">
              {subCategory}
            </div>
          )}
          <p className="font-medium text-gray-900 mb-4 leading-relaxed text-sm md:text-base">
            {question}
          </p>
          <div className="flex flex-col sm:grid sm:grid-cols-2 md:grid-cols-5 gap-2">
            {ratingOptions.map((opt) => {
              const isSelected = value === opt.value;
              const colorMap: Record<string, { selected: string; hover: string }> = {
                green: { selected: "border-green-500 bg-green-50 ring-2 ring-green-200", hover: "hover:border-green-300" },
                teal: { selected: "border-teal-500 bg-teal-50 ring-2 ring-teal-200", hover: "hover:border-teal-300" },
                yellow: { selected: "border-yellow-500 bg-yellow-50 ring-2 ring-yellow-200", hover: "hover:border-yellow-300" },
                orange: { selected: "border-orange-500 bg-orange-50 ring-2 ring-orange-200", hover: "hover:border-orange-300" },
                red: { selected: "border-red-500 bg-red-50 ring-2 ring-red-200", hover: "hover:border-red-300" },
              };
              const colors = colorMap[opt.color];

              return (
                <button
                  key={opt.value}
                  onClick={() => onChange(opt.value)}
                  className={`p-3 md:py-3 md:px-2 rounded-xl border-2 flex items-center md:flex-col md:justify-center gap-3 md:gap-1 transition-all text-left md:text-center ${
                    isSelected ? colors.selected : `border-gray-200 ${colors.hover}`
                  }`}
                >
                  <div className="text-xl md:text-2xl">{opt.emoji}</div>
                  <div className={`text-sm font-semibold flex-1 md:flex-none ${isSelected ? "text-gray-900" : "text-gray-600"}`}>
                    {opt.label}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}