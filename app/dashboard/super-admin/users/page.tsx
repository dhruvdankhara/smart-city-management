"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable } from "@/components/shared/data-table";
import { Pagination } from "@/components/shared/pagination";
import { LoadingButton } from "@/components/shared/loading-button";
import { AlertBanner } from "@/components/shared/alert-banner";
import apiClient from "@/lib/api-client";

export default function SuperAdminUsers() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [users, setUsers] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [departments, setDepartments] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "admin" as string,
    departmentId: "",
  });

  const fetchUsers = async (page: number = 1) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "10" });
      if (roleFilter) params.set("role", roleFilter);
      const { data } = await apiClient.get(`/users?${params}`);
      setUsers(data.data.users);
      setPagination(data.data.pagination);
    } catch {
      setError("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    Promise.all([apiClient.get("/departments")]).then(([deptRes]) => {
      setDepartments(deptRes.data.data);
    });
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleFilter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const { data } = await apiClient.post("/users", form);
      setSuccess(
        `User created. Setup link sent to ${form.email}. Link: ${data.data.setupLink}`,
      );
      setShowForm(false);
      setForm({
        name: "",
        email: "",
        phone: "",
        role: "admin",
        departmentId: "",
      });
      fetchUsers();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Failed to create user");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleActive = async (userId: string, isActive: boolean) => {
    try {
      await apiClient.patch(`/users/${userId}`, { isActive: !isActive });
      fetchUsers();
    } catch {
      setError("Failed to update user");
    }
  };

  const columns = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    {
      key: "role",
      label: "Role",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (item: any) => (
        <span className="capitalize text-sm">
          {item.role.replace("-", " ")}
        </span>
      ),
    },
    {
      key: "departmentId",
      label: "Department",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (item: any) => item.departmentId?.name || "—",
    },
    {
      key: "isActive",
      label: "Status",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (item: any) => (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            item.isActive
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {item.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (item: any) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleActive(item._id, item.isActive);
          }}
          className={`text-xs px-2 py-1 rounded border ${
            item.isActive
              ? "text-red-600 hover:bg-red-50"
              : "text-green-600 hover:bg-green-50"
          }`}
        >
          {item.isActive ? "Deactivate" : "Activate"}
        </button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="User Management"
        description="Manage admins and workers"
        action={
          <LoadingButton onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancel" : "Add User"}
          </LoadingButton>
        }
      />

      {error && (
        <AlertBanner
          variant="error"
          message={error}
          onClose={() => setError("")}
        />
      )}
      {success && (
        <AlertBanner
          variant="success"
          message={success}
          onClose={() => setSuccess("")}
        />
      )}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border bg-card p-5 mb-6 space-y-4 max-w-lg"
        >
          <div className="space-y-2">
            <label className="text-sm font-medium">Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="flex h-10 w-full rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="flex h-10 w-full rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Phone</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="flex h-10 w-full rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Role</label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="flex h-10 w-full rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              required
            >
              <option value="admin">Department Admin</option>
              <option value="worker">Worker</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Department</label>
            <select
              value={form.departmentId}
              onChange={(e) =>
                setForm({ ...form, departmentId: e.target.value })
              }
              className="flex h-10 w-full rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              required
            >
              <option value="">Select department</option>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {departments.map((d: any) => (
                <option key={d._id} value={d._id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
          <LoadingButton type="submit" isLoading={isSubmitting}>
            Create & Send Invite
          </LoadingButton>
        </form>
      )}

      {/* Role filter */}
      <div className="flex gap-2 mb-4">
        {["", "admin", "worker", "citizen"].map((r) => (
          <button
            key={r}
            onClick={() => setRoleFilter(r)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
              roleFilter === r
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {r || "All"}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={users}
        isLoading={isLoading}
        emptyMessage="No users found"
      />
      <Pagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={fetchUsers}
      />
    </div>
  );
}
