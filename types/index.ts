// ============================================================
// Smart City Management - Type Definitions
// ============================================================

// --- Enums ---
export type UserRole = "citizen" | "admin" | "worker" | "super-admin";

export type ComplaintPriority = "low" | "medium" | "high" | "critical";

export type ComplaintStatus =
  | "reported"
  | "assigned"
  | "in_progress"
  | "resolved"
  | "rejected"
  | "cancelled";

// --- GeoJSON ---
export interface GeoPoint {
  type: "Point";
  coordinates: [number, number]; // [lng, lat]
}

// --- Image ---
export interface CloudinaryImage {
  url: string;
  public_id: string;
}

// --- User ---
export interface IUser {
  _id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  avatar?: CloudinaryImage | null;
  role: UserRole;
  departmentId?: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type SafeUser = Omit<IUser, "password">;

// --- Department ---
export interface IDepartment {
  _id: string;
  name: string;
  code: string;
  description: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// --- Complaint Category ---
export interface IComplaintCategory {
  _id: string;
  name: string;
  code: string;
  departmentId: string;
  createdAt: Date;
  updatedAt: Date;
}

// --- Complaint ---
export interface IComplaint {
  _id: string;
  title: string;
  description: string;
  categoryId: string;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  slaDeadline?: Date;
  reporterId: string;
  departmentId?: string;
  assignedWorkerId?: string;
  location: GeoPoint;
  address: string;
  areaId?: string;
  images: CloudinaryImage[];
  severityScore?: number;
  autoDetectedCategory: boolean;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
}

// --- Complaint Status Log ---
export interface IComplaintStatusLog {
  _id: string;
  complaintId: string;
  oldStatus: ComplaintStatus;
  newStatus: ComplaintStatus;
  changedBy: string;
  note: string;
  createdAt: Date;
}

// --- Area ---
export interface IArea {
  _id: string;
  name: string;
  location: GeoPoint;
  radius: number;
}

// --- API Response ---
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// --- Pagination ---
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// --- Auth ---
export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  departmentId?: string;
}

// --- Dashboard Stats ---
export interface DashboardStats {
  totalComplaints: number;
  pendingComplaints: number;
  resolvedComplaints: number;
  inProgressComplaints: number;
  criticalComplaints: number;
}

// --- Worker Stats ---
export interface WorkerStats {
  totalAssigned: number;
  completed: number;
  pending: number;
  overdue: number;
}

// --- Leave Request ---
export interface LeaveRequest {
  _id: string;
  workerId: string;
  startDate: Date;
  endDate: Date;
  reason: string;
  status: "pending" | "approved" | "rejected";
  approvedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}
