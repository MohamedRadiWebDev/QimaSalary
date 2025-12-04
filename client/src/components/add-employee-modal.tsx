import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserPlus } from "lucide-react";

const addEmployeeSchema = z.object({
  الكود: z.string().min(1, "الكود مطلوب"),
  الاسم: z.string().min(1, "الاسم مطلوب"),
  "الرقم القومي": z.string().optional(),
  الفرع: z.string().optional(),
  الإدارة: z.string().optional(),
  القطاع: z.string().optional(),
  الوظيفة: z.string().optional(),
  "تاريخ التعيين": z.string().optional(),
  "نوع التعاقد": z.string().optional(),
  "الراتب الشهري": z.string().optional(),
});

type AddEmployeeForm = z.infer<typeof addEmployeeSchema>;

interface AddEmployeeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: AddEmployeeForm) => Promise<void>;
  branches: string[];
  departments: string[];
  sectors: string[];
  isLoading?: boolean;
}

export function AddEmployeeModal({
  open,
  onOpenChange,
  onSubmit,
  branches,
  departments,
  sectors,
  isLoading = false,
}: AddEmployeeModalProps) {
  const form = useForm<AddEmployeeForm>({
    resolver: zodResolver(addEmployeeSchema),
    defaultValues: {
      الكود: "",
      الاسم: "",
      "الرقم القومي": "",
      الفرع: "",
      الإدارة: "",
      القطاع: "",
      الوظيفة: "",
      "تاريخ التعيين": "",
      "نوع التعاقد": "",
      "الراتب الشهري": "",
    },
  });

  const handleSubmit = async (data: AddEmployeeForm) => {
    await onSubmit(data);
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            إضافة موظف جديد
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="flex-1 flex flex-col min-h-0">
            <ScrollArea className="flex-1 px-1">
              <div className="grid grid-cols-2 gap-4 py-4">
                <FormField
                  control={form.control}
                  name="الكود"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        الكود <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-employee-code" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="الاسم"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        الاسم <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-employee-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="الرقم القومي"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الرقم القومي</FormLabel>
                      <FormControl>
                        <Input {...field} dir="ltr" data-testid="input-national-id" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="الفرع"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الفرع</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-employee-branch">
                            <SelectValue placeholder="اختر الفرع" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {branches.map((branch) => (
                            <SelectItem key={branch} value={branch}>
                              {branch}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="الإدارة"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الإدارة</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-employee-department">
                            <SelectValue placeholder="اختر الإدارة" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {departments.map((dept) => (
                            <SelectItem key={dept} value={dept}>
                              {dept}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="القطاع"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>القطاع</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-employee-sector">
                            <SelectValue placeholder="اختر القطاع" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {sectors.map((sector) => (
                            <SelectItem key={sector} value={sector}>
                              {sector}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="الوظيفة"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الوظيفة</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-job-title" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="تاريخ التعيين"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>تاريخ التعيين</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          dir="ltr"
                          data-testid="input-hire-date"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="نوع التعاقد"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>نوع التعاقد</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-contract-type">
                            <SelectValue placeholder="اختر نوع التعاقد" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="دائم">دائم</SelectItem>
                          <SelectItem value="مؤقت">مؤقت</SelectItem>
                          <SelectItem value="تجربة">تجربة</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="الراتب الشهري"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الراتب الشهري</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          dir="ltr"
                          data-testid="input-monthly-salary"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </ScrollArea>

            <DialogFooter className="mt-4 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                data-testid="button-cancel-add-employee"
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                data-testid="button-submit-add-employee"
              >
                {isLoading ? "جاري الحفظ..." : "حفظ الموظف"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
