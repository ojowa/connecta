# SDD 16: Localization & Internationalization

## 1. Overview

OJChat's localization strategy enables multi-language support across African markets, starting with Nigeria's four major languages and expanding to pan-African coverage. The architecture separates translatable content from application logic, supports locale-aware formatting, and provides tooling for translators to manage string updates efficiently.

The i18n system is designed for incremental rollout: V1 ships English-only, V2 adds Nigerian languages, and V3 targets the broader African market.

---

## 2. Language Support

### 2.1 V1 — English (Launch)

- Default and only language for initial Nigerian launch
- All UI strings, error messages, and notifications in English

### 2.2 V2 — Nigerian Languages (Month 3)

| Language | Code | Speakers (Nigeria) | Priority |
|---|---|---|---|
| English | `en` | ~100M (L1 + L2) | P0 — Default |
| Yoruba | `yo` | ~45M | P1 |
| Igbo | `ig` | ~30M | P1 |
| Hausa | `ha` | ~80M | P1 |

### 2.3 V3 — Pan-African Languages (Month 9)

| Language | Code | Region | Priority |
|---|---|---|---|
| Swahili | `sw` | East Africa | P1 |
| French | `fr` | West/Central Africa | P1 |
| Zulu | `zu` | Southern Africa | P2 |
| Amharic | `am` | East Africa | P2 |
| Arabic | `ar` | North Africa | P2 |
| Portuguese | `pt` | Lusophone Africa | P3 |

### 2.4 Language Detection

On first launch, the app detects the device's system language and sets the app locale accordingly. Users can override the language at any time via `Settings > Language`. The selected language persists across sessions and is synced to the user's profile on the server.

---

## 3. Technical Architecture

### 3.1 Library Integration

**Mobile App (React Native / Expo):**
- `react-i18next` for translation management
- `i18next` core library with `i18next-resources-to-backend` for lazy loading
- `expo-localization` for device locale detection

**Admin Panel (Next.js):**
- `next-intl` for server/client component translation support
- Locale-based routing (`/en/dashboard`, `/yo/dashboard`)

**API (NestJS):**
- `nestjs-i18n` for request-scoped translations (error messages, validation)
- Accept-Language header parsing for automatic locale detection

### 3.2 Translation File Structure

```
packages/
  mobile/
    src/
      locales/
        en/
          common.json       # Shared strings (buttons, labels, actions)
          auth.json          # Authentication flow strings
          profile.json       # Profile creation/editing
          matching.json      # Match discovery and interaction
          messaging.json     # Chat and conversation
          settings.json      # Settings screens
          notifications.json # Push notification content
          errors.json        # Error messages
        yo/
          common.json
          auth.json
          ...
        ig/
          ...
        ha/
          ...
  admin/
    messages/
      en.json
      yo.json
      ig.json
      ha.json
```

### 3.3 Dynamic Language Loading

Translations are loaded on demand to minimize initial bundle size:

```javascript
// i18n.js configuration
i18next.use(resourcesToBackend(
  (language, namespace) => import(`./locales/${language}/${namespace}.json`)
)).init({
  fallbackLng: 'en',
  ns: ['common', 'auth', 'profile', 'matching', 'messaging', 'settings'],
  defaultNS: 'common',
  supportedLngs: ['en', 'yo', 'ig', 'ha'],
  interpolation: {
    escapeValue: false // React already escapes
  }
});
```

Language bundles are loaded lazily — only the active language's strings are included in the initial bundle. Switching languages triggers a dynamic import of the new locale's files.

---

## 4. String Management

### 4.1 Externalization Rules

All user-facing strings must be externalized to translation files. This includes:

- UI labels, buttons, headings
- Error messages and validation feedback
- Push notification titles and bodies
- In-app purchase descriptions
- Onboarding tutorial text
- Empty state messages
- Loading indicators with text

**Not externalized:** Log messages, developer-only debug strings, hardcoded API paths.

### 4.2 Translation Keys

Keys follow a hierarchical dot-notation convention:

```
auth.signup.title          → "Create your account"
auth.signup.subtitle       → "Join thousands of singles in Nigeria"
auth.signup.email_label    → "Email address"
auth.signup.error.email_taken → "This email is already registered"

profile.edit.photo.add    → "Add photo"
profile.edit.photo.max    → "Maximum {{count}} photos"

matching.match.distance   → "{{distance}} km away"
matching.match.time_ago   → "{{time}} ago"
```

### 4.3 Pluralization

i18next pluralization is used for count-dependent strings:

```json
{
  "match.count": {
    "one": "{{count}} new match",
    "other": "{{count}} new matches"
  },
  "message.count": {
    "zero": "No messages yet",
    "one": "{{count}} message",
    "other": "{{count}} messages"
  }
}
```

### 4.4 Interpolation

Variables are denoted with `{{variable}}` syntax:

```json
{
  "profile.distance": "{{distance}} km away",
  "subscription.expiry": "Expires {{date}}",
  "notification.match": "You matched with {{name}}!"
}
```

### 4.5 Translation Workflow

1. Developers add new keys to English source files
2. Keys are exported to translation management system (TMS)
3. Professional translators translate each language
4. Translations are reviewed by native speakers
5. Translated files are committed to the repository
6. CI validates all languages have complete translations before merge

---

## 5. Date/Time/Number Formatting

### 5.1 Date Formatting

All dates use locale-aware formatting via `Intl.DateTimeFormat`:

| Locale | Date Format | Example |
|---|---|---|
| `en` | DD/MM/YYYY | 20/07/2026 |
| `yo` | DD/MM/YYYY | 20/07/2026 |
| `ig` | DD/MM/YYYY | 20/07/2026 |
| `ha` | DD/MM/YYYY | 20/07/2026 |
| `fr` | DD/MM/YYYY | 20/07/2026 |
| `sw` | DD/MM/YYYY | 20/07/2026 |

Relative time formatting for in-app display:
- "Just now" / "5m ago" / "2h ago" / "Yesterday" / "15 Mar 2026"

### 5.2 Currency Formatting

| Locale | Currency | Format | Example |
|---|---|---|---|
| `en` (Nigeria) | NGN | ₦2,000 | ₦2,000 |
| `en` (Kenya) | KES | KSh 2,000 | KSh 2,000 |
| `en` (Ghana) | GHS | GH₵ 20.00 | GH₵ 20.00 |
| `en` (UK) | GBP | £2,000 | £2,000 |
| `en` (US) | USD | $2,000 | $2,000 |
| `fr` | NGN | 2 000 ₦ | 2 000 ₦ |

### 5.3 Phone Number Formatting

Phone numbers are formatted based on locale using `libphonenumber-js`:

| Locale | Format | Example |
|---|---|---|
| `en` (Nigeria) | +234 XXX XXX XXXX | +234 801 234 5678 |
| `en` (Kenya) | +254 XXX XXX XXX | +254 712 345 678 |
| `sw` | +254 XXX XXX XXX | +254 712 345 678 |

### 5.4 Number Formatting

| Locale | Decimal Separator | Thousands Separator | Example |
|---|---|---|---|
| `en` | . | , | 1,234,567.89 |
| `fr` | , | (space) | 1 234 567,89 |
| `ha` | . | , | 1,234,567.89 |

---

## 6. RTL Support

### 6.1 Architecture Readiness

While no RTL languages are in the initial scope, the UI architecture is built to support future RTL languages (Arabic, Hebrew) without major refactoring:

- All layouts use Flexbox with `start`/`end` instead of `left`/`right`
- Margins and paddings use logical properties (`marginInlineStart` instead of `marginLeft`)
- Icons with directional meaning use `I18nManager` for mirroring
- Text alignment respects `I18nManager.isRTL`

### 6.2 Future RTL Implementation

When RTL support is needed:
1. Add locale to `I18nManager.forceRTL()` trigger list
2. Audit all layout components for directional assumptions
3. Test icon mirroring (arrows, chevrons, progress indicators)
4. Validate navigation stack behavior with RTL layouts

---

## 7. Content Moderation

### 7.1 Multi-Language Moderation

Content moderation must handle multiple languages:

| Content Type | Moderation Approach | Languages |
|---|---|---|
| Profile bios | ML classifier + human review | en, yo, ig, ha |
| Messages (reported) | ML classifier + human review | en, yo, ig, ha |
| Reported images | Visual AI + human review | N/A |
| Usernames | Automated filter + human review | en, yo, ig, ha |

### 7.2 Region-Specific Content Policies

Different markets have different content sensitivity norms:

- **Nigeria**: Content policies aligned with NBC (National Broadcasting Commission) guidelines
- **Kenya**: Compliance with Kenya Information and Communications Act
- **General Africa**: Adherence to AU Convention on Cyber Security and Personal Data Protection

### 7.3 Moderation Localization

- Moderation UI is fully translated so local moderators work in their preferred language
- Moderation templates (warning messages, ban reasons) are translated per locale
- Appeal responses can be templated per language

---

## 8. Testing

### 8.1 Pseudo-Localization

Automated pseudo-localization testing is run in CI to catch unexternalized strings and layout issues:

- All translatable strings are converted to pseudo-localized versions (e.g., "Hello" → "[Ħéľľö!!!]")
- UI is tested to ensure pseudo-localized strings don't overflow or break layouts
- This catches missing translation keys before they reach translators

### 8.2 Translation Coverage Reports

CI generates translation coverage reports on every PR:

```
Language | Translated | Missing | Coverage
---------|-----------|---------|--------
en       | 245       | 0       | 100%
yo       | 238       | 7       | 97.1%
ig       | 230       | 15      | 93.9%
ha       | 241       | 4       | 98.4%
```

PRs that reduce coverage below 95% for any supported language are blocked from merging.

### 8.3 Functional Testing

- Automated E2E tests run against each supported language
- Locale switching tested on every screen
- Date/number/currency formatting validated per locale
- Push notification content verified in all languages

---

## 9. Implementation Status

### V1 — English Only (Current)

- [x] i18n library integration (`react-i18next`)
- [x] All UI strings externalized to English JSON files
- [x] Translation key naming convention established
- [x] Pluralization rules for English
- [x] Date/time formatting for English locale
- [x] Currency formatting (NGN)
- [x] Phone number formatting (Nigeria)
- [ ] Pseudo-localization CI test
- [ ] Translation coverage report

### V2 — Nigerian Languages (Q2 2026)

- [ ] Yoruba translation file (100% coverage)
- [ ] Igbo translation file (100% coverage)
- [ ] Hausa translation file (100% coverage)
- [ ] Language picker in settings
- [ ] Device locale auto-detection
- [ ] Locale-aware date/number formatting
- [ ] Translation management system integration
- [ ] Native speaker review process

### V3 — Pan-African Languages (Q4 2026)

- [ ] Swahili translation file
- [ ] French translation file
- [ ] Zulu translation file
- [ ] Amharic translation file
- [ ] RTL architecture validation
- [ ] Multi-language content moderation
- [ ] Region-specific content policies
- [ ] Translation CI pipeline for 10+ languages
