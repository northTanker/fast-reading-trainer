# Requirements Document

## Project Overview

This document defines the requirements for a comprehensive audit of the BacaKilat speed reading trainer application. The audit will evaluate all aspects of the project including code quality, performance, security, accessibility, testing, architecture, configuration, and UI/UX.

## Introduction

This audit specification provides a systematic framework for evaluating the complete state of the fast-reading-trainer project. The audit will produce actionable findings with severity levels, specific recommendations, and verification methods.

## Glossary

- **Audit**: A systematic examination of the codebase to evaluate current state against best practices
- **Severity**: The level of impact - Critical, High, Medium, Low, or Informational
- **Finding**: A specific issue or observation discovered during the audit
- **Recommendation**: A suggested action to address a finding
- **WCAG**: Web Content Accessibility Guidelines
- **RSVP**: Rapid Serial Visual Presentation - the core reading technique
- **ORP**: Optimal Recognition Point - the focal point in each word for speed reading

---

## Requirements

### Requirement 1: Code Quality Audit

**User Story:** As a developer, I want to understand the current code quality state, so that I can prioritize technical debt and improvements.

#### Acceptance Criteria

1. WHEN the Code Quality Audit executes on source TypeScript files in the project, THE Audit SHALL report the count of `any` type usages found, with a pass threshold of zero (0) `any` type occurrences allowed.
2. WHEN the Audit detects duplicate code, THE Audit SHALL identify code blocks of 5 or more consecutive lines that are identical across files, with a pass threshold of zero (0) duplicate blocks allowed.
3. THE Audit SHALL check that all async function calls are wrapped in try-catch blocks or use equivalent error handling, with a pass threshold requiring 100% coverage for non-void async functions.
4. THE Audit SHALL verify that file names follow these patterns: React component files use PascalCase (e.g., Reader.tsx), utility/helper files use camelCase (e.g., tokenizer.ts), with a pass threshold of 100% compliance.
5. THE Audit SHALL identify functions of 20 or more lines that appear to have no external dependencies and are duplicated in 2 or more files, with a pass threshold of zero (0) extraction opportunities allowed.
6. THE Audit SHALL verify that all React component props have explicit type definitions (interfaces or type aliases), with a pass threshold of 100% typed components.
7. THE Audit SHALL verify that string literals in JSX content (not aria-labels, not data attributes) are not present, with a pass threshold of zero (0) hardcoded strings in render output.
8. THE Audit SHALL report the count of unused imports (imported but not referenced) and the count of exported functions that are never imported elsewhere, with a pass threshold of zero (0) unused imports and zero (0) dead exports allowed.

#### Tools & Commands
- TypeScript strict mode: `npx tsc --noEmit`
- ESLint: `npx eslint --ext .ts,.tsx .`
- Unused imports: ESLint `no-unused-vars` rule

#### Pass/Fail Criteria
- PASS: Zero `any` types, zero duplicate blocks, 100% error handling coverage, 100% naming compliance, zero extraction opportunities, 100% prop typing, zero hardcoded strings, zero unused imports/dead exports
- FAIL: Any violation of the above thresholds

---

### Requirement 2: Performance Audit

**User Story:** As a user, I want the application to load quickly and run smoothly, so that my reading experience is not interrupted.

#### Acceptance Criteria

1. WHEN a production build is analyzed, THE Performance Audit SHALL measure the total JavaScript bundle size and identify any individual chunk exceeding 244 KB (the Next.js dynamic import default limit), generating a list of dependencies contributing to oversized chunks.
2. WHEN React component files are analyzed, THE Audit SHALL check all component files in the components/ and hooks/ directories for missing React.memo wrapper on components that receive primitive props, and missing useCallback/useMemo for functions/values used in dependency arrays or rendered JSX.
3. WHEN Next.js routing configuration is analyzed, THE Audit SHALL verify that each route defined in app/ directory uses dynamic imports for heavy components (recharts, firebase, pdfjs-dist, mammoth) by checking for Next.js dynamic() imports or React.lazy() usage, and SHALL report a recommendation if any heavy dependency is imported statically.
4. WHEN the useReader hook is analyzed, THE Audit SHALL verify that requestAnimationFrame is cancelled via cancelAnimationFrame in cleanup functions, that RAF loop does not run when sessionState is not "reading", and that no stale closures capture wordIndex or wpm values without refs.
5. WHEN source files are analyzed, THE Audit SHALL identify all addEventListener calls without corresponding removeEventListener in cleanup functions, all setInterval calls without corresponding clearInterval in cleanup functions, and all setTimeout calls that are not cleared on component unmount.
6. WHEN public/ directory is analyzed, THE Audit SHALL verify all image files exceed 10 KB in size, are served in modern formats (WebP, AVIF, or SVG), and are loaded via loading="lazy" attribute or Next.js Image component when dimensions exceed 100x100 pixels.
7. WHEN localStorage usage is analyzed, THE Audit SHALL verify that no single key stores data exceeding 2 MB (50% of typical 5MB quota), that the reading-history key schema includes pagination or limit on stored records (maximum 100 recent sessions), and that large JSON serialization operations (greater than 100KB serialized) occur no more than once per user session.
8. WHEN source files are analyzed, THE Audit SHALL identify all dynamic import() calls and verify they target heavy dependencies (firebase, recharts, pdfjs-dist, mammoth) rather than core rendering code, and SHALL report effectiveness as PASS if dynamic imports are used for 3+ heavy dependencies, PARTIAL if 1-2, or FAIL if none.

#### Tools & Commands
- Bundle analysis: `npm run build && npx @next/bundle-analyzer`
- React optimization: Manual code review with React DevTools Profiler

#### Pass/Fail Criteria
- PASS: All chunks < 244KB, dynamic imports for heavy deps, no memory leaks, optimized images, localStorage limits
- FAIL: Any oversized chunk, missing dynamic imports, memory leak risks, unoptimized images

---

### Requirement 3: Security Audit

**User Story:** As a user, I want my data to be secure, so that I can trust the application with my information.

#### Acceptance Criteria

1. WHEN user input is validated, THE Security Audit SHALL verify that all text input in components/TextInput.tsx uses Zod schema validation with constraints (text field: max 50000 characters, prompt field: max 10000 characters) and that invalid input triggers visible error messages.
2. WHEN user content is rendered, THE Audit SHALL check that components/Reader.tsx, components/SessionSummary.tsx, and any component displaying user text does NOT use dangerouslySetInnerHTML, and SHALL FAIL if found.
3. WHEN Firebase configuration is analyzed, THE Audit SHALL examine firestore.rules and verify: (a) match /users/{userId}/** allows read/write only if request.auth.uid == userId, (b) match /sessions/{sessionId} allows create only if request.auth != null, with explicit DENY rules for all other paths.
4. WHEN API routes are analyzed, THE Audit SHALL verify app/api/quiz/route.ts and app/api/copilot/route.ts check authentication via Firebase auth token in Authorization header BEFORE processing requests.
5. WHEN source code is scanned, THE Audit SHALL identify hardcoded secrets by searching for patterns: /api\/[a-zA-Z0-9_-]{20,}/, /Bearer [a-zA-Z0-9_-]{20,}/, /firebase[_-]?[a-zA-Z]+["\']?\s*[:=]\s*["\'][^"\'\s]{20,}/ and SHALL FAIL if any match is found outside .env files.
6. WHEN environment configuration is analyzed, THE Audit SHALL verify .env.local contains all required variables (NEXT_PUBLIC_FIREBASE_API_KEY, NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN, NEXT_PUBLIC_FIREBASE_PROJECT_ID, DEEPSEEK_API_KEY) and SHALL verify .env.example documents each variable without containing actual values.
7. WHEN AI API integration is analyzed, THE Audit SHALL verify that app/api/copilot/route.ts sends API requests to DeepSeek with the key in the Authorization header (Bearer token), never in URL query parameters, and the server-side route (not client-side) makes the external call.

#### Tools & Commands
- Dependency vulnerabilities: `npm audit --audit-level=high`
- Secret scanning: `grep -r "api_key\|secret\|password" --include="*.ts" --include="*.tsx" .`
- Firebase rules: Review firestore.rules

#### Pass/Fail Criteria
- PASS: Input validation present, no XSS risks, proper Firebase rules, auth on API routes, no exposed secrets, proper env handling, secure AI API calls
- FAIL: Any vulnerability found in the above checks

---

### Requirement 4: Accessibility Audit

**User Story:** As a user with disabilities, I want the application to be usable with assistive technologies, so that I can benefit from speed reading training.

#### Acceptance Criteria

1. WHEN the accessibility audit runs, THE Accessibility Audit SHALL verify all interactive elements in components/Controls.tsx, components/TextInput.tsx, components/ThemeToggle.tsx, and app/page.tsx are keyboard accessible.
2. WHEN the accessibility audit runs, THE Accessibility Audit SHALL verify that icon-only buttons (skip forward, skip back, theme toggle, play/pause) have non-empty aria-label attributes.
3. WHEN the accessibility audit runs, THE Accessibility Audit SHALL verify focus management during state transitions by checking that focusable elements receive focus in logical order (tabindex >= 0) and no focus trap occurs without aria-hidden on hidden elements.
4. WHEN the accessibility audit runs, THE Accessibility Audit SHALL verify color contrast ratios meet WCAG 2.1 Level AA: minimum 4.5:1 for normal text, 3:1 for large text (18px bold or 24px regular), and 3:1 for graphical objects and UI components.
5. WHEN the accessibility audit runs, THE Accessibility Audit SHALL verify the Reader component in components/Reader.tsx announces word changes using aria-live region with politeness setting of "polite" or "assertive".
6. WHEN the accessibility audit runs, THE Accessibility Audit SHALL verify form input elements in components/TextInput.tsx have associated label elements via htmlFor/id association or nested label elements.
7. WHEN the accessibility audit runs, THE Accessibility Audit SHALL verify the page includes skip navigation link (link with href="#main-content" or similar) and landmark regions (header, main, footer, nav) with appropriate aria-label or role attributes.
8. WHEN the accessibility audit runs, THE Accessibility Audit SHALL verify dynamic content updates in the Reader component (word changes during reading) and progress updates are announced to screen readers via aria-live regions.

#### Tools & Commands
- Automated: `npx eslint --ext .ts,.tsx --rule "jsx-a11y/..." .` or `npx axe-cli <url>`
- Manual: Keyboard navigation test, Screen reader test (NVDA/VoiceOver/TalkBack)
- Contrast: Browser DevTools or axe-core

#### Pass/Fail Criteria
- PASS: All 8 checks complete without critical violations
- FAIL: Any interactive element without keyboard accessibility, any icon-only button without aria-label, contrast ratio below WCAG AA thresholds, missing aria-live on Reader, missing form labels, missing skip navigation/landmarks, or dynamic content not announced

---

### Requirement 5: Testing Audit

**User Story:** As a developer, I want comprehensive test coverage, so that I can confidently make changes without breaking functionality.

#### Acceptance Criteria

1. THE Testing Audit SHALL measure current test coverage percentage and FAIL if coverage falls below 70%.
2. THE Audit SHALL identify critical paths missing tests (RSVP reader in hooks/useReader.ts, gamification logic in lib/gamification.ts, tokenizer in lib/tokenizer.ts, ORP in lib/orp.ts) - the audit SHALL report specific line/branch coverage for each critical path regardless of overall coverage percentage.
3. THE Audit SHALL check test quality by verifying: (a) at least 80% of test files contain non-trivial assertions (assertions that validate computed values, not just constant comparisons like expect(true).toBe(true)), (b) all external dependencies (Firebase, localStorage, window events) are mocked in unit tests.
4. THE Audit SHALL verify integration tests exist for all API routes (app/api/*/route.ts) - FAIL if any API route lacks corresponding integration test.
5. THE Audit SHALL check for E2E test scenarios covering these critical user flows: (a) RSVP reading session from start to finish, (b) user authentication flow, (c) saving and loading reading history, (d) gamification points calculation and display - FAIL if any critical flow lacks E2E test.
6. THE Audit SHALL verify property-based tests exist for pure functions (tokenizer in lib/tokenizer.ts, ORP in lib/orp.ts, gamification in lib/gamification.ts) - FAIL if any pure function lacks property-based tests.
7. THE Audit SHALL examine test execution time and identify slow tests - FAIL if any individual test exceeds 1000ms execution time.
8. THE Audit SHALL verify tests are integrated into CI/CD pipeline by checking for presence of test command in package.json scripts AND presence of CI configuration file (.github/workflows/*.yml, .gitlab-ci.yml, or similar).

#### Tools & Commands
- Coverage: `npx vitest run --coverage`
- Test execution: `npx vitest run`

#### Pass/Fail Criteria
- PASS: Coverage >= 70%, critical paths tested, quality assertions, API tests exist, E2E flows covered, property-based tests exist, no slow tests, CI integration present
- FAIL: Any threshold not met

---

### Requirement 6: Architecture Audit

**User Story:** As a developer, I want a well-organized codebase, so that I can easily navigate and maintain the project.

#### Acceptance Criteria

1. WHEN Architecture Audit is invoked, THE Audit SHALL verify that source files reside in the expected directories: components/, hooks/, lib/, types/, and app/ with no cross-directory violations.
2. WHEN Architecture Audit is invoked, THE Audit SHALL identify all circular dependencies between modules and report them in the output.
3. WHEN Architecture Audit is invoked, THE Audit SHALL check that all production dependencies are within 1 minor version of the latest available version, and SHALL flag any package with known security vulnerabilities (CVEs with severity "high" or above) as failures.
4. WHEN Architecture Audit is invoked, THE Audit SHALL verify that custom hooks pass eslint-plugin-react-hooks rules: exhaustive-deps and rules-of-hooks.
5. WHEN Architecture Audit is invoked, THE Audit SHALL examine state management patterns and verify that: (a) React Context is used for global shared state only, (b) local component state uses useState/useReducer, and (c) no more than 3 consecutive prop-passing levels exist between provider and consumer.
6. WHEN Architecture Audit is invoked, THE Audit SHALL check for proper use of context vs props drilling and FAIL when props are passed through more than 3 levels.
7. WHEN Architecture Audit is invoked, THE Audit SHALL identify files exceeding 300 lines of code and flag them for potential splitting.
8. WHEN Architecture Audit is invoked, THE Audit SHALL verify that state machine implementations follow these best practices: (a) finite states only, (b) defined transition functions, (c) no direct state mutation, and (d) initial state is explicitly defined.

#### Tools & Commands
- Circular deps: `npx madge --circular .`
- Dependency check: `npm outdated`
- Security: `npm audit --audit-level=high`

#### Pass/Fail Criteria
- PASS: Clean directory structure, no circular deps, up-to-date deps, no security advisories, hooks pass ESLint, proper state management, no excessive prop drilling, no oversized files, proper state machine
- FAIL: Any architectural issue found

---

### Requirement 7: Configuration Audit

**User Story:** As a developer, I want proper configuration management, so that the project can be easily deployed and maintained.

#### Acceptance Criteria

1. WHEN TypeScript configuration is analyzed, THE Configuration Audit SHALL verify tsconfig.json contains "strict": true in compilerOptions and FAIL if absent.
2. WHEN ESLint configuration is analyzed, THE Audit SHALL verify eslint.config.mjs or .eslintrc.* extends "next/core-web-vitals" and FAIL if absent.
3. WHEN Next.js configuration is analyzed, THE Audit SHALL verify next.config.ts enables compression (default), uses swc minifier (default in Next.js 16), and does not disable i18n routing if future i18n is planned.
4. WHEN environment configuration is analyzed, THE Audit SHALL verify .env.example documents these variables: NEXT_PUBLIC_FIREBASE_API_KEY, NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN, NEXT_PUBLIC_FIREBASE_PROJECT_ID, NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET, NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID, NEXT_PUBLIC_FIREBASE_APP_ID, DEEPSEEK_API_KEY, OPENAI_API_KEY (if used).
5. WHEN build scripts are analyzed, THE Audit SHALL verify package.json contains these scripts: "dev" (next dev), "build" (next build), "start" (next start), "lint" (eslint) - FAIL if any missing.
6. WHEN PWA configuration is analyzed, THE Audit SHALL verify public/manifest.json exists with required fields: name, short_name, start_url, display (standalone or fullscreen), icons (array of at least 192x192 and 512x512), and SHALL verify public/sw.js exists if service worker is used.
7. WHEN Tailwind CSS configuration is analyzed, THE Audit SHALL verify postcss.config.mjs contains tailwindcss plugin and app/globals.css contains @import "tailwindcss" and @theme block.
8. WHEN environment handling is analyzed, THE Audit SHALL verify Next.js configuration checks process.env.NODE_ENV before executing environment-specific code and that no secret values are exposed to client-side code (all secrets must be accessed via API routes, not directly in components).

#### Tools & Commands
- TypeScript: `npx tsc --noEmit`
- ESLint: `npm run lint`
- Build: `npm run build`

#### Pass/Fail Criteria
- PASS: All config files present and properly configured
- FAIL: Any missing or incorrect configuration

---

### Requirement 8: UI/UX Audit

**User Story:** As a user, I want a polished and consistent user interface, so that I enjoy using the application.

#### Acceptance Criteria

1. THE UI/UX Audit SHALL verify that all pages render correctly at viewport widths of 640px, 768px, 1024px, and 1280px without horizontal scrolling or layout breakage.
2. THE UI/UX Audit SHALL verify that dark mode and light mode both render correctly with readable text contrast ratios of at least 4.5:1 for normal text.
3. THE UI/UX Audit SHALL verify that all interactive elements (buttons, links, inputs) display distinct visual states for hover, active, disabled, and focus conditions.
4. THE UI/UX Audit SHALL verify that loading states appear within 300ms of initiating async operations and display until content loads or an error occurs.
5. THE UI/UX Audit SHALL verify that spacing between elements uses consistent increments (multiples of 4px) and typography follows a defined scale.
6. THE UI/UX Audit SHALL verify that error states display user-understandable feedback and form validation errors appear adjacent to the relevant input field.
7. THE UI/UX Audit SHALL verify that all animations complete within 500ms and do not exceed two simultaneous motion effects.
8. THE UI/UX Audit SHALL verify that touch targets on viewports below 768px width are at least 44 pixels tall and 44 pixels wide.

#### Tools & Commands
- Responsive testing: Browser DevTools device emulation
- Visual states: Manual inspection
- Contrast: Browser DevTools color picker

#### Pass/Fail Criteria
- PASS: All 8 UI/UX criteria met
- FAIL: Any UI/UX issue found

---

### Requirement 9: Audit Output Format

**User Story:** As a stakeholder, I want clear audit findings, so that I can prioritize and take action on issues.

#### Acceptance Criteria

1. THE Audit Report SHALL categorize findings by severity: Critical (exploitable vulnerability or data breach), High (significant security or performance issue), Medium (moderate impact), Low (minor issue), or Informational (best practice reminder).
2. THE Audit Report SHALL include for each finding: a file path relative to project root, a line number, and a column number when applicable.
3. THE Audit Report SHALL include for each finding a plain-language description of 50 to 200 characters that explains what was found and why it is an issue.
4. THE Audit Report SHALL include for each finding a recommendation that specifies the action to take. IF the finding is code-related, THEN the recommendation SHALL include a code example demonstrating the fix.
5. THE Audit Report SHALL group findings by audit category: Security, Performance, Code Quality, Accessibility, or Best Practices.
6. THE Audit Report SHALL include a summary section containing: total findings count, findings count per severity level, findings count per audit category, test coverage percentage, and bundle size in kilobytes.
7. THE Audit Report SHALL order findings first by severity (Critical first, then High, Medium, Low, Informational), then alphabetically by file path within each severity level.
8. IF a finding is determined to be a false positive, THEN the Audit Report SHALL mark that finding with a false positive classification and include a brief rationale explaining why the finding is acceptable as-is.
9. THE Audit Report SHALL structure each finding as a record containing: unique identifier, severity, audit category, file path, line number, description, recommendation, code example (when applicable), and false positive flag (false by default).

#### Output Format Example
```json
{
  "summary": {
    "totalFindings": 42,
    "bySeverity": { "critical": 2, "high": 8, "medium": 15, "low": 12, "informational": 5 },
    "byCategory": { "security": 10, "performance": 8, "codeQuality": 12, "accessibility": 6, "bestPractices": 6 },
    "testCoverage": "68%",
    "bundleSize": "487KB"
  },
  "findings": [
    {
      "id": "SEC-001",
      "severity": "critical",
      "category": "security",
      "file": "lib/storage.ts",
      "line": 42,
      "description": "User input stored without sanitization",
      "recommendation": "Add input sanitization before storage",
      "codeExample": "const sanitized = text.replace(/[<>]/g, '');",
      "falsePositive": false
    }
  ]
}
```

---

### Requirement 10: Audit Tools and Methods

**User Story:** As an auditor, I want to use established tools and methods, so that the audit results are reliable and comparable.

#### Acceptance Criteria

1. THE Code Quality Audit SHALL use ESLint with all rules from eslint-config-next/core-web-vitals and typescript/recommended extending the base Next.js configuration.
2. THE TypeScript Analysis SHALL use npx tsc --noEmit with the project's tsconfig.json which has strict mode enabled (strict: true).
3. THE Performance Audit SHALL use @next/bundle-analyzer and verify that JavaScript bundle size does not exceed 500KB for production builds.
4. THE Accessibility Audit SHALL use @axe-core/react for automated component testing and Google Lighthouse with accessibility audit enabled, targeting WCAG 2.1 Level AA compliance.
5. THE Security Audit SHALL include npm audit for dependency vulnerability scanning with severity level set to "high" or above, and manual code review for common vulnerabilities including XSS, injection, and authentication issues.
6. THE Test Coverage SHALL be measured using Vitest coverage with --coverage provider=v8 and SHALL achieve a minimum of 80% line coverage.
7. THE Audit SHALL verify findings with code inspection by locating the exact file path, line number, and code snippet that demonstrates each finding before reporting.
8. THE Audit SHALL provide reproducible steps for verifying each critical finding in a numbered list format that includes the command executed, expected output, and acceptance criteria.

---

## Correctness Properties

For property-based testing of the audit itself:

1. **Exhaustive Findings**: The audit SHALL report all findings matching its search patterns - it SHALL NOT miss any detectable issue of the types it claims to detect.
2. **No False Negatives for Critical Issues**: All Critical and High severity issues as defined in the acceptance criteria SHALL appear in the report.
3. **Consistent Severity Classification**: Two independent auditors SHALL classify the same finding with the same severity level at least 95% of the time.
4. **Reproducible Results**: Running the same audit command twice on the same codebase SHALL produce identical findings (excluding timing-based issues).
5. **Actionable Recommendations**: Every finding with severity Critical, High, or Medium SHALL include a recommendation that, if implemented, would resolve the finding.

---

## Notes

- The audit is performed on the current state of the codebase
- Some criteria may require manual verification in addition to automated tools
- Recommendations should be prioritized based on severity and effort to fix
- This audit does not replace security penetration testing