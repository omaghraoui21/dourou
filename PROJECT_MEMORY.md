# 📱 Dourou - Project Memory
**Complete Technical Documentation**

---

## 🎯 Project Overview

**Name:** Dourou (دورو)
**Type:** Tontine Management Platform (React Native / Expo)
**Target Market:** Tunisia
**Version:** 1.0.0
**Status:** Production-Ready
**Supabase Project:** qjvkbwjdgxwxmprprvwu

### Vision
Digital platform for managing rotating savings and credit associations (tontines) in Tunisia, providing transparency, trust scoring, and real-time tracking for traditional community savings groups.

### Core Concept
**Tontine (Dourou):** A group of 3-50 members who contribute fixed amounts regularly (weekly/monthly). Each round, one member receives the full pot. The cycle continues until everyone has received their payout.

---

## 🏗️ Architecture

### Tech Stack
- **Frontend:** React Native (Expo)
- **Backend:** Supabase (PostgreSQL + Auth + Realtime)
- **State Management:** React Context API + Hooks
- **Navigation:** Expo Router (file-based routing)
- **Localization:** i18next (FR, EN, AR, AR-TN)
- **Auth:** @fastshot/auth (OAuth + Email/Password)
- **Payment:** D17, Flouci, Bank Transfer, Cash

### Project Structure
```
/workspace/
├── app/                      # Expo Router screens
│   ├── (tabs)/              # Tab navigation (Dashboard, Tontines, Notifications, Profile)
│   ├── auth/                # Authentication screens
│   ├── tontine/             # Tontine management screens
│   ├── legal/               # Terms & Privacy screens
│   └── notifications.tsx    # Notifications screen
├── components/              # Reusable UI components
│   ├── governance/          # Governance dashboard & overlays
│   ├── payment/             # Payment-related components
│   └── tontine/             # Tontine-specific components
├── contexts/                # React Context providers
│   ├── ThemeContext.tsx     # Dark/Light theme
│   ├── GovernanceContext.tsx # Governance state
│   └── NotificationContext.tsx # Realtime notifications
├── hooks/                   # Custom React hooks
├── lib/                     # Database & API utilities
├── utils/                   # Helper functions (timezone, privacy, security)
├── constants/               # Theme, colors, spacing
├── i18n/                    # Translations (ar-TN, ar, fr, en)
├── supabase/                # Database schema & migrations
│   ├── schema.sql           # Main database schema
│   └── migrations/          # Incremental updates
└── assets/                  # Images, icons, fonts
```

---

## 📊 Database Schema

### Core Tables (8)

#### 1. **profiles**
User accounts linked to Supabase Auth.
```sql
- id (UUID, PK, references auth.users)
- full_name (TEXT)
- phone (TEXT)
- avatar_url (TEXT)
- trust_score (NUMERIC, default 3.0, range 1.0-5.0)
- role (TEXT: 'user', 'admin')
- created_at, updated_at (TIMESTAMPTZ)
```

**RLS:** Users can view all profiles, update their own. Admins can update any.

#### 2. **tontines**
Core tontine group settings.
```sql
- id (UUID, PK)
- creator_id (UUID, FK → profiles)
- title (TEXT)
- amount (INTEGER, contribution per round)
- frequency (TEXT: 'weekly', 'monthly')
- currency (TEXT, default 'TND')
- total_members (INTEGER, 3-50)
- current_round (INTEGER, default 1)
- distribution_logic (TEXT: 'fixed', 'random', 'trust')
- status (TEXT: 'draft', 'active', 'completed')
- start_date, next_deadline (TIMESTAMPTZ)
- created_at, updated_at (TIMESTAMPTZ)
```

**RLS:** Visible to creator, members, and admins. Only creator/admin can update.

#### 3. **tontine_members**
Links users to tontines.
```sql
- id (UUID, PK)
- tontine_id (UUID, FK → tontines)
- user_id (UUID, FK → profiles, nullable for non-app users)
- name (TEXT)
- phone (TEXT)
- payout_order (INTEGER, unique per tontine)
- role (TEXT: 'admin', 'member')
- joined_at (TIMESTAMPTZ)
```

**Constraints:**
- UNIQUE(tontine_id, phone)
- UNIQUE(tontine_id, payout_order) DEFERRABLE

**RLS:** Visible to tontine members and admins. Only creator/admin can insert/delete.

#### 4. **invitations**
6-character invitation codes for joining tontines.
```sql
- id (UUID, PK)
- tontine_id (UUID, FK → tontines)
- code (TEXT, UNIQUE, 6 alphanumeric characters)
- created_by (UUID, FK → profiles)
- expires_at (TIMESTAMPTZ, default +7 days)
- max_uses (INTEGER, default 1)
- used_count (INTEGER, default 0)
- created_at (TIMESTAMPTZ)
```

**RLS:** Anyone can view (for joining). Only creator can insert/update/delete.

#### 5. **rounds**
Payment cycles generated when tontine launches.
```sql
- id (UUID, PK)
- tontine_id (UUID, FK → tontines)
- round_number (INTEGER)
- beneficiary_id (UUID, FK → tontine_members, nullable)
- status (TEXT: 'current', 'upcoming', 'completed')
- scheduled_date, completed_at (TIMESTAMPTZ)
- created_at (TIMESTAMPTZ)
```

**Constraints:** UNIQUE(tontine_id, round_number)

**RLS:** Visible to tontine members and admins. Only creator/admin can insert/update.

#### 6. **payments**
Individual contributions per member per round.
```sql
- id (UUID, PK)
- round_id (UUID, FK → rounds)
- member_id (UUID, FK → tontine_members)
- amount (INTEGER)
- method (TEXT: 'cash', 'bank', 'd17', 'flouci')
- status (TEXT: 'unpaid', 'declared', 'paid', 'late')
- reference (TEXT, optional proof/transaction ID)
- declared_at, confirmed_at (TIMESTAMPTZ)
- created_at (TIMESTAMPTZ)
```

**Payment States:**
- **unpaid:** Initial state, no action taken
- **declared:** Member submitted payment proof
- **paid:** Admin confirmed payment
- **late:** Deadline passed, still unpaid

**RLS:** Visible to tontine members. Member can update their own, admin can update any.

#### 7. **notifications**
Activity notifications sent to users.
```sql
- id (UUID, PK)
- user_id (UUID, FK → profiles)
- tontine_id (UUID, FK → tontines, nullable)
- type (TEXT: 'payment_confirmed', 'round_started', 'member_joined', etc.)
- title, body (TEXT)
- read (BOOLEAN, default false)
- metadata (JSONB, additional context)
- created_at (TIMESTAMPTZ)
```

**RLS:** Users can only see their own notifications. Admins can see all.

#### 8. **audit_log**
Immutable system activity tracking.
```sql
- id (UUID, PK)
- tontine_id (UUID, FK → tontines, nullable)
- user_id (UUID, FK → profiles, nullable)
- action (TEXT)
- details (JSONB)
- created_at (TIMESTAMPTZ)
```

**RLS:**
- SELECT: Users can see logs for their tontines, admins see all
- INSERT: Any authenticated user can create audit entries
- **UPDATE/DELETE: BLOCKED** (immutable)

---

## 🔐 Security Architecture

### SECURITY DEFINER Functions (11)

**Purpose:** Bypass RLS internally to prevent infinite recursion.

| Function | Purpose |
|----------|---------|
| `is_admin(user_id)` | Check if user has admin/super_admin role |
| `is_tontine_member(user_id, tontine_id)` | Check membership without triggering RLS |
| `is_tontine_creator(user_id, tontine_id)` | Check if user created the tontine |
| `is_tontine_admin(user_id, tontine_id)` | Check if user is creator OR admin role |
| `handle_new_user()` | Auto-create profile on user signup |
| `calculate_trust_score(user_id)` | Calculate trust score 1.0-5.0 based on payment history |
| `recalculate_all_trust_scores()` | Batch recalculate for all users |
| `create_notification(...)` | Create notification for a user |
| `notify_tontine_members(...)` | Send notification to all members of a tontine |
| `update_member_trust_score()` | Trigger function: auto-update trust on payment status change |
| `notify_payment_confirmed()` | Trigger function: send notification when payment confirmed |

### Row Level Security (RLS)

**All tables have RLS enabled.**

**Key Policies:**
- **profiles:** Public read, self-update, admin override
- **tontines:** Visible to creator/members/admin, modifiable by creator/admin
- **tontine_members:** Visible to members, modifiable by creator/admin
- **payments:** Visible to members, self-update for member, admin override
- **notifications:** Self-view only, admin override
- **audit_log:** Member-view for tontine logs, **no update/delete policies** (immutable)

**RLS V2:** Fixed infinite recursion by using `SECURITY DEFINER` helper functions.

### Governance System

**Purpose:** Admin control over accounts, tontines, and app-wide settings.

**New Tables (in migrations):**
- `app_settings` - Global app state (maintenance mode, kill-switch)
- `governance_audit_log` - Governance action tracking (immutable)
- `invitation_attempts` - Rate limiting for invitation codes
- `payment_rate_limits` - Rate limiting for payment declarations

**Features:**
- **Account Status:** Active, Suspended, Banned
- **Tontine Freeze:** Lock all financial operations
- **Maintenance Mode:** Show professional maintenance screen
- **Kill-Switch:** Emergency app shutdown
- **Rate Limiting:**
  - Invitations: 3 failed attempts → 5-minute cooldown
  - Payments: Max 5 declarations per minute

**RPC Functions:**
```sql
set_user_status(target_user_id, new_status, status_reason)
toggle_tontine_freeze(target_tontine_id, freeze_status, freeze_reason)
set_maintenance_mode(enabled, message)
set_app_kill_switch(enabled)
get_governance_metrics()
```

---

## 🔔 Notification System

### Event-Driven Architecture
Notifications are **automatically triggered** by database events, not scheduled intervals.

**Triggers:**
1. **trigger_notify_payment_confirmed** (ON payments)
   - Event: Payment status changes to 'paid'
   - Action: Notify the member their payment was confirmed

2. **trigger_notify_new_round** (ON rounds)
   - Event: Round status changes to 'current'
   - Action: Notify all members that a new round started

3. **trigger_notify_member_joined** (ON tontine_members)
   - Event: User_id is set (member joined)
   - Action: Notify member (welcome) and creator (new member alert)

### Notification Types
- `payment_confirmed` - Payment approved by admin
- `round_started` - New round begins
- `joined_tontine` - Welcome message for new member
- `member_joined` - Alert to creator about new member
- `payment_reminder` - (Future: scheduled reminders)
- `invitation` - (Future: invitation to join)

### Real-Time Delivery
**Supabase Realtime:**
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
```

**Client-side subscription:**
```typescript
supabase
  .channel('notifications')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'notifications',
    filter: `user_id=eq.${userId}`
  }, (payload) => {
    // Update UI with new notification
  })
  .subscribe();
```

---

## 🌍 Localization Strategy

### Supported Languages (4)
1. **French (fr):** Primary language, Tunisia official language
2. **English (en):** Secondary, international users
3. **Standard Arabic (ar):** Formal Arabic
4. **Tunisian Darija (ar-TN):** Colloquial Tunisian dialect

### Fallback Chain
```
ar-TN → ar → fr → en
ar → fr → en
en → fr
default → fr → en
```

### Tunisian Darija Highlights
**Key Terms:**
- **Dourou (دورو):** Tunisian word for rotating savings group
- **كمّل (Continue):** Casual imperative
- **ثبّت (Confirm):** Tunisian colloquial
- **مواخر (Late):** Natural Tunisian expression
- **خلّص (Paid):** Tunisian "he paid"
- **فلوس (Money):** Colloquial "money"

**Examples:**
```json
{
  "tontine": {
    "launched_title": "مبروك! الدورو بدات!",  // Congrats! Tontine started!
    "invite_title": "ادعي صحابك",            // Invite your friends
    "launch_confirm_message": "الأعضاء والترتيب يتقفلو. متأكد؟"
                                               // Members and order will lock. Sure?
  }
}
```

### RTL (Right-to-Left) Support
```typescript
// Auto-detect and apply RTL for Arabic
const shouldBeRTL = language === 'ar' || language === 'ar-TN';
I18nManager.allowRTL(shouldBeRTL);
I18nManager.forceRTL(shouldBeRTL);
```

---

## ⏰ Timezone & Currency

### Africa/Tunis Timezone
**All timestamps enforced to Tunisian timezone.**

**Database Trigger:**
```sql
CREATE OR REPLACE FUNCTION enforce_tunis_timezone()
RETURNS TRIGGER AS $$
BEGIN
  NEW.created_at = NOW() AT TIME ZONE 'Africa/Tunis';
  NEW.updated_at = NOW() AT TIME ZONE 'Africa/Tunis';
  RETURN NEW;
END;
$$;
```

**Utility Functions:**
```typescript
getTunisTime()                   // Current time in Tunis
formatTunisianCurrency(amount)   // 1000 → "1000.00 DT"
calculateNextDeadline(start, frequency, round)
isPastDeadline(deadline)
```

### Currency Formatting
- **Currency:** TND (Tunisian Dinar)
- **Symbol:** د.ت or DT
- **Format:** `1,234.56 DT` (comma separators, 2 decimals)

---

## 📈 Trust Score System

### Calculation Algorithm
**Range:** 1.0 - 5.0 (2 decimal places)
**Default:** 3.0 (new users with no payment history)

**Formula:**
```
Base score = 3.0
+ (on-time payments × 0.1) [max +2.0]
- (late payments × 0.2)
- (overdue unpaid × 0.15)
= Final score (clamped to 1.0-5.0)
```

**Trigger:** Auto-updated whenever payment status changes.

**SQL Function:**
```sql
CREATE OR REPLACE FUNCTION calculate_trust_score(p_user_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  v_total_payments INTEGER;
  v_paid_payments INTEGER;
  v_late_payments INTEGER;
  v_overdue_unpaid INTEGER;
  v_score NUMERIC;
BEGIN
  -- Get payment statistics across all user's tontines
  SELECT
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE status = 'paid') as paid,
    COUNT(*) FILTER (WHERE status = 'late') as late,
    COUNT(*) FILTER (WHERE status = 'unpaid' AND round.scheduled_date < NOW()) as overdue
  INTO v_total_payments, v_paid_payments, v_late_payments, v_overdue_unpaid
  FROM payments
  INNER JOIN tontine_members ON tontine_members.id = payments.member_id
  WHERE tontine_members.user_id = p_user_id;

  IF v_total_payments = 0 THEN RETURN 3.0; END IF;

  v_score := 3.0 + LEAST(v_paid_payments * 0.1, 2.0) - (v_late_payments * 0.2) - (v_overdue_unpaid * 0.15);

  RETURN GREATEST(1.0, LEAST(5.0, ROUND(v_score, 2)));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Trust Tiers (UI Display)
- **1.0-1.9:** Novice (مبتدئ)
- **2.0-2.9:** Reliable (موثوق)
- **3.0-3.9:** Trusted (جدير بالثقة)
- **4.0-4.5:** Elite (نخبة)
- **4.6-5.0:** Master (خبير)

---

## 🎨 Design System

### Color Palette
```typescript
// Dark Mode
background: '#0F172A'    // Midnight blue
card: '#1E293B'          // Slate
text: '#F8FAFC'          // Off-white
gold: '#D4AF37'          // Premium gold accent
flouci: '#2ECC71'        // Flouci green
success: '#10B981'
warning: '#F59E0B'
error: '#EF4444'
late: '#DC2626'

// Light Mode
background: '#FDFCF9'    // Warm white
card: '#FFFFFF'
text: '#0F172A'
gold: '#D4AF37'          // (same as dark)
```

### Typography
- **Title:** Playfair Display (elegant, financial)
- **Body:** DM Sans (clean, readable)
- **Arabic:** Noto Sans Arabic (RTL support)
- **Mono:** JetBrains Mono (codes, numbers)

### Spacing
```typescript
xs: 4px, sm: 8px, md: 16px, lg: 24px, xl: 32px, xxl: 48px
```

### Border Radius
```typescript
sm: 8px, md: 16px, lg: 24px, full: 9999px
```

### Font Sizes
```typescript
xs: 12px, sm: 14px, md: 16px, lg: 20px, xl: 24px, xxl: 32px, xxxl: 48px
```

### Premium UI Elements
- **Glassmorphism:** Frosted glass effect for overlays
- **Gold Accents:** Premium feel for success states
- **Haptic Feedback:** All interactions (Light/Medium/Heavy)
- **Loading States:** Skeleton screens + spinners

---

## 🔄 Key User Flows

### 1. Create Tontine Flow
```
1. Dashboard → (+) Create Tontine
2. Step 1: Name & Contribution (title, amount, frequency)
3. Step 2: Members (set total_members count)
4. Step 3: Distribution Logic (fixed, random, trust)
5. Step 4: Summary → Create (status='draft')
6. Add Members (tontine_members entries)
7. Set Payout Sequence (assign payout_order)
8. Launch Tontine → Generates rounds, sets status='active'
```

### 2. Join Tontine Flow
```
1. Dashboard → Join Group
2. Enter 6-character invitation code
3. Validate code (check expiry, max_uses)
4. Link user_id to existing tontine_member entry
5. Trigger: notify_member_joined()
6. Redirect to tontine detail screen
```

### 3. Payment Declaration Flow
```
1. Round Detail → Declare Payment button
2. Select payment method (cash, bank, d17, flouci)
3. Optional: Upload proof (reference text)
4. Submit → payment.status='declared', declared_at=NOW()
5. Notification: sent to admin/creator
6. Admin: Mark as Paid → payment.status='paid', confirmed_at=NOW()
7. Trigger: notify_payment_confirmed()
8. Trigger: update_member_trust_score()
```

### 4. Round Progression
```
1. Current Round: status='current'
2. All payments confirmed (status='paid')
3. Admin: Complete Round button
4. Update round.status='completed', completed_at=NOW()
5. Update tontine.current_round += 1
6. Next round.status='current'
7. Trigger: notify_new_round()
8. If last round: tontine.status='completed'
```

---

## 🛠️ Development Commands

### Local Development
```bash
npm install              # Install dependencies
npx expo start           # Start development server
npx expo start --ios     # Launch iOS simulator
npx expo start --android # Launch Android emulator
```

### Code Quality
```bash
npx tsc --noEmit        # TypeScript check
npm run lint            # ESLint check
npm run lint -- --fix   # Auto-fix issues
```

### Database Management
```bash
# Apply schema
psql -h [supabase-host] -U postgres -d postgres -f supabase/schema.sql

# Apply migrations
psql -h [supabase-host] -U postgres -d postgres -f supabase/migrations/[migration-file].sql

# Backup database
supabase db dump -f backup_$(date +%Y%m%d).sql
```

---

## 🚀 Deployment

### Environment Variables
```bash
EXPO_PUBLIC_NEWELL_API_URL        # Newell AI endpoint
EXPO_PUBLIC_PROJECT_ID            # Fastshot project ID
EXPO_PUBLIC_SUPABASE_URL          # Supabase project URL
EXPO_PUBLIC_SUPABASE_ANON_KEY     # Supabase anonymous key
EXPO_PUBLIC_AUTH_BROKER_URL       # Auth broker endpoint
```

### Build Commands
```bash
# Development build
eas build --platform all --profile development

# Production build
eas build --platform all --profile production

# Web build
npx expo export:web
```

### Pre-Deployment Checklist
- [ ] Run `npx tsc --noEmit` (no errors)
- [ ] Run `npm run lint` (no critical errors)
- [ ] Test all authentication flows
- [ ] Test payment declaration and confirmation
- [ ] Test notifications (real-time updates)
- [ ] Test RTL layout (Arabic languages)
- [ ] Verify timezone enforcement (Africa/Tunis)
- [ ] Test governance controls (admin features)
- [ ] Verify rate limiting (invitations, payments)
- [ ] Test account deletion flow
- [ ] Review Legal Center content (Terms & Privacy)

---

## 📂 Migration History

### Phase 0-2: Foundation
- Base schema (profiles, tontines, members, invitations, rounds, payments)
- RLS policies
- Basic triggers (updated_at, handle_new_user)

### Phase 3: Trust Score & Notifications
- Trust score calculation function
- Notification system (create, notify_tontine_members)
- Notification triggers (payment_confirmed, new_round, member_joined)
- Realtime subscription for notifications

### Phase 4: Refined Payment States
- Updated payment states: unpaid → declared → paid → late
- Enhanced trust score calculation for new states
- Notification updates for payment flow

### Phase 5: Production Hardening
- Africa/Tunis timezone enforcement
- Rate limiting (invitations, payments)
- Phone number masking
- Account deletion (delete_user_account function)
- Legal Center (Terms of Service, Privacy Policy)
- Security enhancements (immutable audit logs)

### Phase 6: RLS Fix
- Fixed infinite recursion in RLS policies
- Added SECURITY DEFINER helper functions
- V2 policies for tontines, members, rounds, payments, audit_log

### Phase 7: Risk Mitigation & Governance
- Governance system (account suspend/ban, tontine freeze)
- App-wide controls (maintenance mode, kill-switch)
- Governance audit log (immutable)
- Monitoring views (disputes, defaults, restricted users)
- RPC functions for governance operations

---

## 🔍 Known Issues & Workarounds

### 1. Missing Package: expo-image-picker
**Issue:** TypeScript error in PaymentProofUpload.tsx
**Fix:** `npm install expo-image-picker`

### 2. @fastshot/auth Type Errors
**Issue:** setTimeout type mismatch in node_modules
**Impact:** None (external package)
**Fix:** Ignore or update @fastshot/auth package

### 3. ESLint Warnings
**Issue:** Import duplicates, unused variables (minor)
**Impact:** None (cosmetic)
**Fix:** Run `npm run lint -- --fix` or fix manually

---

## 📞 Support & Escalation

### Troubleshooting
1. Check `.fastshot-logs/` directory:
   - `expo-dev-server.log` - Runtime errors
   - `expo-export.log` - Build errors

2. Database issues:
   - Review Supabase project logs
   - Check RLS policies are enabled
   - Verify user role permissions

3. Authentication issues:
   - Check Auth Broker URL in .env
   - Verify Supabase anon key
   - Check user profile created (handle_new_user trigger)

### Documentation References
- **GOVERNANCE_USAGE.md** - Admin operations
- **PHASE3_TRANSFER_KIT.md** - Notifications & trust score
- **PHASE_5_SUMMARY.md** - Production features
- **DEPLOYMENT_GUIDE.md** - Deployment procedures
- **DARIJA_GUIDE.md** - Tunisian translation guide
- **PORTABILITY_AUDIT_REPORT.md** - Portability verification

---

## 🎉 Project Status

**Current Phase:** Production-Ready
**Last Updated:** $(date)
**Schema Version:** 007 (Risk Mitigation Security)
**Portability Score:** 95/100

**Achievements:**
✅ Complete tontine management system
✅ Real-time notifications
✅ Trust score automation
✅ Governance & security controls
✅ Tunisian localization (Darija)
✅ Production hardening (rate limiting, phone masking)
✅ Legal compliance (Terms & Privacy)
✅ Timezone enforcement (Africa/Tunis)

**Ready for Tunisia Market Launch** 🇹🇳

---

**Maintained By:** Dourou Development Team
**Version:** 1.0
**Last Updated:** [Auto-generated]
