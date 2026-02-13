# 🚀 DOUROU - Deployment & Environment Guide

> **Production Hardening Complete** - Phase 5
> This guide covers environment management, deployment procedures, and production readiness.

---

## 📋 Table of Contents

1. [Environment Configuration](#environment-configuration)
2. [Development → Production Migration](#development--production-migration)
3. [Database Setup](#database-setup)
4. [Security Checklist](#security-checklist)
5. [Deployment Steps](#deployment-steps)
6. [Monitoring & Maintenance](#monitoring--maintenance)

---

## 🔧 Environment Configuration

### Environment Variables

Dourou uses environment-specific configuration via `.env` files.

#### Development Environment (.env.development)

```env
# Newell AI Gateway
EXPO_PUBLIC_NEWELL_API_URL=https://newell.fastshot.ai

# Supabase (Development Instance)
EXPO_PUBLIC_SUPABASE_URL=https://your-dev-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_dev_anon_key_here

# Auth Broker
EXPO_PUBLIC_AUTH_BROKER_URL=https://oauth.fastshot.ai

# Project ID
EXPO_PUBLIC_PROJECT_ID=your-dev-project-id

# Environment Flag
EXPO_PUBLIC_ENVIRONMENT=development
```

#### Production Environment (.env.production)

```env
# Newell AI Gateway
EXPO_PUBLIC_NEWELL_API_URL=https://newell.fastshot.ai

# Supabase (Production Instance)
EXPO_PUBLIC_SUPABASE_URL=https://your-prod-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_prod_anon_key_here

# Auth Broker
EXPO_PUBLIC_AUTH_BROKER_URL=https://oauth.fastshot.ai

# Project ID
EXPO_PUBLIC_PROJECT_ID=your-prod-project-id

# Environment Flag
EXPO_PUBLIC_ENVIRONMENT=production

# Optional: Sentry for Error Tracking
EXPO_PUBLIC_SENTRY_DSN=your_sentry_dsn_here

# Optional: Analytics
EXPO_PUBLIC_ANALYTICS_ID=your_analytics_id_here
```

### Switching Between Environments

**Method 1: Manual Switch**
```bash
# Copy development config
cp .env.development .env

# Or copy production config
cp .env.production .env

# Restart Metro bundler
npm start -- --reset-cache
```

**Method 2: Using npm scripts** (add to package.json)
```json
{
  "scripts": {
    "dev": "cp .env.development .env && expo start",
    "prod": "cp .env.production .env && expo start",
    "build:dev": "cp .env.development .env && eas build --profile development",
    "build:prod": "cp .env.production .env && eas build --profile production"
  }
}
```

---

## 🗄️ Database Setup

### 1. Create Production Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click "New Project"
3. Configure:
   - **Name**: Dourou Production
   - **Database Password**: Strong password (save in password manager)
   - **Region**: Choose closest to Tunisia (e.g., Frankfurt, eu-central-1)
   - **Pricing Plan**: Pro (recommended for production)

### 2. Run All Migrations

Execute migrations in order:

```bash
# Connect to your Supabase project
supabase link --project-ref your-prod-project-id

# Run migrations
supabase db push
```

Or manually execute SQL files in order:
1. `001_initial_schema.sql` (if exists)
2. `002_additional_features.sql` (if exists)
3. `003_trust_score_and_notifications.sql`
4. `004_refined_payment_states.sql`
5. `005_production_hardening.sql` ⭐ **New in Phase 5**

### 3. Verify Database Setup

Run these checks:

```sql
-- Check all tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Expected tables:
-- - profiles
-- - tontines
-- - tontine_members
-- - rounds
-- - payments
-- - invitations
-- - notifications
-- - audit_log
-- - invitation_attempts (Phase 5)
-- - payment_rate_limits (Phase 5)

-- Check RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND rowsecurity = false;

-- Should return ZERO rows (all tables must have RLS enabled)

-- Check timezone functions
SELECT enforce_tunis_timezone();

-- Check rate limiting functions
SELECT check_invitation_rate_limit('00000000-0000-0000-0000-000000000000');
SELECT check_payment_rate_limit('00000000-0000-0000-0000-000000000000');
```

---

## 🔐 Security Checklist

### Database Security

- [ ] **RLS Enabled**: All tables have Row Level Security enabled
- [ ] **Immutable Audit Logs**: Audit logs cannot be edited or deleted
- [ ] **Rate Limiting Active**: Invitation and payment rate limits configured
- [ ] **Timezone Locked**: All timestamps use Africa/Tunis timezone
- [ ] **Strong Passwords**: Database password is strong and secured
- [ ] **Service Role Key Secured**: Never expose service role key in client

### Application Security

- [ ] **Environment Variables**: Production keys are different from development
- [ ] **API Keys Secured**: No hardcoded API keys in source code
- [ ] **Phone Masking**: Phone numbers are masked in shared views
- [ ] **Input Sanitization**: All user inputs are validated and sanitized
- [ ] **HTTPS Only**: All API calls use HTTPS
- [ ] **Auth Tokens**: Secure token storage using AsyncStorage

### Network Security

- [ ] **CORS Configured**: Supabase CORS settings allow only your domains
- [ ] **API Rate Limits**: Supabase rate limits configured appropriately
- [ ] **DDoS Protection**: CloudFlare or similar protection enabled
- [ ] **SSL Certificates**: Valid SSL certificates for all domains

---

## 📦 Deployment Steps

### Pre-Deployment Checklist

- [ ] All tests pass: `npx tsc && npm run lint`
- [ ] Environment variables configured for production
- [ ] Database migrations applied successfully
- [ ] Privacy Policy and Terms of Service reviewed
- [ ] App icons and splash screen finalized
- [ ] App store listings prepared (iOS App Store, Google Play)

### iOS Deployment (TestFlight / App Store)

#### 1. Configure EAS Build

Create `eas.json`:

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": false
      }
    },
    "production": {
      "ios": {
        "bundleIdentifier": "tn.dourou.app"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@example.com",
        "ascAppId": "your-asc-app-id",
        "appleTeamId": "your-apple-team-id"
      }
    }
  }
}
```

#### 2. Build for Production

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Build for iOS
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios --latest
```

### Android Deployment (Google Play)

#### 1. Generate Keystore

```bash
# Generate upload keystore
keytool -genkey -v -keystore dourou-upload-key.keystore -alias dourou -keyalg RSA -keysize 2048 -validity 10000

# Store keystore securely (DO NOT commit to git)
```

#### 2. Configure Build

Update `eas.json`:

```json
{
  "build": {
    "production": {
      "android": {
        "buildType": "app-bundle",
        "gradleCommand": ":app:bundleRelease"
      }
    }
  }
}
```

#### 3. Build and Submit

```bash
# Build for Android
eas build --platform android --profile production

# Submit to Google Play
eas submit --platform android --latest
```

### Web Deployment (Optional)

```bash
# Build web version
npx expo export:web

# Deploy to Vercel/Netlify/CloudFlare Pages
# Follow platform-specific instructions
```

---

## 📊 Monitoring & Maintenance

### Application Monitoring

#### Error Tracking (Sentry)

```typescript
// lib/sentry.ts
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  environment: process.env.EXPO_PUBLIC_ENVIRONMENT,
  enableInExpoDevelopment: false,
  tracesSampleRate: 1.0,
});
```

#### Analytics

Track key metrics:
- User signups
- Tontine creations
- Payment declarations
- Trust score changes
- Error rates

### Database Monitoring

Monitor via Supabase Dashboard:
- **Database Size**: Ensure within plan limits
- **Connection Pooling**: Monitor active connections
- **Query Performance**: Identify slow queries
- **API Usage**: Track API calls and rate limits

### Performance Metrics

Key metrics to monitor:
- **App Load Time**: < 3 seconds
- **API Response Time**: < 500ms average
- **Error Rate**: < 1%
- **User Retention**: Day 1, Day 7, Day 30
- **Trust Score Distribution**: Balance across tiers

### Regular Maintenance

#### Weekly
- [ ] Review error logs
- [ ] Check database performance
- [ ] Monitor API usage

#### Monthly
- [ ] Review audit logs for suspicious activity
- [ ] Clean old data (expired invitations, old rate limit logs)
- [ ] Update dependencies (security patches)
- [ ] Review and optimize slow queries

#### Quarterly
- [ ] Security audit
- [ ] Performance optimization
- [ ] User feedback review
- [ ] Feature planning

---

## 🆘 Troubleshooting

### Common Issues

#### Issue: Database Connection Errors

**Solution:**
- Verify `EXPO_PUBLIC_SUPABASE_URL` is correct
- Check Supabase project status
- Ensure API key is valid (anon key, not service role)
- Check network connectivity

#### Issue: Rate Limiting Not Working

**Solution:**
- Verify migration 005 was applied successfully
- Check rate limit tables exist
- Test rate limit functions manually
- Review audit logs for violations

#### Issue: Phone Numbers Not Masked

**Solution:**
- Verify `mask_phone_number()` function exists
- Check RLS policies on profiles table
- Ensure viewer_id is correctly passed
- Test with non-admin, non-owner user

#### Issue: Timestamps Wrong Timezone

**Solution:**
- Verify `enforce_tunis_timezone()` trigger is active
- Check trigger is attached to all relevant tables
- Manually set timezone: `SET TIME ZONE 'Africa/Tunis';`

---

## 📞 Support

For deployment assistance:
- **Documentation**: Review this guide and PROJECT_MEMORY.md
- **Supabase Support**: [support.supabase.com](https://support.supabase.com)
- **Expo Support**: [forums.expo.dev](https://forums.expo.dev)

---

## ✅ Production Launch Checklist

Final checks before going live:

### Technical
- [ ] All environment variables set for production
- [ ] Database migrations applied and verified
- [ ] RLS policies tested thoroughly
- [ ] Rate limiting tested and working
- [ ] Phone masking working correctly
- [ ] Timezone enforcement verified (Africa/Tunis)
- [ ] Error tracking configured (Sentry)
- [ ] Analytics configured

### Legal & Compliance
- [ ] Terms of Service finalized and accessible
- [ ] Privacy Policy finalized and accessible
- [ ] User data protection measures in place
- [ ] GDPR compliance (if applicable)
- [ ] Cookie policy (web version)

### User Experience
- [ ] App tested on multiple devices (iOS & Android)
- [ ] RTL support tested (Arabic)
- [ ] All translations complete (FR, AR, EN)
- [ ] Loading states and error messages polished
- [ ] Haptic feedback working on all interactions

### Business
- [ ] App store listings prepared
- [ ] Marketing materials ready
- [ ] Support channels established
- [ ] Pricing model finalized (if applicable)
- [ ] Launch announcement ready

---

## 🎉 You're Ready to Launch!

Dourou has been built with production-readiness in mind from Phase 1. With Phase 5 (Production Hardening) complete, the app now includes:

✅ **Security**: Rate limiting, immutable audit logs, input sanitization
✅ **Privacy**: Phone masking, secure account deletion, data protection
✅ **Localization**: Africa/Tunis timezone, TND currency, multi-language
✅ **Compliance**: Terms of Service, Privacy Policy, user rights
✅ **Monitoring**: Error tracking, performance metrics, audit logs

**Good luck with your launch! 🚀**

---

*Document Version: 1.0 - Phase 5 Complete*
*Last Updated: Production Hardening Phase*
