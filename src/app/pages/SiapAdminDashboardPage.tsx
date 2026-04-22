import { useState } from "react";
import { Link } from "react-router";
import {
  FileText,
  Search,
  Eye,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { SimpleSelect } from "../components/SimpleSelect";
import { useData } from "../context/DataContext";



export function SiapAdminDashboardPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [specialtyFilter, setSpecialtyFilter] = useState("all");
  const { submissions } = useData();

  const filteredSubmissions = submissions.filter((submission) => {
    const matchesSearch =
      submission.hospitalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Improved status matching logic
    let matchesStatus = false;
    const subStatus = submission.status?.toLowerCase() || "";
    
    if (statusFilter === "all") {
      matchesStatus = true;
    } else if (statusFilter === "pending") {
      matchesStatus = subStatus.includes("pending");
    } else if (statusFilter === "approved") {
      matchesStatus = subStatus.includes("approved");
    } else if (statusFilter === "rejected") {
      matchesStatus = subStatus.includes("reject") || subStatus.includes("revision");
    }

    // Specialty matching logic (BULLETPROOF)
    let matchesSpecialty = false;
    const subSpecialty = submission.specialty?.toLowerCase() || ""; // Safely fallback if undefined
    
    if (specialtyFilter === "all") {
      matchesSpecialty = true;
    } else {
      // Use .includes() to catch variations like "cardiology " or " Cardiology"
      matchesSpecialty = subSpecialty.includes(specialtyFilter.toLowerCase());
    }
      
    return matchesSearch && matchesStatus && matchesSpecialty;
  });
  
  const stats = {
    total: submissions.length,
    pending: submissions.filter(s => s.status?.toLowerCase() === "pending").length,
    approved: submissions.filter(s => s.status?.toLowerCase() === "approved").length,
    revision: submissions.filter(s => s.status?.toLowerCase() === "rejected" || s.status?.toLowerCase() === "revision required").length,
    averageScore: submissions.length > 0
      ? submissions.reduce((acc, s) => acc + ((s.scores?.final as number) || 0), 0) / submissions.length
      : 0,
  };

  const dynamicScoreDistribution = [
    { range: "90-100 — Tier 1: Platinum", count: submissions.filter(s => ((s.scores?.final as number) || 0) >= 90).length, color: "bg-purple-500" },
    { range: "80-89 — Tier 2: Outstanding", count: submissions.filter(s => ((s.scores?.final as number) || 0) >= 80 && ((s.scores?.final as number) || 0) < 90).length, color: "bg-blue-500" },
    { range: "70-79 — Tier 3: Excellent", count: submissions.filter(s => ((s.scores?.final as number) || 0) >= 70 && ((s.scores?.final as number) || 0) < 80).length, color: "bg-emerald-500" },
    { range: "60-69 — Tier 4: Commendable", count: submissions.filter(s => ((s.scores?.final as number) || 0) >= 60 && ((s.scores?.final as number) || 0) < 70).length, color: "bg-amber-500" },
    { range: "0-59 — Tier 5: Developing", count: submissions.filter(s => ((s.scores?.final as number) || 0) < 60).length, color: "bg-slate-500" },
  ];

  const dynamicStatusDistribution = [
    { name: "Pending", value: stats.pending, color: "#F59E0B" },
    { name: "Approved", value: stats.approved, color: "#10B981" },
    { name: "Revision Required", value: stats.revision, color: "#EF4444" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Admin Review Dashboard
          </h1>
          <p className="text-gray-600">
            Kelola dan review submission NHR PERSI Assessment dari rumah sakit
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-10">
          <StatCard
            title="Total Submissions"
            value={stats.total}
            icon={<FileText className="w-8 h-8" />}
            gradient="from-blue-600 to-blue-400"
            label="Berkas Masuk"
          />
          <StatCard
            title="Pending Review"
            value={stats.pending}
            icon={<Clock className="w-8 h-8" />}
            gradient="from-amber-500 to-orange-400"
            label="Menunggu"
          />
          <StatCard
            title="Approved"
            value={stats.approved}
            icon={<CheckCircle2 className="w-8 h-8" />}
            gradient="from-emerald-600 to-green-400"
            label="Disetujui"
          />
          <StatCard
            title="Revision Required"
            value={stats.revision}
            icon={<AlertCircle className="w-8 h-8" />}
            gradient="from-rose-600 to-red-400"
            label="Revisi"
          />
          <StatCard
            title="Average Score"
            value={stats.averageScore}
            icon={<TrendingUp className="w-8 h-8" />}
            gradient="from-violet-600 to-purple-400"
            label="Rata-rata"
            isDecimal
          />
        </div>



        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Score Distribution */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              Distribusi Skor
            </h3>
            <div className="space-y-4">
              {dynamicScoreDistribution.map((item) => (
                <div key={item.range}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{item.range}</span>
                    <span className="text-sm font-bold text-gray-900">{item.count} RS</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`${item.color} h-3 rounded-full transition-all duration-500`}
                      style={{ width: stats.total > 0 && item.count > 0 ? `${(item.count / stats.total) * 100}%` : "0%" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Status Distribution */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              Status Submission
            </h3>
            <div className="space-y-4">
              {dynamicStatusDistribution.map((item) => (
                <div key={item.name} className="flex items-center gap-4">
                  <div
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{item.name}</span>
                      <span className="text-sm font-bold text-gray-900">{item.value}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-500"
                        style={{
                          backgroundColor: item.color,
                          width: stats.total > 0 && item.value > 0 ? `${(item.value / stats.total) * 100}%` : "0%",
                          opacity: item.value > 0 ? 1 : 0.3,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Cari berdasarkan nama RS..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-11 h-11"
              />
            </div>
            <SimpleSelect
              value={statusFilter}
              onChange={setStatusFilter}
              placeholder="Filter Status"
              options={[
                { value: "all", label: "Semua Status" },
                { value: "pending", label: "Pending Review" },
                { value: "approved", label: "Approved" },
                { value: "rejected", label: "Revision Required/Rejected" },
              ]}
            />
            <SimpleSelect
              value={specialtyFilter}
              onChange={setSpecialtyFilter}
              placeholder="Filter Specialty"
              options={[
                { value: "all", label: "Semua Specialty" },
                { value: "kardiologi", label: "Kardiologi" },
                { value: "onkologi", label: "Onkologi" },
                { value: "neurologi", label: "Neurologi" },
              ]}
            />
          </div>
        </div>

        {/* Submissions Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Submission ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Nama Rumah Sakit
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Specialty
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Tanggal Submit
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Final Score
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredSubmissions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                          <FileText className="w-10 h-10 text-gray-300" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-500 text-lg mb-1">Belum ada submission</p>
                          <p className="text-sm text-gray-400 max-w-md">
                            Submission dari rumah sakit akan muncul di sini setelah mereka menyelesaikan dan mengirimkan NHR PERSI Assessment.
                          </p>
                        </div>
                        <div className="flex items-center gap-2 mt-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                          <span className="text-sm text-blue-700 font-medium">Platform siap menerima submission</span>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredSubmissions.map((submission) => (
                    <tr key={submission.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-mono text-sm text-gray-900">{submission.id}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-gray-900">{submission.hospitalName}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600">{submission.specialty}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600">
                          {new Date(submission.submittedDate).toLocaleDateString("id-ID")}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-lg font-bold text-[#0F4C81]">{((submission.scores?.final as number) || 0).toFixed(1)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={submission.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link to={`/siap-persi/admin/review/${submission.id}`}>
                          <Button size="sm" className="bg-[#0F4C81] hover:bg-[#0d3d66]">
                            <Eye className="w-4 h-4 mr-2" />
                            Review
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  gradient,
  label,
  isDecimal,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  gradient: string;
  label: string;
  isDecimal?: boolean;
}) {
  return (
    <div className="group bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
      {/* Background Accent */}
      <div className={`absolute -right-4 -top-4 w-24 h-24 bg-gradient-to-br ${gradient} opacity-[0.03] rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700`} />

      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className={`p-3 rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-lg group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">{label}</p>
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-tight">{title}</h3>
        </div>
      </div>
      <p className="text-4xl font-black text-gray-900 tracking-tight leading-none relative z-10">
        {isDecimal ? value.toFixed(1) : value}
      </p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const statusConfig = {
    pending: {
      label: "Pending Review",
      color: "bg-amber-50 text-amber-700 border-amber-100",
      dot: "bg-amber-500",
      icon: <Clock className="w-3.5 h-3.5" />,
    },
    approved: {
      label: "Disetujui",
      color: "bg-emerald-50 text-emerald-700 border-emerald-100",
      dot: "bg-emerald-500",
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    },
    revision: {
      label: "Butuh Revisi",
      color: "bg-rose-50 text-rose-700 border-rose-100",
      dot: "bg-rose-500",
      icon: <AlertCircle className="w-3.5 h-3.5" />,
    },
  };

  const normalizedStatus = status.toLowerCase();
  const config =
    normalizedStatus.includes("pending") ? statusConfig.pending :
      normalizedStatus.includes("approved") ? statusConfig.approved :
        normalizedStatus.includes("revision") ? statusConfig.revision :
          statusConfig.pending;

  return (
    <div className={`inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border text-xs font-black uppercase tracking-widest ${config.color} shadow-sm`}>
      <span className={`w-2 h-2 rounded-full ${config.dot} animate-pulse`} />
      <span>{config.label}</span>
      <div className="ml-1 opacity-50">{config.icon}</div>
    </div>
  );
}