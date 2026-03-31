# Trivium Operating System

**The command center for how Trivium runs.**

---

## What This Is

The Trivium Operating System (TriviumOS) is a unified business intelligence hub that maps every process, department, and team function inside Trivium into a single, navigable interface. It is the single source of truth for how work flows through the company — from the moment a prospect becomes aware of Trivium, to the moment a client leaves a testimonial.

This is not a project management tool. It is not a task tracker. It is the **operating layer** — the document that answers the question: *how does Trivium actually work?*

---

## The Vision

Most companies run on tribal knowledge. Critical processes live in people's heads, buried in Slack threads, or scattered across folders no one can find. When a key person leaves, or when the business tries to scale, that knowledge disappears or breaks down.

TriviumOS is the answer to that problem.

The goal is a living system where:
- Every stage of the Growth Engine and Fulfillment Engine is visible and documented
- Every team member can instantly find any SOP, template, playbook, or process document
- Leadership has a real-time view of operational health — where SOPs exist, where gaps are, and what's at risk
- New hires can onboard by navigating the system rather than asking around
- AI can answer any operational question in plain English, sourcing from real documents

Think of it as the **brain of the business** — rendered as a dashboard, searchable by AI, connected to every folder in Google Drive.

---

## What's Inside

### Growth Engine
Maps the full client acquisition journey from first awareness to closed sale. Every stage is clickable and linked directly to its corresponding Google Drive folder — ad assets, sales toolkits, HubSpot workflows, proposal templates. Power Stages (the ones that directly impact revenue if they break) are highlighted with a red border.

### Fulfillment Engine
Maps how Trivium delivers value after the sale — client onboarding, service departments (PPC, Brand Management, DSP, Analytics, TikTok Shop, Reviews), customer success management, and the transition back to growth via testimonials and case studies.

### Power Stages
A dedicated view of the 9 most critical operational stages in the company. These are the stages where a breakdown directly causes lost revenue, churn, or reputation damage. Each one shows its owner, SOP status, and the specific risk if it's not documented. Currently 4 of 9 have documented SOPs — the remaining 5 are the highest-priority operational gaps.

### Support Functions
Operations, Finance, HR & Recruiting, Executive Office, Recruiting Services, and E2CEO — all linked directly to their Drive folders for instant access.

### AI Assistant
A built-in AI chat powered by Claude (Anthropic) that has read every document in the knowledge base. Ask it anything:
- *"What's our onboarding process for new clients?"*
- *"Show me the PPC SOP"*
- *"Who owns the handover to fulfillment and what's the risk?"*
- *"What are the CSM KPIs?"*
- *"Find the message templates"*

The AI searches across 250 extracted documents — SOPs, playbooks, onboarding plans, KPI trackers, training materials, legal contracts — and answers from the actual source material, not a summary.

---

## The Power Stages Concept

A Power Stage is any point in the business where a failure has an outsized impact. Not every stage is equal — most process failures are recoverable. Power Stages are the ones that are not.

**Current Power Stages:**

| # | Stage | Engine | Owner | SOP Status |
|---|-------|--------|-------|------------|
| 1 | Paid Ads (Meta/Google) | Growth | Candelaria | ✅ Documented |
| 2 | Lead Magnets & HubSpot Capture | Growth | Marketing | ❌ Needs SOP |
| 3 | Presales Audit & Analysis | Growth | Sales Team | ✅ Documented |
| 4 | Discovery Call & Proposal | Growth | Mina | ✅ Documented |
| 5 | Handover to Fulfillment | Transition | Sales + CS | ❌ Needs SOP — critical |
| 6 | Client Onboarding | Fulfillment | Client Success | ❌ Needs SOP |
| 7 | PPC Services Delivery | Fulfillment | Manuel | ✅ Documented |
| 8 | Brand Management | Fulfillment | Brand Team | ❌ Needs SOP |
| 9 | Customer Success Management | Fulfillment | CSM Team | ❌ Needs SOP — critical |

The two highest-priority gaps are **Handover to Fulfillment** and **Client Onboarding** — these sit at the junction between the two engines and are where the ICP research identifies the root cause of churn.

---

## Architecture

```
trivium-operating-system/
├── index.html              # The entire dashboard — single HTML file, no framework
├── knowledge-base.json     # 250 extracted documents (SOPs, playbooks, KPIs, templates)
├── api/
│   └── chat.js             # Vercel serverless function — keyword search + Claude API
├── vercel.json             # Vercel configuration
└── README.md               # This file
```

**No build step. No framework. No database.**

The dashboard is a single HTML file. The AI backend is a single serverless function. The knowledge base is a static JSON file bundled with the deployment. This makes it fast, cheap to host, and easy to update.

**Stack:**
- Frontend: Vanilla HTML/CSS/JS
- Hosting: Vercel (static + serverless)
- AI: Anthropic Claude (claude-haiku) via REST API
- Knowledge base: Pre-extracted text from Google Drive documents
- Search: Keyword scoring across document names, folders, and content

---

## Knowledge Base

The `knowledge-base.json` file contains extracted text from 250 documents across Trivium's Operations Google Drive:

| Type | Count |
|------|-------|
| Spreadsheets (.xlsx) | 134 |
| Word documents (.docx) | 74 |
| PDFs | 66 |
| PowerPoints (.pptx) | 7 |
| Text/CSV | 5 |

Key folders indexed: Client Onboarding, New Hire Onboarding Plans, CIP Process Management, Playbooks, Quality Assurance, IT & Automation, HubSpot, Marketing, Finance, KPIs, Legal & Contracts, PPC-FAM, Reviews, Tools Management, Trainual Videos and Documents.

To update the knowledge base when documents change, re-run the extraction script against new Drive exports and redeploy.

---

## Live Dashboard

**https://trivium-os-dlfs-projects-2e99dbe5.vercel.app**

Share this link with any team member. No login required. Works on desktop and mobile.

---

## What This Becomes

TriviumOS in its current form is the foundation. The roadmap:

1. **SOP Builder** — A workflow inside the dashboard for creating and publishing new SOPs directly into the knowledge base
2. **Operational Health Score** — A live score showing what percentage of Power Stages are documented, owned, and current
3. **Team Directory** — Every person linked to their stages, responsibilities, and the documents they own
4. **Onboarding Mode** — A guided walkthrough for new hires that walks them through both engines and their department's role
5. **Change Log** — A record of when processes were last updated and by whom
6. **Cross-Engine Analytics** — Where are handoffs breaking down? Where is time being lost between stages?
7. **Full Google Drive Sync** — Live document indexing via Google Drive API so the knowledge base updates automatically when files change

The end state is a system where asking *"how does Trivium work?"* has a complete, accurate, living answer — available to every team member, at any time, in plain English.

---

## Updating the Knowledge Base

When you add or update documents in Google Drive:

1. Export the relevant folders from Google Drive as zip files
2. Run the extraction script:
   ```bash
   python3 /tmp/build_kb.py
   ```
3. Commit and push:
   ```bash
   git add knowledge-base.json
   git commit -m "chore: update knowledge base"
   git push
   ```
4. Vercel auto-deploys on push (once GitHub integration is connected) or run `vercel deploy --prod`

---

*Built for Trivium. Owned by Trivium.*
