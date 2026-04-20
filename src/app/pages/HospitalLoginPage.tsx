import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Building2,
  User,
  Lock,
  Mail,
  Shield,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  UserPlus,
  LogIn,
  FileText,
  Upload,
  Clock,
  MapPin,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useData } from "../context/DataContext";

const MAX_FILE_SIZE_MB = 2;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export function HospitalLoginPage() {
  const navigate = useNavigate();
  const { loginHospital, registerHospitalFull, currentHospital } = useData();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Login form
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register form
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [regHospitalName, setRegHospitalName] = useState("");
  const [regPicName, setRegPicName] = useState("");
  const [suratTugasFile, setSuratTugasFile] = useState<File | null>(null);
  const [suratTugasError, setSuratTugasError] = useState("");

  // Province & city state
  const [regProvince, setRegProvince] = useState("");
  const [regCity, setRegCity] = useState("");
  const [provinceQuery, setProvinceQuery] = useState("");
  const [cityQuery, setCityQuery] = useState("");
  const [showProvinceDropdown, setShowProvinceDropdown] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [provinces, setProvinces] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);

  // Load provinces
  useEffect(() => {
    import("../data/indonesiaRegions").then((mod) => {
      setProvinces(mod.getAllProvinces());
    });
  }, []);

  // Load cities when province changes
  useEffect(() => {
    if (regProvince) {
      import("../data/indonesiaRegions").then((mod) => {
        setCities(mod.getCitiesForProvince(regProvince));
      });
      setRegCity("");
      setCityQuery("");
    } else {
      setCities([]);
    }
  }, [regProvince]);

  const filteredProvinces = provinces.filter((p) =>
    p.toLowerCase().includes(provinceQuery.toLowerCase())
  );

  const filteredCities = cities.filter((c) =>
    c.toLowerCase().includes(cityQuery.toLowerCase())
  );

  // Redirect if already logged in
  useEffect(() => {
    if (currentHospital) navigate("/submit");
  }, [currentHospital, navigate]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setSuratTugasError("");
    if (!file) return;
    if (file.type !== "application/pdf") {
      setSuratTugasError("Hanya file PDF yang diperbolehkan.");
      return;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setSuratTugasError(
        `Ukuran file maksimal ${MAX_FILE_SIZE_MB}MB. File Anda: ${(file.size / 1024 / 1024).toFixed(1)}MB`
      );
      return;
    }
    setSuratTugasFile(file);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    await new Promise(resolve => setTimeout(resolve, 800));

    const result = await loginHospital(loginEmail, loginPassword);
    if (result.success) {
      sessionStorage.setItem("hospitalAuth", JSON.stringify({
        authenticated: true,
      }));
      navigate("/submit");
    } else {
      setError(result.error || "Email atau password salah.");
    }
    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!regHospitalName.trim()) { setError("Nama rumah sakit wajib diisi."); return; }
    if (regPassword.length < 6) { setError("Password minimal 6 karakter."); return; }
    if (regPassword !== regConfirmPassword) { setError("Konfirmasi password tidak cocok."); return; }
    if (!regPicName.trim()) { setError("Nama penanggung jawab wajib diisi."); return; }
    if (!regProvince) { setError("Provinsi wajib dipilih."); return; }
    if (!regCity) { setError("Kota/Kabupaten wajib dipilih."); return; }
    if (!suratTugasFile) { setError("Surat tugas (PDF) wajib diunggah."); return; }

    setLoading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result as string;
      const ok = await registerHospitalFull(
        regEmail, regPassword, regHospitalName.trim(), regPicName,
        suratTugasFile.name, base64Data, regProvince, regCity
      );
      if (ok) {
        setSuccess(`Registrasi berhasil untuk ${regHospitalName.trim()}! Akun Anda akan diaktivasi oleh admin PERSI.`);
        setMode("login");
        setLoginEmail(regEmail);
        setRegEmail(""); setRegPassword(""); setRegConfirmPassword("");
        setRegHospitalName(""); setRegPicName(""); setSuratTugasFile(null);
        setRegProvince(""); setRegCity(""); setProvinceQuery(""); setCityQuery("");
      } else {
        setError("Registrasi gagal. Email mungkin sudah terdaftar, atau file terlalu besar untuk sistem.");
      }
      setLoading(false);
    };
    reader.onerror = () => { setError("Gagal membaca file. Coba lagi."); setLoading(false); };
    reader.readAsDataURL(suratTugasFile);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1E3A8A] via-[#1E3A8A] to-[#0D9488] flex items-center justify-center p-6">
      <div className="max-w-5xl w-full grid lg:grid-cols-2 gap-8 items-center">

        {/* Left Side - Info */}
        <div className="text-white space-y-8 hidden lg:block">
          <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-5 py-2.5 border border-white/20">
            <Shield className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm font-[500]">Portal Rumah Sakit</span>
          </div>
          <div>
            <h1 className="text-4xl font-[700] mb-4 leading-tight">
              Selamat Datang di<br />
              <span className="text-[#0D9488]">NHR PERSI Portal</span>
            </h1>
            <p className="text-lg text-white/80 leading-relaxed">
              Portal khusus bagi rumah sakit anggota PERSI untuk mengikuti assessment dan masuk ke ranking nasional.
            </p>
          </div>
          <div className="space-y-3">
            <InfoItem icon={<Building2 className="w-4 h-4" />} title="Registrasi Terbuka" description="Rumah sakit dapat mendaftar langsung dengan mengisi data dan mengunggah surat tugas" />
            <InfoItem icon={<FileText className="w-4 h-4" />} title="Upload Surat Tugas" description="Surat tugas PIC wajib diunggah saat registrasi (PDF, maks 2MB)" />
            <InfoItem icon={<Clock className="w-4 h-4" />} title="Aktivasi oleh Admin" description="Setelah mendaftar, akun harus diaktifkan oleh admin PERSI sebelum bisa login" />
            <InfoItem icon={<CheckCircle2 className="w-4 h-4" />} title="Assessment Terstruktur" description="Isi data RSBK, Clinical Audit, dan Patient Report per pelayanan" />
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
            <p className="text-sm text-white/70">
              <strong className="text-white">Butuh bantuan?</strong> Hubungi admin PERSI di{" "}
              <a href="mailto:persi@persi.or.id" className="text-[#0D9488] hover:underline">persi@persi.or.id</a>
            </p>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Tabs */}
          <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
            <button
              onClick={() => { setMode("login"); setError(""); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-[600] transition-colors ${mode === "login" ? "bg-white text-[#1E3A8A] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
            >
              <LogIn className="w-4 h-4" />Login
            </button>
            <button
              onClick={() => { setMode("register"); setError(""); setSuccess(""); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-[600] transition-colors ${mode === "register" ? "bg-white text-[#1E3A8A] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
            >
              <UserPlus className="w-4 h-4" />Daftar
            </button>
          </div>

          {success && (
            <div className="flex items-start gap-2 text-sm text-green-700 bg-green-50 border border-green-200 p-3 rounded-lg mb-4">
              <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}
          {error && (
            <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-200 p-3 rounded-lg mb-4">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* ===== LOGIN FORM ===== */}
          {mode === "login" && (
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="mb-6">
                <h2 className="text-2xl font-[700] text-gray-900 mb-1">Login Portal RS</h2>
                <p className="text-sm text-gray-500">Masuk dengan akun rumah sakit yang sudah diaktivasi</p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-[600] text-gray-700">Email Rumah Sakit</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="admin@rumahsakit.co.id" className="pl-10 h-11" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-[600] text-gray-700">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="Masukkan password" className="pl-10 h-11" required />
                </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full h-11 bg-[#1E3A8A] hover:bg-[#1a3278] font-[600]">
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Memverifikasi...
                  </div>
                ) : (
                  <span className="flex items-center gap-2">Login <ArrowRight className="w-4 h-4" /></span>
                )}
              </Button>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
                <div className="flex items-start gap-2">
                  <Clock className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-600" />
                  <span>Baru mendaftar? Akun harus diaktivasi oleh admin PERSI terlebih dahulu sebelum bisa login.</span>
                </div>
              </div>

              <p className="text-center text-sm text-gray-500">
                Belum punya akun?{" "}
                <button type="button" onClick={() => { setMode("register"); setError(""); }} className="text-[#1E3A8A] font-[600] hover:underline">
                  Daftar di sini
                </button>
              </p>
            </form>
          )}

          {/* ===== REGISTER FORM ===== */}
          {mode === "register" && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="mb-4">
                <h2 className="text-2xl font-[700] text-gray-900 mb-1">Daftar Akun RS</h2>
                <p className="text-sm text-gray-500">Isi data rumah sakit dan unggah surat tugas PIC</p>
              </div>

              {/* Hospital Name */}
              <div className="space-y-2">
                <Label className="text-sm font-[600] text-gray-700">Nama Rumah Sakit *</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input type="text" value={regHospitalName} onChange={(e) => setRegHospitalName(e.target.value)} placeholder="RS Harapan Sehat" className="pl-10 h-11" required />
                </div>
              </div>

              {/* Province + City - Searchable Dropdowns */}
              <div className="grid grid-cols-2 gap-3">
                {/* Province */}
                <div className="space-y-2 relative">
                  <Label className="text-sm font-[600] text-gray-700">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />Provinsi *</span>
                  </Label>
                  <div className="relative">
                    <input
                      type="text"
                      value={regProvince || provinceQuery}
                      onChange={(e) => {
                        setProvinceQuery(e.target.value);
                        if (regProvince) setRegProvince("");
                        setShowProvinceDropdown(true);
                      }}
                      onFocus={() => setShowProvinceDropdown(true)}
                      onBlur={() => setTimeout(() => setShowProvinceDropdown(false), 150)}
                      placeholder="Cari provinsi..."
                      className="w-full h-11 px-3 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/30 focus:border-[#1E3A8A] bg-white"
                      autoComplete="off"
                    />
                    {showProvinceDropdown && filteredProvinces.length > 0 && (
                      <ul className="absolute z-50 w-full bg-white border border-gray-200 rounded-lg shadow-xl max-h-52 overflow-y-auto top-full mt-1">
                        {filteredProvinces.map((prov) => (
                          <li
                            key={prov}
                            onMouseDown={() => {
                              setRegProvince(prov);
                              setProvinceQuery("");
                              setShowProvinceDropdown(false);
                            }}
                            className={`px-3 py-2 text-sm cursor-pointer transition-colors ${regProvince === prov
                                ? "bg-blue-50 text-[#1E3A8A] font-[600]"
                                : "text-gray-700 hover:bg-gray-50"
                              }`}
                          >
                            {prov}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                {/* City */}
                <div className="space-y-2 relative">
                  <Label className="text-sm font-[600] text-gray-700">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />Kota/Kabupaten *</span>
                  </Label>
                  <div className="relative">
                    <input
                      type="text"
                      value={regCity || cityQuery}
                      onChange={(e) => {
                        setCityQuery(e.target.value);
                        if (regCity) setRegCity("");
                        setShowCityDropdown(true);
                      }}
                      onFocus={() => { if (regProvince) setShowCityDropdown(true); }}
                      onBlur={() => setTimeout(() => setShowCityDropdown(false), 150)}
                      placeholder={regProvince ? "Cari kota..." : "Pilih provinsi dulu"}
                      disabled={!regProvince}
                      className="w-full h-11 px-3 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/30 focus:border-[#1E3A8A] disabled:bg-gray-50 disabled:text-gray-400 bg-white"
                      autoComplete="off"
                    />
                    {showCityDropdown && filteredCities.length > 0 && (
                      <ul className="absolute z-50 w-full bg-white border border-gray-200 rounded-lg shadow-xl max-h-52 overflow-y-auto top-full mt-1">
                        {filteredCities.map((city) => (
                          <li
                            key={city}
                            onMouseDown={() => {
                              setRegCity(city);
                              setCityQuery("");
                              setShowCityDropdown(false);
                            }}
                            className={`px-3 py-2 text-sm cursor-pointer transition-colors ${regCity === city
                                ? "bg-blue-50 text-[#1E3A8A] font-[600]"
                                : "text-gray-700 hover:bg-gray-50"
                              }`}
                          >
                            {city}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label className="text-sm font-[600] text-gray-700">Email Rumah Sakit *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input type="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} placeholder="admin@rumahsakit.co.id" className="pl-10 h-11" required />
                </div>
              </div>

              {/* PIC */}
              <div className="space-y-2">
                <Label className="text-sm font-[600] text-gray-700">Nama Penanggung Jawab (PIC) *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input type="text" value={regPicName} onChange={(e) => setRegPicName(e.target.value)} placeholder="Dr. Ahmad Sudrajat, Sp.PD" className="pl-10 h-11" required />
                </div>
              </div>

              {/* Password */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-sm font-[600] text-gray-700">Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input type="password" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} placeholder="Min. 6 karakter" className="pl-10 h-11" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-[600] text-gray-700">Konfirmasi *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input type="password" value={regConfirmPassword} onChange={(e) => setRegConfirmPassword(e.target.value)} placeholder="Ulangi password" className="pl-10 h-11" required />
                  </div>
                </div>
              </div>

              {/* PDF Upload */}
              <div className="space-y-2">
                <Label className="text-sm font-[600] text-gray-700">Upload Surat Tugas (PDF) *</Label>
                <div className={`border-2 border-dashed rounded-xl p-4 text-center transition-colors ${suratTugasFile ? "border-green-400 bg-green-50" : "border-gray-300 hover:border-[#1E3A8A] hover:bg-blue-50"}`}>
                  {suratTugasFile ? (
                    <div className="flex items-center gap-3 justify-center">
                      <FileText className="w-8 h-8 text-green-600" />
                      <div className="text-left">
                        <p className="text-sm font-[600] text-gray-900">{suratTugasFile.name}</p>
                        <p className="text-xs text-gray-500">{(suratTugasFile.size / 1024).toFixed(0)} KB</p>
                      </div>
                      <button type="button" onClick={() => setSuratTugasFile(null)} className="text-red-500 text-xs font-[600] hover:underline ml-2">Hapus</button>
                    </div>
                  ) : (
                    <label className="cursor-pointer block">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">
                        <span className="text-[#1E3A8A] font-[600]">Klik untuk upload</span> atau drag & drop
                      </p>
                      <p className="text-xs text-gray-400 mt-1">Format: PDF | Maksimal: {MAX_FILE_SIZE_MB}MB</p>
                      <input type="file" accept=".pdf,application/pdf" onChange={handleFileChange} className="hidden" />
                    </label>
                  )}
                </div>
                {suratTugasError && <p className="text-xs text-red-600">{suratTugasError}</p>}
              </div>

              <Button type="submit" disabled={loading} className="w-full h-11 bg-[#0D9488] hover:bg-[#0b7f75] font-[600]">
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Mendaftarkan...
                  </div>
                ) : (
                  <span className="flex items-center gap-2">Daftar <UserPlus className="w-4 h-4" /></span>
                )}
              </Button>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
                Setelah mendaftar, admin PERSI akan mereview surat tugas Anda dan mengaktivasi akun. Proses ini membutuhkan waktu 1-2 hari kerja.
              </div>

              <p className="text-center text-sm text-gray-500">
                Sudah punya akun?{" "}
                <button type="button" onClick={() => { setMode("login"); setError(""); }} className="text-[#1E3A8A] font-[600] hover:underline">
                  Login di sini
                </button>
              </p>
            </form>
          )}

          {/* Mobile info */}
          <div className="lg:hidden mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>Butuh bantuan?</strong> Hubungi admin PERSI di{" "}
              <a href="mailto:persi@persi.or.id" className="text-[#1E3A8A] font-[600]">persi@persi.or.id</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex items-start gap-3 bg-white/5 rounded-lg p-3 border border-white/10">
      <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0 text-white/80">{icon}</div>
      <div>
        <h4 className="font-[600] text-white text-sm">{title}</h4>
        <p className="text-xs text-white/60">{description}</p>
      </div>
    </div>
  );
}
