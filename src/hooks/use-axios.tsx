'use client';

import { useMemo } from 'react';
import { createAxiosInstance } from '@/lib/axios-instance';
import { AxiosInstance } from 'axios';
import { useToken } from '@/features/auth/TokenContext';

const useAxios = (): AxiosInstance | undefined => {
  const { accessToken } = useToken();

  const axiosInstance = useMemo(() => {
    if (!accessToken) return undefined; // 🔹 Cambiado de `null` a `undefined`
    return createAxiosInstance(accessToken);
  }, [accessToken]);

  return axiosInstance;
};

export default useAxios;
