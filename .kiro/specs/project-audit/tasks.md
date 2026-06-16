# Implementation Plan: Project Audit System

## Overview

This implementation plan breaks down the project-audit feature into actionable tasks. The audit system will scan the fast-reading-trainer codebase across 8 audit categories and produce a structured JSON report with findings, severity levels, and recommendations.

The implementation follows the design architecture with:
- Core orchestrator coordinating 8 analyzers
- SourceScanner for file discovery
- FindingAggregator for classification
- ReportGenerator for JSON output

## Tasks

- [ ] 1. Set up audit library structure and core types
  - [ ] 1.1 Create lib/audit directory structure
    - Create directories: lib/audit/core, lib/audit/analyzers, lib/audit/models, lib/audit/utils, lib/audit/types, lib/audit/__tests__
    - _Requirements: 6.1, 7.1_
  
  - [ ] 1.2 Define TypeScript interfaces for audit models
    - Create lib/audit/types/index.ts with Severity, AuditCategory, RawFinding, Finding, AuditReport, AuditConfig, AnalysisContext, FileManifest interfaces
    - _Requirements: 9.1, 9.9_

  - [ ] 1.3 Create severity enum and utilities
    - Create lib/audit/models/severity.ts with severity level definitions
    - Create lib/audit/utils/severityUtils.ts for classification helpers
    - _Requirements: 9.3_

- [ ] 2. Implement core scanner and orchestrator
  - [ ] 2.1 Create SourceScanner component
    - Implement scan() method to glob files by patterns
    - Implement readFile() for file content retrieval
    - Implement getTypeScriptFiles(), getConfigFiles(), getTestFiles() helpers
    - _Requirements: 1.1, 1.2_
  
  - [ ] 2.2 Create AuditOrchestrator component
    - Implement runAll() to execute all 8 analyzers
    - Implement runCategory() for single category execution
    - Implement getConfig() for configuration management
    - _Requirements: 9.7_
  
  - [ ] 2.3 Create FindingAggregator component
    - Implement addFinding() for collecting results
    - Implement classify() for severity grouping
    - Implement markAsFalsePositive() for filtering
    - _Requirements: 9.8_
  
  - [ ] 2.4 Create ReportGenerator component
    - Implement generate() for final report assembly
    - Implement toJSON() for serialization
    - Implement writeToFile() for output
    - _Requirements: 9.1-9.9_
    - **Property 10: Report JSON Serialization Round-Trip** - Validates Requirements 9.1, 9.9

- [ ] 3. Implement Code Quality Analyzer
  - [ ] 3.1 Create codeQuality analyzer with ESLint integration
    - Implement runESLint() wrapper to execute npx eslint
    - Parse ESLint JSON output to findings
    - _Requirements: 1.1, 1.8_
  
  - [ ] 3.2 Implement TypeScript strict mode check
    - Run `npx tsc --noEmit` and parse errors
    - Filter for `any` type usage errors
    - _Requirements: 1.1_
    - **Property 1: Exhaustive Finding Detection** - Validates Requirement 1.1
  
  - [ ] 3.3 Implement duplicate code detection
    - Scan source files for 5+ consecutive identical lines
    - Report file locations for each duplicate block
    - _Requirements: 1.2_
    - **Property 2: Duplicate Code Detection** - Validates Requirement 1.2
  
  - [ ] 3.4 Implement async error handling check
    - Parse AST to find async functions
    - Verify try-catch or equivalent error handling
    - _Requirements: 1.3_
    - **Property 3: Async Error Handling Coverage** - Validates Requirement 1.3
  
  - [ ] 3.5 Implement file naming convention validation
    - Check components/ files use PascalCase
    - Check lib/, hooks/ files use camelCase
    - _Requirements: 1.4_
    - **Property 4: File Naming Compliance** - Validates Requirement 1.4
  
  - [ ] 3.6 Implement unused exports detection
    - Track imported vs exported symbols
    - Report dead exports and unused imports
    - _Requirements: 1.8_

- [ ] 4. Implement Performance Analyzer
  - [ ] 4.1 Create performance analyzer with bundle size check
    - Run production build with bundle analyzer
    - Identify chunks exceeding 244KB
    - _Requirements: 2.1_
  
  - [ ] 4.2 Implement React optimization detection
    - Check components/hooks for missing React.memo
    - Check for missing useCallback/useMemo in dependency arrays
    - _Requirements: 2.2_
    - **Property 5: React Optimization Detection** - Validates Requirement 2.2
  
  - [ ] 4.3 Implement dynamic import verification
    - Check for Next.js dynamic() imports
    - Verify heavy deps (firebase, recharts, pdfjs-dist) are dynamically imported
    - _Requirements: 2.3_
  
  - [ ] 4.4 Implement memory leak detection
    - Check for addEventListener without removeEventListener
    - Check for setInterval without clearInterval
    - Check for setTimeout without cleanup
    - _Requirements: 2.5_
    - **Property 6: Memory Leak Prevention Detection** - Validates Requirements 2.4, 2.5
  
  - [ ] 4.5 Implement localStorage analysis
    - Check key sizes don't exceed 2MB
    - Verify reading-history has pagination/limit
    - _Requirements: 2.7_

- [ ] 5. Implement Security Analyzer
  - [ ] 5.1 Create security analyzer with input validation check
    - Verify TextInput.tsx uses Zod validation
    - Check for max length constraints
    - _Requirements: 3.1_
    - **Property 7: Input Validation Detection** - Validates Requirement 3.1
  
  - [ ] 5.2 Implement XSS vulnerability detection
    - Search for dangerouslySetInnerHTML usage
    - Flag all instances found
    - _Requirements: 3.2_
    - **Property 8: XSS Vulnerability Detection** - Validates Requirement 3.2
  
  - [ ] 5.3 Implement Firebase rules validation
    - Parse firestore.rules
    - Verify user-specific read/write rules
    - Check for explicit DENY rules
    - _Requirements: 3.3_
  
  - [ ] 5.4 Implement API route authentication check
    - Verify app/api/quiz/route.ts checks auth token
    - Verify app/api/copilot/route.ts checks auth token
    - _Requirements: 3.4_
  
  - [ ] 5.5 Implement secret scanning
    - Scan for hardcoded API keys, Bearer tokens
    - Exclude .env files from findings
    - _Requirements: 3.5_
    - **Property 9: Secret Detection** - Validates Requirement 3.5
  
  - [ ] 5.6 Implement environment variable validation
    - Verify .env.local has required variables
    - Verify .env.example documents without values
    - _Requirements: 3.6_
  
  - [ ] 5.7 Implement AI API security check
    - Verify DeepSeek key in Authorization header
    - Verify server-side API calls only
    - _Requirements: 3.7_

- [ ] 6. Implement Accessibility Analyzer
  - [ ] 6.1 Create accessibility analyzer
    - Check interactive elements for keyboard accessibility
    - Check icon-only buttons for aria-label
    - _Requirements: 4.1, 4.2_
  
  - [ ] 6.2 Implement focus management check
    - Verify tabindex on focusable elements
    - Check for focus traps
    - _Requirements: 4.3_
  
  - [ ] 6.3 Implement color contrast verification
    - Parse globals.css for color values
    - Check contrast ratios against WCAG AA
    - _Requirements: 4.4_
  
  - [ ] 6.4 Implement aria-live region check
    - Verify Reader.tsx has aria-live on word display
    - Check for polite/assertive settings
    - _Requirements: 4.5_
  
  - [ ] 6.5 Implement form label validation
    - Check TextInput.tsx for htmlFor/id association
    - _Requirements: 4.6_
  
  - [ ] 6.6 Implement skip navigation check
    - Verify skip link exists
    - Verify landmark regions (header, main, footer)
    - _Requirements: 4.7_

- [ ] 7. Implement Testing Analyzer
  - [ ] 7.1 Create testing analyzer with coverage check
    - Run vitest coverage
    - Parse coverage output for percentage
    - _Requirements: 5.1_
  
  - [ ] 7.2 Implement critical path coverage check
    - Check hooks/useReader.ts coverage
    - Check lib/gamification.ts coverage
    - Check lib/tokenizer.ts coverage
    - Check lib/orp.ts coverage
    - _Requirements: 5.2_
  
  - [ ] 7.3 Implement test quality validation
    - Check for non-trivial assertions
    - Verify external dependencies are mocked
    - _Requirements: 5.3_
  
  - [ ] 7.4 Implement API integration test detection
    - Check for app/api/*/route.test.ts files
    - Report missing integration tests
    - _Requirements: 5.4_
  
  - [ ] 7.5 Implement E2E test detection
    - Check for Playwright/Cypress tests
    - Verify critical flows covered
    - _Requirements: 5.5_
  
  - [ ] 7.6 Implement property-based test detection
    - Check for fast-check/vitest-property tests
    - Verify pure functions have PBT
    - _Requirements: 5.6_
  
  - [ ] 7.7 Implement CI/CD integration check
    - Verify package.json has test scripts
    - Check for workflow files (.github/workflows)
    - _Requirements: 5.8_

- [ ] 8. Implement Architecture Analyzer
  - [ ] 8.1 Create architecture analyzer with directory check
    - Verify components/, hooks/, lib/, types/, app/ structure
    - _Requirements: 6.1_
  
  - [ ] 8.2 Implement circular dependency detection
    - Run madge --circular
    - Report circular dependencies found
    - _Requirements: 6.2_
  
  - [ ] 8.3 Implement dependency version check
    - Run npm outdated
    - Flag packages not within 1 minor version
    - _Requirements: 6.3_
  
  - [ ] 8.4 Implement React hooks validation
    - Check exhaustive-deps violations
    - Check rules-of-hooks violations
    - _Requirements: 6.4_
  
  - [ ] 8.5 Implement state management pattern check
    - Verify React Context for global state only
    - Check for excessive prop drilling (>3 levels)
    - _Requirements: 6.5, 6.6_
  
  - [ ] 8.6 Implement file size validation
    - Identify files >300 lines
    - _Requirements: 6.7_
  
  - [ ] 8.7 Implement state machine validation
    - Check useReader state transitions
    - Verify no direct state mutation
    - _Requirements: 6.8_

- [ ] 9. Implement Configuration Analyzer
  - [ ] 9.1 Create configuration analyzer
    - Verify tsconfig.json has strict: true
    - _Requirements: 7.1_
  
  - [ ] 9.2 Implement ESLint config validation
    - Verify eslint.config.mjs extends next/core-web-vitals
    - _Requirements: 7.2_
  
  - [ ] 9.3 Implement Next.js config validation
    - Verify compression enabled
    - Verify swc minifier used
    - _Requirements: 7.3_
  
  - [ ] 9.4 Implement environment documentation check
    - Verify .env.example has all required variables
    - _Requirements: 7.4_
  
  - [ ] 9.5 Implement package.json scripts validation
    - Verify dev, build, start, lint scripts exist
    - _Requirements: 7.5_
  
  - [ ] 9.6 Implement PWA configuration check
    - Verify manifest.json exists with required fields
    - Verify sw.js exists if service worker used
    - _Requirements: 7.6_
  
  - [ ] 9.7 Implement Tailwind CSS configuration check
    - Verify postcss.config.mjs has tailwindcss
    - Verify globals.css has @import "tailwindcss"
    - _Requirements: 7.7_
  
  - [ ] 9.8 Implement secret exposure check
    - Verify NODE_ENV checks exist
    - Verify no secrets in client-side code
    - _Requirements: 7.8_

- [ ] 10. Implement UI/UX Analyzer
  - [ ] 10.1 Create UI/UX analyzer
    - _Requirements: 8.1-8.8_
  
  - [ ] 10.2 Implement responsive design check
    - Check for viewport meta tag
    - Check Tailwind responsive classes usage
    - _Requirements: 8.1_
  
  - [ ] 10.3 Implement dark/light mode verification
    - Check ThemeToggle component exists
    - Check CSS has dark: variants
    - _Requirements: 8.2_
  
  - [ ] 10.4 Implement visual states check
    - Check for hover, active, disabled, focus styles
    - _Requirements: 8.3_
  
  - [ ] 10.5 Implement loading states check
    - Check for loading indicators in async components
    - _Requirements: 8.4_
  
  - [ ] 10.6 Implement spacing/typography check
    - Check for consistent spacing multiples of 4px
    - _Requirements: 8.5_
  
  - [ ] 10.7 Implement error state validation
    - Check form validation error display
    - _Requirements: 8.6_
  
  - [ ] 10.8 Implement animation validation
    - Check animation durations <500ms
    - _Requirements: 8.7_
  
  - [ ] 10.9 Implement touch target size check
    - Verify buttons meet 44px minimum
    - _Requirements: 8.8_

- [ ] 11. Checkpoint - Core infrastructure complete
  - Ensure all core components compile without errors
  - Run npx tsc --noEmit on lib/audit
  - Ask the user if questions arise.

- [ ] 12. Implement external tool wrappers
  - [ ] 12.1 Create ESLint wrapper utility
    - Execute npx eslint with JSON output
    - Parse and transform results to findings
    - _Requirements: 10.1_
  
  - [ ] 12.2 Create TypeScript wrapper utility
    - Execute npx tsc --noEmit
    - Parse error output to structured results
    - _Requirements: 10.2_
  
  - [ ] 12.3 Create npm audit wrapper
    - Execute npm audit --json
    - Parse vulnerabilities
    - _Requirements: 10.5_
  
  - [ ] 12.4 Create madge wrapper for circular deps
    - Execute npx madge --circular --extensions ts,tsx
    - Parse dependency graph
    - _Requirements: 10.6_
  
  - [ ] 12.5 Create vitest coverage wrapper
    - Execute npx vitest run --coverage
    - Parse coverage report
    - _Requirements: 10.6_

- [ ] 13. Create CLI entry point
  - [ ] 13.1 Create lib/audit/index.ts main export
    - Export runAudit() function
    - Export CLI runner
    - _Requirements: 10.7_
  
  - [ ] 13.2 Add npm script to package.json
    - Add "audit": "node lib/audit/index.js" script
    - _Requirements: 10.8_

- [ ] 14. Write unit tests for core components
  - [ ]* 14.1 Write unit tests for SourceScanner
    - Test file globbing
    - Test exclude patterns
    - Test file reading
    - _Requirements: 6.1_
  
  - [ ]* 14.2 Write unit tests for FindingAggregator
    - Test classification
    - Test false positive marking
    - _Requirements: 9.8_
  
  - [ ]* 14.3 Write unit tests for ReportGenerator
    - Test JSON serialization
    - Test file writing
    - _Requirements: 9.1-9.9_

- [ ] 15. Write property-based tests
  - [ ]* 15.1 Write property test for exhaustive detection
    - **Property 1: Exhaustive Finding Detection**
    - **Validates: Requirement 1.1**
  
  - [ ]* 15.2 Write property test for duplicate detection
    - **Property 2: Duplicate Code Detection**
    - **Validates: Requirement 1.2**
  
  - [ ]* 15.3 Write property test for async error handling
    - **Property 3: Async Error Handling Coverage**
    - **Validates: Requirement 1.3**
  
  - [ ]* 15.4 Write property test for file naming
    - **Property 4: File Naming Compliance**
    - **Validates: Requirement 1.4**
  
  - [ ]* 15.5 Write property test for React optimization
    - **Property 5: React Optimization Detection**
    - **Validates: Requirement 2.2**
  
  - [ ]* 15.6 Write property test for memory leaks
    - **Property 6: Memory Leak Prevention Detection**
    - **Validates: Requirements 2.4, 2.5**
  
  - [ ]* 15.7 Write property test for input validation
    - **Property 7: Input Validation Detection**
    - **Validates: Requirement 3.1**
  
  - [ ]* 15.8 Write property test for XSS detection
    - **Property 8: XSS Vulnerability Detection**
    - **Validates: Requirement 3.2**
  
  - [ ]* 15.9 Write property test for secret detection
    - **Property 9: Secret Detection**
    - **Validates: Requirement 3.5**
  
  - [ ]* 15.10 Write property test for report serialization
    - **Property 10: Report JSON Serialization Round-Trip**
    - **Validates: Requirements 9.1, 9.9**
  
  - [ ]* 15.11 Write property test for classification consistency
    - **Property 11: Severity Classification Consistency**
    - **Validates: Requirement 9.3**
  
  - [ ]* 15.12 Write property test for critical finding detection
    - **Property 12: Critical Finding Detection**
    - **Validates: Requirement 9.2**

- [ ] 16. Final checkpoint - Ensure all tests pass
  - Run npx tsc --noEmit on lib/audit
  - Run npx vitest run lib/audit/__tests__
  - Verify JSON report output matches schema
  - Ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- External tools (ESLint, TypeScript, npm) are executed as child processes

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "1.3"] },
    { "id": 1, "tasks": ["2.1", "2.2", "2.3", "2.4"] },
    { "id": 2, "tasks": ["3.1", "3.2", "3.3", "3.4", "3.5", "3.6", "4.1", "4.2", "4.3", "4.4", "4.5", "5.1", "5.2", "5.3", "5.4", "5.5", "5.6", "5.7", "6.1", "6.2", "6.3", "6.4", "6.5", "6.6", "7.1", "7.2", "7.3", "7.4", "7.5", "7.6", "7.7", "8.1", "8.2", "8.3", "8.4", "8.5", "8.6", "8.7", "9.1", "9.2", "9.3", "9.4", "9.5", "9.6", "9.7", "9.8", "10.1", "10.2", "10.3", "10.4", "10.5", "10.6", "10.7", "10.8", "10.9"] },
    { "id": 3, "tasks": ["11"] },
    { "id": 4, "tasks": ["12.1", "12.2", "12.3", "12.4", "12.5"] },
    { "id": 5, "tasks": ["13.1", "13.2"] },
    { "id": 6, "tasks": ["14.1", "14.2", "14.3"] },
    { "id": 7, "tasks": ["15.1", "15.2", "15.3", "15.4", "15.5", "15.6", "15.7", "15.8", "15.9", "15.10", "15.11", "15.12"] },
    { "id": 8, "tasks": ["16"] }
  ]
}
```