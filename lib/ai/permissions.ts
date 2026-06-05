export type UserRole = "admin" | "user"

export interface PermissionCheck {
  allowed: boolean
  reason: string | null
}

const ROLE_HIERARCHY: Record<UserRole, number> = {
  admin: 100,
  user: 10,
}

/**
 * Check if a user has the required role level.
 * Admins can do everything; users are scoped to own data.
 */
export function requireRole(userRole: string, minimum: UserRole): PermissionCheck {
  const userLevel = ROLE_HIERARCHY[userRole as UserRole] ?? 0
  const minLevel = ROLE_HIERARCHY[minimum]
  if (userLevel >= minLevel) {
    return { allowed: true, reason: null }
  }
  return { allowed: false, reason: `Requires role "${minimum}" (current: "${userRole}")` }
}

/**
 * Check if user can access a resource owned by a specific user.
 * Admins can access any resource; users can only access their own.
 */
export function canAccessResource(
  requestorRole: string,
  requestorId: string,
  resourceOwnerId: string
): PermissionCheck {
  if (requestorRole === "admin") {
    return { allowed: true, reason: null }
  }
  if (requestorId === resourceOwnerId) {
    return { allowed: true, reason: null }
  }
  return { allowed: false, reason: "Cannot access another user's data" }
}
