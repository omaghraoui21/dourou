# Dourou Governance Layer - Usage Guide

## Overview
The Dourou Governance Layer provides comprehensive control over user accounts, tontines, and app-wide settings to ensure security, compliance, and founder-level control for public launch.

## Features Implemented

### 1. Account & User Control
- **Account Status**: Active, Suspended, or Banned
- **TOS Tracking**: Track which version of Terms of Service each user accepted
- **Security Auditing**: Track last login IP for abuse detection
- **Automatic Enforcement**: Suspended/banned users are automatically blocked from all write operations

### 2. Tontine Governance
- **Frozen State**: Lock all financial operations (payments, round progression)
- **Governance Flags**: Mark tontines as 'Under Review' or 'Disputed'
- **Read-Only Access**: Users can view frozen tontine data but cannot make changes

### 3. Global App Controls
- **Maintenance Mode**: Show professional maintenance screen to all users
- **Kill-Switch**: Emergency app shutdown capability
- **Premium UI**: High-end overlays for all governance states

### 4. Security & RLS
- **Enforced Policies**: Database-level enforcement of account statuses
- **Admin Override**: Founder account can bypass restrictions
- **Immutable Audit Log**: Track all governance actions

### 5. Backend Toolkit
- **RPC Functions**: Secure functions for governance operations
- **Monitoring Views**: Track invitation failures, payment defaults, disputes
- **Metrics Dashboard**: Real-time governance metrics

## Usage in Your App

### Check Account Status in Components

```typescript
import { useGovernance } from '@/hooks/useGovernance';

function MyComponent() {
  const { accountStatus, canWrite, maintenanceMode } = useGovernance();

  if (!canWrite) {
    return <Text>You cannot perform this action</Text>;
  }

  // Your component logic
}
```

### Check Tontine Frozen State

```typescript
import { useTontineFrozen } from '@/hooks/useGovernance';
import TontineFrozenOverlay from '@/components/governance/TontineFrozenOverlay';

function TontineScreen({ tontineId }: { tontineId: string }) {
  const frozen = useTontineFrozen(tontineId);
  const [showOverlay, setShowOverlay] = useState(false);

  if (frozen.isFrozen) {
    return (
      <>
        <TontineDetails tontineId={tontineId} />
        <TontineFrozenOverlay
          visible={true}
          reason={frozen.frozenReason}
          governanceFlag={frozen.governanceFlag}
          governanceNotes={frozen.governanceNotes}
          frozenAt={frozen.frozenAt}
          onClose={() => {}}
        />
      </>
    );
  }

  // Normal tontine operations
}
```

### Check Before Write Operations

```typescript
import { canWriteToTontine } from '@/lib/governance';

async function handleCreatePayment(tontineId: string, userId: string) {
  const check = await canWriteToTontine(userId, tontineId);

  if (!check.allowed) {
    Alert.alert('Operation Blocked', check.reason);
    return;
  }

  // Proceed with payment creation
}
```

### Use Governance Context

```typescript
import { useGovernanceContext } from '@/contexts/GovernanceContext';

function PaymentButton() {
  const { canWrite, accountStatus } = useGovernanceContext();

  return (
    <TouchableOpacity
      disabled={!canWrite}
      onPress={handlePayment}
    >
      <Text>{canWrite ? 'Make Payment' : 'Action Restricted'}</Text>
    </TouchableOpacity>
  );
}
```

## Admin Functions

### Suspend/Ban a User

```typescript
import { setUserStatus } from '@/lib/governance';

async function suspendUser(userId: string, reason: string) {
  const result = await setUserStatus(userId, 'suspended', reason);

  if (result.success) {
    console.log('User suspended successfully');
  } else {
    console.error('Failed to suspend user:', result.error);
  }
}
```

### Freeze a Tontine

```typescript
import { toggleTontineFreeze } from '@/lib/governance';

async function freezeTontine(tontineId: string, reason: string) {
  const result = await toggleTontineFreeze(tontineId, true, reason);

  if (result.success) {
    console.log('Tontine frozen successfully');
  } else {
    console.error('Failed to freeze tontine:', result.error);
  }
}
```

### Enable Maintenance Mode

```typescript
import { setMaintenanceMode } from '@/lib/governance';

async function enableMaintenance(message: string) {
  const result = await setMaintenanceMode(true, message);

  if (result.success) {
    console.log('Maintenance mode enabled');
  }
}
```

### Get Governance Metrics

```typescript
import { getGovernanceMetrics } from '@/lib/governance';

async function fetchMetrics() {
  const result = await getGovernanceMetrics();

  if (result.success) {
    console.log('Suspended users:', result.data.suspended_users);
    console.log('Frozen tontines:', result.data.frozen_tontines);
    console.log('Late payments:', result.data.late_payments);
  }
}
```

## Database Views

Access governance monitoring views:

```typescript
// View invitation failures
const { data } = await supabase
  .from('v_invitation_failures')
  .select('*');

// View payment defaults
const { data } = await supabase
  .from('v_payment_defaults')
  .select('*');

// View active disputes
const { data } = await supabase
  .from('v_active_disputes')
  .select('*');

// View restricted users
const { data } = await supabase
  .from('v_restricted_users')
  .select('*');
```

## RPC Functions

All admin functions are available as RPC calls:

- `set_user_status(target_user_id, new_status, status_reason)` - Set user account status
- `toggle_tontine_freeze(target_tontine_id, freeze_status, freeze_reason)` - Freeze/unfreeze tontine
- `set_maintenance_mode(enabled, message)` - Toggle maintenance mode
- `set_app_kill_switch(enabled)` - Toggle app kill switch
- `get_governance_metrics()` - Get real-time governance metrics

## Audit Log

All governance actions are automatically logged:

```typescript
const { data } = await supabase
  .from('governance_audit_log')
  .select('*')
  .order('created_at', { ascending: false });
```

## Security Notes

1. **RLS Enforcement**: All policies are enforced at database level
2. **Admin Override**: Only users with `role = 'admin'` can bypass restrictions
3. **Immutable Audit**: Governance audit log cannot be modified or deleted
4. **Real-time Updates**: All governance states are monitored via subscriptions

## Components

- `MaintenanceScreen` - Full-screen maintenance/kill-switch overlay
- `AccountSuspendedScreen` - Account suspended/banned screen
- `TontineFrozenOverlay` - Modal overlay for frozen tontines

## Hooks

- `useGovernance()` - Check app-wide governance and user status
- `useTontineFrozen(tontineId)` - Check if tontine is frozen
- `useCanWrite()` - Check if user can perform write operations
- `useCanWriteTontine(tontineId)` - Check if user can write to specific tontine
- `useGovernanceContext()` - Access governance context values

## Best Practices

1. **Always check permissions** before allowing write operations
2. **Use context hooks** for consistent governance checks across components
3. **Show clear feedback** when operations are blocked
4. **Provide reasons** when setting account status or freezing tontines
5. **Monitor audit logs** regularly for security review
6. **Test frozen states** to ensure read-only access works correctly
7. **Use views** for efficient monitoring and reporting

## Testing

Test governance features:

1. Create a test user and suspend their account
2. Verify they cannot create/update any data
3. Create a tontine and freeze it
4. Verify payments and member operations are blocked
5. Enable maintenance mode and verify global screen appears
6. Check audit logs for all actions

## Migration Path

The governance layer has been added with backward compatibility:
- Existing users default to `account_status = 'active'`
- Existing tontines default to `is_frozen = false`
- App settings default to normal operation mode

No data migration required!
