export {};

declare global {
    interface Window {
        google: {
            accounts: {
                oauth2: {
                    initCodeClient: (config: {
                        client_id: string;
                        scope: string;
                        ux_mode?: 'popup' | 'redirect';
                        callback: (response: GoogleCodeResponse) => void;
                        error_callback?: (error: any) => void;
                    }) => GoogleCodeClient;
                };
            };
        };
    }
}

export interface GoogleCodeResponse {
    code: string;
    scope: string;
    authuser: string;
    prompt: string;
}

export interface GoogleCodeClient {
    requestCode: () => void;
}