// © 2026 Adobe. All rights reserved. See /COPYRIGHT for details.

/**
 * Type shim for axios@0.27.2.
 *
 * The package has `"exports": {}` (empty), which prevents TypeScript with
 * `moduleResolution: "bundler"` from resolving the `types` field.
 * This ambient declaration provides the minimal surface needed.
 */
declare module "axios" {
    interface AxiosRequestConfig {
        headers?: Record<string, string | number | boolean>;
        [key: string]: unknown;
    }
    interface AxiosResponse<T = unknown> {
        data: T;
        status: number;
        statusText: string;
        headers: Record<string, string>;
        config: AxiosRequestConfig;
    }
    interface AxiosInstance {
        get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
        post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
        put<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
        delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
        patch<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
    }
    const axios: AxiosInstance;
    export default axios;
}
