import { z } from "zod";

// Sanitize user input: strip HTML tags and trim whitespace
function stripHtml(value: string): string {
  return value.replace(/<[^>]*>/g, "").trim();
}

// Zod preprocessor that sanitizes string input
const safeString = (min: number, max: number, label: string) =>
  z.preprocess(
    (val) => (typeof val === "string" ? stripHtml(val) : val),
    z
      .string()
      .min(min, `${label} must be at least ${min} characters`)
      .max(max, `${label} must be at most ${max} characters`),
  );

// --- Auth ---
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  name: safeString(2, 100, "Name"),
  email: z.string().email("Invalid email address"),
  phone: z
    .string()
    .min(10, "Phone must be at least 10 digits")
    .max(15)
    .regex(/^[+\d\s()-]+$/, "Phone contains invalid characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const setupAccountSchema = z
  .object({
    token: z.string(),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// --- Department ---
export const departmentSchema = z.object({
  name: safeString(2, 100, "Department name"),
  code: z.string().min(2, "Code is required").max(10).toUpperCase(),
  description: z.string().max(500).optional(),
});

// --- Complaint Category ---
export const complaintCategorySchema = z.object({
  name: safeString(2, 100, "Category name"),
  code: z.string().min(2, "Code is required").max(20).toUpperCase(),
  departmentId: z.string().min(1, "Department is required"),
});

// --- Complaint ---
export const createComplaintSchema = z.object({
  title: safeString(5, 200, "Title"),
  description: safeString(10, 2000, "Description"),
  categoryId: z.string().min(1, "Category is required"),
  priority: z.enum(["low", "medium", "high", "critical"]).default("medium"),
  location: z.object({
    type: z.literal("Point"),
    coordinates: z.tuple([z.number(), z.number()]),
  }),
  address: z.string().min(5, "Address is required").max(500),
  images: z
    .array(
      z.object({
        url: z.string().url(),
        public_id: z.string(),
      }),
    )
    .max(5, "Maximum 5 images allowed")
    .optional(),
});

// --- Assign Complaint ---
export const assignComplaintSchema = z.object({
  assignedWorkerId: z.string().min(1, "Worker is required"),
  slaDeadline: z.string().min(1, "Deadline is required"),
  priority: z.enum(["low", "medium", "high", "critical"]).optional(),
});

// --- Update Complaint Status ---
export const updateStatusSchema = z.object({
  status: z.enum([
    "reported",
    "assigned",
    "in_progress",
    "resolved",
    "rejected",
    "cancelled",
  ]),
  note: z.string().max(500).optional(),
});

// --- Create User (Admin/Worker by Super Admin) ---
export const createUserSchema = z.object({
  name: safeString(2, 100, "Name"),
  email: z.string().email("Invalid email address"),
  phone: z
    .string()
    .min(10, "Phone must be at least 10 digits")
    .max(15)
    .regex(/^[+\d\s()-]+$/, "Phone contains invalid characters"),
  role: z.enum(["admin", "worker"]),
  departmentId: z.string().min(1, "Department is required"),
});

// --- Leave Request ---
export const leaveRequestSchema = z.object({
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  reason: safeString(5, 500, "Reason"),
});

// --- Area ---
export const areaSchema = z.object({
  name: safeString(2, 100, "Area name"),
  location: z.object({
    type: z.literal("Point"),
    coordinates: z.tuple([z.number(), z.number()]),
  }),
  radius: z.number().min(100).max(50000).default(2000),
});

// --- Profile Update ---
export const updateProfileSchema = z.object({
  name: safeString(2, 100, "Name"),
  avatar: z
    .object({
      url: z.string().url(),
      public_id: z.string(),
    })
    .nullable()
    .optional(),
});

// --- Change Password ---
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "New password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Export types inferred from schemas
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CreateComplaintInput = z.infer<typeof createComplaintSchema>;
export type AssignComplaintInput = z.infer<typeof assignComplaintSchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type LeaveRequestInput = z.infer<typeof leaveRequestSchema>;
export type DepartmentInput = z.infer<typeof departmentSchema>;
export type ComplaintCategoryInput = z.infer<typeof complaintCategorySchema>;
