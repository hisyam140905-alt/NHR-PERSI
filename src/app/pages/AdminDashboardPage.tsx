import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router";
import {
  Shield,
  Users,
  Newspaper,
  Calendar,
  Plus,
  Trash2,
  Building2,
  CheckCircle2,
  X,
  BarChart3,
  Eye,
  Clock,
  FileText,
  UserCheck,
  XCircle,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useData } from "../context/DataContext";
import { ImageDropzone } from "../components/ImageDropzone";

type Tab = "overview" | "accounts" | "news" | "events";

export function AdminDashboardPage() {
  const {
    isAdmin,
    news,
    addNews,
    deleteNews,
    events,
    addEvent,
    deleteEvent,
    approvedRankings,
    fetchAllHospitals, // <-- 1. ADD THIS: Pulling our new function from context
  } = useData();

  const [activeTab, setActiveTab] = useState<Tab>("overview");

  // ---------------------------------------------------------
  // 2. ADD THIS: The Database Fetching Engine
  // ---------------------------------------------------------
  const [realAccounts, setRealAccounts] = useState<any[]>([]);

  const loadHospitals = useCallback(async () => {
    const data = await fetchAllHospitals();
    setRealAccounts(data);
  }, [fetchAllHospitals]);

  useEffect(() => {
    loadHospitals();
  }, [loadHospitals]);
  // ---------------------------------------------------------
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-[700] text-gray-900 mb-2">
            Akses Ditolak
          </h2>
          <p className="text-gray-500 mb-4">
            Anda harus login sebagai admin untuk mengakses halaman ini.
          </p>
          <Link to="/admin/login">
            <Button className="bg-[#1E3A8A] hover:bg-[#1a3278]">
              Login Admin
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "overview", label: "Overview", icon: <BarChart3 className="w-4 h-4" /> },
    { key: "accounts", label: "Akun RS", icon: <Users className="w-4 h-4" /> },
    { key: "news", label: "Kelola Berita", icon: <Newspaper className="w-4 h-4" /> },
    { key: "events", label: "Kelola Events", icon: <Calendar className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-[700] text-gray-900 mb-1">
              Admin Dashboard
            </h1>
            <p className="text-gray-500">
              Pusat Kendali NHR PERSI
            </p>
          </div>
          <Link to="/siap-persi/admin/dashboard">
            <Button className="bg-[#0D9488] hover:bg-[#0b7f75] font-[600]">
              <Eye className="w-4 h-4 mr-2" />
              Review Submissions
            </Button>
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-white rounded-xl border border-gray-200 p-1 mb-8 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-shrink-0 whitespace-nowrap flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-[500] transition-colors ${activeTab === tab.key
                ? "bg-[#1E3A8A] text-white"
                : "text-gray-600 hover:bg-gray-50"
                }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === "overview" && (
          <OverviewTab
            stats={{
              totalRS: realAccounts.length,
              rankings: approvedRankings.length,
              newsCount: news.length,
              eventsCount: events.length,
            }}
          />
        )}
        {activeTab === "accounts" && (
          <AccountsTab accounts={realAccounts}
            refreshAccounts={loadHospitals} />
        )}
        {activeTab === "news" && (
          <NewsTab news={news} onAdd={addNews} onDelete={deleteNews} />
        )}
        {activeTab === "events" && (
          <EventsTab
            events={events}
            onAdd={addEvent}
            onDelete={deleteEvent}
          />
        )}
      </div>
    </div>
  );
}

function OverviewTab({
  stats,
}: {
  stats: {
    totalRS: number;
    rankings: number;
    newsCount: number;
    eventsCount: number;
  };
}) {
  return (
    <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
      <StatCard
        title="RS Terdaftar"
        value={stats.totalRS}
        icon={<Building2 className="w-5 h-5" />}
        color="blue"
      />
      <StatCard
        title="Di Ranking"
        value={stats.rankings}
        icon={<BarChart3 className="w-5 h-5" />}
        color="amber"
      />
      <StatCard
        title="Berita"
        value={stats.newsCount}
        icon={<Newspaper className="w-5 h-5" />}
        color="purple"
      />
      <StatCard
        title="Events"
        value={stats.eventsCount}
        icon={<Calendar className="w-5 h-5" />}
        color="green"
      />
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}) {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600",
    amber: "bg-amber-50 text-amber-600",
    purple: "bg-purple-50 text-purple-600",
    green: "bg-green-50 text-green-600",
  };
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-gray-500">{title}</span>
        <div className={`p-2 rounded-lg ${colorMap[color]}`}>{icon}</div>
      </div>
      <div className="text-3xl font-[700] text-gray-900">{value}</div>
    </div>
  );
}

// Notice we are passing a new `refreshAccounts` function so the table can update after you click approve!
function AccountsTab({
  accounts,
  refreshAccounts,
}: {
  accounts: Array<any>;
  refreshAccounts: () => void;
}) {
  // 1. Swap the old local functions for our new Real Database functions
  const { approveHospital, rejectHospitalDB } = useData();

  const [viewPdfUrl, setViewPdfUrl] = useState<string | null>(null);
  const [viewPdfName, setViewPdfName] = useState("");

  // 2. FIX: Change "pending_activation" to exactly "pending" to match the Turso Database!
  const pendingCount = accounts.filter(a => a.status === "pending").length;
  const activatedCount = accounts.filter(a => a.status === "activated").length;
  const rejectedCount = accounts.filter(a => a.status === "rejected").length;

  const statusLabel = (status: string) => {
    // 3. FIX: Match the "pending" string here as well
    if (status === "pending") return { text: "Menunggu Aktivasi", cls: "bg-amber-100 text-amber-700", icon: <Clock className="w-3 h-3" /> };
    if (status === "activated") return { text: "Aktif", cls: "bg-green-100 text-green-700", icon: <CheckCircle2 className="w-3 h-3" /> };
    if (status === "rejected") return { text: "Ditolak", cls: "bg-red-100 text-red-700", icon: <XCircle className="w-3 h-3" /> };
    return { text: status, cls: "bg-gray-100 text-gray-700", icon: null };
  };

  // --- BULLETPROOF PDF CONVERTER ---
  const createPdfBlobUrl = (base64Data: string) => {
    try {
      let base64WithoutPrefix = base64Data.includes(',')
        ? base64Data.split(',')[1]
        : base64Data;

      // THE FIX: Scrub out any invisible line breaks or spaces from the database
      base64WithoutPrefix = base64WithoutPrefix.replace(/\s/g, '');

      const byteCharacters = atob(base64WithoutPrefix);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);

      const blob = new Blob([byteArray], { type: 'application/pdf' });
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error("🔥 FATAL ERROR CONVERTING PDF:", error);
      return null;
    }
  };

  return (
    <div>
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
          <Clock className="w-6 h-6 text-amber-600 mx-auto mb-1" />
          <p className="text-2xl font-[700] text-amber-700">{pendingCount}</p>
          <p className="text-xs text-amber-600">Menunggu Aktivasi</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
          <CheckCircle2 className="w-6 h-6 text-green-600 mx-auto mb-1" />
          <p className="text-2xl font-[700] text-green-700">{activatedCount}</p>
          <p className="text-xs text-green-600">Aktif</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
          <XCircle className="w-6 h-6 text-red-500 mx-auto mb-1" />
          <p className="text-2xl font-[700] text-red-600">{rejectedCount}</p>
          <p className="text-xs text-red-500">Ditolak</p>
        </div>
      </div>

      {/* FIXED HTML: Added the missing Table wrappers! */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-[600] text-gray-500 uppercase">Rumah Sakit</th>
                <th className="px-5 py-3 text-left text-xs font-[600] text-gray-500 uppercase">PIC</th>
                <th className="px-5 py-3 text-left text-xs font-[600] text-gray-500 uppercase">Email</th>
                <th className="px-5 py-3 text-left text-xs font-[600] text-gray-500 uppercase">Status</th>
                <th className="px-5 py-3 text-left text-xs font-[600] text-gray-500 uppercase">Surat Tugas</th>
                <th className="px-5 py-3 text-left text-xs font-[600] text-gray-500 uppercase">Terdaftar</th>
                <th className="px-5 py-3 text-right text-xs font-[600] text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {accounts.map((acc) => {
                const st = statusLabel(acc.status);
                return (
                  <tr key={acc.id || acc.email} className="hover:bg-gray-50">
                    <td className="px-5 py-3 text-sm font-[600] text-gray-900">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-gray-400" />
                        {acc.hospitalName || acc.hospital_name}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-700">{acc.picName || acc.pic_name}</td>
                    <td className="px-5 py-3 text-sm text-gray-600">{acc.email}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-[600] ${st.cls}`}>
                        {st.icon} {st.text}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {acc.suratTugasFileName || acc.surat_tugas_filename ? (
                        <button
                          onClick={() => {
                            const rawData = acc.suratTugasData || acc.surat_tugas_data;
                            if (rawData) {
                              const safeBlobUrl = createPdfBlobUrl(rawData);
                              setViewPdfUrl(safeBlobUrl);
                              setViewPdfName(acc.suratTugasFileName || acc.surat_tugas_filename || "Surat Tugas.pdf");
                            } else {
                              alert("Data PDF tidak ditemukan");
                            }
                          }}
                          className="inline-flex items-center gap-1.5 text-xs font-[600] text-[#1E3A8A] hover:underline"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          Lihat PDF
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Tidak ada</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-500 text-xs">
                      {new Date(acc.created_at || acc.registeredAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {acc.status === "pending" && (
                          <>
                            <button
                              onClick={async () => {
                                const success = await approveHospital(acc.id);
                                if (success) {
                                  refreshAccounts();
                                } else {
                                  alert("Gagal mengaktivasi rumah sakit. Cek koneksi server.");
                                }
                              }}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-xs font-[600] rounded-lg hover:bg-green-700 transition-colors"
                              title="Aktivasi Akun"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                              Aktivasi
                            </button>

                            <button
                              onClick={async () => {
                                if (window.confirm("Apakah Anda yakin ingin menolak akun ini?")) {
                                  const success = await rejectHospitalDB(acc.id);
                                  if (success) {
                                    refreshAccounts();
                                  } else {
                                    alert("Gagal menolak rumah sakit. Cek koneksi server.");
                                  }
                                }
                              }}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-500 text-white text-xs font-[600] rounded-lg hover:bg-red-600 transition-colors"
                              title="Tolak Akun"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              Tolak
                            </button>
                          </>
                        )}

                        {acc.status === "activated" && (
                          <span className="text-xs text-green-600 font-[600]">Sudah aktif</span>
                        )}

                        {acc.status === "rejected" && (
                          <button
                            onClick={async () => {
                              const success = await approveHospital(acc.id);
                              if (success) refreshAccounts();
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-xs font-[600] rounded-lg hover:bg-green-700 transition-colors"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            Aktivasi Ulang
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {accounts.length === 0 && (
          <div className="py-10 text-center text-gray-400">
            Belum ada akun rumah sakit terdaftar
          </div>
        )}
      </div>

      {/* PDF Viewer Modal */}
      {viewPdfUrl && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          onClick={() => {
            if (viewPdfUrl) URL.revokeObjectURL(viewPdfUrl);
            setViewPdfUrl(null);
          }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-[#1E3A8A]" />
                <div>
                  <h3 className="font-[700] text-gray-900">Surat Tugas</h3>
                  <p className="text-xs text-gray-500">{viewPdfName}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* FALLBACK DOWNLOAD BUTTON */}
                <a
                  href={viewPdfUrl || "#"}
                  download={viewPdfName || "Surat-Tugas.pdf"}
                  className="px-4 py-1.5 bg-blue-50 text-[#1E3A8A] text-sm font-[600] rounded-lg hover:bg-blue-100 transition-colors"
                >
                  Download PDF
                </a>

                <button onClick={() => {
                  if (viewPdfUrl) URL.revokeObjectURL(viewPdfUrl);
                  setViewPdfUrl(null);
                }} className="p-2 rounded-full hover:bg-gray-100">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
            <div className="flex-1 p-2">
              <iframe
                src={viewPdfUrl}
                className="w-full h-full rounded-lg border border-gray-200"
                title="Surat Tugas PDF"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
function NewsTab({
  news,
  onAdd,
  onDelete,
}: {
  news: Array<{
    id: string;
    title: string;
    category: string;
    publishedAt: string;
    author: string;
  }>;
  onAdd: (item: any) => void;
  onDelete: (id: string) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    excerpt: "",
    content: "",
    category: "berita" as const,
    imageUrl: "",
    author: "Tim Redaksi PERSI",
    publishedAt: new Date().toISOString().split("T")[0],
    featured: false,
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      ...form,
      imageUrl:
        form.imageUrl ||
        "https://images.unsplash.com/photo-1687677347190-58c4ebf93bf6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    });
    setForm({
      title: "",
      excerpt: "",
      content: "",
      category: "berita",
      imageUrl: "",
      author: "Tim Redaksi PERSI",
      publishedAt: new Date().toISOString().split("T")[0],
      featured: false,
    });
    setShowForm(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-[700] text-gray-900">Kelola Berita</h3>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-[#1E3A8A] hover:bg-[#1a3278] font-[600]"
        >
          <Plus className="w-4 h-4 mr-2" />
          Tambah Berita
        </Button>
      </div>

      {showForm && (
        <form
          onSubmit={handleAdd}
          className="bg-white rounded-xl border border-gray-200 p-5 mb-4 space-y-4"
        >
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-[600]">Judul *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Judul berita"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm font-[600]">Kategori</Label>
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value as any })
                  }
                  className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm"
                >
                  <option value="berita">Berita</option>
                  <option value="publikasi">Publikasi</option>
                  <option value="regulasi">Regulasi</option>
                  <option value="inovasi">Inovasi</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-[600]">Tanggal</Label>
                <Input
                  type="date"
                  value={form.publishedAt}
                  onChange={(e) =>
                    setForm({ ...form, publishedAt: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-[600]">Ringkasan *</Label>
            <Input
              value={form.excerpt}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              placeholder="Ringkasan singkat berita"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-[600]">Konten *</Label>
            <textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="Isi lengkap berita..."
              className="w-full h-32 px-3 py-2 rounded-lg border border-gray-200 text-sm resize-none"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-[600]">Gambar Cover (opsional)</Label>
            <ImageDropzone onImageChange={(base64) => setForm({ ...form, imageUrl: base64 || "" })} />
          </div>
          <div className="flex gap-3">
            <Button
              type="submit"
              className="bg-[#0D9488] hover:bg-[#0b7f75] font-[600]"
            >
              Simpan Berita
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowForm(false)}
            >
              Batal
            </Button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-[600] text-gray-500 uppercase">
                  Judul
                </th>
                <th className="px-5 py-3 text-left text-xs font-[600] text-gray-500 uppercase">
                  Kategori
                </th>
                <th className="px-5 py-3 text-left text-xs font-[600] text-gray-500 uppercase">
                  Penulis
                </th>
                <th className="px-5 py-3 text-left text-xs font-[600] text-gray-500 uppercase">
                  Tanggal
                </th>
                <th className="px-5 py-3 text-right text-xs font-[600] text-gray-500 uppercase">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {news.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 text-sm font-[500] text-gray-900 max-w-[300px] truncate">
                    {item.title}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`text-xs font-[600] px-2 py-0.5 rounded uppercase ${item.category === "berita"
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
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-500">
                    {item.author}
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-500">
                    {item.publishedAt}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => onDelete(item.id)}
                      className="text-red-500 hover:text-red-700 p-1.5 rounded hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function EventsTab({
  events,
  onAdd,
  onDelete,
}: {
  events: Array<{
    id: string;
    title: string;
    type: string;
    date: string;
    location: string;
  }>;
  onAdd: (item: any) => void;
  onDelete: (id: string) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    endDate: "",
    location: "",
    type: "seminar" as const,
    imageUrl: "",
    registrationUrl: "#",
    featured: false,
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      ...form,
      imageUrl:
        form.imageUrl ||
        "https://images.unsplash.com/photo-1627560985113-ab67e8031f40?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    });
    setForm({
      title: "",
      description: "",
      date: "",
      endDate: "",
      location: "",
      type: "seminar",
      imageUrl: "",
      registrationUrl: "#",
      featured: false,
    });
    setShowForm(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-[700] text-gray-900">Kelola Events</h3>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-[#1E3A8A] hover:bg-[#1a3278] font-[600]"
        >
          <Plus className="w-4 h-4 mr-2" />
          Tambah Event
        </Button>
      </div>

      {showForm && (
        <form
          onSubmit={handleAdd}
          className="bg-white rounded-xl border border-gray-200 p-5 mb-4 space-y-4"
        >
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-[600]">Judul Event *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Nama event"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-[600]">Tipe</Label>
              <select
                value={form.type}
                onChange={(e) =>
                  setForm({ ...form, type: e.target.value as any })
                }
                className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm"
              >
                <option value="seminar">Seminar</option>
                <option value="workshop">Workshop</option>
                <option value="congress">Congress</option>
                <option value="webinar">Webinar</option>
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-[600]">Deskripsi *</Label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Deskripsi event..."
              className="w-full h-24 px-3 py-2 rounded-lg border border-gray-200 text-sm resize-none"
              required
            />
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-[600]">Tanggal Mulai *</Label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-[600]">
                Tanggal Selesai (opsional)
              </Label>
              <Input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-[600]">Lokasi *</Label>
              <Input
                value={form.location}
                onChange={(e) =>
                  setForm({ ...form, location: e.target.value })
                }
                placeholder="Jakarta / Online"
                required
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-[600]">Gambar Cover (opsional)</Label>
            <ImageDropzone onImageChange={(base64) => setForm({ ...form, imageUrl: base64 || "" })} />
          </div>
          <div className="flex gap-3">
            <Button
              type="submit"
              className="bg-[#0D9488] hover:bg-[#0b7f75] font-[600]"
            >
              Simpan Event
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowForm(false)}
            >
              Batal
            </Button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-[600] text-gray-500 uppercase">
                  Judul
                </th>
                <th className="px-5 py-3 text-left text-xs font-[600] text-gray-500 uppercase">
                  Tipe
                </th>
                <th className="px-5 py-3 text-left text-xs font-[600] text-gray-500 uppercase">
                  Tanggal
                </th>
                <th className="px-5 py-3 text-left text-xs font-[600] text-gray-500 uppercase">
                  Lokasi
                </th>
                <th className="px-5 py-3 text-right text-xs font-[600] text-gray-500 uppercase">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {events.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 text-sm font-[500] text-gray-900 max-w-[300px] truncate">
                    {item.title}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`text-xs font-[600] px-2 py-0.5 rounded ${item.type === "congress"
                        ? "bg-[#1E3A8A] text-white"
                        : item.type === "workshop"
                          ? "bg-[#0D9488] text-white"
                          : item.type === "seminar"
                            ? "bg-[#D97706] text-white"
                            : "bg-purple-600 text-white"
                        }`}
                    >
                      {item.type}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-500">
                    {item.date}
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-500">
                    {item.location}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => onDelete(item.id)}
                      className="text-red-500 hover:text-red-700 p-1.5 rounded hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}