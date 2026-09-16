// src/hooks/useAuth.ts
import { useState } from 'react';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import { addUser } from '../utils/userslice';

export const useAuth = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [apiError, setApiError] = useState<string>('');

    const authenticate = async (isLogin: boolean, data: any) => {
        setIsLoading(true);
        setApiError('');
        
        try {
            const endpoint = isLogin ? "http://localhost:3000/login" : "http://localhost:3000/signup";
            const response = await axios.post(endpoint, data, { withCredentials: true });
            
            dispatch(addUser(response.data));
            navigate("/");
        } catch (error: any) {
            setApiError(error.response?.data?.message || "An unexpected error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return { authenticate, isLoading, apiError, setApiError };
};