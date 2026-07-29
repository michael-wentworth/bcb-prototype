# Security BCB — FY27 prototype

An interactive front-end prototype of Security Business Case Builder. No backend, no API, no
authentication: every AI interaction is scripted and all data is mock.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
```

Requires Node 18+. Best at 1440px or wider. **Restart the dev server after switching git branches** —
Vite does not reliably survive a whole-tree replacement.

---

## Aligned to the product's forms

The three steps and their fields follow the shipping product's screens so the two can be compared
directly.

**Step 1 — Customer Details**

| Group | Fields |
|---|---|
| Customer Information | Account Name\*, Opportunity ID\*, Opportunity Name\*, "not for a customer", TPID, Opportunity Close Date, Industry, Geography (Region)\*, Currency, Customer Segment\*, Primary Sales Motion\*, Number of Users\*, Customer Website, Number of Devices, Role of Security BCB\*, Description |
| Customer Environment | Existing MS Licenses\*, Competitor Products, Current Security Stack\*, Seller Alias |
| Business Case Setup | Business Case Name\*, Analysis Period (Years)\* |

**Step 2 — SKU Selection**: the eight security outcomes, repeatable SKU rows (SKU, Solution Area,
Solution Play, seats per year, price per month), Build from a current bundle, and Competitor
Products with the MSRP discount and the add-a-product table.

**Step 3 — Customer Report**: metrics, cash-flow chart, spend comparison, authorship lineage, the
written case, and the benefit/investment ledger.

### Behaviours carried over from the product

- **Currency auto-populates from Geography** (UK → GBP, Japan → JPY, and so on)
- **Number of Devices defaults to 1.2 × users** when left blank, and says so
- **Seller Alias** is read-only, "from AAD SSO"
- **Analysis Period drives the seat-year columns** — set 5 years and each SKU row asks for 5 years of
  seats
- Competitor products not in the catalogue can be added and are "saved to this customer only"

### Deliberate changes

- **Three steps, not four.** Competitor Products lives inside SKU Selection, as it does in the
  product. The prototype previously had a separate Competitive Displacement step.
- **Contract timing is enforced.** `Year Contract Ends` is not decoration — a competitor's saving
  begins the year *after* its contract lapses, and a contract ending past the analysis period
  contributes nothing and is flagged **Outside horizon**. This is the single most common way a
  business case overstates savings.
- **The current Microsoft bundle is not a saving.** If the customer is buying an add-on they keep
  paying for their existing bundle, so counting it as benefit would inflate every case. It is
  baseline context and appears in the spend comparison, not the ROI.
- **Nothing is gated on the assistant.** Next is never disabled and every step is reachable, so the
  whole workflow is completable by hand.

---

## How the numbers work

Everything derives from the two input steps — there are no seeded figures, so an empty form produces
an empty case rather than a flattering default.

```
investment = Σ (seats per year × price per month × 12)
benefit    = Σ competitor cost × (1 − MSRP discount), from the year after each contract ends
           + additional Microsoft products / savings
ROI        = (benefit − investment) ÷ investment
payback    = first month cumulative net benefit crosses zero
```

The scripted Contoso example lands at **60% ROI, $819K average annual net, 23-month payback, 4
vendors displaced** — with Splunk's 2027 contract contributing only one of the three years, which is
the point of the mechanic.

---

## AI is an accelerator, not a requirement

The copilot sits in the side panel and can be collapsed entirely. Everything it does is optional:

| Behaviour | Try |
|---|---|
| **Populate** | The Contoso example — fills all three steps, with confidence and "Show source" per field |
| **Explain** | *"Why does 'Year Contract Ends' matter?"* · *"How did you calculate the ROI?"* |
| **Coach** | *"What is still missing from this case?"* — reads the actual form state |

Each written section (Executive summary, Recommendations, Risk analysis) can be typed directly or
generated, then **Rewrite / Summarize / Expand / Improve clarity**. These are deterministic text
operations on what you actually wrote — summarize keeps each paragraph's first sentence, rewrite
promotes the closing sentence to the front, clarity strips hedges. **Revert to my version** restores
your text exactly.

### Authorship

Every section carries **AI generated**, **AI assisted**, **Manually authored** or **Not started**,
with transitions enforced in one place: editing AI output makes it assisted, the copilot reworking
its own draft leaves it AI, reverting restores the prior badge. A lineage summary sits on the report.
There is no separate concept of an "AI case" — it is one Business Case either way.

---

## Project structure

```
src/
  data/
    referenceData.js  steps, dropdowns, SKU catalog, outcomes, competitor matrix
    model.js          the calculation, driven entirely by form inputs
    demoCase.js       the scripted Contoso extraction
    authoring.js      authorship model and narrative sections
    aiActions.js      section-level text transformations
    aiScript.js       scripted intents and step commentary
    caseLibrary.js    seeded My Cases and Example Cases, costed through model.js
    session.js        the signed-in user, named once for the bar and the seeds
  components/
    CustomerDetails/  step 1
    SkuSelection/     step 2 (outcomes, SKUs, bundle, competitors)
    CustomerReport/   step 3
    MyCases/          the case library, and the app's landing destination
    Narrative/        authorable prose sections
    ResultsDashboard/ PaybackChart, SpendComparison (charts only)
    AIAssistantPanel/ the copilot — only mounted inside a case
    WorkflowHeader/   three-step stepper
    Layout/  shared/
  state/AppStateContext.jsx
```

---

## Notes

- **Never attach layout or background rules to `FluentProvider` via `className`** — Fluent copies it
  onto every tooltip/popover portal node, painting full-viewport layers over the app. The shell is
  sized from `global.css` via `#root > .fui-FluentProvider`.
- Fluent's `Switch` renders `input[type="checkbox"]`; scope any bulk checkbox handling.
- Charts are hand-rolled SVG, colour-vision validated, with a table view so no value is hover-only.
- Light theme only; all motion respects `prefers-reduced-motion`.

## Branches

- `main` — this prototype
- `document-management-style` — an earlier exploration reframing the case as a document (Library,
  block-based authoring, versioning). Preserved, not merged.
