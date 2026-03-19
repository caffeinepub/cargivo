import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface InvoiceData {
    customer: CustomerProfile;
    request: QuoteRequest;
    quotation: Quotation;
}
export interface RegisterCustomerProfileArgs {
    contactName: string;
    gstNumber: string;
    email: string;
    address: string;
    companyName: string;
    phone: string;
}
export interface QuoteRequestArgs {
    height: number;
    drawingFileId?: string;
    deliveryLocation: string;
    boxType: string;
    length: number;
    quantity: bigint;
    width: number;
    material: string;
}
export interface QuotationArgs {
    deliveryCharge: number;
    requestId: bigint;
    gstPercent: number;
    notes?: string;
    basePrice: number;
    validUntil: bigint;
}
export interface QuoteRequest {
    id: bigint;
    height: number;
    status: string;
    createdAt: bigint;
    drawingFileId?: string;
    deliveryLocation: string;
    boxType: string;
    length: number;
    quantity: bigint;
    customerId: Principal;
    width: number;
    adminNotes?: string;
    material: string;
}
export interface LoginEmailUserArgs {
    password: string;
    email: string;
}
export type GetEmailUserProfileResult = {
    __kind__: "ok";
    ok: CustomerProfile;
} | {
    __kind__: "errWrongPassword";
    errWrongPassword: string;
} | {
    __kind__: "errNotFound";
    errNotFound: string;
};
export interface GetEmailUserProfileArgs {
    password: string;
    email: string;
}
export interface CustomerProfile {
    contactName: string;
    gstNumber: string;
    email: string;
    address: string;
    companyName: string;
    phone: string;
}
export interface Order {
    requestId: bigint;
    manufacturingNotes?: string;
    deliveryTrackingInfo?: string;
    finalPaid: boolean;
    advancePaid: boolean;
    customerId: Principal;
}
export interface Quotation {
    deliveryCharge: number;
    requestId: bigint;
    gstPercent: number;
    sentAt: bigint;
    notes?: string;
    totalPrice: number;
    basePrice: number;
    validUntil: bigint;
}
export interface EmailProfileUpdateArgs {
    password: string;
    email: string;
    profile: CustomerProfile;
}
export interface RegisterEmailUserArgs {
    contactName: string;
    gstNumber: string;
    password: string;
    email: string;
    address: string;
    companyName: string;
    phone: string;
}
export type LoginEmailUserResult = {
    __kind__: "ok";
    ok: CustomerProfile;
} | {
    __kind__: "errWrongPassword";
    errWrongPassword: string;
} | {
    __kind__: "errNotFound";
    errNotFound: string;
};
export type UpdateEmailUserProfileResult = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "errWrongPassword";
    errWrongPassword: string;
} | {
    __kind__: "errNotFound";
    errNotFound: string;
};
export type RegisterEmailUserResult = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "errInvalid";
    errInvalid: string;
} | {
    __kind__: "errEmailTaken";
    errEmailTaken: string;
};
export interface OrderUpdateArgs {
    requestId: bigint;
    manufacturingNotes?: string;
    deliveryTrackingInfo?: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    approveQuote(requestId: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getAllCustomers(): Promise<Array<[Principal, CustomerProfile]>>;
    getAllQuoteRequests(): Promise<Array<QuoteRequest>>;
    getCallerUserProfile(): Promise<CustomerProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getEmailUserProfile(args: GetEmailUserProfileArgs): Promise<GetEmailUserProfileResult>;
    getInvoiceData(requestId: bigint): Promise<InvoiceData | null>;
    getMyProfile(): Promise<CustomerProfile | null>;
    getMyQuoteRequests(): Promise<Array<QuoteRequest>>;
    getOrder(requestId: bigint): Promise<Order | null>;
    getQuotation(requestId: bigint): Promise<Quotation | null>;
    getUserProfile(user: Principal): Promise<CustomerProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    loginEmailUser(args: LoginEmailUserArgs): Promise<LoginEmailUserResult>;
    markAdvancePaid(requestId: bigint): Promise<void>;
    registerCustomerProfile(args: RegisterCustomerProfileArgs): Promise<void>;
    registerEmailUser(args: RegisterEmailUserArgs): Promise<RegisterEmailUserResult>;
    rejectQuote(requestId: bigint): Promise<void>;
    saveCallerUserProfile(profile: CustomerProfile): Promise<void>;
    sendQuotation(args: QuotationArgs): Promise<void>;
    submitQuoteRequest(args: QuoteRequestArgs): Promise<bigint>;
    submitQuoteRequestWithEmail(email: string, password: string, args: QuoteRequestArgs): Promise<bigint>;
    getMyQuoteRequestsWithEmail(email: string, password: string): Promise<Array<QuoteRequest>>;
    updateEmailUserProfile(args: EmailProfileUpdateArgs): Promise<UpdateEmailUserProfileResult>;
    updateOrderStatus(args: OrderUpdateArgs): Promise<void>;
}
