// src/hooks/useAuth.ts
import { useState } from 'react';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import { addUser } from '../utils/userslice';

export interface LoginData {
    email: string;
    password: string;
}

export const useAuth = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [apiError, setApiError] = useState<string>('');
    
    const authenticate = async (isLogin: boolean, data: LoginData | FormData) => {
        setIsLoading(true);
        setApiError('');

        try {
            const endpoint = isLogin ? "http://localhost:3000/login" : "http://localhost:3000/signup";
            const response = await axios.post(endpoint, data, { withCredentials: true });

            dispatch(addUser(response.data));
            navigate("/");
        } catch (error: any) {
            const rawErrorMessage = error.response?.data?.message || "An unexpected error occurred.";
            
            let cleanMessage = rawErrorMessage;

            if (rawErrorMessage.includes("E11000") && rawErrorMessage.includes("email")) {
                cleanMessage = "An account with this email already exists. Please log in instead.";
            }

            setApiError(cleanMessage);

        } finally {
            setIsLoading(false);
        }
    };

    return { authenticate, isLoading, apiError, setApiError };
};