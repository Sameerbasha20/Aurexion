import usePortalQuery from "../../portal/hooks/usePortalQuery";
import supportService, { type ExecutiveDashboardStats } from "../services/supportService";

export function useExecutiveDashboardStats() {
  return usePortalQuery<ExecutiveDashboardStats>(["support", "dashboard-stats"], () =>
    supportService.getExecutiveDashboardStats()
  );
}

export default useExecutiveDashboardStats;