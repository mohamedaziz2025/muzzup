import type { SystemRole, MemberCapacity } from "@muzzap/shared";

declare global {
  namespace Express {
    interface Request {
      validatedQuery?: unknown;
      validatedParams?: unknown;
      auth?: {
        userId: string;
        roles: SystemRole[];
        capacities: MemberCapacity[];
      };
    }
  }
}

export {};
