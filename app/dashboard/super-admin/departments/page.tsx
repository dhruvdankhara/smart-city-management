"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable } from "@/components/shared/data-table";
import { LoadingButton } from "@/components/shared/loading-button";
import { AlertBanner } from "@/components/shared/alert-banner";
import apiClient from "@/lib/api-client";

export default function SuperAdminDepartments() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [departments, setDepartments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [editingDept, setEditingDept] = useState<any>(null);

  const [form, setForm] = useState({ name: "", code: "", description: "" });

  const fetchDepartments = async () => {
    try {
      const { data } = await apiClient.get("/departments");
      setDepartments(data.data);
    } catch {
      setError("Failed to load departments");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      if (editingDept) {
        await apiClient.patch(`/departments/${editingDept._id}`, form);
        setSuccess("Department updated");
      } else {
        await apiClient.post("/departments", form);
        setSuccess("Department created");
      }
      setShowForm(false);
      setEditingDept(null);
      setForm({ name: "", code: "", description: "" });
      fetchDepartments();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Operation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleEdit = (dept: any) => {
    setEditingDept(dept);
    setForm({
      name: dept.name,
      code: dept.code,
      description: dept.description || "",
    });
    setShowForm(true);
  };

  const handleToggle = async (id: string) => {
    try {
      await apiClient.delete(`/departments/${id}`);
      fetchDepartments();
    } catch {
      setError("Failed to deactivate department");
    }
  };

  const columns = [
    { key: "name", label: "Name" },
    { key: "code", label: "Code" },
    { key: "description", label: "Description" },
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
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(item);
            }}
            className="text-xs px-2 py-1 rounded border text-primary hover:bg-primary/5"
          >
            Edit
          </button>
          {item.isActive && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleToggle(item._id);
              }}
              className="text-xs px-2 py-1 rounded border text-red-600 hover:bg-red-50"
            >
              Deactivate
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Departments"
        description="Manage city departments"
        action={
          <LoadingButton
            onClick={() => {
              setShowForm(!showForm);
              setEditingDept(null);
              setForm({ name: "", code: "", description: "" });
            }}
          >
            {showForm ? "Cancel" : "Add Department"}
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
            <label className="text-sm font-medium">Code</label>
            <input
              type="text"
              value={form.code}
              onChange={(e) =>
                setForm({ ...form, code: e.target.value.toUpperCase() })
              }
              placeholder="e.g. ROAD, WATER"
              disabled={!!editingDept}
              className="flex h-10 w-full rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              rows={3}
              className="flex w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
          </div>
          <LoadingButton type="submit" isLoading={isSubmitting}>
            {editingDept ? "Update" : "Create"} Department
          </LoadingButton>
        </form>
      )}

      <DataTable
        columns={columns}
        data={departments}
        isLoading={isLoading}
        emptyMessage="No departments found"
      />
    </div>
  );
}
