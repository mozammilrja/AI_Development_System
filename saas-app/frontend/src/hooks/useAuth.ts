import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuthStore } from '../stores';
import type { User, LoginRequest, RegisterRequest, AuthResponse } from '../types';

export function useLogin() {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: async (data: LoginRequest) => {
      const response = await api.post<AuthResponse>('/auth/login', data, {
        skipAuth: true,
      });
      return response;
    },
    onSuccess: (data) => {
      setAuth(data.user, data.tokens);
    },
  });
}

export function useRegister() {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: async (data: RegisterRequest) => {
      const response = await api.post<AuthResponse>('/auth/register', data, {
        skipAuth: true,
      });
      return response;
    },
    onSuccess: (data) => {
      setAuth(data.user, data.tokens);
    },
  });
}

export function useLogout() {
  const logout = useAuthStore((state) => state.logout);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await api.post('/auth/logout');
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
