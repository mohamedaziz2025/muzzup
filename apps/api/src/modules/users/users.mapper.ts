import type { UserPublic } from "@muzzap/shared";
import type { UserDocument } from "../../models/user.model.js";

export function toUserPublic(user: UserDocument): UserPublic {
  return {
    id: user._id.toString(),
    fullName: user.fullName,
    pseudonym: user.pseudonym,
    roles: user.roles as UserPublic["roles"],
    capacities: user.capacities as UserPublic["capacities"],
    avatarUrl: user.avatarUrl ?? null,
    isSubscribed: user.roles.includes("subscriber"),
    createdAt: user.createdAt as Date,
  };
}
