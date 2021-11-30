import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import gql from 'graphql-tag';
import { GqlClient } from '../../app/gql-client';
import { RootState } from '../../app/store';

/**
 * Typings
 */
export type Metrics = string[];

export interface VisualizationState {
	metrics: Metrics;
	selectedMetrics: string[];
	metricInfo: {
		[key: string]: {
			state: MetricState;
			unit?: string;
		};
	};
}

export enum MetricState {
	Added,
	Initializing,
	Initialized,
	Plotted,
	Removed,
}

export interface GetMetricsResponse {
	getMetrics: Metrics;
}

/**
 * Initial state of app
 */
const initialState: VisualizationState = {
	metrics: [],
	selectedMetrics: [],
	metricInfo: {},
};

// Create visualization slice
export const visualizationSlice = createSlice({
	name: 'visualization',
	initialState,
	reducers: {
		addSelectedMetric: (state, action: PayloadAction<string>) => {
			state.selectedMetrics.push(action.payload);
			state.metricInfo[action.payload] = { state: MetricState.Added };
		},
		removeSelectedMetric: (state, action: PayloadAction<string>) => {
			const idx = state.selectedMetrics.findIndex((metric) => metric === action.payload);
			state.selectedMetrics.splice(idx, 1);
			state.metricInfo[action.payload].state = MetricState.Removed;
		},
		setMetricState: (state, action: PayloadAction<{ metric: string; newState: MetricState }>) => {
			const { metric, newState } = action.payload;
			state.metricInfo[metric].state = newState;
		},
		setMetricUnit: (state, action: PayloadAction<{ metric: string; unit: string }>) => {
			state.metricInfo[action.payload.metric].unit = action.payload.unit;
		},
		setMetrics: (state, action: PayloadAction<string[]>) => {
			state.metrics = action.payload;
		},
	},
});

// Slice actions
export const {
	addSelectedMetric,
	removeSelectedMetric,
	setMetricUnit,
	setMetricState,
	setMetrics,
} = visualizationSlice.actions;

/**
 * Visualization thunk actions
 */
export const getMetricsAsync = createAsyncThunk('visualization/getMetrics', async (_, { dispatch }) => {
	const query = gql`
    query {
      getMetrics
    }
  `;

	const { data } = await GqlClient.query<GetMetricsResponse>({ query });
	dispatch(setMetrics(data.getMetrics));
});

// Selectors
export const selectMetrics = (state: RootState) => state.visualization.metrics;
export const selectSelectedMetrics = (state: RootState) => state.visualization.selectedMetrics;
export const selectMetricsInfo = (state: RootState) => state.visualization.metricInfo;

// Visualization reducer
export const visualizationReducer = visualizationSlice.reducer;
