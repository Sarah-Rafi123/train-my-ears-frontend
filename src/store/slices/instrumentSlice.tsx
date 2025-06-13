import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { instrumentsApi, Instrument, InstrumentsResponse } from '@/src/services/instrumentApi'

interface InstrumentsState {
  instruments: Instrument[]
  selectedInstrumentId: string | null
  isLoading: boolean
  error: string | null
}

const initialState: InstrumentsState = {
  instruments: [],
  selectedInstrumentId: null,
  isLoading: false,
  error: null,
}

// Async thunk for fetching instruments
export const fetchInstruments = createAsyncThunk<
  InstrumentsResponse,
  void,
  { rejectValue: string }
>(
  'instruments/fetchInstruments',
  async (_, { rejectWithValue }) => {
    try {
      const response = await instrumentsApi.getInstruments()
      return response
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message)
      }
      return rejectWithValue('Failed to fetch instruments')
    }
  }
)

const instrumentsSlice = createSlice({
  name: 'instruments',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setSelectedInstrument: (state, action: PayloadAction<string>) => {
      state.selectedInstrumentId = action.payload
    },
    clearSelectedInstrument: (state) => {
      state.selectedInstrumentId = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInstruments.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchInstruments.fulfilled, (state, action) => {
        state.isLoading = false
        state.instruments = action.payload.data.instruments
        state.error = null
      })
      .addCase(fetchInstruments.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload || 'Failed to fetch instruments'
      })
  },
})

export const { clearError, setSelectedInstrument, clearSelectedInstrument } = instrumentsSlice.actions
export default instrumentsSlice.reducer