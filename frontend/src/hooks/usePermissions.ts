import useAuth from "./useAuth";

export function usePermissions(requiredPermissions: string[] | string): boolean {
  const { user, hasPermission } = useAuth();
  if (!user) return false;

  const permissionsToCheck = Array.isArray(requiredPermissions) 
    ? requiredPermissions 
    : [requiredPermissions];

  return permissionsToCheck.every((perm) => hasPermission(perm));
}

export default usePermissions;
