import axios, { AxiosInstance, AxiosError } from 'axios';

interface ApiConfig {
    baseURL: string;
    headers: Record<string, string>;
    timeout?: number;
}

export const createApiInstance = (config: ApiConfig, serviceName: string): AxiosInstance => {
    const apiInstance = axios.create({
        baseURL: config.baseURL,
        headers: config.headers,
        timeout: config.timeout || 10000,
    });

    apiInstance.interceptors.response.use(
        (response) => response,
        (error: AxiosError) => {
            if (error.response) {
                throw new Error(
                    `${serviceName} API error: ${error.response.status} - ${error.response.statusText}`
                );
            } else if (error.request) {
                throw new Error(`${serviceName} API request failed - no response received`);
            } else {
                throw new Error(`${serviceName} API error: ${error.message}`);
            }
        }
    );

    return apiInstance;
};

export const handleApiError = (error: unknown, operation: string): never => {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to ${operation}: ${message}`);
};
