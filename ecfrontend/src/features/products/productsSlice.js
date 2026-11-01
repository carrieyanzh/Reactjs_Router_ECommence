import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/api";

export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async (categoryId, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/products", {
        params: categoryId ? { categoryId } : {},
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch products"
      );
    }
  }
);

const productsSlice = createSlice({
  name: "products",

  initialState: {
    items: [],
    loading: false,
    error: null,
  },

  reducers: {},

  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Default export
export default productsSlice.reducer;