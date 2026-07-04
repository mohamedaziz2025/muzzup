/** System roles: access-control tiers, not business capacities. */
export const SYSTEM_ROLES = [
  "visitor",
  "member",
  "subscriber",
  "halal_auditor",
  "admin",
  "superadmin",
] as const;
export type SystemRole = (typeof SYSTEM_ROLES)[number];

/** Business capacities: cumulable on a single member profile, not separate accounts. */
export const MEMBER_CAPACITIES = ["buyer", "seller", "provider"] as const;
export type MemberCapacity = (typeof MEMBER_CAPACITIES)[number];

/** Role hierarchy weight used by RBAC middleware for "at least" checks. */
export const ROLE_WEIGHT: Record<SystemRole, number> = {
  visitor: 0,
  member: 1,
  subscriber: 2,
  halal_auditor: 3,
  admin: 4,
  superadmin: 5,
};
