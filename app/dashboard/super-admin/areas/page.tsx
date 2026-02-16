"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable } from "@/components/shared/data-table";
import { LoadingButton } from "@/components/shared/loading-button";
import { AlertBanner } from "@/components/shared/alert-banner";
import { LocationPicker } from "@/components/shared/location-picker";
import apiClient from "@/lib/api-client";

interface AreaForm {
  name: string;
  radius: number;
  location: { type: "Point"; coordinates: [number, number] } | null;
}

const defaultForm: AreaForm = {
  name: "",
  radius: 2000,
  location: null,
};

export default function SuperAdminAreas() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [areas, setAreas] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [editingArea, setEditingArea] = useState<any>(null);
  const [form, setForm] = useState<AreaForm>({ ...defaultForm });

  const fetchAreas = async () => {
    try {
      const { data } = await apiClient.get("/areas");
      setAreas(data.data);
    } catch {
      setError("Failed to load areas");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAreas();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.location) {
      setError("Please select a location on the map");
      return;
    }
    setIsSubmitting(true);
    setError("");

    const payload = {
      name: form.name,
      radius: form.radius,
      location: form.location,
    };

    try {
      if (editingArea) {
        await apiClient.patch(`/areas/${editingArea._id}`, payload);
        setSuccess("Area updated");
      } else {
        await apiClient.post("/areas", payload);
        setSuccess("Area created");
      }
      setShowForm(false);
      setEditingArea(null);
      setForm({ ...defaultForm });
      fetchAreas();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Operation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleEdit = (area: any) => {
    setEditingArea(area);
    setForm({
      name: area.name,
      radius: area.radius || 2000,
      location: area.location || null,
    });
    setShowForm(true);
    setError("");
    setSuccess("");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this area? Complaints in this area will be unlinked."))
      return;
    try {
      await apiClient.delete(`/areas/${id}`);
      setSuccess("Area deleted");
      fetchAreas();
    } catch {
      setError("Failed to delete area");
    }
  };

  const columns = [
    { key: "name", label: "Name" },
    {
      key: "radius",
      label: "Radius",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (item: any) => (
        <span>
          {item.radius ? `${(item.radius / 1000).toFixed(1)} km` : "2 km"}
        </span>
      ),
    },
    {
      key: "location",
      label: "Coordinates",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (item: any) => (
        <span className="text-xs text-muted-foreground">
          {item.location?.coordinates
            ? `${item.location.coordinates[1].toFixed(4)}, ${item.location.coordinates[0].toFixed(4)}`
            : "—"}
        </span>
      ),
    },
    {
      key: "complaintCount",
      label: "Complaints",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (item: any) => (
        <span className="inline-flex items-center rounded-full bg-blue-100 text-blue-800 px-2.5 py-0.5 text-xs font-medium">
          {item.complaintCount || 0}
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
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(item._id);
            }}
            className="text-xs px-2 py-1 rounded border text-red-600 hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Areas"
        description="Manage city areas for complaint assignment"
        backHref="/dashboard/super-admin"
        action={
          <LoadingButton
            onClick={() => {
              setShowForm(!showForm);
              setEditingArea(null);
              setForm({ ...defaultForm });
              setError("");
              setSuccess("");
            }}
          >
            {showForm ? "Cancel" : "Add Area"}
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
          className="rounded-xl border bg-card p-5 mb-6 space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Area Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Downtown, Riverside"
                className="flex h-10 w-full rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Radius (meters)</label>
              <input
                type="number"
                value={form.radius}
                onChange={(e) =>
                  setForm({ ...form, radius: Number(e.target.value) })
                }
                min={100}
                max={50000}
                step={100}
                className="flex h-10 w-full rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                required
              />
              <p className="text-xs text-muted-foreground">
                Complaints within this radius will be auto-assigned to this area
                (100 - 50,000m)
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Location (click on map to select)
            </label>
            <LocationPicker
              value={
                form.location
                  ? {
                      lat: form.location.coordinates[1],
                      lng: form.location.coordinates[0],
                    }
                  : undefined
              }
              onChange={({ lat, lng }) => {
                setForm({
                  ...form,
                  location: {
                    type: "Point",
                    coordinates: [lng, lat],
                  },
                });
              }}
            />
            {form.location && (
              <p className="text-xs text-muted-foreground">
                Selected: {form.location.coordinates[1].toFixed(6)},{" "}
                {form.location.coordinates[0].toFixed(6)}
              </p>
            )}
          </div>

          <LoadingButton type="submit" isLoading={isSubmitting}>
            {editingArea ? "Update" : "Create"} Area
          </LoadingButton>
        </form>
      )}

      <DataTable
        columns={columns}
        data={areas}
        isLoading={isLoading}
        emptyMessage="No areas found. Add an area to start auto-assigning complaints."
      />
    </div>
  );
}
