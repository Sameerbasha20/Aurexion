import useAuth from "./useAuth";

export function useRole(requiredRole: string): boolean {
  const { user, hasRole } = useAuth();
  if (!user) return false;
  return hasRole(requiredRole);
}

export default useRole;
