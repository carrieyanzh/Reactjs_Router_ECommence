import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/api";

export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await api.post("/api/auth/login", credentials);
      const { token, user } = response.data;      
      localStorage.setItem('token', token);

      return user; 
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Login failed"
      );
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  "auth/me",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/auth/me");
      return response.data.user;
    } catch (error) {      
      localStorage.removeItem('token');
      localStorage.removeItem('persist:root'); // Clear layout persist on invalid sessions
      return rejectWithValue("Not authenticated");
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await api.post("/api/auth/logout");
    } catch (error) {
      console.warn("Backend logout endpoint failed, wiping local state anyway.");
    } finally {
      // ✅ Completely wipes out tokens and persisted redux cache states
      localStorage.removeItem('token');
      localStorage.removeItem('persist:root'); 
    }
  }
);

const initialState = {
  user: null,
  isAuthenticated: false,
  status: "idle",
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {    
    clearAuth: (state) => {
      localStorage.removeItem('token');
      localStorage.removeItem('persist:root'); // ✅ Sync fallback reducer clearing mechanisms
      state.user = null;
      state.isAuthenticated = false;
      state.status = "idle";
    }
  },
  extraReducers: (builder) => {
    builder     
      .addCase(loginUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload; 
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })      
      .addCase(fetchCurrentUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.status = "succeeded";
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.status = "failed";
      })
      .addCase(logoutUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.status = "idle";
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state) => {        
        state.user = null;
        state.isAuthenticated = false;
        state.status = "idle";
      });
  },
});

export const { clearAuth } = authSlice.actions;
export default authSlice.reducer;
