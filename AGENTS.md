# Agent Instructions

This project uses **bd** (beads) for issue tracking and **Serena** for semantic code analysis.

## Getting Started

```bash
bd onboard              # Initialize beads tracking
```

## Serena (Semantic Code Tools)

Serena provides symbol-level code navigation and editing via MCP tools. Use it for precise code operations.

### When to Use Serena vs Standard Tools

| Task | Use | Why |
|------|-----|-----|
| Find a class/function definition | `find_symbol` | Precise, fast, no grep noise |
| See file structure overview | `get_symbols_overview` | Instant outline without reading full file |
| Rename a symbol everywhere | `rename_symbol` | Safe, automatic refactoring |
| Find all references to X | `find_referencing_symbols` | Complete call site analysis |
| Replace a method body | `replace_symbol_body` | Surgical, preserves surrounding code |
| Search for text/patterns | `search_for_pattern` | Non-code files, flexible regex |
| Read entire file | `Read` | When you need full context |

### Key Serena Workflows

**Exploring unknown code:**
```
1. get_symbols_overview(relative_path) → See structure
2. find_symbol(name_path, depth=1) → Get children
3. find_symbol(name_path, include_body=True) → Read specific symbol
```

**Making targeted edits:**
```
1. find_symbol(name_path, include_body=True) → Locate exact code
2. replace_symbol_body() or replace_content() → Make change
3. find_referencing_symbols() → Verify impact
```

**Renaming:**
```
1. find_symbol(name_path) → Confirm target
2. rename_symbol(name_path, relative_path, new_name) → Rename everywhere
```

### Symbol Path Syntax

- Simple: `Search` → Any symbol named "Search"
- Relative: `Search/render` → Method "render" in class "Search"
- Absolute: `/Search/render` → Exact path match
- Overloads: `Search/fetch[0]` → First overload of "fetch"

### Serena Quick Reference

```bash
# File structure
mcp__plugin_serena_serena__get_symbols_overview(relative_path="src/app/app.tsx")

# Find symbol
mcp__plugin_serena_serena__find_symbol(name_path_pattern="Search", include_body=True)

# Find references
mcp__plugin_serena_serena__find_referencing_symbols(name_path="Search", relative_path="src/app/components/Search/Search.tsx")

# Replace symbol body
mcp__plugin_serena_serena__replace_symbol_body(name_path="Search/render", relative_path="src/app/components/Search/Search.tsx", body="...")

# Rename symbol
mcp__plugin_serena_serena__rename_symbol(name_path="OldName", relative_path="path/to/file.ts", new_name="NewName")

# Pattern search (when symbols don't apply)
mcp__plugin_serena_serena__search_for_pattern(substring_pattern="console\\.log")
```

## Codebase Context (`.planning/codebase/`)

Reference these documents for project understanding before making changes:

| Document | Purpose |
|----------|---------|
| `STACK.md` | Technologies, frameworks, dependencies |
| `ARCHITECTURE.md` | System design, layers, data flow |
| `STRUCTURE.md` | Directory layout, key locations |
| `CONVENTIONS.md` | Code style, naming, patterns |
| `TESTING.md` | Test framework, structure, coverage |
| `INTEGRATIONS.md` | External APIs, databases, services |
| `CONCERNS.md` | Tech debt, bugs, security issues |

**Workflow:**
1. Read relevant `.planning/codebase/*.md` files before making changes
2. Update documents if architecture changes significantly
3. Add new concerns as they're discovered

**Refresh codebase map:**
```bash
/gsd:map-codebase    # Re-analyze and update all documents
```

## Quick Reference

```bash
bd ready              # Find available work
bd show <id>          # View issue details
bd update <id> --status in_progress  # Claim work
bd close <id>         # Complete work
bd sync               # Sync with git
```

## Landing the Plane (Session Completion)

**When ending a work session**, you MUST complete ALL steps below. Work is NOT complete until `git push` succeeds.

**MANDATORY WORKFLOW:**

1. **File issues for remaining work** - Create issues for anything that needs follow-up
2. **Run quality gates** (if code changed) - Tests, linters, builds
3. **Update issue status** - Close finished work, update in-progress items
4. **PUSH TO REMOTE** - This is MANDATORY:
   ```bash
   git pull --rebase
   bd sync
   git push
   git status  # MUST show "up to date with origin"
   ```
5. **Clean up** - Clear stashes, prune remote branches
6. **Verify** - All changes committed AND pushed
7. **Hand off** - Provide context for next session

**CRITICAL RULES:**
- Work is NOT complete until `git push` succeeds
- NEVER stop before pushing - that leaves work stranded locally
- NEVER say "ready to push when you are" - YOU must push
- If push fails, resolve and retry until it succeeds

