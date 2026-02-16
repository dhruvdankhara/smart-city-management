"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable } from "@/components/shared/data-table";
import { LoadingButton } from "@/components/shared/loading-button";
import { AlertBanner } from "@/components/shared/alert-banner";
import apiClient from "@/lib/api-client";

export default function SuperAdminCategories() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [categories, setCategories] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [departments, setDepartments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({ name: "", code: "", departmentId: "" });

  useEffect(() => {
    Promise.all([apiClient.get("/categories"), apiClient.get("/departments")])
      .then(([catRes, deptRes]) => {
        setCategories(catRes.data.data);
        setDepartments(deptRes.data.data);
        setIsLoading(false);
      })
      .catch(() => {
        setError("Failed to load data");
        setIsLoading(false);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      await apiClient.post("/categories", form);
      setSuccess("Category created");
      setShowForm(false);
      setForm({ name: "", code: "", departmentId: "" });
      const { data } = await apiClient.get("/categories");
      setCategories(data.data);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Failed to create category");
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    { key: "name", label: "Name" },
    { key: "code", label: "Code" },
    {
      key: "departmentId",
      label: "Department",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (item: any) => item.departmentId?.name || "—",
    },
    {
      key: "createdAt",
      label: "Created",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (item: any) => new Date(item.createdAt).toLocaleDateString(),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Complaint Categories"
        description="Manage complaint categories"
        action={
          <LoadingButton onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancel" : "Add Category"}
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
            <label className="text-sm font-medium">Category Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Pothole, Water Leak"
              className="flex h-10 w-full rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Code</label>
            <input
              type="text"
              value={form.code}
              onChange={(e) =>
                setForm({ ...form, code: e.target.value.toUpperCase() })
              }
              placeholder="e.g. POTHOLE, WATER_LEAK"
              className="flex h-10 w-full rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              required
            />
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
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>
          <LoadingButton type="submit" isLoading={isSubmitting}>
            Create Category
          </LoadingButton>
        </form>
      )}

      <DataTable
        columns={columns}
        data={categories}
        isLoading={isLoading}
        emptyMessage="No categories found"
      />
    </div>
  );
}
