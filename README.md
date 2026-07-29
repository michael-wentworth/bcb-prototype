# FY27 Agentic Business Case Builder — vision prototype

> Describe your customer and collaborate with AI to generate a defensible Microsoft business case.

An interactive, presentation-ready front-end prototype of the FY27 vision for **Business Case
Builder (BCB)** — the solution-selling platform Microsoft sellers and partners use to justify
investment in Microsoft solutions.

It is built to be shown to stakeholders. There is no backend, no API and no authentication: every
AI interaction is scripted and every number comes from mock data.

## Running it

```bash
npm install
npm run dev      # http://localhost:5173
```

```bash
npm run build    # production bundle in dist/
npm run preview  # serve the production build
```

Requires Node 18+.

## The demo script

The prototype is built around one scripted narrative. The fastest path through it:

1. **Stage 1 — Customer Profile.** Click **Example prompt** on the primer card (or *Use the Contoso
   example* in the assistant panel). This sends:

   > "Contoso has 18,000 employees and currently uses Microsoft 365 E3, CrowdStrike and Okta. They
   > want to reduce vendor sprawl and improve security operations."

   The assistant works through its reasoning steps, then fills all six profile fields one at a time,
   each with a confidence badge and a **Show source** popover quoting the evidence it used. It also
   detects the third-party estate — flagging that two of the four vendors were *inferred*, not
   stated.

2. **Stage 2 — SKU Selection.** Four recommendations, each with a fit score, the vendors it
   displaces, and an expandable rationale. A fifth is deliberately **held back**, with the reasoning
   shown. Try the suggested prompt *"Why are you recommending E5?"*.

3. **Stage 3 — Competitive Displacement.** The current estate mapped onto the Microsoft stack:
   CrowdStrike → Defender, Okta → Entra, Splunk → Sentinel, Proofpoint → Defender for Office 365.
   **Toggle any mapping off** and the whole business case recalculates.

4. **Stage 4 — Results & Report.** The executive dashboard: 220% ROI, $2.4M estimated savings,
   11-month payback, key value drivers, the full benefit and investment ledger, and export actions.

The assistant is available throughout and speaks first when each stage opens.

## The three AI behaviours

| Behaviour | Try |
|---|---|
| **Populate** | The Contoso prompt above — extracts six fields plus four vendors from one sentence |
| **Explain** | *"Why are you recommending E5?"* · *"What did you decide not to recommend?"* |
| **Coach** | *"What data do you still need from me?"* — names the gaps and what each is worth |

Other scripted intents worth demoing: *"How did you calculate the ROI?"*, *"What if the CFO pushes
back on the savings?"*, *"How will CrowdStrike respond to this?"*, *"Draft an executive summary I
can send"*, *"How do similar manufacturers license security?"*.

Anything unrecognised falls back to a stage-appropriate reply, so the demo cannot dead-end.

## How the numbers work

The headline metrics are **not hard-coded**. `src/data/mockData.js` holds a single ledger — the
displaced third-party contracts, the operational benefits, the incremental Microsoft investment, and
a benefit-realisation curve across a 36-month horizon. `buildBusinessCase()` derives everything from
it:

- **ROI 220%** = $7.2M net benefit ÷ $3.27M incremental investment
- **$2.4M estimated savings** = $7.2M net benefit over 3 years
- **11-month payback** = the first month cumulative net benefit crosses zero

Because costs start immediately while benefits phase in over a nine-month deployment, payback lands
in month 11 rather than month 3 — the realisation curve is what puts it there.

This is why toggling a displacement in stage 3 flows straight through to stage 4: excluding the
inferred Proofpoint line moves the case to 183% ROI and $1.99M. The demo can be stress-tested live
without the numbers contradicting each other.

## Design

Microsoft Fluent 2, via `@fluentui/react-components`. Component styling uses **CSS Modules that read
Fluent design tokens as CSS custom properties** (`var(--colorNeutralBackground1)`,
`var(--spacingHorizontalM)`, `var(--shadow4)`), which `FluentProvider` publishes to the DOM. One
consequence worth knowing: Fluent copies the provider's `className` onto the portal nodes it mounts
for tooltips and popovers, so **never attach layout or background rules to `FluentProvider` via
`className`** — the app shell is sized from `global.css` via `#root > .fui-FluentProvider` instead.

Both light and dark themes are supported (toggle in the top bar), including a separately-stepped
chart palette rather than an automatic flip.

Charts are hand-rolled SVG with no charting dependency. They follow a single-accent *emphasis*
palette — validated for colour-vision deficiency against the surfaces the app actually renders on —
plus a zero baseline, direct labels, hover crosshair with tooltip, keyboard navigation, and a
**View data** table twin so no value is reachable only by hovering.

## Project structure

```
src/
  components/
    Layout/                  AppShell, TopBar
    WorkflowHeader/          four-stage progress indicator
    AIAssistantPanel/        persistent copilot — thread, blocks, composer
    CustomerProfile/         stage 1, incl. AIField with confidence + provenance
    SKUSelection/            stage 2, incl. RecommendationCard
    CompetitiveDisplacement/ stage 3
    ResultsDashboard/        stage 4, incl. PaybackChart + SpendComparison
    shared/                  ConfidenceBadge, MetricTile, SectionHeading, StageFooter
  data/
    mockData.js              profile, SKUs, displacements, financial model
    aiScript.js              scripted intents, responses and stage commentary
  state/
    AppStateContext.jsx      reducer + the scripted orchestration
  styles/global.css          reset, chart roles, shared keyframes
  theme.js                   Fluent brand ramp (light + dark)
  App.jsx
```

## Notes for demoing

- Best at **1440px or wider**. Below ~1024px the assistant panel floats over the workflow rather
  than shrinking it; it can be collapsed from the top bar.
- The reset button (top bar) returns to a clean case mid-presentation.
- Export buttons in stage 4 raise a toast — no file is produced.
- All motion respects `prefers-reduced-motion`.

## Related branches

- `document-management-style` — an exploration that reframes the experience around the Business Case
  as a document: a Library replacing the Dashboard, inline title editing, block-based authoring,
  auto-save, comments, version history and a publish workflow.
