# UX/UI Standard

**Project:** JARVIS / Valeo MOM  
**Purpose:** Agent-loadable UX/UI implementation standard for AI-assisted product design and frontend development.  
**Audience:** UX agents, product designers, frontend developers, reviewers.  
**Version:** v2.0  
**Source basis:** Method One UX Standards + JARVIS Admin Console UI constraints and design system.

---

## 0. How to Use This Standard

Apply this standard before generating or modifying any screen, component, layout, interaction, or UI copy.

Follow this order:

1. Apply the UX standards first.
2. Reuse existing JARVIS / Valeo MOM patterns before inventing a new one.
3. Apply the UI constraints.
4. Apply typography, colour, layout, spacing, navigation, card, button, input, table, status, accessibility, and responsive rules.
5. Validate the output using the UX Agent Checklist before final response or implementation.

When creating a new screen or component, the AI must first ask internally:

> Does this element help the user complete the current workflow, understand a decision, recover from an error, or validate the flow?

If the answer is no, do not add it.

---

## 1. Core UX Intent

The Flow Editor is a dense working screen. The product experience must prioritize:

- Speed
- Clarity
- Safe decision-making
- Accurate technical representation
- Workflow continuity
- Enterprise feasibility

The interface must stay focused on the user's task and the experiment objective.

---

## 2. Method One UX Standards

| Standard | Constraint |
|---|---|
| User first | Design around the user journey and workflow. Every screen and interaction must have a clear purpose. |
| Keep it lean | Build only what is needed to validate the flow. Avoid unnecessary features and visual decoration. |
| Clear hierarchy | Make the primary task obvious. Secondary information should remain visually quieter. |
| Three-pane structure | Keep Process Steps, Operations, and Value Definitions clearly separated. |
| Feedback | Show validation, conflicts, and system feedback close to the affected content. |
| Iterate | Review internally, test in realistic conditions, and refine from feedback. |
| Feasibility | Consider technical and network constraints early, especially for enterprise use. |
| Accessibility | Do not rely on colour alone. Include accessibility and error-message checks. |

### Method One Decision Rule

If a proposed UI element does not help the user complete the current workflow, understand a decision, recover from an error, or validate the flow, do not add it.

---

## 3. Non-Negotiable UI Constraints

| Area | Constraint |
|---|---|
| Visual language | Extend the existing Valeo MOM / JARVIS visual language. Do not invent a second design language. |
| Structure | Keep the established application shell: left navigation, top header, page canvas, and structured working areas. |
| Primary action | Use one clear primary action per working area. Secondary actions must remain quieter. |
| Information | Show the information needed for the current decision first. Keep supporting data secondary. |
| Technical data | Never change, round, rename, or visually distort IDs, versions, timestamps, measurements, or raw messages. |
| Selection | Selected navigation, rows, steps, and operations must remain visibly selected. Hover is not enough. |
| Feedback | Place validation, conflict, and system feedback next to the affected content whenever possible. |
| Errors | State what went wrong, what is affected, and what the user should do next. |
| Status | Never communicate important state through colour alone. |
| Density | Support fast scanning and comparison without making text or controls hard to read. |
| Consistency | Use the same component appearance, terminology, and behaviour across screens. |
| Responsive | Reflow the layout at smaller widths. Do not solve responsiveness by excessively shrinking text. |
| Accessibility | Keyboard access, visible focus, accessible labels, and meaningful state information are mandatory. |
| Motion | Use motion only when it improves feedback. Respect reduced-motion preferences. |
| Decoration | Do not use gradients, glass effects, oversized shadows, decorative illustrations, or marketing-style hero areas. |
| Feasibility | Do not design interactions that ignore network, role, system, or enterprise constraints. |

---

## 4. Design System

### 4.1 Typography

Use IBM Plex Sans for interface text and IBM Plex Mono for technical or machine-readable content.

| Element | Font | Size | Weight | Use |
|---|---:|---:|---:|---|
| Page title | IBM Plex Sans | 15px | 700 | Current screen title |
| Breadcrumb / context | IBM Plex Sans | 12px | 400 | Secondary page context |
| Section / card title | IBM Plex Sans | 13px | 700 | Card and work-area headings |
| Body text | IBM Plex Sans | 13px | 400-500 | Normal UI copy |
| Secondary text | IBM Plex Sans | 11.5-12px | 400 | Counts, hints, and supporting text |
| Table header | IBM Plex Sans | 10px | 700 | Column labels |
| Button text | IBM Plex Sans | 12px | 600 | All buttons |
| Input text | IBM Plex Sans | 12px | 400 | Field values |
| Status pill | IBM Plex Sans | 10-10.5px | 700 | Short state labels |
| Technical data | IBM Plex Mono | 11-13px | 400-500 | IDs, timestamps, codes, and values |
| Raw payload | IBM Plex Mono | 11px | 400 | JSON, raw messages, and logs |

#### Typography Hard Rule

IBM Plex Sans = interface.  
IBM Plex Mono = technical or machine-readable content.  
Do not introduce another font for a new screen or component.

---

### 4.2 Colour Tokens

Use the approved semantic colour tokens only.

| Token | Hex | Meaning / Use |
|---|---|---|
| Technical Blue | `#0057D9` | Primary action, navigation focus, and selected navigation |
| Technical Blue Dark | `#0047B3` | Hover or stronger primary action |
| Blue Tint | `#EAF2FF` | Selected or focused surface |
| Page Background | `#F6F7F9` | Application canvas |
| Surface | `#FFFFFF` | Cards, tables, and working areas |
| Border | `#D9DEE6` | Dividers and control borders |
| Primary Text | `#15233B` | Headings and normal content |
| Secondary Text | `#526078` | Supporting information |
| Muted Text | `#7B8799` | Low-priority metadata |
| Success | `#35A936` | Healthy, valid, published, nominal |
| Warning | `#8A6A2F` | Warning, partial, alert |
| Error | `#D92D20` | Invalid, rejected, blocking |
| Degraded | `#5369A8` | Degraded or conflict |
| Advisory | `#E8EBF0` | Non-blocking information |

#### Colour Rules

- Use Technical Blue only for primary action, focus, and selected navigation.
- Do not colour every navigation item blue.
- Do not use colour alone to communicate state.
- Pair colour with text, icon, border, label, or status copy.

---

### 4.3 Layout and Spacing

| Element | Standard |
|---|---|
| Left navigation | 216px desktop; collapse to 64px at narrow widths |
| Top header | 64px desktop |
| Content padding | 24-30px desktop |
| Maximum content width | 1680px |
| Card radius | 8px |
| Control height | 34-36px |
| Typical table row | About 44-46px |
| Spacing scale | 4 / 8 / 12 / 16 / 24 / 32px |

#### Layout Rules

- Keep the application shell stable.
- Use the page canvas for structured working areas.
- Preserve the three-pane Flow Editor model when applicable.
- Avoid cramming content by shrinking text excessively.
- Prefer reflow, grouping, or progressive disclosure over visual compression.

---

### 4.4 Navigation

Navigation must be quiet, persistent, and predictable on desktop.

Rules:

- Active navigation uses Technical Blue.
- Active navigation uses a light blue background.
- Active navigation uses a 3px left indicator.
- Do not colour every navigation item blue.
- Always make the active Site / Edge role clear.
- Selected navigation must remain visibly selected. Hover is not a selection state.

---

### 4.5 Cards

Cards define working areas. Cards are not decorative containers.

Rules:

- Use a white surface.
- Use a 1px border.
- Use 8px radius.
- Use a very light shadow only when needed for separation.
- Follow the card header pattern:
  - Title
  - Supporting text
  - Spacer
  - Actions
- Do not use cards for marketing-style decoration.

---

### 4.6 Buttons

| Type | Use |
|---|---|
| Primary | Main action for the current task. Blue fill with white text. |
| Secondary | Supporting action. White fill with light border. |
| Destructive | Only for destructive or irreversible actions. |
| Inline | Compact supporting action inside tables or card headers. |

#### Button Rules

- Use action-first labels.
- Good labels: `Open`, `Add step`, `Review`, `Import CSV`, `Publish`.
- Do not place two competing primary actions together.
- Align editor actions with their section header.
- Primary action must be visually obvious but not overused.

---

### 4.7 Inputs

Rules:

- Default input height is 36px.
- Use visible labels.
- Placeholder text is not a label.
- Use a clear Technical Blue focus state.
- Show validation close to the affected field.
- Every input must have an accessible name.
- Required, disabled, invalid, and read-only states must be visually clear and programmatically exposed.

---

### 4.8 Tables and Status

Tables are used for operational lists, logs, and comparison-heavy data.

Rules:

- Align numeric values right.
- Use IBM Plex Mono for technical values when useful.
- Use subtle hover.
- Never use hover as the only selection state.
- Status pills are labels, not buttons.
- Keep status labels short.
- Preserve raw technical values exactly.

| State | Colour | Example |
|---|---|---|
| Success | Green | `published`, `RECORDED` |
| Warning | Muted brown | `RECORDED_PARTIAL` |
| Degraded | Blue-purple | `RECORDED_DEGRADED` |
| Error | Red | `REJECTED_UNPARSEABLE` |
| Neutral | Grey | `draft`, `DUPLICATE_IGNORED` |

---

## 5. Accessibility Rules

Accessibility is mandatory, not optional.

| Area | Rule |
|---|---|
| Keyboard | All controls must be keyboard accessible. |
| Focus | Use a visible focus treatment; Technical Blue is the standard focus colour. |
| Labels | Every input, checkbox, and icon-only control needs an accessible name. |
| State | Selected, expanded, pressed, and disabled states must be exposed clearly. |
| Colour | Never rely on colour alone. |
| Errors | Identify the problem and provide a recovery path. |
| Motion | Respect reduced-motion preferences. |

Additional accessibility requirements:

- Every interactive element must have a clear accessible role.
- Icon-only buttons must include accessible names.
- Error messages must identify the affected field or content.
- Blocking issues must not be mistaken for advisory information.
- Any state communicated through colour must also be communicated through text, shape, icon, label, or ARIA state.

---

## 6. Responsive Behaviour

| Width | Behaviour |
|---|---|
| `>1280px` | Full desktop workbench. |
| `1080-1280px` | Reduce spacing while keeping controls readable. |
| `<=1080px` | Collapse the editor to one column. |
| `<=760px` | Reduce page padding, use 36px controls, full-width search, and two-column limit fields. |

Responsive rules:

- Do not solve narrow layouts by making text too small.
- Preserve task clarity at every breakpoint.
- Keep the primary action visible and understandable.
- Collapse structure progressively.
- Preserve technical data accuracy even when wrapping or reflowing.

---

## 7. UX Agent Operating Sequence

Before producing any UX/UI output, the AI must follow this sequence:

1. Understand the user task.
2. Identify the affected workflow.
3. Reuse an existing pattern.
4. Apply approved typography, colour, and spacing.
5. Define states and feedback.
6. Check accessibility and feasibility.
7. Review at realistic screen sizes.

---

## 8. UX Agent Output Checklist

Before final output, confirm each item.

| Area | The AI must confirm |
|---|---|
| Purpose | The screen or component has one clear user purpose. |
| Hierarchy | The primary task is obvious and secondary information is quieter. |
| Structure | The correct existing pattern is used; no unnecessary new pattern was created. |
| Typography | Correct IBM Plex Sans / IBM Plex Mono family, size, and weight are used. |
| Colour | Only approved semantic colours are used. |
| States | Default, hover, focus, selected, disabled, and error states are considered. |
| Feedback | Validation, conflict, and system feedback appears close to the affected content. |
| Safety | Blocking issues cannot be mistaken for advisory information. |
| Accessibility | Keyboard, focus, labels, and non-colour state cues are covered. |
| Feasibility | The interaction is realistic for the enterprise, network, role, and system context. |
| Responsive | The design remains usable at laptop and narrow widths. |
| Lean | No feature, decoration, or interaction was added without a clear user need. |

---

## 9. AI Instructions for Screen Generation

When this file is loaded into an AI agent, the agent must:

- Use this file as the UI/UX implementation standard.
- Not replace product requirements, business rules, permissions, data contracts, or technical architecture.
- Preserve exact technical values such as IDs, timestamps, versions, messages, measurements, and codes.
- Prefer simple, task-focused screens.
- Reuse existing application shell and patterns.
- Use one primary action per working area.
- Make validation, conflict, and system feedback local to the affected content.
- Ensure keyboard accessibility, visible focus, accessible names, and non-colour state cues.
- Avoid decorative UI that does not support the workflow.
- Consider enterprise constraints such as roles, network limits, system permissions, and realistic operating conditions.

---

## 10. Final Decision Rule

When in doubt, choose the simplest design that:

- Keeps the user's context visible
- Makes the next action obvious
- Preserves technical accuracy
- Supports safe decision-making
- Stays consistent with the JARVIS / Valeo MOM visual language

---

## 11. Boundary of This Standard

This is a UI/UX implementation standard.

It does not replace:

- Product requirements
- Business rules
- Permissions
- Data contracts
- Technical architecture
- Security requirements
- API contracts
- Deployment standards

Use this standard together with the relevant product requirement markdown, architecture notes, frontend standards, and accessibility rules.
