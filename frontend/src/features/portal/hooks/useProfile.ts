import usePortalQuery from "./usePortalQuery";
import portalService from "../services/portalService";
import type { PortalProfile } from "../types/portal.types";

export function useProfile() {
  return usePortalQuery<PortalProfile>(["portal", "profile"], () => portalService.getProfile());
}

export default useProfile;