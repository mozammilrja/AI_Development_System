import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuthStore } from '../stores';
import type { User, LoginRequest, RegisterRequest, AuthTokens } from '../types';

// Backend response format
interface BackendAuthResponse {
  success: boolean;
  data: {
    user: {
      _id: string;
      name: string;
      email: string;
      role: 'user' | 'admin';
    };
    token: string;
  };
}

// Transform backend response to frontend format
function transformAuthResponse(response: BackendAuthResponse): { user: User; tokens: AuthTokens } {
  const { user, token } = response.data;
  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    tokens: {
      accessToken: token,
      refreshToken: token, // Backend uses single token
    },
  };
}

export function useLogin() {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: async (data: LoginRequest) => {
      const response = await api.post<BackendAuthResponse>('/auth/login', data, {
        skipAuth: true,
      });
      return transformAuthResponse(response);
    },
    onSuccess: (data) => {
      // Also store token in localStorage for socket auth
      localStorage.setItem('token', data.tokens.accessToken);
      localStorage.setItem('userId', data.user.id);
      setAuth(data.user, data.tokens);
    },
  });
}

export function useRegister() {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: async (data: RegisterRequest) => {
      const response = await api.post<BackendAuthResponse>('/auth/register', data, {
        skipAuth: true,
      });
      return transformAuthResponse(response);
    },
    onSuccess: (data) => {
      localStorage.setItem('token', data.tokens.accessToken);
      localStorage.setItem('userId', data.user.id);
      setAuth(data.user, data.tokens);
    },
  });
}

export function useLogout() {
  const logout = useAuthStore((state) => state.logout);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // Clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
    },
    onSettled: () => {
      logout();
      queryClient.clear();
    },
  });
}

export function useCurrentUser() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const setUser = useAuthStore((state) => state.setUser);

  return useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const user = await api.get<User>('/auth/me');
      setUser(user);
      return user;
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useUpdateProfile() {
  const setUser = useAuthStore((state) => state.setUser);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<User>) => {
      const user = await api.patch<User>('/auth/profile', data);
      return user;
    },
    onSuccess: (user) => {
      setUser(user);
      queryClient.setQueryData(['currentUser'], user);
    },
  });
}
