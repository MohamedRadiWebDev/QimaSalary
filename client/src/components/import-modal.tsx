import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Upload, FileSpreadsheet, ArrowLeftRight, CheckCircle2, AlertCircle } from "lucide-react";
import type { ImportPreview } from "@shared/schema";

interface ImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (file: File, keyColumn: string) => Promise<ImportPreview>;
  onConfirmImport: () => Promise<void>;
  isLoading?: boolean;
}

export function ImportModal({
  open,
  onOpenChange,
  onImport,
  onConfirmImport,
  isLoading = false,
}: ImportModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [keyColumn, setKeyColumn] = useState("الكود");
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [step, setStep] = useState<"upload" | "preview" | "success">("upload");
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
    }
  };

  const handlePreview = async () => {
    if (!selectedFile) return;
    setError(null);
    try {
      const previewData = await onImport(selectedFile, keyColumn);
      setPreview(previewData);
      setStep("preview");
    } catch (err) {
      setError("فشل في قراءة الملف. تأكد من أن الملف Excel صحيح.");
    }
  };

  const handleConfirm = async () => {
    try {
      await onConfirmImport();
      setStep("success");
      setTimeout(() => {
        resetModal();
        onOpenChange(false);
      }, 2000);
    } catch (err) {
      setError("فشل في استيراد البيانات");
    }
  };

  const resetModal = () => {
    setSelectedFile(null);
    setPreview(null);
    setStep("upload");
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      resetModal();
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            {step === "upload" && "استيراد بيانات من Excel"}
            {step === "preview" && "معاينة التغييرات"}
            {step === "success" && "تم الاستيراد بنجاح"}
          </DialogTitle>
        </DialogHeader>

        {step === "upload" && (
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label>اختر عمود المطابقة</Label>
              <Select value={keyColumn} onValueChange={setKeyColumn}>
                <SelectTrigger className="w-48" data-testid="select-key-column">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="الكود">الكود</SelectItem>
                  <SelectItem value="الرقم القومي">الرقم القومي</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                سيتم استخدام هذا العمود لمطابقة البيانات مع الموظفين الحاليين
              </p>
            </div>

            <div
              className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm font-medium mb-1">
                {selectedFile ? selectedFile.name : "اختر ملف Excel أو اسحبه هنا"}
              </p>
              <p className="text-xs text-muted-foreground">
                يدعم ملفات .xlsx و .xls
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
                data-testid="input-import-file"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-destructive text-sm">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}
          </div>
        )}

        {step === "preview" && preview && (
          <div className="flex-1 flex flex-col min-h-0 space-y-4">
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="gap-1">
                <ArrowLeftRight className="h-3 w-3" />
                {preview.updatedRecords} تحديث
              </Badge>
              <Badge variant="secondary" className="gap-1">
                + {preview.newRecords} جديد
              </Badge>
            </div>

            <ScrollArea className="flex-1 border rounded-md">
              <Table>
                <TableHeader className="sticky top-0 bg-background">
                  <TableRow>
                    <TableHead className="w-[200px]">الموظف</TableHead>
                    <TableHead className="w-[150px]">الحقل</TableHead>
                    <TableHead className="w-[150px]">القيمة القديمة</TableHead>
                    <TableHead className="w-[150px]">القيمة الجديدة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {preview.changes.slice(0, 100).map((change, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {change.employeeName}
                      </TableCell>
                      <TableCell>{change.field}</TableCell>
                      <TableCell className="text-muted-foreground line-through" dir="ltr">
                        {change.oldValue ?? "-"}
                      </TableCell>
                      <TableCell className="text-primary font-medium" dir="ltr">
                        {change.newValue ?? "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
            
            {preview.changes.length > 100 && (
              <p className="text-xs text-muted-foreground text-center">
                يعرض أول 100 تغيير من إجمالي {preview.changes.length}
              </p>
            )}
          </div>
        )}

        {step === "success" && (
          <div className="flex flex-col items-center justify-center py-12">
            <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
            <p className="text-lg font-medium">تم استيراد البيانات بنجاح</p>
          </div>
        )}

        <DialogFooter className="gap-2">
          {step === "upload" && (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                إلغاء
              </Button>
              <Button
                onClick={handlePreview}
                disabled={!selectedFile || isLoading}
                data-testid="button-preview-import"
              >
                {isLoading ? "جاري المعالجة..." : "معاينة التغييرات"}
              </Button>
            </>
          )}
          {step === "preview" && (
            <>
              <Button variant="outline" onClick={() => setStep("upload")}>
                رجوع
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={isLoading}
                data-testid="button-confirm-import"
              >
                {isLoading ? "جاري الاستيراد..." : "تأكيد الاستيراد"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
