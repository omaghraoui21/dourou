import { useUser } from '@/contexts/UserContext';
import { hasSuperAdminPrivileges } from '@/config/superAdmin';

/**
 * Hook to check if the current user has super admin privileges
 */
export const useSuperAdmin = () => {
  const { user, isSuperAdmin } = useUser();

  return {
    isSuperAdmin,
    hasSuperAdminPrivileges: hasSuperAdminPrivileges(user),
    user,
  };
};
