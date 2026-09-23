# Cross-Border Data Transfer & PRA SS2/21 Transfer Impact Assessment (TIA) Engine

[![Compliance Standard](https://img.shields.io/badge/Regulatory%20Standard-EDPB%2001%2F2020%20%7C%20PRA%20SS2%2F21-blue.svg)](#-overview)
[![Framework](https://img.shields.io/badge/Legal%20Framework-EU%2FUK%20GDPR%20Art%2044--49%20%7C%20CJEU%20Schrems%20II-emerald.svg)](#-overview)
[![License](https://img.shields.io/badge/License-Proprietary-red.svg)](#-license)

---

## 📌 Overview

The **Cross-Border Data Transfer & PRA SS2/21 TIA Engine** is an enterprise-grade regulatory compliance, legal risk engineering, and prudential operational resilience platform. It is engineered specifically for Financial Institutions, Global Enterprises, Data Protection Officers (DPOs), Chief Information Security Officers (CISOs), and Regulatory Legal Counsels who govern international data transfers under strict European and British data privacy and financial supervisory regimes.

The engine automates the end-to-end statutory workflow mandated by:
* **CJEU Schrems II (Case C-311/18)** & **EDPB Recommendations 01/2020** on supplementary transfer measures.
* **EU & UK General Data Protection Regulation (GDPR)** Articles 44–49 (Chapter V International Transfers).
* **Bank of England / Prudential Regulation Authority (PRA) Supervisory Statement SS2/21** on Outsourcing and Third-Party Risk Management for Material Outsourcing and Critical Information Functions (CIF).
* **European Essential Guarantees (EEG)** assessments evaluating third-country foreign surveillance legislation (e.g., US FISA Section 702, Executive Order 14086, CLOUD Act, India DPDP Act, and PRC Data Security Law).

---

## Key Highlights

* 🔒 **Three-Pillar Supplementary Safeguards Matrix**: Complete multidimensional evaluation spanning **Technical Protection** (EDPB Annex 2 Use Cases 1–3, BYOK/HYOK Local HSMs, split-knowledge tokenization), **Legal & Contractual Safeguards** (SCCs 2021/914, warrant challenge clauses, PRA direct inspection riders), and **Organizational Governance** (12-month tested stressed exit playbooks, sub-processor 30-day veto SLAs).
* ⚖️ **Statutory Jurisdiction Surveillance Library**: In-depth legal repository analyzing foreign surveillance powers, intelligence oversight mechanisms, warrant thresholds, and individual redress availability across 15+ major global jurisdictions.
* 🏦 **PRA SS2/21 Chapter 2–10 Materiality & Resilience Audit**: Dedicated prudential assessment auditing CIF classification, impact tolerances, operational disruption scenarios, and Section 165A/166 direct regulatory inspection authorities.
* 🧠 **Simulated Intelligence Gap-to-Action Heuristic**: Cognitive heuristic engine that evaluates transfer configurations against surveillance legislation and automatically synthesizes high-impact technical, legal, and operational remediation controls with 1-click adoption.
* 📄 **Multi-Format Vector PDF Audit Export**: Client-side vector-grade PDF compiler (`jsPDF` + `html2canvas`) delivering exportable **Consolidated** and **Individual Pillar** (Technical, Legal, Organizational) dossiers formatted strictly to the 5-section regulatory standard: *Assessment, Gaps, Remediation, Timelines, Remarks*.
* 🌐 **Visual Data Flow & Transit Mapping**: Real-time canvas illustrating exporter-to-importer data pipelines, intermediate transit routing, cloud hypervisor memory boundaries, and cryptographic barrier enforcement.
* 💾 **Session Auto-Save & Crash-Resilient Local Persistence**: Continuous 15-second periodic auto-save and debounced state caching to browser LocalStorage, preventing accidental data loss during extensive multi-step legal and technical scoping sessions with 1-click draft restoration.
* 📸 **Encrypted State Snapshot & Disaster Recovery**: 1-click manual encrypted blob snapshot download (`.tiasnap.json`) utilizing **AES-GCM-256** and **PBKDF2-SHA256 (100,000 rounds)** with SHA-256 tamper-evident integrity hashing for offsite backup and round-trip assessment restoration.
* 📁 **14 Regulated Financial Industry Case Studies & Presets Library**: Production-grade transfer scenarios spanning Tier-1 core banking, Lloyd's insurance syndicates, high-frequency trading AI, private wealth, biometric AML/KYC, and multi-party cryptographic asset custody.
* ⚖️ **Side-by-Side TIA Comparison Mode & Delta Engine**: Multi-profile comparison suite allowing DPOs and CISOs to select two different TIA profiles from browser LocalStorage (live session, auto-saved drafts, saved profile library, preset benchmarks, or uploaded JSON/snapshot files) to visualize side-by-side risk score reductions, GDPR/PRA verdict progressions, 3-pillar safeguard improvements, and granular remediation gap closures.
* 🔗 **Unique TIA Identification & Cross-Framework GRC Interoperability**: Every assessed transfer profile is provisioned with a triple-tier canonical ID bundle (`TIA-2026-XXXX-XXXX`, RFC 4122 UUID v4, and standard URN `urn:grc:tia:...`), enabling automated sync and pre-built JSON payload generation for **ServiceNow VRM/GRC**, **OneTrust TIA**, **PRA Table 5 MTP Outsourcing Register**, **DORA Chapter V ICT Register**, and **NIST OSCAL**.
* 🛡️ **Air-Gapped Sovereign Execution & Local LLM Bridge**: Operates deterministically with zero data exfiltration for air-gapped secure bank perimeters, with optional hybrid connectivity to server-side Gemini API or local Ollama instances (`llama3.3:70b`).

---

## 📁 Available Presets Library

The engine incorporates **14 production-grade regulated transfer scenarios** covering major international cross-border corridors, regulatory standards, and technology architectures:

* 🏦 **Tier-1 UK Bank — Core Banking & Ledger SaaS Migration** (🇺🇸 United States)
* 🛡️ **Global Solvency II Insurer — Policy Administration & Claims BPO** (🇮🇳 India)
* ⚡ **PRA-Designated Investment Firm — Quantitative AI Model Execution** (🇸🇬 Singapore)
* 🏢 **Financial Holding Group — Enterprise HR & Payroll Cloud** (🇨🇦 Canada)
* 🛡️ **Retail Payment Provider — Real-Time Anti-DDoS & WAF Protection** (🇮🇱 Israel)
* 🏦 **Private Wealth Bank — High-Net-Worth Portfolio Optimization** (🇨🇭 Switzerland)
* 💳 **Neo-Bank & Fintech — Real-Time Facial Biometrics & AML Screening** (🇺🇸 United States)
* 🛡️ **Major Life & Pensions Insurer — Actuarial Longevity Grid Compute** (🇦🇺 Australia)
* ⚡ **UK Asset Manager — Low-Latency Equities Matching Cloud** (🇯🇵 Japan)
* 🛡️ **Lloyd’s Reinsurance Syndicate — Spatial Catastrophe Risk Modelling** (🇩🇪 Germany)
* 🔐 **FCA Cryptoasset Firm — Multi-Party Computation Key Sharding in DIFC** (🇦🇪 United Arab Emirates)
* 🚢 **Global Trade Bank — Cross-Border Letter of Credit & OCR Engine** (🇧🇷 Brazil)
* 🏡 **Building Society — Offshore Mortgage Underwriting & Income Verification** (🇿🇦 South Africa)
* 💱 **Wholesale Investment Bank — Asian FX Liquidity Pooling & Clearing Hub** (🇭🇰 Hong Kong)

### 🛠️ Where to Access the Presets

* **Top Navigation Bar**: Select any preset from the **Presets** dropdown to switch the active assessment across the app.
* **Transfer Wizard Toolbar**: Click **Presets (14)** to open the searchable visual library modal to filter by sector (Banking, Insurance, Investment & AI, FinTech) and load configurations directly.
* **Comparison Mode Tab**: Select any two presets to perform differential gap analysis across legal safeguards, PRA SS2/21 resilience benchmarks, and data protection scores.

---

## 🚀 Quick Start

### Prerequisites

Ensure your host environment meets the following baseline requirements:

* **Node.js**: v18.0.0 or higher (Node.js 20+ LTS recommended)
* **Package Manager**: `npm` (v9+) or `bun` / `pnpm` / `yarn`
* **Modern Web Browser**: Chrome 110+, Firefox 110+, Edge 110+, Safari 16.4+ (Canvas and ES2022 support required)
* **Optional (Hybrid AI Mode)**: Google Gemini API key (`GEMINI_API_KEY`) for AI-assisted policy generation, or local Ollama runtime.

---

### ⚡ 1-Click Automated Setup & Launch (Windows & Cross-Platform)

#### Windows (Batch Scripts)
* **Environment Setup & Gap Resolution**:
  Double-click **`setup.bat`** (or execute `setup.bat` in CMD / PowerShell).  
  *Automates Node.js / npm / Docker verification, generates `.env` if missing, installs all dependencies, validates TypeScript types, and compiles the production bundle.*
* **Interactive Server Launcher**:
  Double-click **`start.bat`** (or execute `start.bat` in CMD / PowerShell).  
  *Select between Development Mode (`npm run dev`), Production Server (`npm run start`), or Containerized Docker deployment (`docker compose up --build`). Automatically opens `http://localhost:3000` in your default browser.*

#### macOS / Linux / WSL (Shell Scripts)
* **Setup**: `chmod +x setup.sh && ./setup.sh`
* **Launcher**: `chmod +x start.sh && ./start.sh`

---

### Installation & Setup Guide

#### Option A: 1-Click Scripts (Recommended)
```cmd
:: Run setup to check environment and install any missing packages
setup.bat

:: Launch development, production, or Docker server
start.bat
```

#### Option B: Docker Container Deployment
```bash
# Build and run containerized server
docker compose up --build -d

# Open browser at http://localhost:3000
# View real-time logs
docker compose logs -f
```

#### Option C: Standard Manual NPM / Node.js Setup

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/amitkpconsulting-spec/TIA-Engine.git
   cd TIA-Engine
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```
   *(Alternatively, if using Bun: `bun install`)*

3. **Configure Environment Variables**:
   Create a `.env` file from the provided `.env.example`:
   ```bash
   cp .env.example .env
   ```

   Configure the parameters according to your deployment tier:
   ```env
   # Server Port (Default: 3000)
   PORT=3000

   # Deployment Mode (development | production)
   NODE_ENV=development

   # Optional: Google Gemini API Key for hybrid AI policy generation & regulatory drafting
   GEMINI_API_KEY=your_gemini_api_key_here

   # Canonical Application URL
   APP_URL=http://localhost:3000
   ```

4. **Launch Local Development Server**:
   ```bash
   npm run dev
   ```
   The application dev server boots with `tsx` and hot Vite middleware integration.  
   Access the web interface at: **`http://localhost:3000`**

5. **Verify Codebase & Types**:
   ```bash
   npm run lint
   ```

6. **Build for Production Deployment**:
   ```bash
   npm run build
   ```
   *This compiles the client-side SPA into `dist/` and bundles `server.ts` into a self-contained CommonJS server at `dist/server.cjs` via `esbuild`.*

7. **Run Production Server**:
   ```bash
   npm start
   ```

---

#### Option B: Air-Gapped / Sovereign Bank Perimeter Deployment

For on-premises, classified, or zero-trust financial infrastructure requiring strict zero-data-exfiltration:

1. **Pre-package Bundle in Secure CI/CD**:
   ```bash
   npm ci
   npm run build
   tar -czvf tia-engine-release.tar.gz dist/ package.json node_modules/
   ```
2. **Transfer Artifact to Air-Gapped Host** (via secure diode or audited staging repository).
3. **Launch Offline Runtime**:
   ```bash
   NODE_ENV=production PORT=3000 node dist/server.cjs
   ```
   *The built-in engine functions fully offline with deterministic mathematical scoring algorithms, client-side vector PDF generation (`jsPDF`), and local cryptographic hash generation without external API dependencies.*

---

## 🛠️ Architecture & Core Features

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            TIA COMPLIANCE ENGINE                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  [Step 1: Intake & Scope] ────► [Step 2: Surveillance Law Assessment]      │
│  • Exporter/Importer Profiles   • FISA 702 / EO 14086 / CLOUD Act           │
│  • Data Sensitivity & Volume    • European Essential Guarantees A-D         │
│  • Transfer Mechanisms (SCCs)   • PRA Materiality / CIF Classification      │
│                                                                             │
│                                      │                                      │
│                                      ▼                                      │
│  [Step 3: 3-Pillar Safeguard Matrix & Residual Scoring Engine]              │
│  ┌────────────────────────┬───────────────────────┬──────────────────────┐  │
│  │ Pillar I: Technical    │ Pillar II: Legal      │ Pillar III: Org      │  │
│  │ • Local HSM BYOK Vault │ • Warrant Challenges  │ • Stressed Exit BCP  │  │
│  │ • Split-Knowledge FP-E │ • S165A/166 Riders    │ • Sub-processor Veto │  │
│  │ • Confidential Enclave │ • 24h Law Notice SLAs │ • Step 6 Re-Auditing │  │
│  └────────────────────────┴───────────────────────┴──────────────────────┘  │
│                                                                             │
│                                      │                                      │
│                                      ▼                                      │
│  [Step 4: Remediation Dashboard & Suggested Actions Heuristic Engine]       │
│  • Per-Pillar Progress Tracking    • Cognitive Gap-to-Control Heuristic     │
│  • Residual Risk Burndown Trajectory • Interactive SLA & Roadmap Matrix     │
│                                                                             │
│                                      │                                      │
│                                      ▼                                      │
│  [Step 5: Multi-Format Audit Reports & Policy Export]                       │
│  • 5-Section Regulatory PDF Dossiers (Consolidated / Pillar I / II / III)   │
│  • Data Sovereignty Governance Policy (.docx / Markdown / Plaintext)        │
│  • Full Cryptographic Audit Hash Authentication & JSON Export               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Module Breakdown

| Module | Component | Description |
| :--- | :--- | :--- |
| **Guided Onboarding & Smart Defaults** | `OnboardingSetupModal.tsx` | Guided setup wizard prompting region & industry upon first visit to populate calibrated rules with bypass support and inline validation. |
| **Prioritized Action Items & Bulk Remediation** | `PrioritizedComplianceActionItems.tsx` | Plain English findings sorted strictly by risk severity (Critical ➔ Warnings ➔ Compliant) with progressive disclosure, multi-select, and 1-click bulk remediation. |
| **Audit-Ready Export Engine** | `auditExporter.ts`, `CustomizablePrintModal.tsx` | Instant .CSV and .PDF audit report exports retaining risk hierarchy (Critical first) with timestamps and company metadata. |
| **Immutable Activity & Regulatory Log** | `ActivityLogView.tsx`, `activityLogger.ts` | Tamper-evident, non-repudiable audit trail recording who modified settings, executed bulk fixes, and status transitions with multi-parameter filtering. |
| **Transfer Intake Wizard** | `TransferWizard.tsx`, `autoSaveManager.ts` | Multi-step interactive flow with 15s auto-save persistence, capturing legal entities, country pairs, transfer mechanisms, data classifications, and technical controls. |
| **Remediation & Risk Dashboard** | `RemediationDashboardView.tsx` | Comprehensive mitigation interface featuring 3-pillar progress bars, burndown charts, dynamic residual scoring, and the cognitive Suggested Actions engine. |
| **3-Pillar Safeguards Matrix** | `ThreePillarMatrixView.tsx` | Granular assessment matrix across Technical (EDPB 01/2020), Legal (SCC Clauses 14-15), and Organizational (PRA SS2/21) controls. |
| **Jurisdiction Legal Library** | `JurisdictionLibrary.tsx` | Comprehensive database of 15+ foreign surveillance legal regimes, adequacy decisions, and European Essential Guarantee ratings. |
| **PRA Prudential Checklist** | `PrudentialChecklistView.tsx` | Bank of England PRA SS2/21 operational resilience verification matrix (Chapters 2 through 10). |
| **Data Flow Canvas** | `VisualDataFlow.tsx` | Visual mapping of exporter egress, cloud provider boundary, memory enclaves, and sovereign HSM key stores. |
| **3-Pillar PDF Report Engine** | `ThreePillarPdfReportModal.tsx` | Vector PDF exporter generating Consolidated and Per-Pillar compliance dossiers using standard 5-section layouts. |
| **Data Sovereignty Policy Generator** | `PolicyGeneratorView.tsx` | Generates legally binding corporate Data Sovereignty & International Transfer Policies with customizable sections. |
| **Cross-Framework Integration Engine** | `CrossFrameworkIntegrationModal.tsx`, `tiaIdGenerator.ts` | Generates canonical TIA references, UUIDs, URNs, and interoperability JSON payloads for ServiceNow VRM, OneTrust, PRA Table 5 MTP Register, DORA ICT Register, and NIST OSCAL. |
| **Server & Air-Gap Console** | `ServerStatusView.tsx`, `AirGapConsole.tsx` | Hardware perimeter verification, zero-exfiltration telemetry, and local database connection management. |

---

## ⚙️ Configuration

### Scripts in `package.json`

| Command | Action |
| :--- | :--- |
| `npm run dev` | Starts development server on port 3000 via `tsx server.ts` with Vite middleware. |
| `npm run build` | Compiles client assets (`vite build`) and bundles `server.ts` to `dist/server.cjs` via `esbuild`. |
| `npm start` | Launches compiled production server (`node dist/server.cjs`). |
| `npm run lint` | Runs TypeScript typechecker (`tsc --noEmit`) to validate type safety. |
| `npm run clean` | Cleans build artifacts in `dist/`. |

### Environment Variables

| Variable | Type | Description | Default |
| :--- | :--- | :--- | :--- |
| `GEMINI_API_KEY` | String | Server-side Gemini API key for hybrid AI policy refinement. | *Optional* |
| `PORT` | Number | Server listener port. | `3000` |
| `NODE_ENV` | String | Environment mode (`development` / `production`). | `development` |
| `APP_URL` | String | Canonical URL of the deployment instance. | `http://localhost:3000` |

---

## 📖 Usage & Examples

### 1. Conducting a Transfer Impact Assessment (TIA)

1. Launch the app and navigate to **New Assessment Wizard**.
2. Select **Data Exporter** (e.g., *UK Financial Entity*) and **Data Importer** (e.g., *US Cloud Provider*).
3. Specify transfer legal bases (e.g., *EU Standard Contractual Clauses (Module 2: Controller-to-Processor)*).
4. Enter data volume, sensitivity (*Special Category Data, Financial/Payment data, Critical Operational Assets*).
5. Specify existing key custody (*Cloud Provider Managed, KMS Cloud Vault, BYOK/HYOK Local HSM*).
6. Click **Execute TIA Evaluation** to calculate inherent risk scores, surveillance risk indices, and PRA materiality tiers.

### 2. Remediating Gaps with the Suggested Actions Engine

1. In the **Remediation Dashboard**, review identified statutory deficits in the **Suggested Actions Engine**.
2. Review technical blueprints for highlighted measures (e.g., *On-Soil HSM Key Vault, Client-Side Format-Preserving Tokenization, Stressed Exit Disaster Recovery Playbook*).
3. Click **Adopt Control** on individual items or **Adopt All Suggestions** to incorporate controls into the active remediation plan.
4. Watch the **Pillar I (Technical)**, **Pillar II (Legal)**, and **Pillar III (Organizational)** progress bars and residual risk score update in real-time.

### 3. Exporting Regulatory Audit PDF Dossiers

1. Click **Export Full PDF** or select a specific pillar (**Tech PDF**, **Legal PDF**, **Org PDF**).
2. The modal displays a preview of the formal 5-section regulatory report:
   - **Section 1**: Assessment & Statutory Scope
   - **Section 2**: Compliance & Surveillance Gaps
   - **Section 3**: Supplementary Remediation Measures
   - **Section 4**: Implementation Timelines & SLA Roadmap
   - **Section 5**: DPO, CRO & Regulatory Remarks
3. Click **Download PDF** for an instant high-resolution vector PDF download, or **Print / Save PDF** for hardcopy audit binders.

### 4. Cross-Framework GRC Interoperability & Unique ID Integration

1. Click on the **TIA ID Badge** (e.g., `TIA-2026-8A4F-E29B`) in the top navigation bar or assessment summary.
2. The **Cross-Framework Integration & Interoperability Center** displays:
   - **Canonical Assessment Reference**: High-contrast, human-readable ID format (`TIA-YYYY-XXXX-XXXX`).
   - **Universal UUID (v4)**: Standard RFC 4122 identifier for programmatic API synchronization.
   - **Open-GRC URN**: Standardized Uniform Resource Name (`urn:grc:tia:...`).
   - **Cryptographic SHA-256 Fingerprint**: Verifiable assessment integrity hash.
3. Select your downstream GRC system tab:
   - **ServiceNow VRM / GRC**: Pre-formatted vendor risk payload with residual risk scores and SMF governance.
   - **OneTrust TIA**: Module 1-4 standard format with transfer classification and key custody records.
   - **PRA MTP Register**: Bank of England Table 5 outsourcing register JSON schema.
   - **DORA ICT Register**: Chapter V ICT third-party service provider concentration risk payload.
   - **NIST OSCAL**: Open Security Controls Assessment Language JSON structure.
4. Click **Copy JSON Payload** or **Download Payload** to export directly to your third-party risk tooling.

---

## 🗺️ Roadmap

- [x] **v1.0**: Core TIA Evaluation Engine, Schrems II statutory analysis, and European Essential Guarantees mapping.
- [x] **v1.5**: PRA SS2/21 Prudential Outsourcing Checklist and CIF Materiality modules.
- [x] **v2.0**: Three-Pillar Supplementary Measures matrix and Visual Data Flow topology map.
- [x] **v2.5**: Air-Gapped server status console, local LLM telemetry, and Data Sovereignty Policy generator.
- [x] **v3.0**: 3-Pillar vector PDF export engine (`jsPDF` + `html2canvas`) with 5-section standardized regulatory formats.
- [x] **v3.2**: Three-Pillar progress velocity tracking and Simulated Intelligence Gap-to-Action Heuristic engine.
- [x] **v3.5**: Unique TIA Assessment ID Engine, Cryptographic SHA-256 Fingerprinting, and Cross-Framework Interoperability (ServiceNow, OneTrust, PRA Table 5 MTP, DORA ICT, OSCAL).
- [ ] **v4.0 (Planned)**: Direct Bi-Directional REST / Webhook Sync Connectors for ServiceNow GRC and OneTrust API.

---

## 🤝 Contributing

Contributions, legal citations, and regulatory improvements are welcomed from privacy engineers, data protection officers, and regulatory compliance specialists.

1. **Fork the Repository**: [https://github.com/amitkpconsulting-spec/TIA-Engine](https://github.com/amitkpconsulting-spec/TIA-Engine)
2. **Create a Feature Branch**: `git checkout -b feature/regulatory-enhancement`
3. **Commit Changes**: `git commit -m 'feat: Add DORA Article 28 ICT concentration risk checklist'`
4. **Push Branch**: `git push origin feature/regulatory-enhancement`
5. **Open a Pull Request**: Submit your pull request at [https://github.com/amitkpconsulting-spec/TIA-Engine/pulls](https://github.com/amitkpconsulting-spec/TIA-Engine/pulls) with regulatory citations and test validation details.

---

## 📄 License

**Proprietary Commercial Software**  
Copyright © 2026 Technoscope. All Rights Reserved.

Unauthorized copying, reverse engineering, redistribution, or modification of this software, via any medium, is strictly prohibited without the express written permission of Technoscope.

---

## Contact

For enterprise licensing, bespoke regulatory rulebook integrations, compliance consulting, or technical support:

* **Website**: [www.technoscope.co.in](https://www.technoscope.co.in)
* **Email**: [contact@technoscope.co.in](mailto:contact@technoscope.co.in)
* **Consulting Support**: [amitkp.consulting@gmail.com](mailto:amitkp.consulting@gmail.com)
