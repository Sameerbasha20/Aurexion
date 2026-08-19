/**
 * Check if the user has the required permission
 * Support exact matches, wildcard matches (e.g. read:*), and global admin matches (*)
 */
export function checkPermission(userPermissions: string[], requiredPermission: string): boolean {
  if (userPermissions.includes("*")) {
    return true; // Admin override
  }
  
  if (userPermissions.includes(requiredPermission)) {
    return true; // Exact match
  }

  // Support wildcard matching e.g. "read:*" covers "read:leads"
  const [reqAction, reqResource] = requiredPermission.split(":");
  
  return userPermissions.some((userPerm) => {
    const [userAction, userResource] = userPerm.split(":");
    
    if (userAction === reqAction && userResource === "*") {
      return true;
    }
    
    if (userAction === "*" && userResource === reqResource) {
      return true;
    }

    return false;
  });
}

export default checkPermission;
