// Lo que espera el Service-Processor (Python)
export interface UserRegisterDTO {
 full_name: string;    
 email: string;
 password: string;
}

// Lo que maneja nuestro dominio en React
export interface UserResponse {
 id: string; 
 email: string;
 token: string;
 role: string;
 full_name?: string;
}

export interface UserLoginDTO {
 email: string;
 password: string;
}