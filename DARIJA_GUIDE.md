# 🇹🇳 Dourou Tunisian Darija Translation Guide

## Overview
This guide documents the Tunisian dialect (Darija) localization strategy for the Dourou tontine management platform. It serves as a reference for maintaining authentic, culturally-appropriate translations for the Tunisian market.

---

## Why Tunisian Darija?

**Target Market:** Dourou is built specifically for Tunisian users managing traditional rotating savings groups (called "دورو" - Dourou in Tunisian Arabic).

**Language Context:**
- **Standard Arabic (ar):** Formal, used in official documents
- **Tunisian Darija (ar-TN):** Colloquial spoken language, more relatable
- **French (fr):** Widely understood, business language

**Strategy:** Provide authentic Tunisian Darija (ar-TN) as the primary Arabic option, with fallback to Standard Arabic (ar) when needed.

---

## Key Differences: Darija vs. Standard Arabic

### Common Tunisian Expressions

| English | Standard Arabic | Tunisian Darija | Usage Context |
|---------|----------------|-----------------|---------------|
| Continue | أكمل | كمّل | Buttons, actions |
| Cancel | إلغاء | بطّل | Confirmations |
| Confirm | تثبيت | ثبّت | Approvals |
| Welcome | أهلاً | أسلامة | Greetings |
| Late | متأخر | مواخر | Payment status |
| Paid | مدفوع | خلّص | Payment status |
| Complete | أكمل | كمل | Tontine status |
| Upcoming | القادم | الجاي | Rounds |
| Manage | إدارة | دوّر | Actions |
| Money | مال | فلوس | Financial terms |

### Verb Conjugations

**"To pay":**
- Standard: دفع (dafa'a)
- Darija: خلّص (khallas) - "He paid"
- Usage: "خلّص" is more natural in Tunisian financial contexts

**"To confirm":**
- Standard: أكّد (akkada)
- Darija: ثبّت (thabbet)
- Usage: Used for admin confirmations

**"To start":**
- Standard: ابدأ (ibda')
- Darija: ابدا (ibda) - softer pronunciation
- Usage: "تبدا الدورو؟" (Start the tontine?)

---

## Financial Terminology

### Tontine-Specific Terms

**"Dourou" (دورو):**
- Tunisian term for rotating savings groups
- More familiar than "جمعية" (jameiya - standard Arabic)
- Used consistently throughout the app

**Currency:**
- Standard: دينار تونسي (Tunisian Dinar)
- Darija: د.ت (D.T) or دينار (dinar)
- App uses: "د.ت" for brevity

**Payment Methods:**
- **Cash:** كاش (kash) - French loanword, widely used
- **Bank Transfer:** تحويل بنكي (standard, universal)
- **D17:** Tunisian mobile payment service
- **Flouci:** فلوسي (Tunisian fintech, keeps original name)

### Common Financial Phrases

| Context | Tunisian Darija | Literal Translation |
|---------|-----------------|---------------------|
| Late payment | مواخر | "He's late" |
| Declared payment | صرّح | "He declared" |
| Paid in full | خلّص | "He paid off" |
| Contribution | نصيبو | "His share" |
| Deadline | الوقت | "The time" |
| Collected amount | المحصل | "The collected" |

---

## Cultural Context

### Tunisian Tontine Culture

**Traditional Names:**
- Groups are often family-based: "عائلة بن علي" (Family Ben Ali)
- Use of "صحابك" (your friends) in invitations
- Informal, trust-based system

**Social Norms:**
- **Trust:** Central concept - "ثقة" (thiqa)
- **Punctuality:** Important but flexible - "في الوقت" (fi el wa9t)
- **Community:** "الكل" (everyone) frequently used

**Communication Style:**
- More casual than Standard Arabic
- Direct and friendly tone
- Use of emojis/icons acceptable (🇹🇳 flag, 💰 money)

### App-Specific Translations

**Onboarding:**
```
Screen 1:
- Title: "مرحبا بيك في دورو" (Welcome to Dourou)
- Description: "أسلامة! دوّر جمعياتك بكل سهولة وشفافية"
  (Hello! Manage your tontines with ease and transparency)
```

**Success Messages:**
```
Tontine Created:
- Title: "مبروك! الدورو تصنع!"
- Message: "الدورو متاعك ولّى جاهز. زيد أعضاء للبدء!"
  (Your tontine is ready. Add members to start!)
```

---

## Translation Guidelines

### 1. Tone & Voice
- **Casual but respectful:** Use "بيك" (you - informal) not "بكم" (formal)
- **Encouraging:** "مبروك" (congratulations) for successes
- **Clear:** Avoid complex financial jargon

### 2. Button Labels
Keep short (1-2 words):
- "كمّل" (Continue) not "واصل" (too formal)
- "ثبّت" (Confirm) not "أكّد"
- "بطّل" (Cancel) not "إلغاء"

### 3. Financial Terms
Use Tunisian colloquialisms:
- "فلوس" (money) over "مال"
- "خلص" (paid) over "دفع"
- "نصيبو" (his share) for contribution

### 4. Error Messages
Be friendly and helpful:
- "ما نجمتش" (couldn't) - casual past tense
- "حاول مرة أخرى" (try again) - encouraging

### 5. Status Labels
Use natural Darija:
- "مازال" (still pending) - natural Tunisian expression
- "مواخر" (late) - colloquial
- "خلّص" (paid) - completed action

---

## Common Mistakes to Avoid

### ❌ Don't Use Standard Arabic Forms
**Wrong:** "لقد أكمل الدفع" (He has completed the payment - formal)
**Right:** "خلّص" (He paid - casual)

### ❌ Don't Over-Formalize
**Wrong:** "يرجى الضغط على الزر" (Please press the button - too formal)
**Right:** "أنقر هنا" (Click here - simple)

### ❌ Don't Use Literary Vocabulary
**Wrong:** "الموعد النهائي" (final appointment - literary)
**Right:** "الوقت" (the time - colloquial)

### ❌ Don't Ignore French Loanwords
**Wrong:** "نقد" (currency - standard Arabic)
**Right:** "كاش" (cash - Tunisian loanword from French)

---

## Fallback Strategy

### Translation Hierarchy
```
ar-TN (Tunisian Darija)
  ↓ (if key missing)
ar (Standard Arabic)
  ↓ (if key missing)
fr (French)
  ↓ (if key missing)
en (English)
```

### When to Use Fallback
- **New features:** Add ar-TN first, then ar
- **Technical terms:** May use Standard Arabic if no colloquial equivalent
- **Legal text:** Use Standard Arabic (more formal)

---

## Practical Examples

### Payment Flow

**English → Tunisian Darija**
```json
{
  "payment": {
    "declare": "صرّح بالخلاص",          // Declare payment
    "declare_title": "صرّح بالخلاص",    // Declare payment (title)
    "method": "كيفاش خلصت",             // How did you pay?
    "method_cash": "كاش",               // Cash
    "status_unpaid": "ما خلصش",        // Didn't pay
    "status_declared": "صرّح",         // Declared
    "status_paid": "خلّص",             // Paid
    "status_late": "مواخر",            // Late
    "mark_paid": "حطّ خلّص",           // Mark as paid
    "confirm_mark_paid": "متأكد إلي هذا خلّص نصيبو؟"  // Are you sure he paid his share?
  }
}
```

### Tontine Creation

**English → Tunisian Darija**
```json
{
  "tontine": {
    "create": "إنشاء جمعية",                     // Create tontine
    "name": "اسم الجمعية",                      // Tontine name
    "launch_tontine": "انطلاق الدورو",          // Launch tontine
    "launch_confirm_title": "تبدا الدورو؟",     // Start the tontine?
    "launch_confirm_message": "الأعضاء والترتيب يتقفلو. متأكد؟",
                                                 // Members and order will lock. Sure?
    "launched_title": "مبروك! الدورو بدات!",    // Congrats! Tontine started!
    "launched_message": "الدورو متاعك ولّات نشيطة توّا!"
                                                 // Your tontine is now active!
  }
}
```

### Invitation System

**English → Tunisian Darija**
```json
{
  "tontine": {
    "invite_title": "ادعي صحابك",                           // Invite your friends
    "invite_code_label": "شارك هذا الكود",                   // Share this code
    "invite_copy": "نسّخ الكود",                             // Copy the code
    "invite_copied": "تنسّخ!",                               // Copied!
    "invite_share_message": "تعال للدورو متاعي \"{{name}}\"! استعمل الكود: {{code}}"
                                                             // Come to my tontine "{{name}}"! Use code: {{code}}
  }
}
```

---

## Testing Your Translations

### Checklist
1. **Natural Speech Test:** Would a Tunisian speaker say this in daily conversation?
2. **Context Test:** Does the translation fit the app's casual, friendly tone?
3. **Brevity Test:** Is it short enough for UI elements (buttons, labels)?
4. **Cultural Test:** Does it respect Tunisian financial customs?
5. **Consistency Test:** Do similar actions use similar verbs?

### Testing in App
```typescript
// Switch language to Tunisian Darija
import { changeLanguage } from '@/i18n/config';
await changeLanguage('ar-TN');
```

Navigate through all screens and verify:
- Text is readable (RTL layout)
- Buttons are appropriately sized
- Messages sound natural
- No overflow or truncation

---

## Maintenance Guidelines

### Adding New Translations

**Step 1:** Add to English first
```json
// en.json
"new_feature": {
  "title": "New Feature",
  "description": "This is a new feature"
}
```

**Step 2:** Translate to Standard Arabic
```json
// ar.json
"new_feature": {
  "title": "ميزة جديدة",
  "description": "هذه ميزة جديدة"
}
```

**Step 3:** Adapt to Tunisian Darija
```json
// ar-TN.json
"new_feature": {
  "title": "ميزة جديدة",                  // Keep formal (feature = technical term)
  "description": "هذي ميزة جديدة"        // Darija: "هذي" instead of "هذه"
}
```

### Updating Existing Translations

1. Check context of usage (button vs. paragraph)
2. Consult Tunisian speaker if unsure
3. Test in app before committing
4. Update all 4 language files (en, fr, ar, ar-TN)

---

## Resources

### Tunisian Arabic References
- **Dialect:** Tunisian Arabic (توني Tounsi)
- **Wikipedia:** https://en.wikipedia.org/wiki/Tunisian_Arabic
- **Common phrases:** Focus on financial and social contexts

### Tontine Cultural Context
- Traditional Tunisian ROSCAs (Rotating Savings)
- Community-based trust systems
- Mobile money integration (D17, Flouci)

### App-Specific Terms
- **Dourou:** دورو (rotating savings group)
- **Trust Score:** درجة الثقة (trust level)
- **Payout Sequence:** ترتيب الصرف (distribution order)

---

## Contact & Contributions

### Updating This Guide
When adding new features or finding better translations:
1. Document the rationale for translation choices
2. Provide context examples
3. Test thoroughly with native speakers

### Translation Review
For major updates, consult native Tunisian speakers to ensure:
- Authenticity of dialect
- Cultural appropriateness
- Natural flow in conversation

---

## Appendix: Complete Darija Vocabulary

### A-C
- **أسلامة** (aslama) - Hello, hi
- **بطّل** (battel) - Cancel
- **تعال** (ta'al) - Come
- **ثبّت** (thabbet) - Confirm
- **الجاي** (el jay) - Upcoming, next

### D-K
- **دوّر** (dawwer) - Manage, organize
- **خلّص** (khallas) - Paid, settled
- **كمّل** (kammel) - Continue, complete
- **كاش** (kash) - Cash

### L-S
- **مازال** (mazal) - Still, not yet
- **مبروك** (mabrouk) - Congratulations
- **متاعك** (mta'ak) - Yours (possessive)
- **مواخر** (mwakher) - Late, delayed
- **نسّخ** (nassekh) - Copy
- **نصيبو** (nasibu) - His share

### T-Z
- **تنسّخ** (tnassekh) - Copied
- **توّا** (tawwa) - Now, immediately
- **فلوس** (flous) - Money
- **ولّى** (walla) - Became, turned into
- **زيد** (zid) - Add, more

---

**Last Updated:** [Current Date]
**Maintained By:** Dourou Development Team
**Version:** 1.0
