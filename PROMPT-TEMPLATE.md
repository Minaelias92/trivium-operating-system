# Operating System Dashboard — Reusable Prompt Template

Use this prompt with Claude (or any AI) to generate a single-page HTML operating system dashboard for any business.

---

## The Prompt

> Build me a single-page HTML dashboard called **"[Company Name] Operating System"** that maps out how my business creates and delivers value. It should have:
>
> ### Structure
> - A dark-themed UI (navy/slate background, clean sans-serif font)
> - Tabbed navigation across the top
> - Each tab shows a horizontal flowchart with clickable stage cards
>
> ### Tabs
> 1. **[Revenue/Growth Engine]** — How we attract and convert customers. Show every step from first awareness to closed deal, as a left-to-right flow with arrows between stages.
> 2. **[Fulfillment/Delivery Engine]** — How we deliver the service/product after the sale. Show onboarding through to completion/retention.
> 3. **Power Stages** — The critical stages across both engines that we can't afford to mess up. Show each as a card with: stage name, why it matters, who owns it, and whether an SOP exists (green) or is missing (red).
> 4. **Support Functions** — Back-office departments that enable both engines (e.g., Finance, HR, Ops) shown as a grid of cards.
>
> ### For each stage card, include:
> - Stage name
> - Department/owner
> - A clickable link to its Google Drive folder (I'll provide the URLs)
> - Color coding by department/function
> - A lightning bolt icon on "power stages" (the critical ones)
>
> ### Visual rules
> - Trigger stages are green-tinted
> - End stages are red-tinted
> - Arrows (→) connect stages left to right
> - Where the flow splits into parallel services, show them as a vertical grid
> - Mobile responsive (stacks vertically on small screens)
>
> ### Here is my business information:
>
> **Company Name:** [Your company]
>
> **Growth/Acquisition Stages (in order):**
> 1. [Stage name] — [Department] — [Google Drive link]
> 2. [Stage name] — [Department] — [Google Drive link]
> 3. ...
>
> **Fulfillment/Delivery Stages (in order):**
> 1. [Stage name] — [Department] — [Google Drive link]
> 2. [Stage name] — [Department] — [Google Drive link]
> 3. ...
>
> **Parallel service departments (branching point in fulfillment):**
> - [Service name] — [Department] — [Google Drive link]
> - [Service name] — [Department] — [Google Drive link]
> - ...
>
> **Power Stages (critical, can't-fail stages):**
> 1. [Stage name] — Why it matters: [reason] — Owner: [who] — SOP status: [Exists/Needs creation]
> 2. ...
>
> **Support Functions:**
> - [Department] — [Description] — [Google Drive link]
> - ...

---

## How to Use

1. Copy the prompt above
2. Replace all `[bracketed]` placeholders with your business details
3. Paste into Claude or any AI assistant
4. You'll get a single `index.html` file — no dependencies, ready to deploy

## Tips

- **The two-engine model is universal:** every business has a way it gets customers (Growth Engine) and a way it serves them (Fulfillment Engine). Frame your stages around that.
- **Power stages** are the ones where failure causes revenue loss, churn, or reputation damage. Be honest about which stages those are.
- **SOP tracking** turns this from a pretty diagram into an accountability tool. Mark what's documented and what isn't.
- **Google Drive links** can be swapped for Notion, Confluence, SharePoint, or any URL.

## Deployment Options

- **GitHub Pages:** Push to a repo, enable Pages in Settings → free hosted link
- **Vercel/Netlify:** Drag and drop the HTML file → instant deploy
- **Internal:** Just open the HTML file in any browser — it's fully self-contained

---

*Generated from the Trivium Operating System project.*
