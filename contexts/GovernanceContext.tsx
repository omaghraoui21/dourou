import React, { createContext, useContext } from 'react';
import { useGovernance } from '@/hooks/useGovernance';
import MaintenanceScreen from '@/components/governance/MaintenanceScreen';
import AccountSuspendedScreen from '@/components/governance/AccountSuspendedScreen';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

interface GovernanceContextValue {
  maintenanceMode: boolean;
  appKillSwitch: boolean;
  maintenanceMessage: string | null;
  accountStatus: 'active' | 'suspended' | 'banned';
  isRestricted: boolean;
  canWrite: boolean;
}

const GovernanceContext = createContext<GovernanceContextValue | undefined>(
  undefined
);

export function GovernanceProvider({ children }: { children: React.ReactNode }) {
  const governance = useGovernance();

  // Show loading screen while checking governance
  if (governance.isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // Show maintenance screen if maintenance mode or kill switch is active
  if (governance.maintenanceMode || governance.appKillSwitch) {
    return (
      <MaintenanceScreen
        message={governance.maintenanceMessage || undefined}
        isKillSwitch={governance.appKillSwitch}
      />
    );
  }

  // Show account suspended/banned screen if user account is restricted
  if (governance.accountStatus === 'suspended' || governance.accountStatus === 'banned') {
    return (
      <AccountSuspendedScreen
        status={governance.accountStatus}
        reason={
          governance.accountStatus === 'suspended'
            ? governance.suspendedReason || undefined
            : governance.bannedReason || undefined
        }
        suspendedAt={governance.suspendedAt || undefined}
        bannedAt={governance.bannedAt || undefined}
      />
    );
  }

  // Normal app operation
  const contextValue: GovernanceContextValue = {
    maintenanceMode: governance.maintenanceMode,
    appKillSwitch: governance.appKillSwitch,
    maintenanceMessage: governance.maintenanceMessage,
    accountStatus: governance.accountStatus,
    isRestricted:
      governance.accountStatus !== 'active' ||
      governance.maintenanceMode ||
      governance.appKillSwitch,
    canWrite:
      governance.accountStatus === 'active' &&
      !governance.maintenanceMode &&
      !governance.appKillSwitch,
  };

  return (
    <GovernanceContext.Provider value={contextValue}>
      {children}
    </GovernanceContext.Provider>
  );
}

export function useGovernanceContext() {
  const context = useContext(GovernanceContext);
  if (context === undefined) {
    throw new Error(
      'useGovernanceContext must be used within a GovernanceProvider'
    );
  }
  return context;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});
