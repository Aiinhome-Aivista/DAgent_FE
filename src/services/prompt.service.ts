import { apiService } from './api.service';
import { API_ENDPOINTS } from './api.config';

export const promptService = {
    getPromptTypes: async (): Promise<any> => {
        return apiService.get(API_ENDPOINTS.PROMPTS.GET_TYPES);
    },
    
    getWorkspacePrompts: async (workspaceId: number): Promise<any> => {
        return apiService.get(`${API_ENDPOINTS.PROMPTS.WORKSPACE_PROMPT}/${workspaceId}`);
    },

    getWorkspacePromptByType: async (workspaceId: number, promptType: string): Promise<any> => {
        return apiService.get(`${API_ENDPOINTS.PROMPTS.WORKSPACE_PROMPT}/${workspaceId}/${promptType}`);
    },

    setWorkspacePrompt: async (workspaceId: number, promptType: string, customPrompt: string): Promise<any> => {
        return apiService.post(API_ENDPOINTS.PROMPTS.WORKSPACE_PROMPT, {
            workspace_id: workspaceId,
            prompt_type: promptType,
            custom_prompt: customPrompt
        });
    },

    getAllWorkspacePrompts: async (): Promise<any> => {
        return apiService.get(API_ENDPOINTS.PROMPTS.GET_ALL_WORKSPACE_PROMPTS);
    }
};
