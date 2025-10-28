# 🔋 Wezu Smart Battery System: Interactive Architecture Proposal

[![Vercel Deployment](https://vercel.com/button)](YOUR_VERCEL_URL)
[![Built with React](https://img.shields.io/badge/Built%20with-React%20%7C%20Vite-blue?style=flat&logo=react)](https://react.dev/)
[![Styled with Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-06B6D4?style=flat&logo=tailwindcss)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🌟 Executive Summary: Cost Optimization and Scalability

This project is an **interactive visualization and planning tool** for the next generation of the Wezu Smart Battery System architecture. The central goal is to transition from a high-cost, vendor-locked (Azure-heavy) model to a **Cloud-Agnostic, cost-optimized** platform built on Kubernetes and Polyglot Persistence.

The proposal demonstrates a **60% reduction in cloud infrastructure costs** by leveraging specialized open-source solutions like TimescaleDB, Neo4j, and Kafka for IoT data handling.

## ✨ Key Features of the Interactive App

The front-end application provides a navigable roadmap across several key areas:

### 💰 Cost Comparison & Savings
* **Visual Data:** Bar charts illustrating cost differences between the current and proposed architectures across MVP, Growth, and Scale phases.
* **Total Savings:** Projected savings of over **$157,000** in the first two years by optimizing data services.

### 🗺️ Agile Development Roadmap (8 Weeks)
Detailed 2-week sprints across four parallel tracks:
1.  **Agile Feature Roadmap:** Integrated Customer App and Admin Portal feature development.
2.  **Technical Roadmap:** Backend services, Kubernetes infrastructure, and database integration.
3.  **UI/UX Roadmap:** Design and user experience delivery.
4.  **AI/ML Roadmap:** Predictive Maintenance and Fraud Detection model deployment.

### ⚙️ Architectural Decisions
* **Clean Architecture:** Principles are applied to ensure maximum testability, maintainability, and independence from cloud vendors.
* **Polyglot Persistence:** Utilizing the "right tool for the right job":
    * `TimescaleDB`: Optimized for high-volume battery telemetry (time-series).
    * `Neo4j`: Used for complex relationships (Battery → Customer → Station) and fraud detection.
    * `PostgreSQL`: Used for secure, transactional data (Rentals, User Accounts).
* **Cloud Agnostic:** Leveraging Kubernetes, Kafka, and Open-Source tools to guarantee portability across AWS, Azure, or GCP.

## 💻 Tech Stack

| Category | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | [React](https://react.dev/) / [Vite](https://vitejs.dev/) | High-performance component-based UI. |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) | Responsive, utility-first design (Full mobile/desktop compatibility). |
| **Visualization** | Modern JSX/CSS | Interactive tabs, charts, and clean theme switching. |
| **Deployment** | [Vercel](https://vercel.com/) | Continuous deployment (CI/CD) setup. |

## �� Local Setup Instructions

To run this application on your local machine:

1.  **Clone the Repository:**
    ```bash
    git clone [https://github.com/](https://github.com/)<YOUR_USERNAME>/wezu-comparison-app.git
    cd wezu-comparison-app
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Start Development Server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5173/`.

## 🌐 Live View

The latest version of the architecture proposal is live:

[**View the Live Interactive Proposal Here**](YOUR_VERCEL_URL)

*(Remember to replace `YOUR_VERCEL_URL` and GitHub repo details after deployment.)*
