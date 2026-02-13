# 🧠 PROJECT MEMORY - DOUROU (دورو)

> **Living Brain Document** - Last Updated: Phase 4 Complete (Polishing & Robustness)
> This document serves as the central knowledge repository for any AI agent working on Dourou.

---

## ⚠️ CRITICAL BUSINESS RULES (Updated Phase 4.5)

**The following rules are MANDATORY and production-critical:**

### 1. Tontine Joining Logic
- Users can **ONLY** join a tontine while it is in **`draft`** status
- Once launched (status = `active`), **NO new members can join** via invitation code
- Attempting to join an active/completed tontine returns clear error message

### 2. Payment States (4 Refined States)
- **`unpaid`**: Round started, no payment declared yet
- **`declared`**: User submitted payment proof, awaiting admin confirmation
- **`paid`**: Administrator verified and confirmed the payment
- **`late`**: Payment deadline passed without declaration
- ⚠️ **NO MORE "pending" status** - migrated to appropriate new states

### 3. Member Count Limits
- **Minimum**: 3 members (strictly enforced in DB and UI)
- **Maximum**: 50 members (strictly enforced in DB and UI)
- Launch button only activates when ≥3 members have joined

### 4. Trust Score Calculation
- Uses refined payment states: `paid`, `late`, `unpaid` (overdue)
- `declared` status is neutral (awaiting confirmation)
- Formula: Base 3.0 + (paid×0.1) - (late×0.2) - (overdue_unpaid×0.15)

---

## 📋 TABLE OF CONTENTS

1. [Project Identity](#project-identity)
2. [Design Language & Visual Identity](#design-language--visual-identity)
3. [Feature Map](#feature-map)
4. [Technical Foundation](#technical-foundation)
5. [Developer Rules & Standards](#developer-rules--standards)
6. [Current Status](#current-status)
7. [Critical Implementation Details](#critical-implementation-details)
8. [Known Patterns & Anti-Patterns](#known-patterns--anti-patterns)

---

## 🎯 PROJECT IDENTITY

### What is Dourou?

**Dourou** (دورو - Arabic for "rotation/turn") is a **premium, high-end Fintech Luxe mobile application** designed specifically for the Tunisian market. It digitizes and modernizes the traditional practice of **rotating savings groups (tontines)**, bringing transparency, trust, and efficiency to collective savings.

### Market Position
- **Target Market**: Tunisia (Primary), North Africa (Secondary)
- **User Base**: Families, friends, colleagues who practice tontines
- **Value Proposition**: Transform informal savings circles into transparent, trustworthy digital experiences
- **Positioning**: Premium fintech solution, not a casual savings app

### Core Philosophy
1. **Trust First**: Every feature reinforces trust and transparency
2. **Culturally Authentic**: Respects Tunisian traditions while modernizing them
3. **Luxe Experience**: Premium aesthetics worthy of users' hard-earned money
4. **Inclusive Design**: Multi-language (French, Arabic, English) with full RTL support

---

## 🎨 DESIGN LANGUAGE & VISUAL IDENTITY

### Color Palette

#### Primary Colors
```
Deep Blue (Background):    #0F172A  - Represents trust, stability, financial security
Gold (Accent):             #D4AF37  - Represents wealth, premium quality, achievement
```

#### Secondary Colors
```
Card Background (Dark):    #1E293B
Card Background (Light):   #FFFFFF
Text Primary (Dark):       #F8FAFC
Text Primary (Light):      #0F172A
Text Secondary (Dark):     #94A3B8
Text Secondary (Light):    #64748B
Border (Dark):             #334155
Border (Light):            #E2E8F0
```

#### Functional Colors
```
Success:                   #10B981  - Payment confirmed, tontine completed
Warning:                   #F59E0B  - Upcoming deadline, requires attention
Error/Late:                #EF4444  - Late payment, critical issue
Flouci Green:              #2ECC71  - Payment method indicator
```

### Typography

#### Font Families
- **Title Font**: Playfair Display (Serif, elegant, premium)
- **Body Font**: DM Sans (Sans-serif, clean, readable)
- **Arabic Font**: Noto Sans Arabic (Optimized for RTL, readable)
- **Monospace**: JetBrains Mono (For codes, numbers)

#### Font Scale
```
xs:   12px - Micro text, timestamps
sm:   14px - Secondary text, labels
md:   16px - Body text, primary content
lg:   20px - Section titles, card headers
xl:   24px - Screen titles
xxl:  32px - Hero text, user name
xxxl: 48px - Large numbers, total savings
```

### Spacing System
```
xs:   4px  - Tight spacing, inline elements
sm:   8px  - Related elements, compact layouts
md:   16px - Standard spacing, form fields
lg:   24px - Section spacing, cards
xl:   32px - Major sections, screen padding
xxl:  48px - Hero sections, major separations
```

### Border Radius
```
sm:   8px  - Small elements (buttons, badges)
md:   16px - Cards, inputs
lg:   24px - Large cards, modals
full: 9999px - Circular elements (avatars, pills)
```

### Visual Style: Glassmorphism

The app employs a **sophisticated glassmorphism design** that creates depth and premium feel:

1. **Frosted Glass Effects**: Cards have subtle backdrop blur
2. **Layered Transparency**: Multiple levels of opacity create depth
3. **Gold Accents**: Strategic use of gold borders and highlights
4. **Subtle Shadows**: Elevation without harsh borders

### Loading States: Gold-Shimmer Skeleton Loaders

**CRITICAL DESIGN ELEMENT**: All loading states use custom gold-shimmer skeleton loaders, NOT generic spinners.

#### Implementation Pattern
```typescript
// Gold shimmer animation with LinearGradient
colors={[
  'transparent',
  colors.gold + '30',  // 30% opacity
  colors.gold + '50',  // 50% opacity
  colors.gold + '30',
  'transparent',
]}
```

**Why it matters**: The gold shimmer reinforces the premium brand and maintains visual consistency during loading states.

### Haptic Feedback

**MANDATORY**: All key interactions must include subtle haptic feedback.

#### Haptic Guidelines
```typescript
import * as Haptics from 'expo-haptics';

// Light tap - Secondary actions, navigation
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

// Medium impact - Primary actions, button presses
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

// Heavy impact - Critical actions, confirmations
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

// Success notification - Payment confirmed, tontine created
Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

// Warning notification - Late payment, deadline approaching
Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

// Error notification - Payment failed, validation error
Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
```

**Where to use**:
- Button presses (all GoldButton interactions)
- Tab navigation switches
- Pull-to-refresh gestures
- Payment confirmations
- Member additions
- Tontine launches
- Notification taps

---

## 🗺️ FEATURE MAP

### 1. User Authentication & Profiles

#### Authentication Flow
- **Phone-based authentication** (primary method)
  - Enter phone number (Tunisian format: +216 XX XXX XXX)
  - Receive 6-digit OTP code
  - Verify code
  - Complete profile (first name, last name)
- **OAuth Support** (Google, Apple) via @fastshot/auth package
- **Admin Login** (special route for super_admin role)

#### Profile Management
- **User Information**:
  - Full name (first + last)
  - Phone number
  - Avatar (optional)
  - Trust score (dynamic, calculated)
  - Role (user, admin, super_admin)
- **Profile Editing**: Users can update their information
- **Avatar System**: Numismatic-style avatars with gold accents

### 2. Tontine Creation & Management

#### Creating a Tontine (Draft Mode)
1. **Basic Information**:
   - Title (e.g., "Family Ben Ali", "Office Tontine")
   - Contribution amount (in TND - Tunisian Dinar)
   - Frequency (weekly or monthly)
   - Total members count (3-50, strictly enforced)
   - Currency (TND default)

2. **Distribution Logic**:
   - **Fixed**: Pre-defined payout order
   - **Random**: Draw at tontine launch
   - **Trust-based**: Higher trust scores get earlier turns (future feature)

3. **Member Management**:
   - Add members manually (name + phone)
   - Members don't need accounts to be added
   - Assign payout order (for fixed distribution)
   - Each member gets a unique position

4. **Launch Process**:
   - Review all members and settings
   - **CRITICAL**: Minimum 3 members required to launch
   - Generate invitation code (6-character alphanumeric)
   - Execute draw (if random distribution)
   - Generate all rounds automatically
   - Set first round as "current"
   - Transition status from "draft" to "active"
   - **Celebration animation** on successful launch

#### Tontine Statuses
- **Draft**: Being configured, members can be added/removed, joinable via invitation
- **Active**: Launched, rounds in progress, **NO NEW MEMBERS CAN JOIN**
- **Completed**: All rounds finished

#### Invitation System
- **Invitation Codes**: 6-character codes (e.g., "ABC123")
  - Auto-generated on tontine launch
  - Can be shared via copy/paste
  - Expiration date (default: 7 days)
  - Max uses limit
  - Used count tracking
- **Joining Flow**:
  - User enters invitation code
  - System validates code (exists, not expired, not full)
  - **CRITICAL RULE**: System checks tontine status - **ONLY draft tontines can be joined**
  - If tontine is "active" or "completed", joining is blocked with clear error message
  - User links their account to an existing member slot
  - Receives welcome notification

### 3. Rounds & Automated Turns

#### Round System
Each tontine automatically generates **N rounds** (where N = total members).

**Round Properties**:
- Round number (1, 2, 3...)
- Beneficiary (member who receives payout this round)
- Status (current, upcoming, completed)
- Scheduled date (calculated based on frequency)
- Payments (one per member)

#### Round Lifecycle
1. **Upcoming**: Future round, grayed out
2. **Current**: Active round, members can declare payments
3. **Completed**: All payments confirmed, beneficiary received payout

#### Automatic Progression
- When admin confirms all payments for current round → round marked "completed"
- Next round automatically becomes "current"
- Notifications sent to all members

### 4. Payment Tracking

#### Payment Lifecycle - 4 Refined States

**CRITICAL**: The payment system uses FOUR distinct states to improve clarity and Trust Score accuracy:

1. **Unpaid**: Round has started, no payment proof submitted yet
   - Initial state when round begins
   - Member has not yet declared their payment
   - Deadline has not passed

2. **Declared**: Member submitted payment proof, awaiting admin verification
   - Member selected payment method
   - Member provided optional reference number
   - declared_at timestamp recorded
   - Awaiting admin confirmation

3. **Paid**: Admin verified and confirmed the payment
   - Admin marked payment as confirmed
   - confirmed_at timestamp recorded
   - Counts toward round completion
   - Trust score automatically updated
   - Member receives confirmation notification

4. **Late**: Payment deadline passed without declaration
   - System automatically marks as late after deadline
   - Negatively impacts Trust Score
   - Still can be paid, but flagged as late

#### Payment Declaration (Member Action)
Members can declare their payment when status is "unpaid":
1. Select payment method (cash, bank, d17, flouci)
2. Optionally add reference number
3. Declare payment with timestamp
4. Status changes from "unpaid" to "declared"

#### Payment Confirmation (Admin Action)
Tontine creator/admin reviews and confirms declared payments:
1. View all declared payments
2. Verify payment received
3. Confirm payment → status changes from "declared" to "paid"
4. Member receives confirmation notification
5. Trust score updated automatically

#### Payment Methods
- **Cash**: Physical cash payment
- **Bank**: Bank transfer
- **D17**: Tunisian mobile payment service
- **Flouci**: Popular Tunisian e-wallet

### 5. Trust Score System

The trust score is the **cornerstone of the Dourou reputation system**.

#### Trust Tiers
```
Score Range    | Tier       | Icon | Colors                | Description
---------------|------------|------|----------------------|---------------------------
1.0 - 2.9      | Novice     | 🌱   | Gray gradient        | New user, no history
3.0 - 3.4      | Reliable   | ⭐   | Blue gradient        | Good payment record
3.5 - 3.9      | Trusted    | 💎   | Purple gradient      | Very reliable
4.0 - 4.4      | Elite      | 👑   | Gold gradient        | Exceptional reliability
4.5 - 5.0      | Master     | 💠   | Gold-Orange gradient | Perfect record
```

#### Calculation Logic (Automated via SQL)

**Base Score**: 3.0 (for all new users)

**Formula** (Updated for Refined Payment States):
```sql
score = 3.0
  + (paid_payments * 0.1)       -- Max +2.0 (confirmed payments)
  - (late_payments * 0.2)        -- Penalty for late payments
  - (overdue_unpaid * 0.15)      -- Penalty for unpaid past deadline

-- Bounded to [1.0, 5.0]
-- Note: 'declared' payments are neutral (awaiting confirmation)
```

**Key Changes from Previous Version**:
- Now tracks `paid` (confirmed) payments instead of generic "on-time"
- Penalizes `unpaid` payments past deadline (previously "overdue pending")
- `declared` status is neutral - doesn't affect score until confirmed or late

**Triggers**:
- Recalculated automatically on payment status change
- Stored in `profiles.trust_score`
- Visible on profile page and member lists

**Display**:
- Badge with tier icon and label
- Numerical score (e.g., "4.5")
- Color-coded gradient background
- Shown on profile, in member lists, and notifications

### 6. Notification Center

Real-time notification system for all tontine activities.

#### Notification Types
1. **Payment Confirmed**: Admin confirmed your payment
2. **Round Started**: New round has begun
3. **Member Joined**: Someone joined your tontine
4. **Joined Tontine**: You successfully joined a tontine
5. **Payment Reminder**: Deadline approaching (future)
6. **Round Completed**: All payments received (future)

#### Notification Structure
```typescript
{
  id: UUID
  user_id: UUID          // Recipient
  tontine_id: UUID       // Related tontine
  type: string           // Notification category
  title: string          // Bold headline
  body: string           // Detailed message
  read: boolean          // Read status
  metadata: JSONB        // Extra data (round_id, payment_id, etc.)
  created_at: timestamp  // For sorting
}
```

#### Realtime Updates
- Notifications table enabled for Supabase Realtime
- UI updates instantly when new notifications arrive
- Badge count on notification icon
- Mark as read functionality

### 7. Localization (i18n)

Full multi-language support with **French as the primary language**.

#### Supported Languages
1. **French (fr)**: Primary, default language
2. **English (en)**: Secondary, international users
3. **Arabic (ar)**: Full RTL support for Arabic speakers

#### RTL (Right-to-Left) Support

**CRITICAL RULE**: All new UI components MUST support RTL layout for Arabic.

#### RTL Implementation Pattern
```typescript
import { useTranslation } from 'react-i18next';

const { i18n } = useTranslation();
const rtl = i18n.language === 'ar';

// Apply to containers
<View style={[styles.container, rtl && styles.containerRTL]}>

// FlexDirection reversal
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  containerRTL: {
    flexDirection: 'row-reverse',
  },
});

// Text alignment
<Text style={{ textAlign: rtl ? 'right' : 'left' }}>

// Absolute positioning
fabRTL: {
  right: undefined,
  left: 24,
}
```

#### Language Switching
- Settings screen has language selector
- Persisted to AsyncStorage
- Forces RTL direction for Arabic
- App restart required for full RTL effect (React Native limitation)

---

## 🏗️ TECHNICAL FOUNDATION

### Tech Stack

#### Frontend
- **Framework**: React Native 0.81.5
- **Meta-Framework**: Expo SDK 54
- **Navigation**: Expo Router 6.0 (file-based routing)
- **Language**: TypeScript (strict mode enabled)
- **State Management**: React Context API
  - `ThemeContext`: Dark/light mode
  - `UserContext`: Current user, authentication state
  - `TontineContext`: Tontine data, CRUD operations
- **Styling**: StyleSheet (native), no CSS-in-JS libraries

#### Key Libraries
```json
{
  "@fastshot/auth": "^1.1.0",           // OAuth + Phone auth
  "@supabase/supabase-js": "^2.95.3",   // Database client
  "expo-blur": "~15.0.7",               // Glassmorphism effects
  "expo-haptics": "~15.0.7",            // Tactile feedback
  "expo-linear-gradient": "^15.0.8",    // Gold gradients
  "expo-localization": "^17.0.8",       // Device locale detection
  "i18next": "^25.8.7",                 // Internationalization
  "react-i18next": "^16.5.4",           // React bindings for i18n
  "react-native-modal": "^14.0.0",      // Premium modals
  "react-native-reanimated": "~4.1.1"   // Smooth animations
}
```

#### Backend
- **Database**: Supabase PostgreSQL
- **Authentication**: Supabase Auth + @fastshot/auth broker
- **Realtime**: Supabase Realtime (for notifications, rounds, payments)
- **Storage**: Supabase Storage (for avatars - future)
- **Edge Functions**: Supabase Edge Functions (for AI features via Newell)

### Database Architecture

#### Schema Overview
```
profiles            // User accounts
├── tontines        // Tontine groups
│   ├── tontine_members      // Members in each tontine
│   ├── rounds               // Rounds (tours)
│   │   └── payments         // Individual contributions
│   └── invitations          // Invitation codes
├── notifications   // User notifications
└── audit_log       // System activity log
```

#### Key Tables

**profiles**
- Links to `auth.users` (Supabase Auth)
- Stores: name, phone, avatar_url, trust_score, role
- Trust score updated by trigger on payment changes

**tontines**
- Core tontine configuration
- Statuses: draft, active, completed
- Distribution logic: fixed, random, trust
- Tracks current_round number

**tontine_members**
- Junction table: tontine ↔ user
- Stores: name, phone, payout_order, role (admin/member)
- user_id can be NULL (for non-registered members)

**rounds**
- Auto-generated on tontine launch
- One round per member
- Beneficiary assigned (fixed or random)
- Status: upcoming, current, completed

**payments**
- One payment per member per round
- Status: pending, paid, late
- Tracks declaration and confirmation timestamps
- Method: cash, bank, d17, flouci

**invitations**
- 6-character invitation codes
- Expiration date, max uses, used count
- Linked to tontine

**notifications**
- Real-time user notifications
- Typed: payment_confirmed, round_started, member_joined, etc.
- Metadata JSONB field for extra data

**audit_log**
- System-wide activity tracking
- For admin oversight and debugging

#### Row Level Security (RLS)

**EVERY TABLE HAS RLS ENABLED** - This is non-negotiable for security.

#### RLS Policy Patterns

**User-owned resources** (profiles):
```sql
-- Users can read all profiles
CREATE POLICY "profiles_select" ON profiles
  FOR SELECT TO authenticated USING (true);

-- Users can only update their own profile
CREATE POLICY "profiles_update" ON profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id);
```

**Tontine membership-based access**:
```sql
-- Can only see tontines you're a member of or created
CREATE POLICY "tontines_select" ON tontines
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tontine_members
      WHERE tontine_members.tontine_id = tontines.id
      AND tontine_members.user_id = auth.uid()
    )
    OR creator_id = auth.uid()
  );
```

**Admin override**:
```sql
-- Admins can view all tontines
CREATE POLICY "admins_can_view_all_tontines" ON tontines
  FOR SELECT TO authenticated
  USING (is_admin(auth.uid()));
```

#### Database Functions

**1. Auto-create profile on signup**
```sql
CREATE FUNCTION handle_new_user()
-- Triggered on auth.users INSERT
-- Creates corresponding profile record
```

**2. Calculate trust score**
```sql
CREATE FUNCTION calculate_trust_score(p_user_id UUID) RETURNS NUMERIC
-- Analyzes payment history
-- Returns score between 1.0 and 5.0
```

**3. Update trust score trigger**
```sql
CREATE FUNCTION update_member_trust_score()
-- Triggered on payments INSERT/UPDATE
-- Recalculates and updates profiles.trust_score
```

**4. Create notification**
```sql
CREATE FUNCTION create_notification(
  p_user_id, p_type, p_title, p_body, p_tontine_id, p_metadata
)
-- Helper to insert notification with metadata
```

**5. Notify tontine members**
```sql
CREATE FUNCTION notify_tontine_members(
  p_tontine_id, p_type, p_title, p_body, p_metadata, p_exclude_user_id
)
-- Bulk notify all members of a tontine
```

**6. Auto-notification triggers**
```sql
-- Payment confirmed → notify member
CREATE TRIGGER trigger_notify_payment_confirmed

-- Round started → notify all members
CREATE TRIGGER trigger_notify_new_round

-- Member joined → notify member and creator
CREATE TRIGGER trigger_notify_member_joined
```

#### Realtime Subscriptions

Tables enabled for realtime:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE tontines;
ALTER PUBLICATION supabase_realtime ADD TABLE tontine_members;
ALTER PUBLICATION supabase_realtime ADD TABLE rounds;
ALTER PUBLICATION supabase_realtime ADD TABLE payments;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
```

**Usage in app**:
```typescript
// Subscribe to notification changes
supabase
  .channel('notifications')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'notifications',
    filter: `user_id=eq.${userId}`
  }, handleNewNotification)
  .subscribe();
```

### File Structure

```
/workspace
├── app/                      # Expo Router pages (file-based routing)
│   ├── (tabs)/              # Tab navigator screens
│   │   ├── index.tsx        # Dashboard (home)
│   │   ├── tontines.tsx     # Tontine list
│   │   ├── profile.tsx      # User profile
│   │   └── _layout.tsx      # Tab navigator config
│   ├── auth/                # Authentication flows
│   │   ├── phone.tsx        # Phone number entry
│   │   ├── otp.tsx          # OTP verification
│   │   ├── profile.tsx      # Profile completion
│   │   ├── callback.tsx     # OAuth callback
│   │   └── admin-login.tsx  # Admin backdoor
│   ├── tontine/            # Tontine management
│   │   ├── create.tsx       # Create new tontine
│   │   ├── join.tsx         # Join via invitation code
│   │   ├── [id].tsx         # Tontine detail screen
│   │   └── round/
│   │       └── [roundId].tsx # Round detail screen
│   ├── onboarding.tsx       # First-time user flow
│   ├── notifications.tsx    # Notification center
│   ├── index.tsx            # Entry point / redirect
│   ├── _layout.tsx          # Root layout
│   └── +not-found.tsx       # 404 screen
├── components/              # Reusable UI components
│   ├── GoldButton.tsx       # Premium button component
│   ├── TontineCard.tsx      # Tontine display card
│   ├── RoundCard.tsx        # Round display card
│   ├── TrustScoreBadge.tsx  # Trust tier badge
│   ├── SkeletonLoader.tsx   # Gold-shimmer loading states
│   ├── PremiumInput.tsx     # Styled text input
│   ├── NumismaticAvatar.tsx # Gold-accent avatar
│   ├── PaymentStatusList.tsx # Payment tracking list
│   ├── PayoutSequenceList.tsx # Member order list
│   ├── AddMemberModal.tsx   # Add member dialog
│   ├── InvitationModal.tsx  # Share invitation code
│   ├── LaunchCelebration.tsx # Tontine launch animation
│   ├── TontineCelebration.tsx # Completion animation
│   ├── PremiumEmptyState.tsx # Empty state with CTA
│   ├── ConnectivityBanner.tsx # Offline indicator
│   ├── CachedImage.tsx      # Image with loading state
│   ├── ProgressRing.tsx     # Circular progress indicator
│   └── SuperAdminBadge.tsx  # Admin role badge
├── contexts/                # React Context providers
│   ├── ThemeContext.tsx     # Dark/light theme
│   ├── UserContext.tsx      # Authentication state
│   └── TontineContext.tsx   # Tontine data + operations
├── constants/               # Design tokens
│   └── theme.ts             # Colors, fonts, spacing
├── i18n/                    # Internationalization
│   ├── config.ts            # i18next setup
│   └── locales/
│       ├── en.json          # English translations
│       ├── fr.json          # French translations
│       └── ar.json          # Arabic translations
├── lib/                     # External service clients
│   └── supabase.ts          # Supabase client config
├── types/                   # TypeScript definitions
│   ├── index.ts             # App-level types
│   └── database.ts          # Supabase generated types
├── utils/                   # Helper functions
│   ├── rtl.ts               # RTL layout helpers
│   └── ai.ts                # Newell AI integration helpers
├── supabase/                # Database schema & migrations
│   ├── schema.sql           # Complete schema (portability kit)
│   └── migrations/
│       └── 003_trust_score_and_notifications.sql
├── assets/                  # Static assets (images, fonts)
├── .env                     # Environment variables
├── app.json                 # Expo configuration
├── package.json             # Dependencies
├── tsconfig.json            # TypeScript configuration
├── CLAUDE.md                # Developer instructions
└── PROJECT_MEMORY.md        # This document
```

### Environment Variables

```env
# Newell AI Gateway (for AI features)
EXPO_PUBLIC_NEWELL_API_URL=https://newell.fastshot.ai

# Supabase Backend
EXPO_PUBLIC_SUPABASE_URL=https://qjvkbwjdgxwxmprprvwu.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...

# Auth Broker (OAuth flows)
EXPO_PUBLIC_AUTH_BROKER_URL=https://oauth.fastshot.ai

# Project ID
EXPO_PUBLIC_PROJECT_ID=7ccdf979-15b7-4237-9b61-eaa65a71597b
```

---

## 📐 DEVELOPER RULES & STANDARDS

### Golden Rules (NON-NEGOTIABLE)

#### 1. Transfer Kit Mandate
**EVERY PHASE MUST END WITH A COMPLETE "TRANSFER KIT"**

**What is a Transfer Kit?**
A portable, replayable SQL file that can recreate the entire database schema on any Supabase instance.

**Required Contents**:
- All table definitions
- All indexes
- All RLS policies
- All functions
- All triggers
- All realtime configurations
- Comments explaining complex logic

**Location**: `/workspace/supabase/schema.sql`

**Why it matters**: Enables easy database migration, disaster recovery, and onboarding of new developers/agents.

#### 2. AI Features: Newell AI Gateway Only
**ALL AI INTEGRATIONS MUST USE THE NEWELL AI SKILL**

**Forbidden**:
- Direct OpenAI API calls
- Direct Anthropic API calls
- Direct Replicate API calls
- Any other AI service direct integration

**Correct Approach**:
```typescript
// Use the newell-ai skill
import { Skill } from '@/tools';

// For text generation, chatbots
await Skill.invoke('newell-ai', {
  task: 'Generate trust score summary',
  // ...
});
```

**Why it matters**:
- Centralized AI governance
- Cost control
- Consistent prompting
- Easy to switch providers

#### 3. Fintech Luxe Aesthetic
**ALL UI MUST MAINTAIN THE PREMIUM FINTECH LUXE STANDARD**

**Checklist for every new UI**:
- [ ] Uses deep blue background (#0F172A)
- [ ] Gold accents (#D4AF37) on key elements
- [ ] Glassmorphism card style
- [ ] Gold-shimmer skeleton loaders (NOT basic spinners)
- [ ] Haptic feedback on interactions
- [ ] Smooth animations (react-native-reanimated)
- [ ] Proper spacing (from theme.ts)
- [ ] Border radius consistency (from theme.ts)

**Anti-Patterns to Avoid**:
- ❌ Generic Material Design
- ❌ Flat, colorful buttons
- ❌ Basic ActivityIndicator spinners
- ❌ Harsh shadows
- ❌ Bright, saturated colors

#### 4. RTL Support is Mandatory
**EVERY NEW UI COMPONENT MUST SUPPORT ARABIC RTL LAYOUT**

**RTL Checklist**:
- [ ] FlexDirection reversal for row layouts
- [ ] Text alignment conditional on language
- [ ] Absolute positioning (left/right) handled
- [ ] Icons/arrows flipped where semantically appropriate
- [ ] Test with Arabic language enabled

**Testing**:
```typescript
// In Profile settings, switch to Arabic
// Verify entire flow works correctly
```

#### 5. TypeScript Strict Mode
**NO `any` TYPES, NO IMPLICIT RETURNS**

**Compilation must pass**:
```bash
npx tsc --noEmit
```

**Why it matters**: Catches bugs at compile-time, improves maintainability.

#### 6. Safe Area Insets (Mobile UI)
**ALWAYS USE `useSafeAreaInsets()` FOR NAVIGATION BARS**

```typescript
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const insets = useSafeAreaInsets();

tabBarStyle: {
  paddingBottom: insets.bottom,
  height: 80,
}
```

**Why**: Prevents overlap with home indicator on iOS, gesture bars on Android.

### Code Quality Standards

#### Linting
```bash
npm run lint
```
Must pass with zero errors before committing.

#### TypeScript Compilation
```bash
npx tsc --noEmit
```
Must pass with zero errors before committing.

#### Error Handling
All async operations must have proper error handling:
```typescript
try {
  const { data, error } = await supabase.from('tontines').select();
  if (error) throw error;
  // Handle data
} catch (error) {
  console.error('Failed to fetch tontines:', error);
  // Show user-friendly error message
}
```

#### Loading States
Every data fetch must have:
1. Loading state (with gold-shimmer skeleton)
2. Error state (with retry button)
3. Empty state (with call-to-action)
4. Success state (with data)

### Testing Guidelines

#### Manual Testing Checklist (Per Feature)
- [ ] Test on iOS simulator
- [ ] Test on Android emulator
- [ ] Test in light mode
- [ ] Test in dark mode
- [ ] Test in French
- [ ] Test in Arabic (RTL)
- [ ] Test with slow network
- [ ] Test offline behavior
- [ ] Test with keyboard open
- [ ] Test with screen reader (accessibility)

#### Regression Testing (Before Each Phase Completion)
- [ ] Authentication flow works
- [ ] Tontine creation works
- [ ] Tontine launch works
- [ ] Payment declaration works
- [ ] Payment confirmation works
- [ ] Trust score updates correctly
- [ ] Notifications arrive in real-time
- [ ] Language switching works
- [ ] Theme switching works

---

## 📊 CURRENT STATUS

### Phase 4: Polishing & Robustness - **✅ COMPLETED**

#### What Was Accomplished

**1. Core Features (100% Complete)**
- ✅ User authentication (phone, OAuth)
- ✅ User profiles with trust scores
- ✅ Tontine creation (draft → active)
- ✅ Member management (add, remove, reorder)
- ✅ Invitation system (codes, expiration, validation)
- ✅ Round generation and management
- ✅ Payment declaration and confirmation
- ✅ Trust score calculation and display
- ✅ Real-time notifications
- ✅ Multi-language support (FR, EN, AR)
- ✅ RTL layout for Arabic
- ✅ Dark/light theme switching

**2. Database (100% Complete)**
- ✅ Complete schema with 8 core tables
- ✅ Row Level Security (RLS) on all tables
- ✅ Admin helper function (`is_admin`)
- ✅ Trust score calculation function
- ✅ Auto-update triggers for trust scores
- ✅ Notification creation functions
- ✅ Realtime enabled for key tables
- ✅ Transfer Kit (portability SQL file)

**3. UI/UX Polish (100% Complete)**
- ✅ Fintech Luxe aesthetic throughout
- ✅ Gold-shimmer skeleton loaders
- ✅ Haptic feedback on all interactions
- ✅ Smooth animations and transitions
- ✅ Premium empty states
- ✅ Celebration animations (launch, complete)
- ✅ Pull-to-refresh on all lists
- ✅ Connectivity banner for offline mode

**4. Developer Experience (100% Complete)**
- ✅ TypeScript strict mode enabled
- ✅ ESLint configuration
- ✅ Clean project structure
- ✅ Comprehensive type definitions
- ✅ Context-based state management
- ✅ Path aliases (`@/` mapping)
- ✅ Documentation (CLAUDE.md)
- ✅ This PROJECT_MEMORY.md document

### Deployment Status

**Ready for Production**: ✅ YES

The app is **fully functional and ready to deploy** to:
- Expo Go (for testing)
- TestFlight (iOS)
- Google Play Internal Testing (Android)
- Web (via Expo web build)

### Known Limitations & Future Enhancements

#### Minor Polish Items (Optional)
- [ ] Avatar upload functionality (using Supabase Storage)
- [ ] Push notifications (using Expo Notifications)
- [ ] In-app messaging between members
- [ ] Payment dispute resolution flow
- [ ] Advanced analytics dashboard
- [ ] Export tontine data to PDF

#### Future Features (Roadmap)
- [ ] Trust-based distribution logic (implementation)
- [ ] Recurring tontines (auto-restart after completion)
- [ ] Tontine templates (save common configurations)
- [ ] Member reputation badges
- [ ] Social sharing (invite via WhatsApp, SMS)
- [ ] Payment reminders (push notifications)
- [ ] Late payment penalties (configurable)
- [ ] Multi-currency support (EUR, USD)
- [ ] Insurance/guarantee system
- [ ] AI-powered financial insights (via Newell AI)

---

## 🔍 CRITICAL IMPLEMENTATION DETAILS

### 1. Tontine Launch Sequence

**This is the most complex operation in the app.** Here's the exact sequence:

```typescript
// Step 1: Validate preconditions
if (members.length !== tontine.total_members) throw new Error('Not all members added');
if (tontine.status !== 'draft') throw new Error('Already launched');

// Step 2: Execute distribution logic
if (distribution_logic === 'random') {
  // Shuffle members randomly
  const shuffled = shuffleArray(members);
  // Update payout_order for each member
  for (let i = 0; i < shuffled.length; i++) {
    await updateMember(shuffled[i].id, { payout_order: i + 1 });
  }
}

// Step 3: Update tontine status and dates
await updateTontine({
  status: 'active',
  start_date: new Date(),
  next_deadline: calculateNextDeadline(frequency),
});

// Step 4: Generate all rounds
for (let i = 0; i < members.length; i++) {
  const beneficiary = members.find(m => m.payout_order === i + 1);
  await createRound({
    tontine_id: tontine.id,
    round_number: i + 1,
    beneficiary_id: beneficiary.id,
    status: i === 0 ? 'current' : 'upcoming',
    scheduled_date: calculateRoundDate(start_date, frequency, i),
  });
}

// Step 5: Generate payments for first round
const firstRound = rounds[0];
for (const member of members) {
  await createPayment({
    round_id: firstRound.id,
    member_id: member.id,
    amount: tontine.contribution,
    status: 'pending',
  });
}

// Step 6: Create invitation code
await createInvitation({
  tontine_id: tontine.id,
  code: generateInviteCode(),
  expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  max_uses: members.length,
});

// Step 7: Notify all members
await notifyTontineMembers(tontine.id, 'tontine_launched', 'Tontine Started!', ...);

// Step 8: Show celebration animation
showLaunchCelebration();
```

### 2. Payment Confirmation Flow

**Admin confirms payment → Cascading updates**

```typescript
// User declares payment
await updatePayment(paymentId, {
  status: 'pending',
  declared_at: new Date(),
  method: 'flouci',
  reference: 'REF123',
});

// Admin confirms payment
await updatePayment(paymentId, {
  status: 'paid',
  confirmed_at: new Date(),
});

// 🔥 Automatic cascade (via SQL triggers):
// 1. update_member_trust_score() trigger fires
// 2. Calculates new trust score for member's user
// 3. Updates profiles.trust_score
// 4. notify_payment_confirmed() trigger fires
// 5. Creates notification for member

// Frontend checks if all payments confirmed
const allPaid = payments.every(p => p.status === 'paid');
if (allPaid) {
  // Mark round as completed
  await updateRound(roundId, {
    status: 'completed',
    completed_at: new Date(),
  });

  // Activate next round
  await updateRound(nextRoundId, {
    status: 'current',
  });

  // 🔥 notify_new_round() trigger fires automatically
}
```

### 3. Real-time Notification Delivery

**How notifications reach users instantly**

```typescript
// In UserContext or NotificationContext
useEffect(() => {
  if (!user) return;

  // Subscribe to notifications table changes
  const channel = supabase
    .channel('user-notifications')
    .on(
      'postgres_changes',
      {
        event: '*',  // INSERT, UPDATE, DELETE
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`,
      },
      (payload) => {
        if (payload.eventType === 'INSERT') {
          // New notification arrived
          const newNotification = payload.new as DbNotification;

          // Add to local state
          setNotifications(prev => [newNotification, ...prev]);

          // Show toast/banner
          showNotificationToast(newNotification);

          // Trigger haptic feedback
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

          // Update badge count
          setBadgeCount(prev => prev + 1);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [user]);
```

### 4. Trust Score Tier Determination

**Client-side helper (must match server logic)**

```typescript
export const getTrustTier = (score: number): TrustTier => {
  if (score >= 4.5) return 'master';   // 💠 Perfect record
  if (score >= 4.0) return 'elite';    // 👑 Exceptional
  if (score >= 3.5) return 'trusted';  // 💎 Very reliable
  if (score >= 3.0) return 'reliable'; // ⭐ Good
  return 'novice';                     // 🌱 New user
};

// Usage
const tier = getTrustTier(user.trustScore);
<TrustScoreBadge score={user.trustScore} tier={tier} />
```

### 5. Invitation Code Validation

**Multi-step validation process**

```typescript
const validateInvitationCode = async (code: string) => {
  // 1. Check format (6 alphanumeric characters)
  if (!/^[A-Z0-9]{6}$/.test(code)) {
    throw new Error('Invalid code format');
  }

  // 2. Fetch invitation from database
  const { data: invitation, error } = await supabase
    .from('invitations')
    .select('*, tontines(*)')
    .eq('code', code.toUpperCase())
    .single();

  if (error || !invitation) {
    throw new Error('Invitation not found');
  }

  // 3. Check expiration
  if (new Date(invitation.expires_at) < new Date()) {
    throw new Error('Invitation expired');
  }

  // 4. Check usage limit
  if (invitation.used_count >= invitation.max_uses) {
    throw new Error('Invitation fully used');
  }

  // 5. Check tontine status
  if (invitation.tontines.status !== 'draft') {
    throw new Error('Tontine already launched');
  }

  return invitation;
};
```

---

## ⚠️ KNOWN PATTERNS & ANTI-PATTERNS

### ✅ DO: Best Practices

#### Data Fetching
```typescript
// ✅ GOOD: Comprehensive error handling with user feedback
const [tontines, setTontines] = useState<Tontine[]>([]);
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

const fetchTontines = async () => {
  setIsLoading(true);
  setError(null);

  try {
    const { data, error } = await supabase
      .from('tontines')
      .select('*, members:tontine_members(*)')
      .order('created_at', { ascending: false });

    if (error) throw error;

    setTontines(transformData(data));
  } catch (err) {
    console.error('Failed to fetch tontines:', err);
    setError('Unable to load tontines. Please try again.');
  } finally {
    setIsLoading(false);
  }
};
```

#### Component Structure
```typescript
// ✅ GOOD: Clear separation, typed props, RTL support
interface TontineCardProps {
  tontine: Tontine;
  onPress?: () => void;
}

export const TontineCard: React.FC<TontineCardProps> = ({ tontine, onPress }) => {
  const { colors } = useTheme();
  const { t, i18n } = useTranslation();
  const rtl = i18n.language === 'ar';

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress?.();
  };

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card }, rtl && styles.cardRTL]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      {/* Card content */}
    </TouchableOpacity>
  );
};
```

#### SQL Queries (with RLS)
```typescript
// ✅ GOOD: RLS automatically filters, clean query
const { data: userTontines } = await supabase
  .from('tontines')
  .select(`
    *,
    members:tontine_members(*)
  `)
  .order('created_at', { ascending: false });

// RLS policy ensures user only sees tontines they're part of
```

#### Loading States
```typescript
// ✅ GOOD: Skeleton loader maintains layout
if (isLoading) {
  return (
    <>
      <TontineCardSkeleton />
      <TontineCardSkeleton />
      <TontineCardSkeleton />
    </>
  );
}
```

### ❌ DON'T: Anti-Patterns

#### Data Fetching
```typescript
// ❌ BAD: No error handling, no loading state
const fetchTontines = async () => {
  const { data } = await supabase.from('tontines').select();
  setTontines(data);
};
```

#### Component Structure
```typescript
// ❌ BAD: No TypeScript, no RTL, no haptics
export const TontineCard = ({ tontine, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress}>
      {/* Hardcoded styles, no theme */}
    </TouchableOpacity>
  );
};
```

#### Direct Database Manipulation
```typescript
// ❌ BAD: Bypassing RLS, manual trust score update
await supabase
  .from('profiles')
  .update({ trust_score: 4.2 })
  .eq('id', userId);

// ✅ GOOD: Let triggers handle it
await supabase
  .from('payments')
  .update({ status: 'paid', confirmed_at: new Date() })
  .eq('id', paymentId);
// Trust score auto-updates via trigger
```

#### Loading Indicators
```typescript
// ❌ BAD: Generic spinner, breaks visual consistency
if (isLoading) {
  return <ActivityIndicator size="large" color="#ffffff" />;
}

// ✅ GOOD: Gold-shimmer skeleton loader
if (isLoading) {
  return <SkeletonLoader width="100%" height={200} />;
}
```

#### Internationalization
```typescript
// ❌ BAD: Hardcoded strings
<Text>Total Savings</Text>

// ✅ GOOD: i18n with fallback
<Text>{t('dashboard.total_savings')}</Text>
```

### 🚨 Critical Mistakes to Avoid

1. **Never Disable RLS**: Even for testing. Use admin policies instead.
2. **Never Hardcode User IDs**: Always use `auth.uid()` in queries.
3. **Never Skip Skeleton Loaders**: Use gold-shimmer, not spinners.
4. **Never Forget RTL**: Test every new screen in Arabic.
5. **Never Omit Haptics**: All pressable elements need feedback.
6. **Never Use `any` Type**: TypeScript strict mode for a reason.
7. **Never Bypass Newell AI**: Direct API calls are forbidden.
8. **Never Commit Without Transfer Kit**: Database changes need SQL migration.

---

## 🎓 LEARNING FROM THIS PROJECT

### What Makes Dourou Special

**1. Trust-First Design**
Every feature reinforces trust:
- Transparent payment tracking
- Immutable round history
- Real-time updates
- Public trust scores
- Admin oversight

**2. Cultural Sensitivity**
Built for Tunisian users:
- TND currency default
- French primary language
- Full Arabic support with RTL
- Local payment methods (D17, Flouci)
- Tontine terminology (not "ROSCA" or "savings circle")

**3. Premium Positioning**
Not a casual app:
- Fintech Luxe aesthetic
- Gold-shimmer loaders
- Haptic feedback
- Celebration animations
- Attention to micro-interactions

**4. Robust Architecture**
Production-ready from day one:
- Row Level Security on all tables
- Automated triggers for business logic
- Real-time subscriptions
- Comprehensive error handling
- Type-safe throughout

### Key Architectural Decisions

**Why Supabase?**
- PostgreSQL with RLS = secure by design
- Realtime out of the box
- Auth included
- Edge Functions for serverless
- No vendor lock-in (self-hostable)

**Why Expo?**
- Over-the-air updates
- Managed native builds
- Cross-platform (iOS, Android, Web)
- Rich ecosystem (haptics, blur, gradients)
- Fast iteration

**Why Context API over Redux?**
- Simpler mental model
- No boilerplate
- TypeScript-friendly
- Sufficient for app complexity
- React built-in

**Why File-Based Routing (Expo Router)?**
- Intuitive project structure
- Type-safe navigation
- Automatic deep linking
- Easy to understand flow
- Industry standard (Next.js influence)

---

## 📝 CHANGE LOG

### Phase 1: Foundation (Completed)
- User authentication (phone + OAuth)
- Basic profile management
- Database schema v1
- Theme system (dark/light)
- Internationalization setup

### Phase 2: Core Features (Completed)
- Tontine creation and management
- Member addition and ordering
- Invitation system
- Round generation
- Payment tracking
- Admin confirmation flow

### Phase 3: Trust & Engagement (Completed)
- Trust score calculation (SQL function)
- Auto-update triggers
- Trust tier system (Novice → Master)
- Notification system
- Realtime subscriptions
- Notification triggers (payment confirmed, round started, member joined)

### Phase 4: Polishing & Robustness (Completed)
- Gold-shimmer skeleton loaders
- Haptic feedback throughout
- Launch celebration animation
- Pull-to-refresh on all lists
- Connectivity banner
- Empty state components
- RTL testing and fixes
- Transfer Kit (complete SQL portability)
- This PROJECT_MEMORY.md document

### Future Phases (Planned)
- **Phase 5**: Payment Integrations (Flouci API, D17 API)
- **Phase 6**: Push Notifications (Expo Notifications)
- **Phase 7**: Advanced Analytics (Charts, insights)
- **Phase 8**: AI-Powered Features (Newell AI integration)

---

## 🤝 ONBOARDING CHECKLIST FOR NEW AI AGENTS

If you're an AI agent taking over this project, complete this checklist:

### Understanding Phase
- [ ] Read this entire PROJECT_MEMORY.md document
- [ ] Read CLAUDE.md for development guidelines
- [ ] Review package.json to understand dependencies
- [ ] Review app.json to understand Expo configuration
- [ ] Examine /workspace/supabase/schema.sql to understand database

### Setup Phase
- [ ] Verify .env file has all required variables
- [ ] Check Supabase connection (can you query profiles table?)
- [ ] Verify Newell AI Gateway access
- [ ] Test authentication flow (phone or OAuth)

### Validation Phase
- [ ] Run `npx tsc --noEmit` (should pass with zero errors)
- [ ] Run `npm run lint` (should pass with zero errors)
- [ ] Test tontine creation flow (create → add members → launch)
- [ ] Test payment flow (declare → admin confirm)
- [ ] Test notification delivery (trigger payment confirmation)
- [ ] Test in Arabic (verify RTL works)

### Ready to Contribute
- [ ] Understand the Fintech Luxe aesthetic
- [ ] Know where to find reusable components
- [ ] Understand the Transfer Kit requirement
- [ ] Ready to maintain the trust-first design philosophy

---

## 🎯 PROJECT MISSION STATEMENT

**Dourou exists to bring transparency, trust, and modernity to the ancient practice of rotating savings.**

We believe:
- Financial tools should be **beautiful** and **trustworthy**
- Technology should **amplify**, not replace, human trust
- Tunisian culture deserves **world-class** fintech experiences
- Every person should have access to **secure collective savings**

This app is not just a product—it's a **bridge between tradition and innovation**, a **digital handshake**, and a **commitment to financial inclusion**.

---

## 📞 SUPPORT & RESOURCES

### For Developers
- **CLAUDE.md**: Development guidelines and patterns
- **PROJECT_MEMORY.md**: This comprehensive context document
- **Expo Docs**: https://docs.expo.dev
- **Supabase Docs**: https://supabase.com/docs
- **React Native Docs**: https://reactnavigation.org

### For Future AI Agents
- **Primary Context**: This document (PROJECT_MEMORY.md)
- **Secondary Context**: CLAUDE.md
- **Database Schema**: /workspace/supabase/schema.sql
- **Type Definitions**: /workspace/types/index.ts

### For Product Managers
- **Feature Status**: See "Current Status" section above
- **Roadmap**: See "Future Features" section above
- **Design System**: See "Design Language & Visual Identity" section above

---

## 🔄 DOCUMENT MAINTENANCE

### When to Update This Document

**Update PROJECT_MEMORY.md whenever**:
- New major feature is added (e.g., recurring tontines)
- Database schema changes significantly
- New developer rule is established
- Architecture decision is made (e.g., switch to different state management)
- New phase is completed
- Critical bug pattern is discovered

### How to Update

1. Find the relevant section
2. Add new information in the same voice/style
3. Update "Change Log" section at the bottom
4. Update "Current Status" if phase milestone reached
5. Keep formatting consistent (headers, code blocks, emojis)

### Version History

- **v1.0** (Phase 4 Complete): Initial comprehensive document
- **v1.1** (Phase 4.5 - Logic Consistency): Updated critical business rules:
  - Tontine joining restricted to `draft` status only
  - Payment states refined to 4-state system (unpaid, declared, paid, late)
  - Member limits harmonized to 3-50 across entire app
  - Trust Score calculation updated for new payment states
  - Launch button requires minimum 3 members

---

## ✨ FINAL NOTES

This document represents **hundreds of hours of development, design, and decision-making**. It's not just documentation—it's the **institutional memory** of the Dourou project.

Treat it with care. Update it diligently. Reference it often.

When in doubt, **read this document**. The answer is likely here.

**Welcome to the Dourou project. Let's build something extraordinary together.** 🚀

---

*Last updated: Phase 4.5 - Logic Consistency & Production Readiness*
*Document maintained by: Dourou AI Development Team*
*For questions or clarifications, refer to CLAUDE.md or update this document.*

**Phase 4.5 Changes Summary**:
- ✅ Fixed tontine joining logic (draft-only)
- ✅ Refined payment states (4-state system)
- ✅ Harmonized member limits (3-50)
- ✅ Updated Trust Score calculation
- ✅ Database migration created (004_refined_payment_states.sql)
