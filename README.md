# Cyber Incident Prioritization Engine 🛡️⚡

> **"Investigate what matters first."**  
> *Transform thousands of security alerts into an intelligent, explainable, prioritized incident response queue.*

[![React](https://img.shields.io/badge/React-19-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-cyan.svg)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-6-purple.svg)](https://vitejs.dev/)
[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

An enterprise-grade Security Operations Center (SOC) web application that ingests, correlates, mathematically scores, and dynamically ranks high-velocity cybersecurity alerts from **most dangerous to least dangerous**.

---

## 🎯 Problem & Solution

During a single shift, a cybersecurity team may receive 100+ alerts (phishing, brute-force, ransomware, PowerShell execution, impossible travel, data exfiltration). Analysts cannot triage every alert simultaneously.

The **Cyber Incident Prioritization Engine** solves this alert fatigue by:
1. **Normalizing & Scoring** alerts across 7 key dimensions (CVSS, Asset Criticality, Data Classification, Blast Radius, Telemetry Confidence, Business Impact, Graph Correlation).
2. **Autonomous Multi-Vector Correlation** grouping isolated alerts into unified **Attack Chains** sharing IPs, identities, or sequential MITRE ATT&CK kill-chain steps.
3. **Dynamic Re-Ranking Queue** ordered deterministically with 4-stage tie-breaking.
4. **Explainable AI (XAI)** providing natural language reasoning and factor-by-factor score delta breakdowns.
5. **Real-Time SOC Streaming Mode** simulating high-velocity events with instant critical attack chain detection.

---

## 📐 Mathematical Scoring Model

Each incident is evaluated across 7 weighted factors scaled from **1.0 to 10.0**:

| Dimension | Factor Weight | Focus Area |
|---|:---:|---|
| **Exploit Severity** | **22%** | CVSS base score, weaponization level, remote execution capability |
| **Business Impact** | **18%** | Operational downtime risk, financial liability, brand damage |
| **Asset Importance** | **15%** | Tier 0 Crown Jewels (Active Directory DC, Financial DB, Cloud Root) |
| **Data Sensitivity** | **15%** | PII, Financial records, PHI, Kerberos secrets, intellectual property |
| **Attack Confidence** | **12%** | Sensor fidelity, signature match strength, low false-positive rate |
| **Correlation Score** | **10%** | Multi-vector link density and active attack chain depth |
| **Affected Users** | **8%** | Blast radius measured by identity privilege and impacted count |

### Priority Score Formula:
$$\text{Weighted Score} = (\text{Sev} \times 0.22) + (\text{Impact} \times 0.18) + (\text{Asset} \times 0.15) + (\text{Data} \times 0.15) + (\text{Conf} \times 0.12) + (\text{Users} \times 0.08) + (\text{Corr} \times 0.10)$$

$$\text{Final Priority Score} = \text{Weighted Score} \times 10 \quad (\text{Range: } 10 - 100)$$

### 🚦 Deterministic Tie-Breaking Hierarchy:
1. **Higher Correlation Score** (Multi-stage intrusions take precedence)
2. **Higher Exploit Severity**
3. **Higher Asset Importance**
4. **More Recent Timestamp**

---

## ✨ Key Features

### 1. 🛡️ Prioritized Incident Queue
- Real-time ranked queue with dynamic rank indicators (`#1`, `#2`, `#3`...).
- Rich columns: Rank, Incident ID, MITRE ATT&CK classification, Asset Tier, Affected User, Attacker IP $\to$ Target IP, Priority Score with SVG Radial Gauge, Risk Level, Correlation Count, Timestamp, Status, and Actions.
- Multi-select batch actions: **Batch Mitigate**, **Escalate to CIRT**, **Suppress**.

### 2. 🔍 Explainable Ranking & Head-to-Head Comparison
- **Why this incident ranks here**: Natural language summary, key ranking drivers, and 7-factor horizontal contribution bars ($+\text{pts}$).
- **Head-to-Head Delta Comparator**: Pairwise comparison explaining why Incident #A outranks Incident #B with exact point attribution differentials.

### 3. 🕸️ Interactive Attack Chain Visualizer
- Directed Acyclic Graph (DAG) visualizing multi-stage attack progression:
  $$\text{Spearphishing} \to \text{Credential Access} \to \text{Execution} \to \text{Privilege Escalation} \to \text{Data Exfiltration} \to \text{Ransomware}$$
- Interactive nodes with MITRE technique codes (e.g. `T1566`, `T1078`, `T1068`, `T1041`, `T1486`), forensic metadata, and stage inspection modals.

### 4. ⚡ Batch Simulation & Real-Time SOC Live Mode
- **"Simulate Security Alerts"**: Generates 25–30 realistic enterprise alerts with interconnected IP/user attack chains.
- **Live SOC Mode**: Streams real-time incoming events every 6 seconds, triggers flash banner **"CRITICAL ATTACK CHAIN DETECTED"**, and dynamically re-ranks the queue in real time.
- **Preset APT Scenarios**: *APT29 State-Sponsored Espionage*, *BlackCat / ALPHV Ransomware Outbreak*.

### 5. 🎛️ Manual Ingestion Studio & Dynamic Weight Tuner
- Sliders for all 7 mathematical dimensions with real-time score preview and projected queue rank.
- Custom weight adjustments with dynamic re-ranking of the entire queue in memory.

### 6. 📊 Threat Intelligence & Analytics Dashboard
- Severity Distribution Donut Chart.
- Ingestion Velocity Timeline Area Chart.
- Top Targeted Infrastructure Assets.
- Compromised Accounts Leaderboard.

---

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

```bash
# Clone repository
git clone https://github.com/pranesh-2601/cyber-incident-prioritization-engine.git

# Navigate to project directory
cd cyber-incident-prioritization-engine

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS (SOC Dark Theme with Glassmorphism)
- **Charts & Graphs**: Recharts, Custom SVG Attack Chain Graph
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Storage**: LocalStorage with state reactivity

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
