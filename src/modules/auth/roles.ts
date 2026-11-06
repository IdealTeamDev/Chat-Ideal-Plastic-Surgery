export const STAFF_ROLES = ["admin", "supervisor", "agent"] as const;
export type StaffRole = (typeof STAFF_ROLES)[number];

export const AGENT_AVAILABILITY_STATES = [
  "available",
  "away",
  "offline",
] as const;
export type AgentAvailability = (typeof AGENT_AVAILABILITY_STATES)[number];

export type StaffPermission =
  | "conversations:read:assigned"
  | "conversations:read:all"
  | "conversations:reply"
  | "conversations:assign:self_or_transfer"
  | "conversations:assign:any"
  | "notes:write"
  | "agents:manage_availability"
  | "metrics:read"
  | "users:manage"
  | "settings:manage";

const ROLE_PERMISSIONS: Record<StaffRole, readonly StaffPermission[]> = {
  admin: [
    "conversations:read:assigned",
    "conversations:read:all",
    "conversations:reply",
    "conversations:assign:self_or_transfer",
    "conversations:assign:any",
    "notes:write",
    "agents:manage_availability",
    "metrics:read",
    "users:manage",
    "settings:manage",
  ],
  supervisor: [
    "conversations:read:assigned",
    "conversations:read:all",
    "conversations:reply",
    "conversations:assign:self_or_transfer",
    "conversations:assign:any",
    "notes:write",
    "agents:manage_availability",
    "metrics:read",
  ],
  agent: [
    "conversations:read:assigned",
    "conversations:reply",
    "conversations:assign:self_or_transfer",
    "notes:write",
  ],
};

export function hasPermission(
  role: StaffRole,
  permission: StaffPermission
): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}

export function getPermissionsForRole(
  role: StaffRole
): readonly StaffPermission[] {
  return ROLE_PERMISSIONS[role];
}
