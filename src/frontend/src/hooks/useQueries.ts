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
  return useQuery<QuoteRequest[]>({
    queryKey: ["myQuoteRequests"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyQuoteRequests();
    },
    enabled: !!actor && !actorFetching,
  });
}

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
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (args: QuoteRequestArgs) => {
      if (!actor) throw new Error("Not authenticated");
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
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (args: QuotationArgs) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.sendQuotation(args);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allQuoteRequests"] });
    },
  });
}

export function useMarkAdvancePaid() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (requestId: bigint) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.markAdvancePaid(requestId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allQuoteRequests"] });
    },
  });
}

export function useUpdateOrderStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (args: OrderUpdateArgs) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.updateOrderStatus(args);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allQuoteRequests"] });
      queryClient.invalidateQueries({ queryKey: ["order"] });
    },
  });
}
