import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/v1';

export interface ProcessStep {
  id?: string;
  flowId?: string;
  stepCode: number;
  stepName: string;
  stepOrder: number;
}

export interface ProcessFlow {
  id: string;
  productId: string;
  flowCode: string;
  description: string;
  syncStatus: string;
  createdAt: string;
  steps: ProcessStep[];
}

export const apiService = {
  getProcessFlows: async (): Promise<ProcessFlow[]> => {
    try {
      const response = await axios.get<ProcessFlow[]>(`${API_BASE_URL}/process-flows`);
      return response.data;
    } catch (error) {
      console.error('Error fetching process flows:', error);
      return [];
    }
  },

  getEdgeProcessFlows: async (): Promise<ProcessFlow[]> => {
    try {
      const response = await axios.get<ProcessFlow[]>(`${API_BASE_URL}/process-flows/edge`);
      return response.data;
    } catch (error) {
      console.error('Error fetching edge process flows:', error);
      return [];
    }
  },

  createProcessFlow: async (flow: { productId: string; flowCode: string; description: string }): Promise<ProcessFlow | null> => {
    try {
      const response = await axios.post<ProcessFlow>(`${API_BASE_URL}/process-flows`, flow);
      return response.data;
    } catch (error) {
      console.error('Error creating process flow:', error);
      return null;
    }
  },

  addStepToFlow: async (flowId: string, step: { stepCode: number; stepName: string; stepOrder: number }): Promise<ProcessStep | null> => {
    try {
      const response = await axios.post<ProcessStep>(`${API_BASE_URL}/process-flows/${flowId}/steps`, step);
      return response.data;
    } catch (error) {
      console.error('Error adding step to flow:', error);
      return null;
    }
  },

  addStepToEdgeFlow: async (flowId: string, step: { stepCode: number; stepName: string; stepOrder: number }): Promise<ProcessStep | null> => {
    try {
      const response = await axios.post<ProcessStep>(`${API_BASE_URL}/process-flows/edge/${flowId}/steps`, step);
      return response.data;
    } catch (error) {
      console.error('Error adding step to edge flow:', error);
      // Fallback
      return apiService.addStepToFlow(flowId, step);
    }
  },

  editOnEdgeAndSyncBack: async (flowId: string, flow: { productId: string; flowCode: string; description: string }): Promise<ProcessFlow | null> => {
    try {
      const response = await axios.put<ProcessFlow>(`${API_BASE_URL}/process-flows/edge-edit/${flowId}`, flow);
      return response.data;
    } catch (error) {
      console.error('Error editing flow on Edge:', error);
      return null;
    }
  },

  getSavedProcessResults: async (): Promise<any[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/traceability/process-results`);
      return response.data;
    } catch (error) {
      console.error('Error fetching saved process results:', error);
      return [];
    }
  },

  recordProcessResult: async (payload: any): Promise<any> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/traceability/process-results`, payload);
      return response.data;
    } catch (error: any) {
      console.error('Error recording process result:', error);
      return error.response?.data || { status: 'ERROR', message: error.message };
    }
  }
};
