import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";

function toQueryString<T extends object>(params: T): string {
  const usp = new URLSearchParams();
  Object.entries(params as Record<string, string | number | boolean | undefined>).forEach(([key, value]) => {
    if (value !== undefined && value !== "") usp.set(key, String(value));
  });
  return usp.toString();
}

// ---------------------------------------------------------------------------------------------
// KPIs
// ---------------------------------------------------------------------------------------------

export interface AdminKpis {
  mrrEur: number;
  activeSubscriptions: number;
  totalUsers: number;
  subscriberCount: number;
  listingsByStatus: Record<string, number>;
  dealsByStage: Record<string, number>;
  conversionRate: number;
  revenueEstimateEur: number;
}

export function useAdminKpis() {
  return useQuery({
    queryKey: ["admin", "kpis"],
    queryFn: () => apiFetch<AdminKpis>("/admin/kpis"),
  });
}

// ---------------------------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------------------------

export interface AdminUser {
  _id: string;
  email: string;
  fullName: string;
  pseudonym: string;
  avatarUrl: string | null;
  locale: string;
  roles: string[];
  capacities: string[];
  kycStatus: string;
  isBanned: boolean;
  bannedAt: string | null;
  banReason: string | null;
  lastLoginAt: string | null;
  emailVerifiedAt: string | null;
  createdAt: string;
}

export interface AuditLogEntry {
  _id: string;
  actorId: { _id: string; fullName: string; email: string } | string | null;
  action: string;
  targetType: string | null;
  targetId: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface AdminUsersParams {
  q?: string;
  role?: string;
  status?: "banned" | "active";
  page: number;
  pageSize: number;
}

export function useAdminUsers(params: AdminUsersParams) {
  return useQuery({
    queryKey: ["admin", "users", params],
    queryFn: () => apiFetch<{ users: AdminUser[] }>(`/admin/users?${toQueryString(params)}`),
  });
}

export function useCreateAdminUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { email: string; fullName: string; password: string; roles: string[] }) =>
      apiFetch<{ user: AdminUser }>("/admin/users", { method: "POST", body: input }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "users"] }),
  });
}

export function useUpdateAdminUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...patch
    }: {
      id: string;
      fullName?: string;
      roles?: string[];
      capacities?: string[];
    }) => apiFetch<{ user: AdminUser }>(`/admin/users/${id}`, { method: "PATCH", body: patch }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "users"] }),
  });
}

export function useVerifyAdminUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<{ user: AdminUser }>(`/admin/users/${id}/verify`, { method: "POST" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "users"] }),
  });
}

export function useAdminUserHistory(id: string) {
  return useQuery({
    queryKey: ["admin", "users", id, "history"],
    queryFn: () => apiFetch<{ entries: AuditLogEntry[] }>(`/admin/users/${id}/history`),
    enabled: !!id,
  });
}

export function useBanUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      apiFetch(`/admin/users/${id}/ban`, { method: "POST", body: { reason } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "users"] }),
  });
}

export function useUnbanUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch(`/admin/users/${id}/unban`, { method: "POST" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "users"] }),
  });
}

// ---------------------------------------------------------------------------------------------
// Listings
// ---------------------------------------------------------------------------------------------

export interface PopulatedRef {
  _id: string;
  fullName?: string;
  email?: string;
  pseudonym?: string;
  title?: string;
}

export interface AdminListing {
  _id: string;
  sellerId: PopulatedRef | string;
  type: string;
  status: string;
  title: string;
  summary: string;
  sector: string;
  foundedAt: string;
  financials: {
    monthlyRevenue: number;
    monthlyProfit: number;
    annualRevenue: number;
    annualProfit: number;
    askingPrice: number;
    valuationMultiple: number | null;
  };
  halalVerified: boolean;
  isFeatured: boolean;
  rejectionReason: string | null;
  viewsCount: number;
  publishedAt: string | null;
  soldAt: string | null;
  createdAt: string;
}

export interface AdminListingsParams {
  status?: string;
  sector?: string;
  q?: string;
  page: number;
  pageSize: number;
}

export function useAdminListings(params: AdminListingsParams) {
  return useQuery({
    queryKey: ["admin", "listings", params],
    queryFn: () => apiFetch<{ listings: AdminListing[] }>(`/admin/listings?${toQueryString(params)}`),
  });
}

export function useApproveListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<{ listing: AdminListing }>(`/admin/listings/${id}/approve`, { method: "POST" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "listings"] }),
  });
}

export function useRejectListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      apiFetch<{ listing: AdminListing }>(`/admin/listings/${id}/reject`, {
        method: "POST",
        body: { reason },
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "listings"] }),
  });
}

export function useArchiveListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<{ listing: AdminListing }>(`/admin/listings/${id}/archive`, { method: "POST" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "listings"] }),
  });
}

export function useFeatureListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isFeatured }: { id: string; isFeatured: boolean }) =>
      apiFetch<{ listing: AdminListing }>(`/admin/listings/${id}/feature`, {
        method: "POST",
        body: { isFeatured },
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "listings"] }),
  });
}

export function useVerifyShariaListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<{ listing: AdminListing }>(`/admin/listings/${id}/verify-sharia`, { method: "POST" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "listings"] }),
  });
}

export function useDeleteListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<{ deleted: boolean }>(`/admin/listings/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "listings"] }),
  });
}

// ---------------------------------------------------------------------------------------------
// Sharia verification workspace
// ---------------------------------------------------------------------------------------------

export interface AuditItem {
  key: string;
  label: string;
  passed: boolean | null;
  note: string;
}

export interface AuditJournalEntry {
  action: string;
  actorId: { _id: string; fullName: string } | string;
  at: string;
  metadata: Record<string, unknown>;
}

export interface AdminHalalAudit {
  _id: string;
  listingId: { _id: string; title: string; sector: string } | string;
  sellerId: string;
  auditorId: { _id: string; fullName: string } | string | null;
  status: "queued" | "in_progress" | "completed";
  decision: "approved" | "rejected" | null;
  items: AuditItem[];
  vigilancePoints: string[];
  reportSummary: string;
  claimedAt: string | null;
  completedAt: string | null;
  journal: AuditJournalEntry[];
  createdAt: string;
}

export interface AiAnalysis {
  _id: string;
  type: string;
  output: unknown;
  humanVerdict: "confirmed" | "overridden" | null;
  humanVerdictNote: string | null;
  createdAt: string;
}

export interface AdminHalalAuditListItem {
  audit: AdminHalalAudit;
  aiAnalysis: AiAnalysis | null;
}

export interface AdminHalalAuditsParams {
  status?: string;
  page: number;
  pageSize: number;
}

export function useAdminHalalAudits(params: AdminHalalAuditsParams) {
  return useQuery({
    queryKey: ["admin", "halal-audits", params],
    queryFn: () =>
      apiFetch<{ audits: AdminHalalAuditListItem[] }>(`/admin/halal-audits?${toQueryString(params)}`),
  });
}

export function useAdminHalalAudit(id: string) {
  return useQuery({
    queryKey: ["admin", "halal-audits", id],
    queryFn: () =>
      apiFetch<{ audit: AdminHalalAudit; aiAnalysis: AiAnalysis | null }>(`/admin/halal-audits/${id}`),
    enabled: !!id,
  });
}

export function useCommentHalalAudit(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (text: string) =>
      apiFetch<{ audit: AdminHalalAudit }>(`/admin/halal-audits/${id}/comment`, {
        method: "POST",
        body: { text },
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "halal-audits"] }),
  });
}

// ---------------------------------------------------------------------------------------------
// Transactions (deal pipeline)
// ---------------------------------------------------------------------------------------------

export interface AdminDeal {
  _id: string;
  listingId: { _id: string; title: string } | string;
  buyerId: { _id: string; fullName: string; email: string } | string;
  sellerId: { _id: string; fullName: string; email: string } | string;
  stage: string;
  status: string;
  frozenReason: string | null;
  agreedPrice: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminDealListItem {
  deal: AdminDeal;
  commission: number | null;
}

export interface AdminDealsParams {
  status?: string;
  stage?: string;
  page: number;
  pageSize: number;
}

export function useAdminDeals(params: AdminDealsParams) {
  return useQuery({
    queryKey: ["admin", "deals", params],
    queryFn: () => apiFetch<{ deals: AdminDealListItem[] }>(`/admin/deals?${toQueryString(params)}`),
  });
}

export function useAdminDeal(id: string) {
  return useQuery({
    queryKey: ["admin", "deals", id],
    queryFn: () => apiFetch<{ deal: AdminDeal; commission: number | null }>(`/admin/deals/${id}`),
    enabled: !!id,
  });
}

export function useSetDealPrice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, agreedPrice }: { id: string; agreedPrice: number }) =>
      apiFetch<{ deal: AdminDeal }>(`/admin/deals/${id}/price`, {
        method: "PATCH",
        body: { agreedPrice },
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "deals"] }),
  });
}

// ---------------------------------------------------------------------------------------------
// Messages moderation
// ---------------------------------------------------------------------------------------------

export interface AdminConversation {
  _id: string;
  listingId: { _id: string; title: string } | null;
  participantIds: ({ _id: string; fullName: string; email: string } | string)[];
  revealPhase: string;
  lastMessageAt: string | null;
  lastMessagePreview: string | null;
  flaggedCount: number;
  adminBlocked: boolean;
  adminBlockedReason: string | null;
  updatedAt: string;
}

export interface AdminMessage {
  _id: string;
  conversationId: string;
  senderId: string;
  body: string;
  flagged: boolean;
  deletedAt: string | null;
  createdAt: string;
}

export interface AdminConversationsParams {
  flaggedOnly?: boolean;
  q?: string;
  page: number;
  pageSize: number;
}

export function useAdminConversations(params: AdminConversationsParams) {
  return useQuery({
    queryKey: ["admin", "conversations", params],
    queryFn: () =>
      apiFetch<{ conversations: AdminConversation[] }>(`/admin/conversations?${toQueryString(params)}`),
  });
}

export function useAdminConversationMessages(id: string) {
  return useQuery({
    queryKey: ["admin", "conversations", id, "messages"],
    queryFn: () => apiFetch<{ messages: AdminMessage[] }>(`/admin/conversations/${id}/messages`),
    enabled: !!id,
  });
}

export function useBlockConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      apiFetch<{ conversation: AdminConversation }>(`/admin/conversations/${id}/block`, {
        method: "POST",
        body: { reason },
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "conversations"] }),
  });
}

export function useUnblockConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<{ conversation: AdminConversation }>(`/admin/conversations/${id}/unblock`, {
        method: "POST",
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "conversations"] }),
  });
}

export function useDeleteAdminMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ conversationId, messageId }: { conversationId: string; messageId: string }) =>
      apiFetch<{ message: AdminMessage }>(
        `/admin/conversations/${conversationId}/messages/${messageId}`,
        { method: "DELETE" },
      ),
    onSuccess: (_data, variables) =>
      queryClient.invalidateQueries({
        queryKey: ["admin", "conversations", variables.conversationId, "messages"],
      }),
  });
}

// ---------------------------------------------------------------------------------------------
// Reports
// ---------------------------------------------------------------------------------------------

export interface AdminReport {
  _id: string;
  reporterId: { _id: string; fullName: string; email: string } | string;
  targetType: string;
  targetId: string;
  reason: string;
  details: string;
  status: "open" | "resolved" | "dismissed";
  resolutionNote: string | null;
  createdAt: string;
}

export interface AdminReportsParams {
  status?: string;
  targetType?: string;
  page: number;
  pageSize: number;
}

export function useAdminReports(params: AdminReportsParams) {
  return useQuery({
    queryKey: ["admin", "reports", params],
    queryFn: () => apiFetch<{ reports: AdminReport[] }>(`/admin/reports?${toQueryString(params)}`),
  });
}

export function useResolveReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action, note }: { id: string; action: "resolve" | "dismiss"; note?: string }) =>
      apiFetch<{ report: AdminReport }>(`/admin/reports/${id}/resolve`, {
        method: "POST",
        body: { action, ...(note ? { note } : {}) },
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "reports"] }),
  });
}

// ---------------------------------------------------------------------------------------------
// CMS
// ---------------------------------------------------------------------------------------------

export interface CmsEntry {
  _id: string;
  key: string;
  locale: "fr" | "en" | "ar";
  value: string;
  updatedBy: string | null;
  updatedAt: string;
}

export function useAdminCms(locale?: string) {
  return useQuery({
    queryKey: ["admin", "cms", locale ?? "all"],
    queryFn: () => apiFetch<{ entries: CmsEntry[] }>(`/admin/cms${locale ? `?locale=${locale}` : ""}`),
  });
}

export function useUpsertCms() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { key: string; locale: string; value: string }) =>
      apiFetch<{ entry: CmsEntry }>("/admin/cms", { method: "PUT", body: input }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "cms"] }),
  });
}

// ---------------------------------------------------------------------------------------------
// Platform settings
// ---------------------------------------------------------------------------------------------

export interface PlatformSettings {
  _id: string;
  commissionRate: number;
  currencies: string[];
  countries: string[];
  languages: string[];
  registrationOpen: boolean;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  supportEmail: string;
}

export interface AdminInfrastructure {
  emailProvider: string;
  aiProvider: string;
  storageProvider: string;
}

export function useAdminSettings() {
  return useQuery({
    queryKey: ["admin", "settings"],
    queryFn: () => apiFetch<{ settings: PlatformSettings }>("/admin/settings"),
  });
}

export function useUpdateAdminSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (patch: Partial<Omit<PlatformSettings, "_id">>) =>
      apiFetch<{ settings: PlatformSettings }>("/admin/settings", { method: "PATCH", body: patch }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "settings"] }),
  });
}

export function useAdminInfrastructure() {
  return useQuery({
    queryKey: ["admin", "settings", "infrastructure"],
    queryFn: () => apiFetch<AdminInfrastructure>("/admin/settings/infrastructure"),
  });
}

// ---------------------------------------------------------------------------------------------
// Logs
// ---------------------------------------------------------------------------------------------

export interface AdminLogsParams {
  action?: string;
  actorId?: string;
  from?: string;
  to?: string;
  page: number;
  pageSize: number;
}

export function useAdminLogs(params: AdminLogsParams) {
  return useQuery({
    queryKey: ["admin", "logs", params],
    queryFn: () => apiFetch<{ logs: AuditLogEntry[] }>(`/admin/logs?${toQueryString(params)}`),
  });
}

// ---------------------------------------------------------------------------------------------
// Analytics
// ---------------------------------------------------------------------------------------------

export interface AnalyticsPoint {
  date: string;
  count: number;
}

export interface AdminAnalytics {
  signups: AnalyticsPoint[];
  listingSubmissions: AnalyticsPoint[];
  completedDeals: AnalyticsPoint[];
}

export function useAdminAnalytics(range: "7d" | "30d" | "90d") {
  return useQuery({
    queryKey: ["admin", "analytics", range],
    queryFn: () => apiFetch<AdminAnalytics>(`/admin/analytics?range=${range}`),
  });
}
