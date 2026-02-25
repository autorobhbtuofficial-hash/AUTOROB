/**
 * Role Utility — Centralized access control helpers.
 *
 * SECURITY: Role values are not stored as plain string literals in this module.
 * They are derived at runtime so that static bundle analysis does not trivially
 * reveal the privilege-role mapping. Combined with Firestore server-side rules,
 * knowing the role names gives an attacker zero ability to escalate privileges.
 *
 * How it works:
 * - We build the role strings from innocuous-looking character arrays.
 * - All role comparisons in the app go through the helpers below.
 * - Alert/UI messages never expose role names directly.
 */

// Build role identifiers at runtime — avoids plain-text literals in bundle
const _r = (parts) => parts.join('');

// Internal role tokens — do NOT export these raw strings
const _R = {
    HI: _r(['s', 'e', 'n', 's', 'e', 'i']),   // highest privilege
    MID: _r(['s', 'e', 'n', 'p', 'a', 'i']),   // mid privilege
    LO: _r(['u', 's', 'e', 'r']),           // base role
};

/**
 * Returns true if the given role has full admin privileges.
 * @param {string|null} role
 */
export const isAdmin = (role) => role === _R.HI;

/**
 * Returns true if the given role has sub-admin privileges.
 * @param {string|null} role
 */
export const isSubAdmin = (role) => role === _R.MID;

/**
 * Returns true if the role has any elevated privileges (admin OR sub-admin).
 * @param {string|null} role
 */
export const isElevated = (role) => role === _R.HI || role === _R.MID;

/**
 * Returns true if the role is the base user role (no privilege).
 * @param {string|null} role
 */
export const isUser = (role) => !role || role === _R.LO;

/**
 * Returns true if the given role is included in the allowed roles array.
 * Accepts string or array.
 * @param {string|null} role
 * @param {string|string[]} allowed
 */
export const hasRole = (role, allowed) => {
    if (Array.isArray(allowed)) {
        return allowed.some(a => role === a);
    }
    return role === allowed;
};

/**
 * The role token for admin — use ONLY where you must pass the raw value
 * (e.g. Firestore write, AuthContext initial set). Prefer isAdmin() for comparisons.
 * @returns {string}
 */
export const adminRole = () => _R.HI;

/**
 * The role token for sub-admin.
 * @returns {string}
 */
export const subAdminRole = () => _R.MID;

/**
 * The role token for base user.
 * @returns {string}
 */
export const userRole = () => _R.LO;

/**
 * Returns a generic display label for a role — never exposes internal role name.
 * @param {string|null} role
 * @returns {string}
 */
export const getRoleLabel = (role) => {
    if (role === _R.HI) return 'Head';
    if (role === _R.MID) return 'Co-Head';
    return 'Member';
};

/**
 * Generic "permission denied" message — never hints at what role is required.
 * @returns {string}
 */
export const accessDeniedMsg = () => 'You do not have permission to perform this action.';
