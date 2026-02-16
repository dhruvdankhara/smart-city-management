"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable } from "@/components/shared/data-table";
import { LoadingButton } from "@/components/shared/loading-button";
import { AlertBanner } from "@/components/shared/alert-banner";
import apiClient from "@/lib/api-client";

export default function AdminWorkers() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [workers, setWorkers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const fetchWorkers = async () => {
    try {
      const { data } = await apiClient.get("/users?role=worker&limit=100");
      setWorkers(data.data.users);
    } catch {
      setError("Failed to load workers");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      // Get current user's departmentId from stored user
      const storedUser = localStorage.getItem("user");
      const user = storedUser ? JSON.parse(storedUser) : null;

      const { data } = await apiClient.post("/users", {
        ...form,
        role: "worker",
        departmentId: user?.departmentId,
      });

      setSuccess(`Worker created successfully. Setup link sent to ${form.email}.`);
      console.log("Setup link:", data.data.setupLink);
      setShowForm(false);
      setForm({ name: "", email: "", phone: "" });
      fetchWorkers();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Failed to create worker");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleActive = async (userId: string, isActive: boolean) => {
    try {
      await apiClient.patch(`/users/${userId}`, { isActive: !isActive });
      fetchWorkers();
    } catch {
      setError("Failed to update worker");
    }
  };

  const columns = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
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
        title="Workers"
        description="Manage workers in your department"
        action={
          <LoadingButton onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancel" : "Add Worker"}
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
          onSubmit={handleCreate}
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
          <LoadingButton type="submit" isLoading={isSubmitting}>
            Create & Send Invite
          </LoadingButton>
        </form>
      )}

      <DataTable
        columns={columns}
        data={workers}
        isLoading={isLoading}
        emptyMessage="No workers found"
      />
    </div>
  );
}
