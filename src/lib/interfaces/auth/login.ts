export interface FormValues {
    email: string;
    password: string;
      
}
export interface phoneValues {
  phone: string;
  otp: string;
}
export interface LoginPayload {
    email: string;
    password: string;
}
export interface phonePayload{
    phone:string;
}
interface ServerErrorData {
    success: boolean;
    status: number;
    message: string;
    data: any;
    errors: Record<string, string[]>;
}

export interface ServerError {
    status: number;
    success: boolean;
    message?: string;
    data: ServerErrorData;
}

export interface ValidationErrors {
    [key: string]: string[];
}

