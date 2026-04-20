import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { Users, Building2, Stethoscope, ChevronRight, Save, Target, BedDouble, DoorOpen } from "lucide-react";
import { Button } from "../components/ui/button";
import { specialtyAuditData, RsbkItem } from "../data/specialtyAuditData";
import { SpecialtyProgressTracker } from "../components/SpecialtyProgressTracker";
import { draftManager } from "../utils/draftManager";

export function RsbkFormPage() {
  const { specialty } = useParams<{ specialty: string }>();
  const navigate = useNavigate();
  const specialtyInfo = specialtyAuditData[specialty as keyof typeof specialtyAuditData];

  const [formData, setFormData] = useState<Record<string, number | null>>({});

  useEffect(() => {
    const draftId = draftManager.getCurrentDraftId();
    if (draftId && specialty) {
      const draft = draftManager.getDraftById(draftId);
      if (draft && draft.progress[specialty]?.rsbk?.data) {
        const raw = draft.progress[specialty].rsbk.data;
        const converted: Record<string, number | null> = {};
        Object.entries(raw).forEach(([k, v]) => {
          if (v === null || v === undefined || v === "") {
            converted[k] = null;
          } else {
            converted[k] = typeof v === "number" ? v : parseInt(v as string);
            if (isNaN(converted[k] as number)) converted[k] = null;
          }
        });
        setFormData(converted);
      }
    }
  }, [specialty]);

  const handleChange = (id: string, value: number | null) => {
    setFormData({ ...formData, [id]: value });
  };

  const rsbkItems = specialtyInfo.rsbkItems;
  const sdmItems = rsbkItems.filter(i => i.category === "sdm");
  const saranaItems = rsbkItems.filter(i => i.category === "sarana");
  const alatItems = rsbkItems.filter(i => i.category === "alat");
  const sarprasItems = [...saranaItems, ...alatItems];

  const groupBySubCategory = (items: RsbkItem[]) => {
    const groups: Record<string, RsbkItem[]> = {};
    items.forEach(item => {
      const key = item.subCategory || "Umum";
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });
    return groups;
  };

  const sdmGroups = groupBySubCategory(sdmItems);
  const saranaGroups = groupBySubCategory(saranaItems);

  const totalItems = rsbkItems.length;
  const filledItems = rsbkItems.filter(item => formData[item.id] !== null && formData[item.id] !== undefined).length;
  const progress = totalItems > 0 ? (filledItems / totalItems) * 100 : 0;

  // === SCORING: SDM (50 poin) + Sarpras (50 poin) = 100 ===
  const getActual = (id: string) => {
    const v = formData[id];
    return (v !== null && v !== undefined) ? v : 0;
  };

  // Points = min(actual, target) × pointPerUnit
  const calcPoints = (items: RsbkItem[]) =>
    items.reduce((sum, item) => sum + Math.min(getActual(item.id), item.target) * item.pointPerUnit, 0);
  const calcTargetPoints = (items: RsbkItem[]) =>
    items.reduce((sum, item) => sum + item.target * item.pointPerUnit, 0);

  const sdmPoints = calcPoints(sdmItems);
  const sdmTargetPoints = calcTargetPoints(sdmItems);
  const sarprasPoints = calcPoints(sarprasItems);
  const sarprasTargetPoints = calcTargetPoints(sarprasItems);

  // Bed points & room points (for display)
  const bedItems = saranaItems.filter(i => i.pointPerUnit === 1);
  const roomItems = saranaItems.filter(i => i.pointPerUnit === 5);
  const bedPoints = calcPoints(bedItems);
  const bedTargetPoints = calcTargetPoints(bedItems);
  const roomPoints = calcPoints(roomItems);
  const roomTargetPoints = calcTargetPoints(roomItems);
  const alatPoints = calcPoints(alatItems);
  const alatTargetPoints = calcTargetPoints(alatItems);

  const sdmSubScore = sdmTargetPoints > 0 ? Number(((sdmPoints / sdmTargetPoints) * 50).toFixed(1)) : 0;
  const sarprasSubScore = sarprasTargetPoints > 0 ? Number(((sarprasPoints / sarprasTargetPoints) * 50).toFixed(1)) : 0;
  const totalRsbkScore = Number((sdmSubScore + sarprasSubScore).toFixed(1));

  const handleSaveDraft = () => {
    const draftId = draftManager.getCurrentDraftId();
    if (!draftId || !specialty) return;
    draftManager.updateDraft(draftId, specialty, "rsbk", {
      data: formData,
      score: totalRsbkScore,
      completed: filledItems === totalItems,
    });
    alert("Draft berhasil disimpan!");
  };

  const handleSubmit = () => {
    const draftId = draftManager.getCurrentDraftId();
    if (!draftId || !specialty) return;
    draftManager.updateDraft(draftId, specialty, "rsbk", {
      data: formData,
      score: totalRsbkScore,
      completed: true,
    });
    sessionStorage.setItem(`${specialty}_rsbkScore`, totalRsbkScore.toString());
    sessionStorage.setItem("currentSpecialty", specialty || "");
    navigate(`/siap-persi/clinical-audit/${specialty}`);
  };

  const handleIsiNanti = () => {
    const draftId = draftManager.getCurrentDraftId();
    if (!draftId || !specialty) return;

    // Save current progress, but strictly tell the system it is NOT done
    draftManager.updateDraft(draftId, specialty, "rsbk", {
      data: formData,
      score: totalRsbkScore,
      completed: false, // <--- This guarantees no checkmark!
    });

    // Now teleport them to the next page
    navigate(`/siap-persi/clinical-audit/${specialty}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <SpecialtyProgressTracker currentSpecialty={specialty || ""} currentStage="rsbk" />

        {/* Header */}
        <div className="mb-6">
          <Link to="/siap-persi/select-specialty" className="inline-flex items-center text-[#0F4C81] hover:underline mb-4">
            &larr; Kembali ke Pilih Pelayanan
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Hospital Structure Form - {specialtyInfo.name}</h1>
              <p className="text-gray-600">Rumah Sakit Berstandar Kemampuan — Input SDM, Kapasitas Bed, Ruangan & Alat Medis</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 px-6 py-4 text-center min-w-[160px]">
              <p className="text-sm text-gray-600 mb-1">Hospital Structure Score</p>
              <p className="text-4xl font-bold text-[#0F4C81]">{totalRsbkScore}</p>
              <p className="text-xs text-gray-500 mt-1">dari 100</p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-gray-700">Progress Pengisian</span>
            <span className="text-sm text-gray-600">{filledItems} / {totalItems} item ({progress.toFixed(0)}%)</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div className="bg-gradient-to-r from-[#0F4C81] to-[#14B8A6] h-3 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
          <h3 className="font-bold text-gray-900 mb-2">Panduan Pengisian RSBK</h3>
          <p className="text-sm text-[#0F4C81] font-semibold mb-3">
            {specialtyInfo.name} — SDM Target: {sdmTargetPoints} poin (maks 50) | Sarpras Target: {sarprasTargetPoints} poin (maks 50)
          </p>
          <div className="space-y-2 text-sm text-gray-700">
            <p>&bull; Klik tombol <strong>+</strong> untuk mulai mengisi (dimulai dari 0). Setiap dokter = 1 poin, setiap bed = 1 poin, setiap ruangan = <strong>5 poin</strong></p>
            <p>&bull; <strong>Hospital Structure Score</strong> = Sub-Skor SDM (maks 50) + Sub-Skor Sarpras (maks 50) = <strong>0–100</strong></p>
            <p>&bull; Nilai RSBK dikalikan bobot <strong>15%</strong> untuk peringkat nasional</p>
          </div>
        </div>

        {/* Section 1: SDM */}
        <FormSection title="Tenaga Medis (SDM)" icon={<Users className="w-6 h-6" />} color="blue"
          subtitle={`${sdmItems.length} item | Poin: ${sdmPoints} / ${sdmTargetPoints} | Sub-Skor: ${sdmSubScore}/50`}>
          {Object.entries(sdmGroups).map(([group, items]) => (
            <div key={group} className="mb-6 last:mb-0">
              <h4 className="text-sm font-semibold text-blue-700 bg-blue-50 px-4 py-2 rounded-lg mb-3">{group}</h4>
              <div className="space-y-3">
                {items.map((item) => (
                  <QuantityInput key={item.id} item={item} value={formData[item.id] ?? 0} onChange={handleChange} />
                ))}
              </div>
            </div>
          ))}
        </FormSection>

        {/* Section 2: Sarana & Prasarana (Bed + Ruangan + Alat) */}
        <FormSection title="Sarana & Prasarana" icon={<Building2 className="w-6 h-6" />} color="teal"
          subtitle={`Poin: ${sarprasPoints} / ${sarprasTargetPoints} | Sub-Skor: ${sarprasSubScore}/50`}>

          {/* Kapasitas Bed */}
          {saranaGroups["Kapasitas Bed"] && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <BedDouble className="w-5 h-5 text-teal-600" />
                <h4 className="text-sm font-semibold text-teal-700 bg-teal-50 px-4 py-2 rounded-lg flex-1">
                  Kapasitas Bed <span className="text-gray-500 font-normal ml-2">(1 bed = 1 poin) — {bedPoints}/{bedTargetPoints} poin</span>
                </h4>
              </div>
              <div className="space-y-3">
                {saranaGroups["Kapasitas Bed"].map((item) => (
                  <QuantityInput key={item.id} item={item} value={formData[item.id] ?? 0} onChange={handleChange} />
                ))}
              </div>
            </div>
          )}

          {/* Ruangan Khusus */}
          {saranaGroups["Ruangan Khusus"] && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <DoorOpen className="w-5 h-5 text-indigo-600" />
                <h4 className="text-sm font-semibold text-indigo-700 bg-indigo-50 px-4 py-2 rounded-lg flex-1">
                  Ruangan Khusus <span className="text-gray-500 font-normal ml-2">(1 ruangan = 5 poin) — {roomPoints}/{roomTargetPoints} poin</span>
                </h4>
              </div>
              <div className="space-y-3">
                {saranaGroups["Ruangan Khusus"].map((item) => (
                  <QuantityInput key={item.id} item={item} value={formData[item.id] ?? 0} onChange={handleChange} />
                ))}
              </div>
            </div>
          )}

          {/* Alat Medis */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Stethoscope className="w-5 h-5 text-purple-600" />
              <h4 className="text-sm font-semibold text-purple-700 bg-purple-50 px-4 py-2 rounded-lg flex-1">
                Alat Medis <span className="text-gray-500 font-normal ml-2">(1 unit = 1 poin) — {alatPoints}/{alatTargetPoints} poin</span>
              </h4>
            </div>
            <div className="space-y-3">
              {alatItems.map((item) => (
                <QuantityInput key={item.id} item={item} value={formData[item.id] ?? 0} onChange={handleChange} />
              ))}
            </div>
          </div>
        </FormSection>

        {/* Summary */}
        <div className="bg-white rounded-xl border-2 border-[#0F4C81] p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Ringkasan Hospital Structure Score</h3>



          <div className="overflow-x-auto mb-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-[#0F4C81]">
                  <th className="text-left py-3 px-4 font-bold text-[#0F4C81]">Komponen</th>
                  <th className="text-center py-3 px-4 font-bold text-[#0F4C81]">Poin</th>
                  <th className="text-center py-3 px-4 font-bold text-[#0F4C81]">Target</th>
                  <th className="text-center py-3 px-4 font-bold text-[#0F4C81]">Bobot</th>
                  <th className="text-center py-3 px-4 font-bold text-[#0F4C81]">Sub-Skor</th>
                </tr>
              </thead>
              <tbody>
                {/* SDM Row */}
                <tr className="border-b-2 border-blue-200 bg-blue-50/60">
                  <td className="py-3 px-4 font-bold text-blue-900">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span>
                      SDM — Tenaga Medis
                    </div>
                    <div className="mt-1 w-full bg-blue-200 rounded-full h-1.5">
                      <div className="bg-blue-500 h-1.5 rounded-full transition-all" style={{ width: `${sdmTargetPoints > 0 ? Math.min((sdmPoints / sdmTargetPoints) * 100, 100) : 0}%` }} />
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-blue-700">{sdmPoints}</td>
                  <td className="py-3 px-4 text-center text-gray-600">{sdmTargetPoints}</td>
                  <td className="py-3 px-4 text-center text-gray-500 font-medium">× 50</td>
                  <td className="py-3 px-4 text-center font-bold text-blue-700 text-lg">{sdmSubScore}</td>
                </tr>
                {/* Sarpras: Bed Row */}
                <tr className="border-b border-gray-100 bg-teal-50/40">
                  <td className="py-2.5 px-4 text-gray-700 pl-8">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-400 inline-block"></span>
                      Kapasitas Bed <span className="text-xs text-gray-400">(1 bed = 1 poin)</span>
                    </div>
                    <div className="mt-1 w-full bg-teal-100 rounded-full h-1">
                      <div className="bg-teal-500 h-1 rounded-full transition-all" style={{ width: `${bedTargetPoints > 0 ? Math.min((bedPoints / bedTargetPoints) * 100, 100) : 0}%` }} />
                    </div>
                  </td>
                  <td className="py-2.5 px-4 text-center font-semibold text-teal-700">{bedPoints}</td>
                  <td className="py-2.5 px-4 text-center text-gray-500">{bedTargetPoints}</td>
                  <td className="py-2.5 px-4 text-center text-gray-400 text-xs" rowSpan={3}>
                    <div className="flex flex-col items-center gap-1">
                      <span>× 50</span>
                      <span className="text-[10px] text-gray-400">(Sarpras)</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-4 text-center font-bold text-teal-700 text-lg" rowSpan={3}>{sarprasSubScore}</td>
                </tr>
                {/* Sarpras: Ruangan */}
                <tr className="border-b border-gray-100 bg-indigo-50/30">
                  <td className="py-2.5 px-4 text-gray-700 pl-8">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 inline-block"></span>
                      Ruangan Khusus <span className="text-xs text-gray-400">(1 ruangan = 5 poin)</span>
                    </div>
                    <div className="mt-1 w-full bg-indigo-100 rounded-full h-1">
                      <div className="bg-indigo-500 h-1 rounded-full transition-all" style={{ width: `${roomTargetPoints > 0 ? Math.min((roomPoints / roomTargetPoints) * 100, 100) : 0}%` }} />
                    </div>
                  </td>
                  <td className="py-2.5 px-4 text-center font-semibold text-indigo-700">{roomPoints}</td>
                  <td className="py-2.5 px-4 text-center text-gray-500">{roomTargetPoints}</td>
                </tr>
                {/* Sarpras: Alat */}
                <tr className="border-b border-gray-200 bg-purple-50/30">
                  <td className="py-2.5 px-4 text-gray-700 pl-8">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400 inline-block"></span>
                      Alat Medis <span className="text-xs text-gray-400">(1 unit = 1 poin)</span>
                    </div>
                    <div className="mt-1 w-full bg-purple-100 rounded-full h-1">
                      <div className="bg-purple-500 h-1 rounded-full transition-all" style={{ width: `${alatTargetPoints > 0 ? Math.min((alatPoints / alatTargetPoints) * 100, 100) : 0}%` }} />
                    </div>
                  </td>
                  <td className="py-2.5 px-4 text-center font-semibold text-purple-700">{alatPoints}</td>
                  <td className="py-2.5 px-4 text-center text-gray-500">{alatTargetPoints}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="bg-[#0F4C81]/10">
                  <td className="py-3 px-4 font-bold text-[#0F4C81] text-lg" colSpan={4}>Total Hospital Structure</td>
                  <td className="py-3 px-4 text-center font-bold text-[#0F4C81] text-2xl">{totalRsbkScore}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="bg-gradient-to-r from-[#0F4C81] to-[#14B8A6] rounded-xl p-5 text-white text-center">
            <p className="text-sm opacity-90 mb-1">Hospital Structure Score</p>
            <p className="text-4xl font-bold">{totalRsbkScore} <span className="text-lg font-normal opacity-80">/ 100</span></p>
            <p className="text-sm opacity-80 mt-1">SDM ({sdmPoints}/{sdmTargetPoints}): {sdmSubScore}/50 + Sarpras ({sarprasPoints}/{sarprasTargetPoints}): {sarprasSubScore}/50</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600 mt-4">
            <p><strong>Rumus:</strong> Hospital Structure Score = Sub-Skor SDM (maks 50) + Sub-Skor Sarpras (maks 50) = 0–100</p>
            <p className="mt-1">Sub-Skor SDM = (Poin SDM / Target SDM) × 50 | Sub-Skor Sarpras = (Total Bed + Ruangan×5 + Alat) / Target × 50</p>
            <p className="mt-1">Nilai akhir RSBK dikalikan bobot <strong>15%</strong> untuk peringkat nasional.</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-8">
          <Button onClick={handleSaveDraft} variant="outline" className="h-12 px-8 border-2 border-gray-300 font-semibold">
            <Save className="w-5 h-5 mr-2" /> Simpan Draft
          </Button>
          <Button onClick={handleIsiNanti} variant="outline"
            className="h-12 px-8 border-2 border-yellow-400 text-yellow-700 hover:bg-yellow-50 font-semibold">
            Isi Nanti (Lanjut ke Clinical Audit)
          </Button>
          <Button onClick={handleSubmit} className="flex-1 h-12 bg-[#0F4C81] hover:bg-[#0d3d66] font-semibold">
            Lanjut ke Clinical Audit <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </div>

        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-gray-700">
            <strong>Tips:</strong> Anda dapat mengklik <strong>"Isi Nanti"</strong> untuk melanjutkan ke bagian berikutnya, kemudian kembali melengkapi Hospital Structure Form sebelum submit final.
          </p>
        </div>
      </div>
    </div>
  );
}

function FormSection({ title, icon, color, subtitle, children }: {
  title: string; icon: React.ReactNode; color: string; subtitle?: string; children: React.ReactNode;
}) {
  const colorClasses: Record<string, string> = { blue: "bg-blue-50 text-blue-600", teal: "bg-teal-50 text-teal-600", purple: "bg-purple-50 text-purple-600" };
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-8 mb-6">
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-3 rounded-xl ${colorClasses[color]}`}>{icon}</div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
      </div>
      <div className="mt-6">{children}</div>
    </div>
  );
}

function QuantityInput({ item, value, onChange }: {
  item: RsbkItem; value: number | null; onChange: (id: string, value: number | null) => void;
}) {
  const isFilled = value !== null;
  const actualValue = value ?? 0;
  const achievement = isFilled ? Math.min(actualValue, item.target) / item.target : 0;
  const isMetTarget = isFilled && actualValue >= item.target;
  const unit = item.inputUnit || "unit";
  const pointsEarned = isFilled ? Math.min(actualValue, item.target) * item.pointPerUnit : 0;
  const targetPoints = item.target * item.pointPerUnit;

  const handleDecrement = () => {
    if (!isFilled) return;
    if (actualValue <= 0) onChange(item.id, null);
    else onChange(item.id, actualValue - 1);
  };
  const handleIncrement = () => {
    if (!isFilled) onChange(item.id, 0);
    else onChange(item.id, actualValue + 1);
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === "" || raw === "-") { onChange(item.id, null); return; }
    const parsed = parseInt(raw);
    if (!isNaN(parsed) && parsed >= 0) onChange(item.id, parsed);
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div className="flex-1">
        <label className="font-medium text-gray-900">{item.name}</label>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${isMetTarget ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"
            }`}>
            <Target className="w-3 h-3" />
            Target: {item.target} {unit}
          </span>
          {item.pointPerUnit > 1 && (
            <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-indigo-100 text-indigo-700">
              ×{item.pointPerUnit} poin
            </span>
          )}
          {isFilled && (
            <span className={`text-xs font-medium ${isMetTarget ? "text-green-600" : "text-orange-600"}`}>
              {pointsEarned}/{targetPoints} poin ({(achievement * 100).toFixed(0)}%)
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button type="button" onClick={handleDecrement}
          className="w-9 h-9 rounded-lg bg-gray-200 hover:bg-gray-300 flex items-center justify-center font-bold text-gray-700 transition-colors">-</button>
        <input type="text" value={isFilled ? actualValue : "-"} onChange={handleInputChange}
          className={`w-20 h-9 text-center border-2 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:border-[#0F4C81] ${isFilled ? "border-gray-300 text-gray-900" : "border-gray-300 text-gray-400"
            }`} />
        <button type="button" onClick={handleIncrement}
          className="w-9 h-9 rounded-lg bg-[#0F4C81] hover:bg-[#0d3d66] flex items-center justify-center font-bold text-white transition-colors">+</button>
        <span className="text-sm text-gray-500 w-16">{unit}</span>
      </div>
      {isMetTarget && (
        <div className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-semibold">&check; Target</div>
      )}
    </div>
  );
}
