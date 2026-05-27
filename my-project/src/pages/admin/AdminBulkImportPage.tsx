import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Upload,
  FileSpreadsheet,
  X,
  CheckCircle2,
  AlertCircle,
  Download,
  Loader2,
  Users,
  Trash2,
  ChevronRight,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import * as XLSX from "xlsx";

interface ParsedRow {
  rowIndex: number;
  name: string;
  email: string;
  role: string;
  password: string;
  phone?: string;
  department?: string;
  errors: string[];
  isValid: boolean;
}

interface ImportResult {
  successCount: number;
  failedCount: number;
  assignedCount: number;
  createdUsers: { id: string; name: string; email: string; role: string }[];
  failedRows: { row: number; field?: string; message: string }[];
}

// Download template
function downloadTemplate() {
  const headers = [
    "Họ và tên",
    "Email",
    "Vai trò",
    "Mật khẩu",
    "Điện thoại",
    "Khoa/Phòng",
  ];
  const sampleRows = [
    ["Nguyễn Văn An", "nguyenvanan@student.edu.vn", "sinh viên", "MatKhau123", "0901234567", "Khoa CNTT"],
    ["Trần Thị Bình", "tranbinh@student.edu.vn", "sinh viên", "MatKhau456", "0912345678", "Khoa Kinh tế"],
    ["PGS.TS Lê Hoàng C", "lehongc@edu.vn", "giảng viên", "MatKhau789", "0933456789", "Khoa CNTT"],
    ["Công ty ABC", "tuyendung@abc.com.vn", "doanh nghiệp", "MatKhauABC", "0281234567", "Nhân sự"],
  ];
  const data = [headers, ...sampleRows];
  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Mau_Import");
  XLSX.writeFile(wb, "mau_import_nguoi_dung.xlsx");
}

function validateRow(
  row: Record<string, any>,
  rowIndex: number,
  seenEmails: Set<string>,
): ParsedRow {
  const errors: string[] = [];
  const name =
    row["Họ và tên"] || row["name"] || row["Name"] || "";
  const email = String(
    row["Email"] || row["email"] || row["Email"] || "",
  )
    .trim()
    .toLowerCase();
  const roleRaw =
    row["Vai trò"] || row["role"] || row["Role"] || "";
  const password = String(
    row["Mật khẩu"] || row["password"] || row["Password"] || "",
  ).trim();
  const phone =
    row["Điện thoại"] || row["phone"] || row["Phone"] || "";
  const department =
    row["Khoa/Phòng"] ||
    row["department"] ||
    row["Department"] ||
    "";

  const roleMap: Record<string, string> = {
    "sinh viên": "student",
    sinh_viên: "student",
    student: "student",
    sv: "student",
    "giảng viên": "lecturer",
    giảng_viên: "lecturer",
    lecturer: "lecturer",
    gv: "lecturer",
    "doanh nghiệp": "company",
    doanh_nghiệp: "company",
    company: "company",
    dn: "company",
    admin: "admin",
  };
  const role = roleMap[String(roleRaw).trim().toLowerCase()] || "";
  const validRoles = ["student", "lecturer", "company", "admin"];
  const roleLabels: Record<string, string> = {
    student: "sinh viên",
    lecturer: "giảng viên",
    company: "doanh nghiệp",
    admin: "admin",
  };

  if (!name || String(name).trim().length < 2) {
    errors.push("Họ và tên bắt buộc, tối thiểu 2 ký tự");
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    errors.push("Email không hợp lệ");
  } else if (seenEmails.has(email)) {
    errors.push("Email bị trùng lặp trong file");
  } else {
    seenEmails.add(email);
  }
  if (!role || !validRoles.includes(role)) {
    errors.push(
      `Vai trò không hợp lệ. Chấp nhận: ${Object.keys(roleLabels).map((r) => roleLabels[r]).join(", ")}`,
    );
  }
  if (!password || password.length < 6) {
    errors.push("Mật khẩu bắt buộc, tối thiểu 6 ký tự");
  }

  return {
    rowIndex,
    name: String(name).trim(),
    email,
    role: role || "",
    password,
    phone: String(phone).trim() || undefined,
    department: String(department).trim() || undefined,
    errors,
    isValid: errors.length === 0,
  };
}

function parseFile(file: File): Promise<ParsedRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any;
        if (!json || json.length < 2) {
          reject(new Error("File không chứa dữ liệu hoặc thiếu dòng tiêu đề"));
          return;
        }
        const seenEmails = new Set<string>();
        const rows: ParsedRow[] = [];
        for (let i = 1; i < json.length; i++) {
          const raw = json[i];
          if (!raw || raw.every((c: any) => c === null || c === undefined || c === "")) {
            continue;
          }
          // Convert array row to object using headers from row 0
          const headers = json[0];
          const obj: Record<string, any> = {};
          for (let j = 0; j < headers.length; j++) {
            obj[headers[j]] = raw[j] ?? "";
          }
          rows.push(validateRow(obj, i + 1, seenEmails));
        }
        resolve(rows);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error("Không thể đọc file"));
    reader.readAsArrayBuffer(file);
  });
}

function RoleLabel({ role }: { role: string }) {
  const map: Record<string, { label: string; color: string }> = {
    student: { label: "Sinh viên", color: "bg-blue-100 text-blue-700" },
    lecturer: { label: "Giảng viên", color: "bg-emerald-100 text-emerald-700" },
    company: { label: "Doanh nghiệp", color: "bg-amber-100 text-amber-700" },
    admin: { label: "Admin", color: "bg-purple-100 text-purple-700" },
  };
  const info = map[role] || { label: role, color: "bg-slate-100 text-slate-600" };
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium", info.color)}>
      {info.label}
    </span>
  );
}

export function AdminBulkImportPage() {
  const { isAuthenticated } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [parseError, setParseError] = useState("");
  const [result, setResult] = useState<ImportResult | null>(null);

  const handleFileChange = useCallback(
    async (f: File) => {
      const ext = f.name.split(".").pop()?.toLowerCase();
      if (!["xlsx", "xls", "csv"].includes(ext || "")) {
        setParseError("Định dạng file không được hỗ trợ. Vui lòng dùng .xlsx, .xls, hoặc .csv");
        return;
      }
      setFile(f);
      setParseError("");
      setResult(null);
      setIsPreviewing(true);
      try {
        const rows = await parseFile(f);
        setParsedRows(rows);
      } catch (err: any) {
        setParseError(err.message || "Không thể đọc file. Vui lòng kiểm tra định dạng.");
        setParsedRows([]);
      } finally {
        setIsPreviewing(false);
      }
    },
    [],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const f = e.dataTransfer.files[0];
      if (f) handleFileChange(f);
    },
    [handleFileChange],
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => setIsDragging(false);

  const handleClear = () => {
    setFile(null);
    setParsedRows([]);
    setParseError("");
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleImport = async () => {
    const validRows = parsedRows.filter((r) => r.isValid);
    if (validRows.length === 0) return;
    setIsImporting(true);
    try {
      const users = validRows.map((r) => ({
        name: r.name,
        email: r.email,
        role: r.role,
        password: r.password,
        phone: r.phone,
        department: r.department,
      }));
      const data = await api.bulkImportUsers(users);
      setResult(data);
    } catch (err: any) {
      setParseError(err.message || "Import thất bại. Vui lòng thử lại.");
    } finally {
      setIsImporting(false);
    }
  };

  const validCount = parsedRows.filter((r) => r.isValid).length;
  const errorCount = parsedRows.filter((r) => !r.isValid).length;

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-slate-500">Vui lòng đăng nhập để sử dụng chức năng này.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Nhập người dùng hàng loạt</h1>
          <p className="text-slate-500 mt-1">
            Tải lên file Excel để tạo nhiều tài khoản cùng lúc cho sinh viên, giảng viên, doanh nghiệp
          </p>
        </div>
        <Button
          variant="outline"
          onClick={downloadTemplate}
          className="gap-2 border-indigo-200 text-indigo-600 hover:bg-indigo-50"
        >
          <Download className="h-4 w-4" />
          Tải file mẫu
        </Button>
      </div>

      {/* Instructions Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-100 rounded-xl p-5"
      >
        <h3 className="font-semibold text-indigo-900 mb-3 flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Hướng dẫn sử dụng
        </h3>
        <ol className="space-y-1.5 text-sm text-indigo-800 list-decimal list-inside">
          <li>Tải file mẫu Excel bên trên để đảm bảo đúng định dạng cột</li>
          <li>Điền thông tin vào file: <strong>Họ và tên</strong>, <strong>Email</strong>, <strong>Vai trò</strong>, <strong>Mật khẩu</strong> (tối thiểu 6 ký tự)</li>
          <li>Cột <strong>Vai trò</strong> chấp nhận: <code className="bg-indigo-100 px-1 rounded">sinh viên</code>, <code className="bg-indigo-100 px-1 rounded">giảng viên</code>, <code className="bg-indigo-100 px-1 rounded">doanh nghiệp</code>, <code className="bg-indigo-100 px-1 rounded">admin</code></li>
          <li>Kéo thả hoặc nhấn <strong>Chọn file</strong> để tải lên</li>
          <li>Kiểm tra danh sách preview, sửa các dòng bị lỗi (nếu có)</li>
          <li>Nhấn <strong>Nhập người dùng</strong> để hoàn tất</li>
          <li className="font-medium text-indigo-700 mt-2">
            <span className="text-emerald-600">★</span> <strong>Sinh viên import sẽ tự động được phân đều cho các giảng viên</strong> (mỗi sinh viên được phân cho 1 giảng viên)
          </li>
        </ol>
      </motion.div>

      {/* Upload Area */}
      {!result && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={cn(
            "relative border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-200 cursor-pointer",
            isDragging
              ? "border-indigo-400 bg-indigo-50"
              : parseError
              ? "border-red-300 bg-red-50/50"
              : "border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50",
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFileChange(f);
            }}
          />
          {isPreviewing ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
              <p className="text-slate-600 font-medium">Đang đọc file...</p>
            </div>
          ) : file ? (
            <div className="flex flex-col items-center gap-3">
              <div className="h-14 w-14 rounded-2xl bg-green-100 flex items-center justify-center">
                <FileSpreadsheet className="h-7 w-7 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">{file.name}</p>
                <p className="text-sm text-slate-500">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClear();
                  }}
                  className="text-slate-600"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" />
                  Xoá file
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="text-slate-600"
                >
                  Đổi file khác
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="h-14 w-14 rounded-2xl bg-indigo-100 flex items-center justify-center">
                <Upload className="h-7 w-7 text-indigo-500" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">
                  Kéo thả file Excel vào đây
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  hoặc{" "}
                  <span className="text-indigo-500 font-medium underline underline-offset-2 cursor-pointer">
                    chọn từ máy tính
                  </span>
                </p>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Hỗ trợ .xlsx, .xls, .csv — Tối đa 500 dòng mỗi lần
              </p>
            </div>
          )}
        </motion.div>
      )}

      {/* Parse Error */}
      {parseError && !isPreviewing && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {parseError}
        </div>
      )}

      {/* Preview Table */}
      {parsedRows.length > 0 && !result && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Summary */}
          <div className="flex items-center justify-between">
            <div className="flex gap-4">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-sm text-slate-600">
                  Hợp lệ: <strong className="text-green-600">{validCount}</strong>
                </span>
              </div>
              {errorCount > 0 && (
                <div className="flex items-center gap-1.5">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-slate-600">
                    Lỗi: <strong className="text-red-600">{errorCount}</strong>
                  </span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Users className="h-4 w-4 text-slate-400" />
                <span className="text-sm text-slate-600">
                  Tổng: <strong className="text-slate-900">{parsedRows.length}</strong>
                </span>
              </div>
            </div>
            <Button
              onClick={handleImport}
              disabled={validCount === 0 || isImporting}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 gap-2"
            >
              {isImporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Users className="h-4 w-4" />
              )}
              Nhập {validCount} người dùng
            </Button>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto max-h-96 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="text-left p-3 text-xs font-medium text-slate-500 uppercase w-12">#</th>
                    <th className="text-left p-3 text-xs font-medium text-slate-500 uppercase">Họ và tên</th>
                    <th className="text-left p-3 text-xs font-medium text-slate-500 uppercase">Email</th>
                    <th className="text-left p-3 text-xs font-medium text-slate-500 uppercase">Vai trò</th>
                    <th className="text-left p-3 text-xs font-medium text-slate-500 uppercase">Mật khẩu</th>
                    <th className="text-left p-3 text-xs font-medium text-slate-500 uppercase">Điện thoại</th>
                    <th className="text-left p-3 text-xs font-medium text-slate-500 uppercase">Khoa/Phòng</th>
                    <th className="text-left p-3 text-xs font-medium text-slate-500 uppercase w-48">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedRows.map((row, idx) => (
                    <tr
                      key={idx}
                      className={cn(
                        "border-b border-slate-50 last:border-0 transition-colors",
                        !row.isValid ? "bg-red-50/50 hover:bg-red-100/50" : "hover:bg-slate-50",
                      )}
                    >
                      <td className="p-3 text-slate-400 text-xs">{row.rowIndex}</td>
                      <td className="p-3 font-medium text-slate-900">{row.name || "—"}</td>
                      <td className="p-3 text-slate-600">{row.email || "—"}</td>
                      <td className="p-3">{row.role ? <RoleLabel role={row.role} /> : "—"}</td>
                      <td className="p-3 text-slate-600 font-mono text-xs">
                        {row.password ? "••••••" : "—"}
                      </td>
                      <td className="p-3 text-slate-600">{row.phone || "—"}</td>
                      <td className="p-3 text-slate-600">{row.department || "—"}</td>
                      <td className="p-3">
                        {row.isValid ? (
                          <span className="inline-flex items-center gap-1 text-green-600 text-xs font-medium">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Hợp lệ
                          </span>
                        ) : (
                          <div className="space-y-0.5">
                            {row.errors.map((err, ei) => (
                              <span
                                key={ei}
                                className="inline-flex items-start gap-1 text-red-600 text-xs"
                              >
                                <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" />
                                {err}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {/* Result */}
      {result && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-4"
        >
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="h-12 w-12 rounded-2xl bg-green-100 flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Kết quả nhập dữ liệu</h2>
                <p className="text-slate-500 text-sm mt-0.5">
                  {result.successCount > 0
                    ? `Đã tạo thành công ${result.successCount} tài khoản`
                    : "Không có tài khoản nào được tạo"}
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-green-50 rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-green-600">{result.successCount}</p>
                <p className="text-sm text-green-700 mt-1">Tài khoản mới</p>
              </div>
              <div className="bg-red-50 rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-red-600">{result.failedCount}</p>
                <p className="text-sm text-red-700 mt-1">Thất bại</p>
              </div>
              <div className="bg-emerald-50 rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-emerald-600">{result.assignedCount}</p>
                <p className="text-sm text-emerald-700 mt-1">Đã phân cho GV</p>
              </div>
            </div>

            {/* Assignment Info */}
            {result.assignedCount > 0 && (
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 mb-6 border border-emerald-100">
                <div className="flex items-center gap-2 text-emerald-800">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  <span className="font-medium">
                    {result.assignedCount} sinh viên đã được tự động phân đều cho các giảng viên
                  </span>
                </div>
                <p className="text-sm text-emerald-700 mt-2 ml-7">
                  Mỗi sinh viên được phân cho 1 giảng viên. Các giảng viên đã được thông báo.
                </p>
              </div>
            )}

            {result.assignedCount === 0 && result.successCount > 0 && (
              <div className="bg-amber-50 rounded-xl p-4 mb-6 border border-amber-100">
                <div className="flex items-center gap-2 text-amber-800">
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                  <span className="font-medium">
                    Chưa có sinh viên nào được phân cho giảng viên
                  </span>
                </div>
                <p className="text-sm text-amber-700 mt-2 ml-7">
                  Có thể chưa có tài khoản giảng viên trong hệ thống, hoặc tất cả sinh viên đã được phân công trước đó.
                </p>
              </div>
            )}

            {/* Created users */}
            {result.createdUsers.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-slate-700 mb-2">Tài khoản đã tạo:</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {result.createdUsers.map((u) => (
                    <div
                      key={u.id}
                      className="flex items-center gap-3 p-3 bg-green-50 rounded-lg"
                    >
                      <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 text-sm">{u.name}</p>
                        <p className="text-xs text-slate-500">{u.email}</p>
                      </div>
                      <RoleLabel role={u.role} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Failed rows */}
            {result.failedRows.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-red-700 mb-2">Dòng lỗi:</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {result.failedRows.map((f, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 p-3 bg-red-50 rounded-lg"
                    >
                      <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                      <div>
                        {f.row > 0 && (
                          <span className="text-xs font-medium text-red-500">
                            Dòng {f.row}
                            {f.field ? ` · ${f.field}` : ""}:
                          </span>
                        )}
                        <p className="text-sm text-red-700">{f.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                onClick={handleClear}
                className="flex-1"
              >
                Nhập thêm
              </Button>
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 gap-2"
              >
                <ChevronRight className="h-4 w-4" />
                Tiếp tục với file khác
              </Button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFileChange(f);
              }}
            />
          </div>
        </motion.div>
      )}
    </div>
  );
}
