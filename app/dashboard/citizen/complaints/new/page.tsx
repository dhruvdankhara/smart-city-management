"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { LocationPicker } from "@/components/shared/location-picker";
import { ImageUpload } from "@/components/shared/image-upload";
import { LoadingButton } from "@/components/shared/loading-button";
import { AlertBanner } from "@/components/shared/alert-banner";
import apiClient from "@/lib/api-client";
import { createComplaintSchema } from "@/lib/validations";

export default function NewComplaint() {
  const router = useRouter();

  const [form, setForm] = useState({
    title: "",
    description: "",
    categoryId: "",
    priority: "medium",
  });
  const [location, setLocation] = useState<{
    lat: number;
    lng: number;
    address: string;
  } | null>(null);
  const [images, setImages] = useState<string[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    apiClient.get("/categories").then(({ data }) => {
      setCategories(data.data);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!location) {
      setError("Please select a location on the map or use GPS");
      return;
    }

    const complaintData = {
      ...form,
      location: {
        type: "Point" as const,
        coordinates: [location.lng, location.lat] as [number, number],
      },
      address: location.address,
    };

    const parsed = createComplaintSchema.safeParse(complaintData);
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.post("/complaints", {
        ...complaintData,
        imageFiles: images,
      });
      router.push("/dashboard/citizen/complaints");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Failed to submit complaint");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Register Complaint"
        description="Fill in the details to file a new complaint"
      />

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        {error && (
          <AlertBanner
            variant="error"
            message={error}
            onClose={() => setError("")}
          />
        )}

        {/* Title */}
        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-medium">
            Title
          </label>
          <input
            id="title"
            type="text"
            placeholder="Brief description of the issue"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="flex h-10 w-full rounded-lg border bg-background px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            required
          />
        </div>

        {/* Category */}
        <div className="space-y-2">
          <label htmlFor="category" className="text-sm font-medium">
            Category
          </label>
          <select
            id="category"
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            className="flex h-10 w-full rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            required
          >
            <option value="">Select a category</option>
            {categories.map(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (cat: any) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name} ({cat.departmentId?.name})
                </option>
              ),
            )}
          </select>
        </div>

        {/* Priority */}
        <div className="space-y-2">
          <label htmlFor="priority" className="text-sm font-medium">
            Priority
          </label>
          <select
            id="priority"
            value={form.priority}
            onChange={(e) => setForm({ ...form, priority: e.target.value })}
            className="flex h-10 w-full rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-medium">
            Description
          </label>
          <textarea
            id="description"
            placeholder="Describe the issue in detail..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={4}
            className="flex w-full rounded-lg border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
            required
          />
        </div>

        {/* Location */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Location{" "}
            <span className="text-muted-foreground">
              (click on map or use GPS)
            </span>
          </label>
          <LocationPicker
            value={
              location ? { lat: location.lat, lng: location.lng } : undefined
            }
            onChange={setLocation}
          />
          {location && (
            <p className="text-xs text-muted-foreground mt-1 truncate">
              {location.address}
            </p>
          )}
        </div>

        {/* Images */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Photos{" "}
            <span className="text-muted-foreground">(optional, max 5)</span>
          </label>
          <ImageUpload images={images} onChange={setImages} maxFiles={5} />
        </div>

        {/* Submit */}
        <div className="flex gap-3">
          <LoadingButton type="submit" isLoading={isLoading}>
            Submit Complaint
          </LoadingButton>
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-lg border px-4 py-2.5 text-sm font-medium hover:bg-accent transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
