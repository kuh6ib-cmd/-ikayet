import React, { useState } from "react";
import {
  Table,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ArrowUpDown,
  Car,
  AlertCircle,
  Clock,
  Building,
  Wrench,
  CheckCircle2,
  DollarSign,
  Search,
  MessageSquareWarning,
} from "lucide-react";
import { ComplaintItem } from "../types";

interface ComplaintsTableProps {
  complaints: ComplaintItem[];
  onSelectComplaint: (item: ComplaintItem) => void;
  onDiagnoseComplaint: (item: ComplaintItem) => void;
}

export const ComplaintsTable: React.FC<ComplaintsTableProps> = ({
  complaints,
  onSelectComplaint,
  onDiagnoseComplaint,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortField, setSortField] = useState<string>("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const sortedComplaints = [...complaints].sort((a, b) => {
    let aVal: any = (a as any)[sortField];
    let bVal: any = (b as any)[sortField];

    if (sortField === "invoicedCost") {
      aVal = a.financials?.invoicedCost || 0;
      bVal = b.financials?.invoicedCost || 0;
    } else if (sortField === "difference") {
      aVal = a.financials?.difference || 0;
      bVal = b.financials?.difference || 0;
    }

    if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
    if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sortedComplaints.length / pageSize) || 1;
  const paginatedComplaints = sortedComplaints.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
      {/* Tablo Üst Kontrolleri */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <Table className="w-4 h-4 text-indigo-600" />
            <span>Tüm Şikayet ve Servis Dosyaları</span>
          </h2>
          <p className="text-xs text-slate-400">
            Filtrelenen toplam <strong className="text-slate-800 font-semibold">{complaints.length}</strong> dosya listeleniyor
          </p>
        </div>

        {/* Sayfalama ve Boyut Kontrolü */}
        <div className="flex items-center gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-1.5">
            <span>Göster:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs font-semibold text-slate-800"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>

          <span className="text-slate-500">
            Sayfa <strong className="text-slate-800 font-bold">{currentPage}</strong> / {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-30 hover:bg-slate-50 transition cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-30 hover:bg-slate-50 transition cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tablo Gövdesi */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            <tr className="border-b border-slate-200">
              <th className="pb-3 pt-2">Kayıt & Tarih</th>
              <th className="pb-3 pt-2">Bildiren Firma (Filo)</th>
              <th className="pb-3 pt-2 cursor-pointer select-none" onClick={() => handleSort("brand")}>
                <div className="flex items-center gap-1">
                  <span>Araç / Model / Plaka</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="pb-3 pt-2">K (Ana Başlık) & L (Konu)</th>
              <th className="pb-3 pt-2">Şikayetçi Olunan Servis</th>
              <th className="pb-3 pt-2 cursor-pointer select-none" onClick={() => handleSort("km")}>
                <div className="flex items-center gap-1">
                  <span>KM</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="pb-3 pt-2 text-right cursor-pointer select-none" onClick={() => handleSort("invoicedCost")}>
                <div className="flex items-center justify-end gap-1">
                  <span>Fatura Tutarı</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="pb-3 pt-2 text-right cursor-pointer select-none" onClick={() => handleSort("difference")}>
                <div className="flex items-center justify-end gap-1">
                  <span>Geri Ödenen Tutar</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="pb-3 pt-2 text-center cursor-pointer select-none" onClick={() => handleSort("chronicRiskScore")}>
                <div className="flex items-center justify-center gap-1">
                  <span>Risk</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="pb-3 pt-2 text-right">İşlem</th>
            </tr>
          </thead>
          <tbody className="text-xs text-slate-700 divide-y divide-slate-100">
            {paginatedComplaints.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50 transition">
                {/* Kayıt No & Tarih */}
                <td className="py-4">
                  <span className="font-bold text-slate-900 block">{item.recordNumber}</span>
                  <span className="text-slate-400 text-[11px] font-mono">{item.date}</span>
                </td>

                {/* Bildiren Firma (Filo) */}
                <td className="py-4">
                  <div className="flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span className="font-bold text-indigo-950">
                      {item.reportedByCompany || item.fleetCompany || "Özmal / Filo"}
                    </span>
                  </div>
                </td>

                {/* Araç */}
                <td className="py-4">
                  <div className="font-bold text-slate-900 text-sm">
                    {item.brand} {item.model}
                  </div>
                  <div className="text-xs text-slate-500 font-medium mt-0.5 font-mono">
                    {item.plate} • {item.engineType} ({item.modelYear})
                  </div>
                </td>

                {/* K Sütunu (Ana Başlık) & L Sütunu (Konu) */}
                <td className="py-4 max-w-xs">
                  <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                    {item.faultCategory === "Servis İletişimi, Bilgilendirme & Müşteri Hizmetleri" ||
                    item.mainHeader?.includes("İletişim") ||
                    item.mainHeader?.includes("Bilgilendirme") ? (
                      <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-300 shadow-2xs">
                        <MessageSquareWarning className="w-3 h-3 text-amber-600 shrink-0" />
                        <span>{item.mainHeader && !item.mainHeader.startsWith("SRV-") ? item.mainHeader : item.faultCategory}</span>
                      </span>
                    ) : (
                      <span className="inline-block rounded px-2 py-0.5 text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {item.mainHeader && !item.mainHeader.startsWith("SRV-") ? item.mainHeader : item.faultCategory}
                      </span>
                    )}
                  </div>
                  <div className="font-semibold text-slate-800 text-xs">
                    {item.subTopic || item.complaintReason || item.complaintSubject}
                  </div>
                </td>

                {/* Şikayetçi Olunan Servis */}
                <td className="py-4">
                  <div className="flex items-center gap-1">
                    <Wrench className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-semibold text-slate-800">
                      {item.complainedService || item.serviceName}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 ml-4.5">{item.serviceCity}</div>
                </td>

                {/* KM */}
                <td className="py-4 font-mono font-medium text-slate-900">
                  <div>{item.km.toLocaleString("tr-TR")} KM</div>
                  <span className="text-[10px] text-slate-400">{item.kmRange}</span>
                </td>

                {/* Fatura Tutarı */}
                <td className="py-4 text-right font-mono font-bold text-slate-900 text-sm">
                  {item.financials?.invoicedCost.toLocaleString("tr-TR")} ₺
                </td>

                {/* Sapma */}
                <td className="py-4 text-right font-mono text-sm">
                  {item.financials?.difference && item.financials.difference > 0 ? (
                    <span className="text-rose-600 font-bold">
                      +{item.financials.difference.toLocaleString("tr-TR")} ₺
                    </span>
                  ) : (
                    <span className="text-slate-400 font-medium">0 ₺</span>
                  )}
                </td>

                {/* Risk Seviyesi */}
                <td className="py-4">
                  <div className="flex flex-col items-center justify-center gap-1">
                    <div className="flex h-2 w-16 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          item.chronicRiskScore >= 80
                            ? "bg-rose-500"
                            : item.chronicRiskScore >= 60
                            ? "bg-amber-500"
                            : "bg-indigo-500"
                        }`}
                        style={{ width: `${item.chronicRiskScore}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-slate-600">%{item.chronicRiskScore}</span>
                  </div>
                </td>

                {/* İşlem */}
                <td className="py-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => onSelectComplaint(item)}
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition cursor-pointer"
                    >
                      Detay
                    </button>
                    <button
                      onClick={() => onDiagnoseComplaint(item)}
                      className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition flex items-center gap-1 cursor-pointer shadow-2xs"
                    >
                      <Sparkles className="w-3 h-3 text-yellow-300" />
                      <span>Teşhis</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
