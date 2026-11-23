# Foundation architecture

See ADR 001. Routes compose shared shells and project components; `components/ui` contains shadcn primitives; `lib/preview` owns sample data and pure queue selectors. Page-specific interactivity stays at leaf components. There are no application backend services in this milestone.

Checks: lint, TypeScript, production build, and browser tests for shell navigation, queue browsing, responsive layout and accessibility. No commits until the user reviews the diff and tests the implementation.
