import usePortalQuery from "../../portal/hooks/usePortalQuery";
import supportService from "../services/supportService";
import type { AssignableUser } from "../../portal/types/portal.types";

export function useAssignableUsers() {
  return usePortalQuery<AssignableUser[]>(["support", "assignable-users"], () =>
    supportService.getUsers()
  );
}

export default useAssignableUsers;
