import {
  useQuery,
  useMutation,
  UseQueryResult,
  UseMutationResult,
  useQueryClient
} from '@tanstack/react-query';
import { AxiosInstance } from 'axios';
import {
  LoanRequest,
  LoanRequestListingParams,
  LoanRequestDetail,
  UpdateLoanRequestForm,
  IncomeType,
  CreateLoanRequest
} from 'types/LoanRequests';

const LOAN_REQUESTS_KEY = 'loanRequests';

export const useLoanRequests = (
  apiClient: AxiosInstance | undefined,
  params?: LoanRequestListingParams,
  enabled: boolean = true
): UseQueryResult<LoanRequest[], Error> => {
  return useQuery({
    queryKey: [LOAN_REQUESTS_KEY, params],
    queryFn: async (): Promise<LoanRequest[]> => {
      if (!apiClient) throw new Error('API client not initialized');

      // Construir los parámetros de consulta
      const queryParams = new URLSearchParams();

      if (params) {
        // Añadir viewAll como parámetro booleano
        if (params.viewAll !== undefined) {
          queryParams.append('viewAll', params.viewAll.toString());
        }

        // Parámetros que se manejan localmente y no se envían al API:
        // - dni: Se filtra localmente en el componente page.tsx

        // Añadir otros parámetros si son necesarios en el futuro
        // if (params.dealership) queryParams.append('dealership', params.dealership);
        // if (params.manager) queryParams.append('manager', params.manager);
        // if (params.status) queryParams.append('status', params.status);
      }

      const queryString = queryParams.toString();
      const url = `/loan-requests${queryString ? `?${queryString}` : ''}`;

      const response = await apiClient.get<LoanRequest[]>(url);
      return response.data;
    },
    enabled: !!apiClient && enabled
  });
};

export const useCreateLoanRequest = (apiClient: AxiosInstance | undefined) => {
  const queryClient = useQueryClient();

  return useMutation<string, Error, CreateLoanRequest>({
    mutationFn: async (loanRequest: CreateLoanRequest) => {
      if (!apiClient) throw new Error('API client not initialized');
      try {
        const response = await apiClient.post<string>(
          '/loan-requests/create-by-business-user',
          loanRequest
        );
        return response.data;
      } catch (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [LOAN_REQUESTS_KEY] });
    }
  });
};

export const useLoanRequestDetail = (
  apiClient: AxiosInstance | undefined,
  id: string,
  enabled: boolean = true
): UseQueryResult<LoanRequestDetail, Error> => {
  return useQuery({
    queryKey: [LOAN_REQUESTS_KEY, 'detail', id],
    queryFn: async (): Promise<LoanRequestDetail> => {
      if (!apiClient) throw new Error('API client not initialized');

      const response = await apiClient.get<LoanRequestDetail>(
        `/loan-requests/${id}`
      );
      return response.data;
    },
    enabled: !!apiClient && !!id && enabled
  });
};

// Hook para usar la mutación de Equifax
export const useRegisterEquifax = (
  apiClient: AxiosInstance | undefined
): UseMutationResult<
  boolean,
  string,
  { clientDni: string; loanRequestId: string }
> => {
  return useMutation({
    mutationFn: async ({ clientDni, loanRequestId }) => {
      if (!apiClient) throw new Error('API client not initialized');
      return registerClientEquifax(apiClient, clientDni, loanRequestId);
    }
  });
};

export const useDocumentContent = (
  apiClient: AxiosInstance | undefined,
  documentId: string | undefined,
  enabled: boolean = true
): UseQueryResult<
  { blob: Blob; fileName: string; contentType: string },
  string
> => {
  return useQuery({
    queryKey: ['document', documentId],
    queryFn: async () => {
      if (!apiClient) throw new Error('API client not initialized');
      if (!documentId) throw new Error('Document ID is required');
      return getDocumentContent(apiClient, documentId);
    },
    enabled: !!apiClient && !!documentId && enabled
  });
};

// Función para obtener el contenido de un documento
export const getDocumentContent = async (
  apiClient: AxiosInstance,
  documentId: string
): Promise<{ blob: Blob; fileName: string; contentType: string }> => {
  if (!apiClient) throw new Error('API client not initialized');
  if (!documentId) throw new Error('Document ID is required');

  const response = await apiClient.get(
    `/loan-documents/content/${documentId}`,
    {
      responseType: 'arraybuffer',
      headers: {
        Accept: 'application/pdf,image/*,application/xml,text/xml,*/*'
      }
    }
  );

  const contentType =
    response.headers['content-type'] || 'application/octet-stream';
  const contentDisposition = response.headers['content-disposition'] || '';
  let fileName = `documento_${documentId}`;

  // Intentar extraer el nombre del archivo del header Content-Disposition
  const fileNameMatch = contentDisposition.match(
    /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
  );
  if (fileNameMatch && fileNameMatch[1]) {
    fileName = fileNameMatch[1].replace(/['"]/g, '');
  }

  return {
    blob: new Blob([response.data], { type: contentType }),
    fileName,
    contentType
  };
};

// Función para consultar Equifax
export const registerClientEquifax = async (
  apiClient: AxiosInstance,
  clientDni: string,
  loanRequestId: string
): Promise<boolean> => {
  if (!apiClient) throw new Error('API client not initialized');
  if (!clientDni) throw new Error('Client DNI is required');
  if (!loanRequestId) throw new Error('Loan request ID is required');

  const response = await apiClient.post('/loan-requests/registerequifax', {
    clientDni,
    loanRequestId
  });

  return response.status === 200;
};

export const useCheckBantotal = (apiClient: AxiosInstance) => {
  return useMutation({
    mutationFn: async (loanRequestId: string) => {
      const response = await apiClient.post(
        `/loan-requests/checkbantotal/${loanRequestId}`
      );
      return response.data;
    }
  });
};

// Mutations for approving/rejecting loan requests
export const useApproveByAgent = (apiClient: AxiosInstance) => {
  return useMutation({
    mutationFn: async (loanRequestId: string) => {
      const response = await apiClient.post(
        `/loan-requests/approve-by-agent/${loanRequestId}`
      );
      return response.data;
    }
  });
};

export const useRejectByAgent = (apiClient: AxiosInstance) => {
  return useMutation<
    string,
    string,
    {
      loanRequestId: string;
      rejectionReason: string;
    }
  >({
    mutationFn: async ({ loanRequestId, rejectionReason }) => {
      const response = await apiClient.post(
        `/loan-requests/reject-by-agent/${loanRequestId}`,
        { rejectionReason }
      );
      return response.data;
    }
  });
};

export const useApproveByManager = (apiClient: AxiosInstance) => {
  return useMutation({
    mutationFn: async (loanRequestId: string) => {
      const response = await apiClient.post(
        `/loan-requests/approve-by-manager/${loanRequestId}`
      );
      return response.data;
    }
  });
};

export const useRejectByManager = (apiClient: AxiosInstance) => {
  return useMutation<
    string,
    string,
    {
      loanRequestId: string;
      rejectionReason: string;
    }
  >({
    mutationFn: async ({ loanRequestId, rejectionReason }) => {
      const response = await apiClient.post(
        `/loan-requests/reject-by-manager/${loanRequestId}`,
        { rejectionReason }
      );
      return response.data;
    }
  });
};

// Update loan request mutation
export const useUpdateLoanRequest = (apiClient: AxiosInstance) => {
  return useMutation({
    mutationFn: async ({
      loanRequestId,
      ...data
    }: UpdateLoanRequestForm & { loanRequestId: string }) => {
      const response = await apiClient.put(
        `/loan-requests/update/${loanRequestId}`,
        data
      );
      return response.data;
    }
  });
};

// Assign visit mutation
export interface AssignVisitData {
  incomeType: IncomeType;
  branchCode: number;
  branchName: string;
  branchAddress: string;
  branchManagerId: string;
  pymeAdvisorId: string | null;
}

export const useAssignVisit = (apiClient: AxiosInstance) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      loanRequestId,
      ...data
    }: AssignVisitData & { loanRequestId: string }) => {
      const response = await apiClient.post(
        `/loan-requests/assign-visit/${loanRequestId}`,
        data
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      // Invalidate the specific loan request to update its details
      queryClient.invalidateQueries({
        queryKey: [LOAN_REQUESTS_KEY, 'detail', variables.loanRequestId]
      });
      // Also invalidate the list of loan requests
      queryClient.invalidateQueries({ queryKey: [LOAN_REQUESTS_KEY] });
    }
  });
};

export const useApproveForCommittee = (apiClient: AxiosInstance) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (loanRequestId: string) => {
      const response = await apiClient.post(
        `/loan-requests/approve-for-committee/${loanRequestId}`
      );
      return response.data;
    },
    onSuccess: (_, loanRequestId) => {
      // Invalidate the specific loan request to update its details
      queryClient.invalidateQueries({
        queryKey: [LOAN_REQUESTS_KEY, 'detail', loanRequestId]
      });
      // Also invalidate the list of loan requests
      queryClient.invalidateQueries({ queryKey: [LOAN_REQUESTS_KEY] });
    }
  });
};

export const useAddBranchManagerComment = (apiClient: AxiosInstance) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      loanRequestId,
      comment
    }: {
      loanRequestId: string;
      comment: string;
    }) => {
      const response = await apiClient.post(
        `/loan-requests/add-branch-manager-comment/${loanRequestId}`,
        { comment }
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      // Invalidate the specific loan request to update its details
      queryClient.invalidateQueries({
        queryKey: [LOAN_REQUESTS_KEY, 'detail', variables.loanRequestId]
      });
    }
  });
};

export const useCompleteLoanRequest = (apiClient: AxiosInstance) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (loanRequestId: string) => {
      const response = await apiClient.post(
        `/loan-requests/complete/${loanRequestId}`
      );
      return response.data;
    },
    onSuccess: (_, loanRequestId) => {
      // Invalidate the specific loan request to update its details
      queryClient.invalidateQueries({
        queryKey: [LOAN_REQUESTS_KEY, 'detail', loanRequestId]
      });
      // Also invalidate the list of loan requests
      queryClient.invalidateQueries({ queryKey: [LOAN_REQUESTS_KEY] });
    }
  });
};

export const useCompleteLoanRequestWithDate = (apiClient: AxiosInstance) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      loanRequestId,
      approvalDate
    }: {
      loanRequestId: string;
      approvalDate: string;
    }) => {
      const response = await apiClient.post(
        `/loan-requests/complete-with-date/${loanRequestId}`,
        { approvalDate }
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      // Invalidate the specific loan request to update its details
      queryClient.invalidateQueries({
        queryKey: [LOAN_REQUESTS_KEY, 'detail', variables.loanRequestId]
      });
      // Also invalidate the list of loan requests
      queryClient.invalidateQueries({ queryKey: [LOAN_REQUESTS_KEY] });
    }
  });
};

export const useAcceptTermsByCustomer = (apiClient: AxiosInstance) => {
  return useMutation({
    mutationFn: async ({
      loanRequestId,
      data
    }: {
      loanRequestId: string;
      data: {
        phoneNumber: string;
        city: string;
        address: string;
      };
    }) => {
      const response = await apiClient.post(
        `/loan-requests/accept-by-customer/${loanRequestId}`,
        data
      );
      return response.data;
    }
  });
};

export const useDeclineTermsByCustomer = (apiClient: AxiosInstance) => {
  return useMutation({
    mutationFn: async (loanRequestId: string) => {
      const { data } = await apiClient.post(
        `/loan-requests/decline-by-customer/${loanRequestId}`
      );
      return data;
    }
  });
};

export const useReferredLoanRequests = (
  apiClient: AxiosInstance | undefined,
  enabled: boolean = true
): UseQueryResult<LoanRequest[], Error> => {
  return useQuery({
    queryKey: [LOAN_REQUESTS_KEY, 'referred'],
    queryFn: async (): Promise<LoanRequest[]> => {
      if (!apiClient) throw new Error('API client not initialized');

      const response = await apiClient.get<LoanRequest[]>(
        '/loan-requests/referred-loan-requests'
      );
      return response.data;
    },
    enabled: !!apiClient && enabled
  });
};
