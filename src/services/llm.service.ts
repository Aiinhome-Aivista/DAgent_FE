import { apiService } from './api.service';
import { API_ENDPOINTS } from './api.config';
import { LLMProvider, ScenarioAssignment } from '../features/admin/components/ManageLLM';

export interface CreateProviderPayload {
  name: string;
  provider_type: string;
  api_key?: string;
  model_name: string;
  base_url?: string;
  is_active?: boolean;
}

export const llmService = {
  // ── Providers ───────────────────────────────────────────────────────────────
  getProviders: async (): Promise<{ status: boolean; providers: LLMProvider[] }> => {
    return apiService.get(API_ENDPOINTS.LLM.PROVIDERS);
  },

  createProvider: async (data: CreateProviderPayload): Promise<{ status: boolean; msg: string; id: number }> => {
    return apiService.post(API_ENDPOINTS.LLM.PROVIDERS, data);
  },

  updateProvider: async (id: number, data: Partial<CreateProviderPayload>): Promise<{ status: boolean; msg: string }> => {
    return apiService.put(`${API_ENDPOINTS.LLM.PROVIDERS}/${id}`, data);
  },

  deleteProvider: async (id: number): Promise<{ status: boolean; msg: string }> => {
    return apiService.delete(`${API_ENDPOINTS.LLM.PROVIDERS}/${id}`);
  },

  testProvider: async (id: number): Promise<{ status: boolean; msg: string; response?: string }> => {
    return apiService.post(`${API_ENDPOINTS.LLM.PROVIDERS}/${id}/test`, {});
  },

  // ── Assignments ─────────────────────────────────────────────────────────────
  getAssignments: async (): Promise<{ status: boolean; assignments: ScenarioAssignment[] }> => {
    return apiService.get(API_ENDPOINTS.LLM.ASSIGNMENTS);
  },

  updateAssignments: async (
    assignments: Partial<ScenarioAssignment>[]
  ): Promise<{ status: boolean; msg: string }> => {
    return apiService.put(API_ENDPOINTS.LLM.ASSIGNMENTS, { assignments });
  },
};
