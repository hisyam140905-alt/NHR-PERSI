import { useState } from "react";
import { Link } from "react-router";
import {
  Activity,
  FileText,
  Users,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";
import { Button } from "../components/ui/button";

export function SiapPersiOverviewPage() {
  const [assessmentData] = useState({
    rsbkScore: 85,
    auditScore: 78,
    patientScore: 90,
    finalScore: 82.1,
    status: "in-progress", // completed, pending-review, approved
    specialty: "Cardiology",
    lastUpdated: "10 Maret 2026",
  });

  const getTier = (score: number) => {
    if (score >= 90) return { grade: "Tier 1", name: "Platinum", color: "text-purple-700", bg: "bg-purple-50" };
    if (score >= 80) return { grade: "Tier 2", name: "Outstanding", color: "text-blue-700", bg: "bg-blue-50" };
    if (score >= 70) return { grade: "Tier 3", name: "Excellent", color: "text-emerald-700", bg: "bg-emerald-50" };
    if (score >= 60) return { grade: "Tier 4", name: "Commendable", color: "text-amber-700", bg: "bg-amber-50" };
    return { grade: "Tier 5", name: "Developing", color: "text-slate-600", bg: "bg-slate-50" };
  };

  const finalGrade = getTier(assessmentData.finalScore);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            NHR PERSI Assessment
          </h1>
          <p className="text-gray-600">
            National Hospital Ranking PERSI untuk evaluasi kualitas rumah sakit
          </p>
        </div>

        {/* Progress Tracker */}
        <div className="bg-white rounded-xl border border-gray-200 p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Progress Penilaian</h2>
          <div className="flex items-center justify-between">
            <StepItem
              number={1}
              label="Hospital Structure"
              sublabel="Kemampuan Layanan"
              status="completed"
              isLast={false}
            />
            <StepItem
              number={2}
              label="Clinical Audit"
              sublabel="Audit Klinis"
              status="completed"
              isLast={false}
            />
            <StepItem
              number={3}
              label="Patient Report"
              sublabel="Laporan Pasien"
              status="current"
              isLast={false}
            />
            <StepItem
              number={4}
              label="Result"
              sublabel="Hasil Akhir"
              status="pending"
              isLast={true}
            />
          </div>
        </div>

        {/* Score Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <ScoreCard
            title="Hospital Structure Score"
            score={assessmentData.rsbkScore}
            weight="15%"
            icon={<Activity className="w-6 h-6" />}
            color="blue"
          />
          <ScoreCard
            title="Clinical Audit"
            score={assessmentData.auditScore}
            weight="60%"
            icon={<FileText className="w-6 h-6" />}
            color="purple"
          />
          <ScoreCard
            title="Patient Score"
            score={assessmentData.patientScore}
            weight="25%"
            icon={<Users className="w-6 h-6" />}
            color="teal"
          />
          <div className="bg-gradient-to-br from-[#0F4C81] to-[#14B8A6] rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white/90">Final Score</h3>
              <TrendingUp className="w-6 h-6" />
            </div>
            <div className="flex items-baseline gap-3 mb-2">
              <span className="text-5xl font-bold">{assessmentData.finalScore}</span>
              <span
                className={`text-2xl font-bold px-3 py-1 rounded-lg ${finalGrade.bg} ${finalGrade.color}`}
              >
                {finalGrade.grade}
              </span>
            </div>
            <p className="text-white/80 text-sm">Weighted Average</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Simple Radar Visualization */}
          <div className="bg-white rounded-xl border border-gray-200 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Visualisasi Komponen Penilaian
            </h2>
            <div className="space-y-4">
              <BarVisual
                label="Hospital Structure"
                value={assessmentData.rsbkScore}
                color="bg-blue-500"
              />
              <BarVisual
                label="Clinical Audit"
                value={assessmentData.auditScore}
                color="bg-purple-500"
              />
              <BarVisual
                label="Patient Report"
                value={assessmentData.patientScore}
                color="bg-teal-500"
              />
            </div>
          </div>

          {/* Assessment Info */}
          <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-4">Status Penilaian</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Pelayanan</span>
                  <span className="font-semibold text-gray-900">
                    {assessmentData.specialty}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Status</span>
                  <StatusBadge status={assessmentData.status} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Terakhir Diperbarui</span>
                  <span className="text-gray-900">{assessmentData.lastUpdated}</span>
                </div>
              </div>
            </div>

            {/* Score Breakdown */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-4">Perhitungan Skor</h3>
              <div className="space-y-3">
                <CalculationRow
                  label="Hospital Structure"
                  score={assessmentData.rsbkScore}
                  weight={0.15}
                  result={assessmentData.rsbkScore * 0.15}
                />
                <CalculationRow
                  label="Clinical Audit"
                  score={assessmentData.auditScore}
                  weight={0.6}
                  result={assessmentData.auditScore * 0.6}
                />
                <CalculationRow
                  label="Patient Report"
                  score={assessmentData.patientScore}
                  weight={0.25}
                  result={assessmentData.patientScore * 0.25}
                />
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900">Total Score</span>
                    <span className="text-2xl font-bold text-[#0F4C81]">
                      {assessmentData.finalScore}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Link to="/siap-persi/select-specialty" className="flex-1">
                <Button className="w-full h-12 bg-[#0F4C81] hover:bg-[#0d3d66] font-semibold">
                  Lanjutkan Penilaian
                </Button>
              </Link>
              <Button
                variant="outline"
                className="h-12 px-6 border-2 border-gray-300 font-semibold"
              >
                Simpan Draft
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StepItem({
  number,
  label,
  sublabel,
  status,
  isLast,
}: {
  number: number;
  label: string;
  sublabel: string;
  status: "completed" | "current" | "pending";
  isLast: boolean;
}) {
  const getStyles = () => {
    switch (status) {
      case "completed":
        return {
          circle: "bg-green-500 border-green-500",
          text: "text-gray-900",
          icon: <CheckCircle2 className="w-5 h-5 text-white" />,
        };
      case "current":
        return {
          circle: "bg-[#0F4C81] border-[#0F4C81]",
          text: "text-[#0F4C81] font-semibold",
          icon: <span className="text-white font-bold">{number}</span>,
        };
      default:
        return {
          circle: "bg-white border-gray-300",
          text: "text-gray-400",
          icon: <span className="text-gray-400 font-bold">{number}</span>,
        };
    }
  };

  const styles = getStyles();

  return (
    <div className="flex items-center flex-1">
      <div className="flex flex-col items-center">
        <div
          className={`w-12 h-12 rounded-full border-2 flex items-center justify-center ${styles.circle} mb-3`}
        >
          {styles.icon}
        </div>
        <div className="text-center">
          <p className={`font-semibold text-sm ${styles.text}`}>{label}</p>
          <p className="text-xs text-gray-500">{sublabel}</p>
        </div>
      </div>
      {!isLast && (
        <div
          className={`flex-1 h-0.5 mx-4 ${
            status === "completed" ? "bg-green-500" : "bg-gray-300"
          }`}
        />
      )}
    </div>
  );
}

function ScoreCard({
  title,
  score,
  weight,
  icon,
  color,
}: {
  title: string;
  score: number;
  weight: string;
  icon: React.ReactNode;
  color: string;
}) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
    teal: "bg-teal-50 text-teal-600",
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-600 text-sm">{title}</h3>
        <div className={`p-2 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
          {icon}
        </div>
      </div>
      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-4xl font-bold text-gray-900">{score}</span>
        <span className="text-gray-500">/100</span>
      </div>
      <p className="text-sm text-gray-500">Bobot: {weight}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const statusConfig = {
    "in-progress": {
      label: "Sedang Berlangsung",
      icon: <Clock className="w-4 h-4" />,
      bg: "bg-yellow-50",
      text: "text-yellow-700",
      border: "border-yellow-200",
    },
    "pending-review": {
      label: "Menunggu Review",
      icon: <AlertCircle className="w-4 h-4" />,
      bg: "bg-blue-50",
      text: "text-blue-700",
      border: "border-blue-200",
    },
    approved: {
      label: "Disetujui",
      icon: <CheckCircle2 className="w-4 h-4" />,
      bg: "bg-green-50",
      text: "text-green-700",
      border: "border-green-200",
    },
  };

  const config = statusConfig[status as keyof typeof statusConfig];

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${config.bg} ${config.text} ${config.border}`}
    >
      {config.icon}
      <span className="text-sm font-medium">{config.label}</span>
    </div>
  );
}

function CalculationRow({
  label,
  score,
  weight,
  result,
}: {
  label: string;
  score: number;
  weight: number;
  result: number;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-600">
        {label} ({score} × {weight})
      </span>
      <span className="font-semibold text-gray-900">{result.toFixed(1)}</span>
    </div>
  );
}

function BarVisual({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm font-bold text-gray-900">{value}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className={`${color} h-3 rounded-full transition-all duration-500`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}