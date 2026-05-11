import { z } from "zod";

// ============ COMPANY - JOB POSTING SCHEMA ============
export const jobPostingSchema = z.object({
  title: z.string().min(3, "Tiêu đề phải có ít nhất 3 ký tự"),
  field: z.string().min(1, "Vui lòng chọn lĩnh vực"),
  location: z.string().min(2, "Địa điểm phải có ít nhất 2 ký tự"),
  workType: z.enum(["remote", "hybrid", "on-site"], {
    required_error: "Vui lòng chọn hình thức làm việc",
  }),
  duration: z.string().min(1, "Vui lòng chọn thời hạn"),
  salaryMin: z.coerce
    .number({ invalid_type_error: "Lương tối thiểu phải là số" })
    .min(0, "Lương không được âm")
    .optional(),
  salaryMax: z.coerce
    .number({ invalid_type_error: "Lương tối đa phải là số" })
    .min(0, "Lương không được âm")
    .optional(),
  requirements: z.string().optional(),
  status: z.enum(["active", "paused", "closed"]).optional(),
}).refine(
  (data) => {
    if (data.salaryMin !== undefined && data.salaryMax !== undefined) {
      return data.salaryMax >= data.salaryMin;
    }
    return true;
  },
  {
    message: "Lương tối đa phải lớn hơn hoặc bằng lương tối thiểu",
    path: ["salaryMax"],
  }
);

export type JobPostingFormValues = z.infer<typeof jobPostingSchema>;

// ============ ADMIN - USER EDIT SCHEMA ============
export const userEditSchema = z.object({
  name: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  role: z.enum(["student", "lecturer", "company", "admin"], {
    required_error: "Vui lòng chọn vai trò",
  }),
  department: z.string().optional(),
  phone: z
    .string()
    .regex(/^[0-9]{9,11}$/, "Số điện thoại phải có 9-11 chữ số")
    .optional()
    .or(z.literal("")),
  status: z.enum(["active", "inactive", "pending_role"]).optional(),
});

export type UserEditFormValues = z.infer<typeof userEditSchema>;

// ============ STUDENT - PROFILE EDIT SCHEMA ============
export const studentProfileSchema = z.object({
  name: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  phone: z
    .string()
    .regex(/^[0-9]{9,11}$/, "Số điện thoại phải có 9-11 chữ số")
    .min(1, "Số điện thoại không được để trống"),
  bio: z
    .string()
    .max(500, "Tiểu sử không được vượt quá 500 ký tự")
    .optional()
    .or(z.literal("")),
  gpa: z.coerce
    .number({ invalid_type_error: "GPA phải là số" })
    .min(0, "GPA tối thiểu là 0")
    .max(4, "GPA tối đa là 4"),
  skills: z.array(z.string()).min(1, "Vui lòng chọn ít nhất 1 kỹ năng"),
});

export type StudentProfileFormValues = z.infer<typeof studentProfileSchema>;
