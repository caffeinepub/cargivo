import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CustomerProfile,
  InvoiceData,
  Order,
  OrderUpdateArgs,
  Quotation,
  QuotationArgs,
  QuoteRequest,
  QuoteRequestArgs,
  RegisterCustomerProfileArgs,
} from "../backend.d";
import type { UserRole } from "../backend.d";
import { useActor } from "./useActor";
import { useAdminAuth } from "./useAdminAuth";
import { useEmailAuth } from "./useEmailAuth";

export type {
  CustomerProfile,
  QuoteRequest,
  Quotation,
  Order,
  InvoiceData,
  UserRole,
};

export function useGetMyProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const query = useQuery<CustomerProfile | null>({
    queryKey: ["myProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getMyProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useIsCallerAdmin() {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isCallerAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetMyQuoteRequests() {
  const { actor, isFetching: actorFetching } = useActor();
  const { isEmailAuthenticated, emailUser } = useEmailAuth();
  const emailSession = isEmailAuthenticated
    ? JSON.parse(localStorage.getItem("cargivo_email_session") || "null")
    : null;
  return useQuery<QuoteRequest[]>({
    queryKey: [
      "myQuoteRequests",
      isEmailAuthenticated ? emailUser?.email : "ii",
    ],
    queryFn: async () => {
      if (isEmailAuthenticated && emailSession) {
        if (!actor) return [];
        return actor.getMyQuoteRequestsWithEmail(
          emailSession.email,
          emailSession.password,
        );
      }
      if (!actor) return [];
      return actor.getMyQuoteRequests();
    },
    enabled: !!actor && !actorFetching,
  });
}

// Admin email-authenticated queries
export function useAdminGetAllQuoteRequests() {
  const { actor, isFetching: actorFetching } = useActor();
  const { adminSession } = useAdminAuth();
  const query = useQuery<QuoteRequest[]>({
    queryKey: ["adminAllQuoteRequests", adminSession?.email],
    queryFn: async () => {
      if (!actor || !adminSession) return [];
      try {
        const result = await actor.getAllQuoteRequestsAdmin(
          adminSession.email,
          adminSession.password,
        );
        console.log("[Admin] getAllQuoteRequestsAdmin result:", result);
        return result;
      } catch (err) {
        console.error("[Admin] getAllQuoteRequestsAdmin error:", err);
        throw err;
      }
    },
    enabled: !!actor && !actorFetching && !!adminSession,
    refetchInterval: 30000,
    retry: 1,
  });
  return {
    ...query,
    isError: query.isError,
    error: query.error,
  };
}

export function useAdminGetAllCustomers() {
  const { actor, isFetching: actorFetching } = useActor();
  const { adminSession } = useAdminAuth();
  const query = useQuery<CustomerProfile[]>({
    queryKey: ["adminAllEmailCustomers", adminSession?.email],
    queryFn: async () => {
      if (!actor || !adminSession) return [];
      try {
        const result = await actor.getAllEmailCustomersAdmin(
          adminSession.email,
          adminSession.password,
        );
        console.log("[Admin] getAllEmailCustomersAdmin result:", result);
        return result;
      } catch (err) {
        console.error("[Admin] getAllEmailCustomersAdmin error:", err);
        throw err;
      }
    },
    enabled: !!actor && !actorFetching && !!adminSession,
    retry: 1,
  });
  return {
    ...query,
    isError: query.isError,
    error: query.error,
  };
}

export function useAdminGetOrder(requestId: bigint | null) {
  const { actor, isFetching: actorFetching } = useActor();
  const { adminSession } = useAdminAuth();
  return useQuery<Order | null>({
    queryKey: ["adminOrder", requestId?.toString()],
    queryFn: async () => {
      if (!actor || !adminSession || requestId === null) return null;
      return actor.getOrder(requestId);
    },
    enabled: !!actor && !actorFetching && !!adminSession && requestId !== null,
  });
}

export function useAdminSendQuotation() {
  const { actor } = useActor();
  const { adminSession } = useAdminAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (args: QuotationArgs) => {
      if (!actor || !adminSession)
        throw new Error("Not authenticated as admin");
      return actor.sendQuotationAdmin(
        adminSession.email,
        adminSession.password,
        args,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminAllQuoteRequests"] });
    },
  });
}

export function useAdminMarkAdvancePaid() {
  const { actor } = useActor();
  const { adminSession } = useAdminAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (requestId: bigint) => {
      if (!actor || !adminSession)
        throw new Error("Not authenticated as admin");
      return actor.markAdvancePaidAdmin(
        adminSession.email,
        adminSession.password,
        requestId,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminAllQuoteRequests"] });
      queryClient.invalidateQueries({ queryKey: ["adminOrder"] });
    },
  });
}

export function useAdminUpdateOrderStatus() {
  const { actor } = useActor();
  const { adminSession } = useAdminAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (args: OrderUpdateArgs) => {
      if (!actor || !adminSession)
        throw new Error("Not authenticated as admin");
      return actor.updateOrderStatusAdmin(
        adminSession.email,
        adminSession.password,
        args,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminAllQuoteRequests"] });
      queryClient.invalidateQueries({ queryKey: ["adminOrder"] });
    },
  });
}

export function useAdminUpdateRequestStatus() {
  const { actor } = useActor();
  const { adminSession } = useAdminAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      requestId,
      status,
    }: { requestId: bigint; status: string }) => {
      if (!actor || !adminSession)
        throw new Error("Not authenticated as admin");
      return actor.updateRequestStatusAdmin(
        adminSession.email,
        adminSession.password,
        requestId,
        status,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminAllQuoteRequests"] });
    },
  });
}

export function useAdminClearAllData() {
  const { actor } = useActor();
  const { adminSession } = useAdminAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor || !adminSession)
        throw new Error("Not authenticated as admin");
      return actor.clearAllDataAdmin(adminSession.email, adminSession.password);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminAllQuoteRequests"] });
      queryClient.invalidateQueries({ queryKey: ["adminAllEmailCustomers"] });
      queryClient.invalidateQueries({ queryKey: ["adminOrder"] });
    },
  });
}

// Legacy II-based admin queries (kept for backward compat)
export function useGetAllQuoteRequests() {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery<QuoteRequest[]>({
    queryKey: ["allQuoteRequests"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllQuoteRequests();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetAllCustomers() {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery<Array<[any, CustomerProfile]>>({
    queryKey: ["allCustomers"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllCustomers();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetQuotation(requestId: bigint | null) {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery<Quotation | null>({
    queryKey: ["quotation", requestId?.toString()],
    queryFn: async () => {
      if (!actor || requestId === null) return null;
      return actor.getQuotation(requestId);
    },
    enabled: !!actor && !actorFetching && requestId !== null,
  });
}

export function useGetOrder(requestId: bigint | null) {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery<Order | null>({
    queryKey: ["order", requestId?.toString()],
    queryFn: async () => {
      if (!actor || requestId === null) return null;
      return actor.getOrder(requestId);
    },
    enabled: !!actor && !actorFetching && requestId !== null,
  });
}

export function useGetInvoiceData(requestId: bigint | null) {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery<InvoiceData | null>({
    queryKey: ["invoiceData", requestId?.toString()],
    queryFn: async () => {
      if (!actor || requestId === null) return null;
      return actor.getInvoiceData(requestId);
    },
    enabled: !!actor && !actorFetching && requestId !== null,
  });
}

export function useRegisterCustomerProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (args: RegisterCustomerProfileArgs) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.registerCustomerProfile(args);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myProfile"] });
    },
  });
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: CustomerProfile) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myProfile"] });
    },
  });
}

export function useSubmitQuoteRequest() {
  const { actor } = useActor();
  const { isEmailAuthenticated } = useEmailAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (args: QuoteRequestArgs) => {
      if (!actor) throw new Error("Not authenticated");
      const emailSession = isEmailAuthenticated
        ? JSON.parse(localStorage.getItem("cargivo_email_session") || "null")
        : null;
      if (isEmailAuthenticated && emailSession) {
        return actor.submitQuoteRequestWithEmail(
          emailSession.email,
          emailSession.password,
          args,
        );
      }
      return actor.submitQuoteRequest(args);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myQuoteRequests"] });
    },
  });
}

export function useApproveQuote() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (requestId: bigint) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.approveQuote(requestId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myQuoteRequests"] });
      queryClient.invalidateQueries({ queryKey: ["allQuoteRequests"] });
    },
  });
}

export function useRejectQuote() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (requestId: bigint) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.rejectQuote(requestId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myQuoteRequests"] });
      queryClient.invalidateQueries({ queryKey: ["allQuoteRequests"] });
    },
  });
}

export function useSendQuotation() {
  const { actor } = useActor();
  const { adminSession } = useAdminAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (args: QuotationArgs) => {
      if (!actor || !adminSession) throw new Error("Not authenticated");
      return actor.sendQuotationAdmin(
        adminSession.email,
        adminSession.password,
        args,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allQuoteRequests"] });
    },
  });
}

export function useMarkAdvancePaid() {
  const { actor } = useActor();
  const { adminSession } = useAdminAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (requestId: bigint) => {
      if (!actor || !adminSession) throw new Error("Not authenticated");
      return actor.markAdvancePaidAdmin(
        adminSession.email,
        adminSession.password,
        requestId,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allQuoteRequests"] });
    },
  });
}

export function useUpdateOrderStatus() {
  const { actor } = useActor();
  const { adminSession } = useAdminAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (args: OrderUpdateArgs) => {
      if (!actor || !adminSession) throw new Error("Not authenticated");
      return actor.updateOrderStatusAdmin(
        adminSession.email,
        adminSession.password,
        args,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allQuoteRequests"] });
      queryClient.invalidateQueries({ queryKey: ["order"] });
    },
  });
}
