import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "@/lib/api-client";
import type { IComplaint } from "@/types";

interface ComplaintState {
  complaints: IComplaint[];
  currentComplaint: IComplaint | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  isLoading: boolean;
  error: string | null;
}

const initialState: ComplaintState = {
  complaints: [],
  currentComplaint: null,
  pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
  isLoading: false,
  error: null,
};

export const fetchComplaints = createAsyncThunk(
  "complaints/fetchAll",
  async (params: Record<string, string> = {}, { rejectWithValue }) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const { data } = await apiClient.get(`/complaints?${queryString}`);
      return data.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch complaints",
      );
    }
  },
);

export const fetchComplaintById = createAsyncThunk(
  "complaints/fetchById",
  async (id: string, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get(`/complaints/${id}`);
      return data.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch complaint",
      );
    }
  },
);

export const createComplaint = createAsyncThunk(
  "complaints/create",
  async (payload: Record<string, unknown>, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.post("/complaints", payload);
      return data.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        err.response?.data?.message || "Failed to create complaint",
      );
    }
  },
);

const complaintSlice = createSlice({
  name: "complaints",
  initialState,
  reducers: {
    clearCurrentComplaint(state) {
      state.currentComplaint = null;
    },
    clearComplaintError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch all
    builder.addCase(fetchComplaints.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchComplaints.fulfilled, (state, action) => {
      state.isLoading = false;
      state.complaints = action.payload.complaints;
      state.pagination = action.payload.pagination;
    });
    builder.addCase(fetchComplaints.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Fetch by ID
    builder.addCase(fetchComplaintById.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(fetchComplaintById.fulfilled, (state, action) => {
      state.isLoading = false;
      state.currentComplaint = action.payload.complaint;
    });
    builder.addCase(fetchComplaintById.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Create
    builder.addCase(createComplaint.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(createComplaint.fulfilled, (state) => {
      state.isLoading = false;
    });
    builder.addCase(createComplaint.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearCurrentComplaint, clearComplaintError } =
  complaintSlice.actions;
export default complaintSlice.reducer;
