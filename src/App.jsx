import React, { useState, useMemo } from 'react';
import {
  ArrowRight, DollarSign, Database, Shield, Zap, Cloud, Check, X, Info, Layers,
  Workflow as WorkflowIcon, Code, Terminal, Server, MessageSquare, HardDrive,
  Cpu, ShoppingCart, TrendingUp, Home, Calendar, Clock, Lock, Truck, Repeat,
  Feather, Layout, Palette, Brain, Target, Aperture, Power, GitBranch, Sun, Moon
} from 'lucide-react';

// --- DATA DEFINITION (CORE COMPONENTS & WORKFLOWS) ---

const componentComparison = {
  messaging: {
    name: "Messaging & IoT Ingestion",
    client: {
      tech: "Azure Event Grid + MQTT Broker",
      cost: "$200-500/month",
      pros: ["Azure native", "Integrated"],
      cons: ["Vendor lock-in", "Higher cost", "Complex pricing"]
    },
    proposed: {
      tech: "HiveMQ/RabbitMQ + Kafka/Redis",
      cost: "$50-150/month",
      pros: ["Open source", "Multi-cloud", "Predictable cost", "Battle-tested"],
      cons: ["Self-managed (but containerized)"]
    }
  },
  timeseries: {
    name: "Time-Series Database",
    client: {
      tech: "Azure Data Explorer",
      cost: "$400-1000/month",
      pros: ["Managed service", "Fast queries"],
      cons: ["Expensive", "Azure only", "Over-engineered for IoT"]
    },
    proposed: {
      tech: "TimescaleDB (PostgreSQL)",
      cost: "$100-250/month",
      pros: ["SQL compatible", "Cost-effective", "Easy maintenance", "Perfect for IoT telemetry"],
      cons: ["Requires basic DB knowledge"]
    }
  },
  graph: {
    name: "Graph Database",
    client: {
      tech: "Azure Cosmos DB (Graph API)",
      cost: "$400-1000/month",
      pros: ["Fully managed", "Global distribution"],
      cons: ["Very expensive", "Gremlin query language learning curve", "Overkill for use case"]
    },
    proposed: {
      tech: "Neo4j Community/Aura",
      cost: "$150-400/month",
      pros: ["Industry standard for graphs", "Cypher query language (easy)", "Perfect for relationships", "Better ML integration"],
      cons: ["Separate service"]
    }
  },
  storage: {
    name: "Blob/Object Storage",
    client: {
      tech: "Azure Blob Storage",
      cost: "$50-150/month",
      pros: ["Integrated", "Reliable"],
      cons: ["Azure locked"]
    },
    proposed: {
      tech: "S3 (AWS) / R2 (Cloudflare)",
      cost: "$20-60/month",
      pros: ["Cheaper", "Multi-cloud", "Better egress pricing"],
      cons: ["Additional service"]
    }
  },
  compute: {
    name: "Backend Compute",
    client: {
      tech: "Azure Kubernetes Service (AKS)",
      cost: "$300-800/month",
      pros: ["Managed K8s", "Auto-scaling"],
      cons: ["Azure only", "Higher cost"]
    },
    proposed: {
      tech: "EKS/GKE/AKS (Multi-cloud ready)",
      cost: "$200-500/month",
      pros: ["Cloud agnostic", "Better pricing options", "Flexibility"],
      cons: ["Requires DevOps setup"]
    }
  },
  monitoring: {
    name: "Monitoring & Observability",
    client: {
      tech: "Azure Monitor + Log Analytics",
      cost: "$200-500/month",
      pros: ["Integrated"],
      cons: ["Expensive", "Azure only"]
    },
    proposed: {
      tech: "Prometheus + Grafana + ELK Stack",
      cost: "$100-200/month",
      pros: ["Open source", "Industry standard", "Customizable", "Cost-effective"],
      cons: ["Initial setup time"]
    }
  }
};

const databaseExplanation = {
  postgresql: {
    name: "PostgreSQL (Relational)",
    useCase: "User accounts, transactions, invoices, rental contracts, payment records, Master Inventory",
    why: "Perfect for structured data that needs ACID compliance (financial data, user management, and master inventory lists)",
    cost: "$50-100/month (managed: AWS RDS/DigitalOcean)"
  },
  timescaledb: {
    name: "TimescaleDB (Time-Series)",
    useCase: "Battery telemetry: voltage, temperature, SOC, current, charging cycles over time",
    why: "Optimized for high-volume, time-stamped IoT data with automatic data retention policies and fast aggregations",
    cost: "$100-250/month (self-hosted on Kubernetes or managed cloud)"
  },
  neo4j: {
    name: "Neo4j (Graph)",
    useCase: "Relationships: Customer→Battery→Vehicle→Charger→Dealer/Station, Fraud detection, Availability mapping",
    why: "Excels at complex relationship queries like 'find all batteries at Dealer X that are available for rent'",
    cost: "$150-400/month (Aura managed or self-hosted)"
  },
  redis: {
    name: "Redis (Cache & Queue)",
    useCase: "Session management, real-time device state (SOC, Location), job queues, rate limiting",
    why: "In-memory speed for frequently accessed data and message queuing for high-speed device state updates",
    cost: "$30-80/month (managed: AWS ElastiCache/Upstash)"
  }
};

const costBreakdown = {
  client: {
    mvp: { messaging: 350, timeseries: 700, graph: 700, storage: 100, compute: 550, monitoring: 350, security: 150, total: 2900 },
    growth: { messaging: 800, timeseries: 1500, graph: 1500, storage: 300, compute: 1200, monitoring: 600, security: 300, total: 6200 },
    scale: { messaging: 2000, timeseries: 4000, graph: 3500, storage: 800, compute: 3000, monitoring: 1200, security: 500, total: 15000 }
  },
  proposed: {
    mvp: { messaging: 100, timeseries: 175, graph: 275, storage: 40, compute: 350, monitoring: 150, security: 100, total: 1190 },
    growth: { messaging: 250, timeseries: 400, graph: 500, storage: 120, compute: 800, monitoring: 300, security: 200, total: 2570 },
    scale: { messaging: 600, timeseries: 1000, graph: 1200, storage: 350, compute: 2000, monitoring: 600, security: 350, total: 6100 }
  }
};

const architectureTypes = [
  {
    title: "Clean Architecture",
    description: "Our proposed architecture follows Clean Architecture principles",
    layers: [
      { name: "IoT Devices Layer", desc: "Smart batteries, chargers, vehicles with sensors" },
      { name: "API Gateway & Load Balancer", desc: "Single entry point, handles authentication, rate limiting" },
      { name: "Backend Services (FastAPI)", desc: "Business logic: rentals, payments, device control - independent microservices" },
      { name: "Data Layer", desc: "Right database for right job: PostgreSQL (transactions), TimescaleDB (telemetry), Neo4j (relationships)" },
      { name: "External Services", desc: "Payment gateways, SMS, Email - easily swappable" }
    ],
    benefits: [
      "Independent layers - change database without touching business logic",
      "Testable - mock external services easily",
      "Cloud agnostic - move from AWS to Azure without rewriting",
      "Scalable - scale each service independently"
    ]
  }
];

const customerFeatureRoadmap = [
  {
    sprint: 1,
    title: "User Onboarding & Profile Foundation",
    duration: "2 Weeks",
    theme: "Acquisition & Account Setup",
    icon: "👤",
    deliverables: [
      { icon: "📝", desc: "Working <strong>User Registration and Login</strong> flow (API & UI)." },
      { icon: "⚙️", desc: "Profile Management (view/edit personal details, change password)." },
      { icon: "🔒", desc: "Setup of <strong>PostgreSQL</strong> user schema and initial security policies." },
      { icon: "📜", desc: "Terms & Conditions and Privacy Policy screens implemented." }
    ],
  },
  {
    sprint: 2,
    title: "Map & Search MVP",
    duration: "2 Weeks",
    theme: "Core Utility & Availability",
    icon: "🗺️",
    deliverables: [
      { icon: "📍", desc: "Real-time <strong>Map View</strong> showing all available swap stations/dealers." },
      { icon: "🔍", desc: "Search and filter functionality (e.g., nearest station, battery type)." },
      { icon: "⚡", desc: "<strong>Redis Cache</strong> integration for near real-time battery availability status." },
      { icon: "🧭", desc: "<strong>Neo4j</strong> integration for efficient proximity queries (find nearest X)." }
    ],
  },
  {
    sprint: 3,
    title: "Rental Transaction Core",
    duration: "2 Weeks",
    theme: "Monetization & Core Business Logic",
    icon: "💳",
    deliverables: [
      { icon: "🤝", desc: "UI and API for <strong>Initiating a Rental Contract</strong> and viewing pricing." },
      { icon: "💸", desc: "Basic <strong>Payment Gateway</strong> integration (Stripe/Razorpay) for initial charges." },
      { icon: "💾", desc: "Rental Microservice fully functional with <strong>PostgreSQL</strong> contract recording." },
      { icon: "🔑", desc: "Ability to remotely <strong>unlock/lock</strong> a reserved battery (via IoT Microservice)." }
    ],
  },
  {
    sprint: 4,
    title: "Post-Transaction & Support",
    duration: "2 Weeks",
    theme: "Retention & Customer Care",
    icon: "💚",
    deliverables: [
      { icon: "📈", desc: "Customer dashboard to view <strong>Active Contract</strong> and rental history." },
      { icon: "🔋", desc: "Live status view of the rented battery (<strong>SOC, health, time remaining</strong>)." },
      { icon: "💬", desc: "In-app support/FAQ section integration (e.g., Zendesk widget)." },
      { icon: "🌟", desc: "Initial production deployment and feature polish based on user testing." }
    ],
  },
];

const adminFeatureRoadmap = [
  {
    sprint: 1,
    title: "Master Data & Role Foundation",
    duration: "2 Weeks",
    theme: "Setup & Access Control",
    icon: "🏛️",
    deliverables: [
      { icon: "🔑", desc: "Admin Portal UI and API for <strong>User Role and Permissions</strong> management." },
      { icon: "🏢", desc: "Management UI for <strong>Dealer/Station registration</strong> and location details." },
      { icon: "📦", desc: "Full <strong>Master Inventory List</strong> management UI (add, edit, view batteries/devices)." },
      { icon: "☁️", desc: "Secure VPN access and cluster access for the Admin/DevOps team." }
    ],
  },
  {
    sprint: 2,
    title: "Real-Time Fleet & Status Monitoring",
    duration: "2 Weeks",
    theme: "Operational Awareness",
    icon: "📡",
    deliverables: [
      { icon: "📍", desc: "Real-time <strong>Fleet Location Dashboard</strong> (map-based view of all devices)." },
      { icon: "📊", desc: "Dashboard showing fleet <strong>SOC distribution</strong> and overall health summaries." },
      { icon: "⚠️", desc: "Real-time <strong>Device Health Indicators</strong> (Red/Yellow/Green status based on TimescaleDB)." },
      { icon: "👀", desc: "Ability to drill down into a single battery's <strong>live telemetry data</strong>." }
    ],
  },
  {
    sprint: 3,
    title: "Device Management & Logistics",
    duration: "2 Weeks",
    theme: "Actionable Control",
    icon: "🚚",
    deliverables: [
      { icon: "🔓", desc: "Admin UI for <strong>Remote Control Commands</strong> (Force Lock, Power Cycle, Update Firmware)." },
      { icon: "📝", desc: "UI for <strong>Manual Inventory Check-in/Out</strong> at stations (for staff use)." },
      { icon: "🔨", desc: "Logistics UI for Assigning Maintenance Tickets and tracking completion status." },
      { icon: "🔄", desc: "Ability to manually update battery metadata (e.g., assigning to a new dealer)." }
    ],
  },
  {
    sprint: 4,
    title: "Alerts, Reports & Audit",
    duration: "2 Weeks",
    theme: "Intelligence & Audit",
    icon: "🔎",
    deliverables: [
      { icon: "🚨", desc: "Alerting Queue UI showing flags from the <strong>AI/ML Service</strong> (e.g., high failure risk)." },
      { icon: "📈", desc: "MVP Reports: Total Rentals by Month, Top 10 Busiest Stations, Daily Revenue." },
      { icon: "🛡️", desc: "<strong>Audit Log</strong> viewer for tracking critical actions taken by Admin users." },
      { icon: "✅", desc: "Final system-wide performance and security audit before launch." }
    ],
  },
];

// --- ROADMAP COMBINATION (Correct, single declaration) ---
const combinedAgileRoadmap = customerFeatureRoadmap.map((customerSprint, index) => ({
  customer: customerSprint,
  admin: adminFeatureRoadmap[index],
}));

const technicalRoadmap = [
  {
    sprint: 1,
    title: "Core Infrastructure & Telemetry Foundation",
    duration: "2 Weeks",
    theme: "Infrastructure & Data Ingestion",
    icon: "🏠",
    deliverables: [
      { icon: "☁️", desc: "Core <strong>K8s Cluster Setup</strong> and CI/CD pipelines." },
      { icon: "🔒", desc: "User Microservice (Registration/Login) and <strong>PostgreSQL</strong> schema." },
      { icon: "🔋", desc: "IoT Ingestion Pipeline (<strong>MQTT to Kafka</strong>) for basic telemetry." },
      { icon: "🧭", desc: "Basic <strong>Monitoring Stack</strong> (Prometheus/Grafana) deployed." }
    ],
  },
  {
    sprint: 2,
    title: "Transactional Core & Real-Time Tracking",
    duration: "2 Weeks",
    theme: "Business Logic & Device State",
    icon: "💰",
    deliverables: [
      { icon: "🗺️", desc: "<strong>Neo4j Graph</strong> integration for station/dealer location and initial relationships." },
      { icon: "⚡", desc: "Real-time state tracking using <strong>Redis</strong> (SOC/Location updates)." },
      { icon: "🔄", desc: "Rental Microservice MVP (Contract creation and management)." },
      { icon: "💾", desc: "<strong>TimescaleDB</strong> setup and initial data logging from Kafka." }
    ],
  },
  {
    sprint: 3,
    title: "Device Control & Operations Enablement",
    duration: "2 Weeks",
    theme: "Fleet Management & Control",
    icon: "🛠️",
    deliverables: [
      { icon: "📦", desc: "Inventory Microservice (Check-in/Check-out) and Master Data integration." },
      { icon: "🔌", desc: "<strong>Device Control Commands</strong> (unlock/lock) implemented via IoT Gateway." },
      { icon: "🚚", desc: "Logistics Microservice MVP for transport and maintenance assignments." },
      { icon: "🛡️", desc: "Full <strong>API Gateway</strong> security hardening and rate limiting." }
    ],
  },
  {
    sprint: 4,
    title: "Analytics Integration & Production Readiness",
    duration: "2 Weeks",
    theme: "Intelligence & Scaling",
    icon: "🧠",
    deliverables: [
      { icon: "📈", desc: "Integration point for <strong>AI/ML Service</strong> to consume TimescaleDB data." },
      { icon: "💸", desc: "Data pipeline for detailed commission/payout reporting." },
      { icon: "🚨", desc: "Full alerting and anomaly detection setup." },
      { icon: "✅", desc: "Final load testing, documentation, and production cutover." }
    ],
  },
];

const uiUxRoadmap = [
  {
    sprint: 1,
    title: "Style Guide & Core Customer Flow UI",
    duration: "2 Weeks",
    theme: "Foundational Design",
    icon: "🎨",
    deliverables: [
      { icon: "🖋️", desc: "Brand Style Guide, Typography, and Color Palette finalized." },
      { icon: "📱", desc: "Customer App (iOS/Android) <strong>Wireframes</strong> for login and map view." },
      { icon: "🔒", desc: "Final UI/UX for <strong>User Registration/Login</strong> flow." },
      { icon: "🖥️", desc: "Admin Portal dashboard <strong>information architecture</strong> design." }
    ],
  },
  {
    sprint: 2,
    title: "Customer Map & Rental Experience",
    duration: "2 Weeks",
    theme: "Core User Journey",
    icon: "🗺️",
    deliverables: [
      { icon: "📍", desc: "Interactive Map View UI/UX (Battery & Station display)." },
      { icon: "💳", desc: "Rental/Purchase flow screens and <strong>Payment Gateway</strong> integration screens." },
      { icon: "🔄", desc: "<strong>Battery Swap</strong> reservation flow design." },
      { icon: "⚙️", desc: "Settings and Profile management screens." }
    ],
  },
  {
    sprint: 3,
    title: "Dealer & Admin Portals MVP",
    duration: "2 Weeks",
    theme: "Operational Tools Design",
    icon: "🏡",
    deliverables: [
      { icon: "📦", desc: "Dealer Portal UI for <strong>Inventory Management</strong> (Check-in/Check-out)." },
      { icon: "📊", desc: "Admin Portal UI for <strong>Real-Time Fleet Status</strong> and tracking." },
      { icon: "✍️", desc: "Dealer registration and onboarding flow UI/UX." },
      { icon: "📞", desc: "Maintenance/Support Ticket submission form design." }
    ],
  },
  {
    sprint: 4,
    title: "Reporting, Refinement & Final Handoff",
    duration: "2 Weeks",
    theme: "Polish & Production Readiness",
    icon: "✨",
    deliverables: [
      { icon: "📈", desc: "UI for <strong>Dealer Commission</strong> and performance reports." },
      { icon: "🔔", desc: "Design and implementation of notification/alert system UI." },
      { icon: "🖼️", desc: "Accessibility check and UI responsiveness refinement across devices." },
      { icon: "📖", desc: "Final design system documentation and UI Handoff." }
    ],
  },
];

const aiMlRoadmap = [
  {
    sprint: 1,
    title: "Data Access & Baseline Model Setup",
    duration: "2 Weeks",
    theme: "Data Foundation for Intelligence",
    icon: "💾",
    deliverables: [
      { icon: "🔗", desc: "Secure connection and authorization to <strong>TimescaleDB</strong> (telemetry)." },
      { icon: "💧", desc: "Initial <strong>Data Cleaning and Feature Engineering</strong> pipeline established." },
      { icon: "🧪", desc: "Selection of <strong>Anomaly Detection Algorithm</strong> (e.g., Isolation Forest)." },
      { icon: "📈", desc: "Baseline model deployed on cloud compute (e.g., Sagemaker/Vertex AI)." }
    ],
  },
  {
    sprint: 2,
    title: "Predictive Maintenance MVP",
    duration: "2 Weeks",
    theme: "Initial Predictive Capability",
    icon: "🔧",
    deliverables: [
      { icon: "⚙️", desc: "Model trained to predict <strong>Component Failure</strong> (e.g., voltage irregularity)." },
      { icon: "🚨", desc: "Output pipeline to send model predictions to <strong>Kafka Stream</strong>." },
      { icon: "🔔", desc: "Basic <strong>Alert Generation</strong> logic based on prediction thresholds." },
      { icon: "📊", desc: "Dashboard MVP for visualizing model performance and input data drift." }
    ],
  },
  {
    sprint: 3,
    title: "Security and Commercial Intelligence",
    duration: "2 Weeks",
    theme: "Security and Commercial Intelligence",
    icon: "🛡️",
    deliverables: [
      { icon: "🔗", desc: "Integration with <strong>Neo4j</strong> (relationships) for complex features." },
      { icon: "💰", desc: "Model trained to detect <strong>Rental/Swap Fraud</strong> patterns." },
      { icon: "⚖️", desc: "<strong>Risk Scoring</strong> API developed for real-time transaction checks." },
      { icon: "📈", desc: "Deployment of fraud model in a <strong>Shadow Mode</strong> for testing." }
    ],
  },
  {
    sprint: 4,
    title: "Model Ops & Production Deployment",
    duration: "2 Weeks",
    theme: "Operationalizing Intelligence (MLOps)",
    icon: "🚀",
    deliverables: [
      { icon: "✅", desc: "Deployment of <strong>Predictive and Fraud models</strong> into production environment." },
      { icon: "🔄", desc: "Automated <strong>Model Retraining Pipeline</strong> setup (MLOps)." },
      { icon: "📝", desc: "Detailed documentation for model features and API endpoints." },
      { icon: "✨", desc: "Integration of model outputs into <strong>Admin Portal</strong> Investigation Queue." }
    ],
  },
];

const uiUxRoadmapColor = 'teal'; // Set universal light theme accent color
const technicalRoadmapColor = 'sky';
const aiMlRoadmapColor = 'purple';


// --- UI HELPERS ---

const tabLabels = {
  overview: 'Quick Summary',
  diagram: 'Architecture Diagram',
  components: 'Component Comparison',
  databases: 'Database Strategy',
  architecture: 'Clean Architecture',
  cost: 'Cost Breakdown',
  technical_roadmap: 'Technical (8 Wks)',
  ui_ux_roadmap: 'UI/UX (8 Wks)',
  ai_ml_roadmap: 'AI/ML (8 Wks)',
  agile_feature_roadmap: 'Agile Feature Roadmap (CUST & ADMIN)',
};

const tabOrder = [
  'overview',
  'diagram',
  'components',
  'databases',
  'architecture',
  'cost',
  'agile_feature_roadmap',
  'technical_roadmap',
  'ui_ux_roadmap',
  'ai_ml_roadmap',
];

// --- THEME & STYLING LOGIC ---

// Define the core classes for Light and Dark modes
const getThemeStyles = (isDark) => ({
  // General
  // UPDATED BG: Subtly off-white, clean, professional blue/grey gradient
  bgPrimary: isDark ? 'bg-gradient-to-br from-gray-900 to-slate-950' : 'bg-gradient-to-br from-slate-50 to-cyan-100', // <-- UPDATED
  bgContainer: isDark ? 'bg-gray-800' : 'bg-white',
  textPrimary: isDark ? 'text-white' : 'text-gray-900',
  // UPDATED: Light Mode Accent changed from Pink to Teal/Cyan for "Universal" feel
  textSecondary: isDark ? 'text-pink-300' : 'text-teal-700', // <-- UPDATED
  textBody: isDark ? 'text-gray-300' : 'text-gray-700',
  // UPDATED: Light Mode Border changed to match the new accent
  borderSecondary: isDark ? 'border-gray-700' : 'border-teal-200', // <-- UPDATED

  // NEW: Glassmorphism / Frosted Glass effect
  // UPDATED: Light Mode Border changed to match the new accent
  bgGlass: isDark ? 'bg-gray-900/80 backdrop-blur-xl border-gray-700/50' : 'bg-white/70 backdrop-blur-xl border-teal-200/50', // <-- UPDATED

  // Accents (Pink/Teal)
  // UPDATED: Light Mode accent changed to Teal
  accentColor: isDark ? 'text-pink-400' : 'text-teal-600', // <-- UPDATED
  accentBg: isDark ? 'bg-pink-600 hover:bg-pink-700' : 'bg-teal-500 hover:bg-teal-600', // <-- UPDATED
  accentBorder: isDark ? 'border-pink-700' : 'border-teal-500', // <-- UPDATED

  // Tab Specific
  // UPDATED: Tab colors changed to match the new accent
  tabActive: isDark ? 'bg-pink-500 text-white shadow-lg shadow-pink-400/50' : 'bg-teal-600 text-white shadow-lg shadow-teal-400/50', // <-- UPDATED
  tabInactive: isDark ? 'bg-gray-700 text-gray-200 hover:bg-pink-700 hover:text-white' : 'bg-gray-100 text-gray-700 hover:bg-teal-50 hover:text-teal-700', // <-- UPDATED

  // Cost/Comparison Colors
  goodText: isDark ? 'text-teal-400' : 'text-teal-700',
  goodBg: isDark ? 'bg-teal-900 border-teal-700' : 'bg-teal-50 border-teal-300',
  badText: isDark ? 'text-rose-400' : 'text-rose-700',
  badBg: isDark ? 'bg-rose-900 border-rose-700' : 'bg-rose-50 border-rose-300',
  barFillClient: isDark ? 'bg-rose-500' : 'bg-rose-500',
  barFillProposed: isDark ? 'bg-teal-500' : 'bg-teal-500',
  savingsBanner: isDark ? 'bg-gradient-to-r from-teal-700 to-green-800 text-white border-white' : 'bg-gradient-to-r from-teal-500 to-green-600 text-white border-white',
});

// A reusable Tailwind class for advanced, floating 3D effect on hover
const FLOATING_CARD_EFFECT = "transform hover:scale-[1.03] hover:-translate-y-1 hover:shadow-2xl transition duration-500 ease-in-out";


const ContentTransitionWrapper = ({ children, activeTab }) => {
  return (
    <div
      key={activeTab}
      className="opacity-0 animate-fade-in"
      style={{ animation: 'fade-in 0.5s ease-out forwards' }}
    >
      {children}
    </div>
  );
};


const CostComparisonChart = React.memo(({ phase, clientCost, proposedCost, themeClasses, isDark }) => {
  const maxCost = Math.max(clientCost, proposedCost);
  const clientWidth = (clientCost / maxCost) * 100;
  const proposedWidth = (proposedCost / maxCost) * 100;
  const savings = ((clientCost - proposedCost) / clientCost * 100).toFixed(0);

  return (
    <div className={`mb-8 p-6 rounded-xl shadow-lg ${themeClasses.bgContainer} ${FLOATING_CARD_EFFECT}`}>
      <h3 className={`text-xl font-bold mb-4 ${themeClasses.textSecondary}`}>{phase} Phase</h3>
      <div className="space-y-6">
        <div>
          <div className="flex justify-between mb-2">
            <span className={`font-semibold ${themeClasses.badText} flex items-center gap-1`}>
              <ArrowRight size={18} className={themeClasses.badText.replace('text', '')} /> Client Architecture (Azure-heavy)
            </span>
            <span className={`font-bold ${themeClasses.badText} text-xl`}>${clientCost.toLocaleString()}/month</span>
          </div>
          <div className="bg-gray-200 rounded-full h-8 overflow-hidden">
            <div
              className={`${themeClasses.barFillClient} h-8 rounded-full flex items-center justify-end pr-4 text-white font-semibold transition-all duration-1000 ease-out`}
              style={{ width: `${clientWidth}%` }}
            >
              ${clientCost.toLocaleString()}
            </div>
          </div>
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <span className={`font-semibold ${themeClasses.goodText} flex items-center gap-1`}>
              <Check size={18} className={themeClasses.goodText.replace('text', '')} /> Proposed Architecture (Multi-cloud)
            </span>
            <span className={`font-bold ${themeClasses.goodText} text-xl`}>${proposedCost.toLocaleString()}/month</span>
          </div>
          <div className="bg-gray-200 rounded-full h-8 overflow-hidden">
            <div
              className={`${themeClasses.barFillProposed} h-8 rounded-full flex items-center justify-end pr-4 text-white font-semibold transition-all duration-1000 ease-out`}
              style={{ width: `${proposedWidth}%` }}
            >
              ${proposedCost.toLocaleString()}
            </div>
          </div>
        </div>

        <div className={`${themeClasses.savingsBanner} rounded-lg p-5 text-center shadow-lg transform hover:scale-[1.02] transition duration-300`}>
          <span className="text-3xl font-extrabold text-white flex items-center justify-center gap-3">
            <DollarSign size={32} />
            YOU SAVE {savings}% = ${(clientCost - proposedCost).toLocaleString()}/month
          </span>
        </div>
      </div>
    </div>
  );
});

const renderAgileRoadmap = (combinedRoadmap, themeClasses, isDark) => (
  <div className={`rounded-xl shadow-2xl p-8 ${themeClasses.bgContainer}`}>
    <h2 className={`text-3xl font-bold mb-6 ${themeClasses.textPrimary} flex items-center gap-2`}>
      <GitBranch size={30} className={`animate-pulse ${themeClasses.accentColor.replace('text', '')}`} />
      Agile Feature Roadmap (8-Week MVP)
    </h2>
    <p className={`text-lg mb-8 ${themeClasses.textBody}`}>
      This integrated roadmap shows parallel feature development for the core customer application and the internal administration portal across four 2-week sprints.
    </p>

    <div className="space-y-12">
      {combinedRoadmap.map((sprintGroup, index) => (
        <div key={index} className={`border-4 ${themeClasses.accentBorder} rounded-xl p-6 relative shadow-xl ${themeClasses.bgContainer} ${FLOATING_CARD_EFFECT}`}>
          <div className={`absolute -top-4 left-4 ${themeClasses.accentBg} text-white text-sm px-4 py-1 rounded-full font-bold shadow-lg transform rotate-[-1deg] hover:rotate-0 transition duration-300`}>
            {`SPRINT ${sprintGroup.customer.sprint}: 2 WEEKS`}
          </div>

          <h3 className={`text-2xl font-bold ${themeClasses.textPrimary} pt-4 mb-6 border-b-2 ${themeClasses.borderSecondary} pb-2`}>
            Sprint {sprintGroup.customer.sprint} Focus: {sprintGroup.customer.theme} & {sprintGroup.admin.theme}
          </h3>

          <div className="grid md:grid-cols-2 gap-6">

            {/* Customer Deliverables Column */}
            <div className={`rounded-lg p-5 shadow-lg border-t-4 border-teal-500 ${themeClasses.bgContainer} transform hover:shadow-xl transition duration-300`}>
              <div className="flex items-center gap-3 mb-4">
                <ShoppingCart size={24} className="text-teal-600 animate-bounce" style={{ '--animation-delay': '0s' }} />
                <h4 className={`text-xl font-bold text-teal-700 ${isDark ? 'text-teal-400' : ''}`}>Customer Focus: {sprintGroup.customer.title}</h4>
              </div>
              <ul className="space-y-3">
                {sprintGroup.customer.deliverables.map((item, i) => (
                  <li key={i} className={`flex items-start gap-2 ${themeClasses.textBody} text-base border-b border-gray-100 pb-1`}>
                    <div className="text-xl flex-shrink-0 mt-1">{item.icon}</div>
                    <span dangerouslySetInnerHTML={{ __html: item.desc }}></span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Admin Deliverables Column */}
            <div className={`rounded-lg p-5 shadow-lg border-t-4 border-rose-500 ${themeClasses.bgContainer} transform hover:shadow-xl transition duration-300`}>
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp size={24} className="text-rose-600 animate-bounce" style={{ '--animation-delay': '0.2s' }} />
                <h4 className={`text-xl font-bold text-rose-700 ${isDark ? 'text-rose-400' : ''}`}>Admin/Ops Focus: {sprintGroup.admin.title}</h4>
              </div>
              <ul className="space-y-3">
                {sprintGroup.admin.deliverables.map((item, i) => (
                  <li key={i} className={`flex items-start gap-2 ${themeClasses.textBody} text-base border-b border-gray-100 pb-1`}>
                    <div className="text-xl flex-shrink-0 mt-1">{item.icon}</div>
                    <span dangerouslySetInnerHTML={{ __html: item.desc }}></span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const renderSingleRoadmap = (roadmap, title, icon, color, themeClasses, isDark) => {
  const itemBg = isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-50';
  const itemBorder = isDark ? 'border-gray-600' : 'border-gray-100';

  return (
    <div className={`rounded-xl shadow-2xl p-8 ${themeClasses.bgContainer}`}>
      <h2 className={`text-3xl font-bold mb-6 ${themeClasses.textPrimary} flex items-center gap-2`}>
        {icon}
        {title}
      </h2>
      <p className={`text-lg mb-8 ${themeClasses.textBody}`}>
        This is an <strong>8-week MVP roadmap</strong> (four 2-week sprints) focusing on delivering core value quickly with clear, tangible results at each stage.
      </p>

      <div className="space-y-10">
        {roadmap.map((sprint, index) => (
          <div key={index} className={`border-4 border-${color}-200 rounded-xl p-6 bg-${color}-50 relative shadow-xl ${FLOATING_CARD_EFFECT} ${isDark ? 'bg-opacity-10 border-opacity-30' : ''}`}>

            <div className={`absolute -top-4 left-4 ${themeClasses.accentBg} text-white text-sm px-4 py-1 rounded-full font-bold shadow-lg transform rotate-[-1deg] hover:rotate-0 transition duration-300`}>
              {`SPRINT ${sprint.sprint}: ${sprint.duration}`}
            </div>

            <div className={`flex items-center gap-4 pt-4 mb-4 border-b-2 border-gray-200 pb-2 ${isDark ? 'border-gray-600' : ''}`}>
              <div className={`text-5xl flex-shrink-0 text-${color}-800 ${isDark ? `text-${color}-400` : ''}`}>{sprint.icon}</div>
              <div>
                <h3 className={`text-2xl font-bold text-${color}-800 ${isDark ? `text-${color}-400` : ''}`}>{sprint.title}</h3>
                <p className={`${themeClasses.accentColor} font-semibold`}>{sprint.theme}</p>
              </div>
            </div>

            <h4 className={`font-bold text-xl mb-3 ${themeClasses.textPrimary}`}>Key Deliverables:</h4>
            <div className="grid md:grid-cols-2 gap-x-6 gap-y-3">
              {sprint.deliverables.map((item, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-3 p-3 rounded-lg shadow-sm border ${itemBorder} ${itemBg} transition duration-200`}
                >
                  <div className="text-xl flex-shrink-0 mt-1">{item.icon}</div>
                  <span
                    className={`${themeClasses.textBody} text-base`}
                    dangerouslySetInnerHTML={{ __html: item.desc }}
                  ></span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


// --- MAIN COMPONENT ---

const ArchitectureComparison = () => {
  const [activeTab, setActiveTab] = useState('agile_feature_roadmap');
  const [theme, setTheme] = useState('light');
  const isDark = theme === 'dark';

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  const themeClasses = useMemo(() => getThemeStyles(isDark), [isDark]);

  return (
    <div className={`min-h-screen ${themeClasses.bgPrimary} p-4 md:p-8 ${isDark ? 'dark' : ''}`}>
      <style>
        {`
        /* Global Fade-in and Bounce/Pulse animations for a modern feel */
        @keyframes fade-in {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
            animation-duration: 0.5s;
            animation-timing-function: ease-out;
            animation-fill-mode: forwards;
        }
        @keyframes bounce {
            0%, 100% { transform: translateY(-5%); animation-timing-function: cubic-bezier(0.8, 0, 1, 1); }
            50% { transform: translateY(0); animation-timing-function: cubic-bezier(0, 0, 0.2, 1); }
        }
        .animate-bounce {
            animation: bounce 1s infinite;
        }
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: .5; }
        }
        .animate-pulse {
            animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        /* Custom 3D-like shadow for the glass container to enhance the 'floating' effect */
        .shadow-3xl {
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 20px rgba(255, 255, 255, 0.1);
        }
        .dark .shadow-3xl {
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.9), 0 0 20px rgba(255, 255, 255, 0.05);
        }
        `}
      </style>

      {/* NEW: Outer wrapper with slight padding to reveal the background gradient */}
      <div className="max-w-7xl mx-auto pt-6">

        {/* HIGHLY ADVANCED: The Glassmorphism Container */}
        <div className={`rounded-3xl shadow-3xl p-4 md:p-8 border ${themeClasses.bgGlass} transition duration-500 ease-in-out`}>

          {/* Header and Theme Toggle */}
          <div className="flex justify-between items-center mb-6 md:mb-8">
            <h1 className={`text-3xl md:text-4xl font-extrabold ${themeClasses.textPrimary} leading-tight`}>
              Wezu Smart Battery System - <span className={themeClasses.accentColor.replace('text', 'text-4xl')}>Architecture & Roadmap</span>
            </h1>
            <button
              onClick={toggleTheme}
              className={`flex items-center gap-2 p-3 rounded-full transition duration-300 transform hover:scale-110 ${isDark ? 'bg-pink-500 text-white shadow-lg' : 'bg-teal-500 text-white shadow-xl'}`}
              title="Toggle Theme"
            >
              {isDark ? <Sun size={24} /> : <Moon size={24} />}
              <span className="hidden md:inline font-semibold">{isDark ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
          </div>


          {/* Tab Navigation (Styled to look part of the glass frame) */}
          <div className={`flex gap-2 mb-8 overflow-x-auto ${themeClasses.bgContainer} rounded-xl p-2 shadow-xl ${themeClasses.borderSecondary} border sticky top-0 z-20 transition duration-500`}>
            {tabOrder.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 md:px-6 md:py-3 rounded-xl font-semibold text-sm md:text-base transition-all duration-300 whitespace-nowrap flex-shrink-0 transform hover:scale-[1.05] ${activeTab === tab
                  ? themeClasses.tabActive
                  : themeClasses.tabInactive
                  }`}
              >
                {tabLabels[tab]}
              </button>
            ))}
          </div>

          {/* --- TABS --- */}
          <ContentTransitionWrapper activeTab={activeTab}>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className={`rounded-xl shadow-xl p-6 md:p-8 ${themeClasses.bgContainer}`}>
                <h2 className={`text-3xl font-bold mb-6 ${themeClasses.textPrimary}`}>Quick Summary: Strategy & Savings</h2>

                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  {/* Client Card */}
                  <div className={`border-4 border-rose-300 rounded-xl p-6 ${themeClasses.badBg.split(' ')[0]} transform ${FLOATING_CARD_EFFECT}`}>
                    <h3 className={`text-2xl font-bold mb-4 ${themeClasses.badText} flex items-center gap-2`}>
                      <X size={24} className={`animate-pulse ${themeClasses.badText.replace('text', 'text-4xl')}`} /> Client Architecture (Azure)
                    </h3>
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex items-start gap-2">
                        <X className={`${themeClasses.badText.replace('text', 'text-2xl')} mt-1 flex-shrink-0`} size={20} />
                        <span className={themeClasses.textBody}>Vendor Lock-in: Fully dependent on Azure managed services.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <X className={`${themeClasses.badText.replace('text', 'text-2xl')} mt-1 flex-shrink-0`} size={20} />
                        <span className={themeClasses.textBody}>High Costs: Premium Azure services for standard tasks.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <X className={`${themeClasses.badText.replace('text', 'text-2xl')} mt-1 flex-shrink-0`} size={20} />
                        <span className={themeClasses.textBody}>Over-engineered: CosmosDB and Data Explorer are complex for phase 1 IoT.</span>
                      </li>
                    </ul>
                    <div className={`mt-6 p-4 ${themeClasses.badBg} rounded-lg border-2 ${themeClasses.badBorder}`}>
                      <p className={`font-bold text-xl ${themeClasses.badText}`}>MVP Cost: ${costBreakdown.client.mvp.total.toLocaleString()}/month</p>
                    </div>
                  </div>

                  {/* Proposed Card */}
                  <div className={`border-4 border-teal-300 rounded-xl p-6 ${themeClasses.goodBg.split(' ')[0]} transform ${FLOATING_CARD_EFFECT}`}>
                    <h3 className={`text-2xl font-bold mb-4 ${themeClasses.goodText} flex items-center gap-2`}>
                      <Check size={24} className={`animate-pulse ${themeClasses.goodText.replace('text', 'text-4xl')}`} /> Proposed Architecture (Multi-cloud)
                    </h3>
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex items-start gap-2">
                        <Check className={`${themeClasses.goodText.replace('text', 'text-2xl')} mt-1 flex-shrink-0`} size={20} />
                        <span className={themeClasses.textBody}>Cloud Agnostic: Uses Kubernetes and open-source for portability.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className={`${themeClasses.goodText.replace('text', 'text-2xl')} mt-1 flex-shrink-0`} size={20} />
                        <span className={themeClasses.textBody}>Cost Efficiency: 60% reduction using specialized open-source DBs.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className={`${themeClasses.goodText.replace('text', 'text-2xl')} mt-1 flex-shrink-0`} size={20} />
                        <span className={themeClasses.textBody}>Polyglot Persistence: Right database for the right job (Time-Series, Graph, Relational).</span>
                      </li>
                    </ul>
                    <div className={`mt-6 p-4 ${themeClasses.goodBg} rounded-lg border-2 ${themeClasses.goodBorder}`}>
                      <p className={`font-bold text-xl ${themeClasses.goodText}`}>MVP Cost: ${costBreakdown.proposed.mvp.total.toLocaleString()}/month</p>
                    </div>
                  </div>
                </div>

                {/* Savings Banner */}
                <div className={`${themeClasses.savingsBanner} rounded-xl p-8 text-center shadow-2xl border-4 border-white transform hover:scale-[1.01] transition duration-300`}>
                  <h3 className="text-3xl font-bold mb-4">💰 Projected 2-Year Cost Reduction</h3>
                  <p className="text-6xl font-extrabold mb-2 animate-bounce-slow">$157,680</p>
                  <p className="text-xl">This savings is achieved by optimizing data services and leveraging open-source components, allowing for more investment in feature development.</p>
                </div>
              </div>
            )}

            {/* --- DIAGRAM TAB --- */}
            {activeTab === 'diagram' && (
              <div className={`rounded-xl shadow-xl p-6 md:p-8 ${themeClasses.bgContainer}`}>
                <h2 className={`text-3xl font-bold mb-6 ${themeClasses.textPrimary} flex items-center gap-2`}>
                  <Layers size={30} className={themeClasses.accentColor.replace('text', '')} />
                  Wezu Smart Battery System - High-Level Architecture
                </h2>

                {/* Key Principles Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {/* Clean Architecture Card */}
                  <div className={`p-6 rounded-xl shadow-lg border-t-4 border-teal-600 transition-all duration-300 ${FLOATING_CARD_EFFECT} ${themeClasses.bgContainer}`}>
                    <div className="flex items-center space-x-3 mb-3">
                      <Layers size={24} className="text-teal-600" />
                      <h3 className={`text-xl font-bold ${themeClasses.textPrimary}`}>Clean Architecture Principles</h3>
                    </div>
                    <p className={themeClasses.textBody}>
                      The entire system is built on **Clean Architecture** principles for maximum separation of concerns, ensuring the application is highly testable, maintainable, and independent of specific frameworks or databases.
                    </p>
                    <div className="mt-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-teal-100 ${themeClasses.accentColor}`}>
                        High Maintainability
                      </span>
                    </div>
                  </div>
                  {/* Cloud Agnostic Card */}
                  <div className={`p-6 rounded-xl shadow-lg border-t-4 border-teal-600 transition-all duration-300 ${FLOATING_CARD_EFFECT} ${themeClasses.bgContainer}`}>
                    <div className="flex items-center space-x-3 mb-3">
                      <Cloud size={24} className="text-teal-600" />
                      <h3 className={`text-xl font-bold ${themeClasses.textPrimary}`}>Cloud Agnostic (K8s)</h3>
                    </div>
                    <p className={themeClasses.textBody}>
                      We guarantee portability by using **Kubernetes (K8s)** orchestration, avoiding vendor lock-in and allowing seamless deployment across AWS, Azure, or GCP.
                    </p>
                    <div className="mt-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-teal-100 ${themeClasses.goodText}`}>
                        Vendor Lock-in Avoided
                      </span>
                    </div>
                  </div>
                </div>

                {/* --- ARCHITECTURE DIAGRAM CONTAINER (Simplified Theming) --- */}
                <div className={`flex flex-col items-center border-4 border-gray-300 rounded-xl p-4 relative shadow-inner ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50'}`}>

                  {/* 1. TOP LAYER: Client Apps & Monitoring */}
                  <div className="flex justify-between w-full mb-6 gap-2 md:gap-4">
                    <div className="flex flex-col items-center p-3 md:p-4 bg-rose-100 rounded-lg shadow-md border-rose-300 border-2 w-1/3 transform hover:scale-[1.05] transition duration-200">
                      <Code size={24} className="text-rose-600 mb-1 md:mb-2" />
                      <span className="font-bold text-sm md:text-lg text-rose-800 text-center">Client Applications</span>
                      <span className="text-xs text-gray-600 text-center hidden md:block">Customer, Admin, Dealer Portals</span>
                    </div>
                    <div className="flex flex-col items-center p-3 md:p-4 bg-yellow-100 rounded-lg shadow-md border-yellow-300 border-2 w-1/3 transform hover:scale-[1.05] transition duration-200">
                      <Terminal size={24} className="text-yellow-600 mb-1 md:mb-2" />
                      <span className="font-bold text-sm md:text-lg text-yellow-800 text-center">Monitoring & Alerting</span>
                      <span className="text-xs text-gray-600 text-center hidden md:block">Prometheus, Grafana, ELK</span>
                    </div>
                    <div className="flex flex-col items-center p-3 md:p-4 bg-teal-100 rounded-lg shadow-md border-teal-300 border-2 w-1/3 transform hover:scale-[1.05] transition duration-200">
                      <Brain size={24} className="text-teal-600 mb-1 md:mb-2" />
                      <span className="font-bold text-sm md:text-lg text-teal-800 text-center">AI/ML Services</span>
                      <span className="text-xs text-gray-600 text-center hidden md:block">Predictive Maintenance, Fraud</span>
                    </div>
                  </div>

                  {/* Connection Line: Apps/Monitoring to API Gateway (Cloud Layer) */}
                  <div className="w-full flex justify-center mb-6">
                    <div className="w-1/2 md:w-2/3 flex justify-around">
                      <ArrowRight size={24} className="text-gray-500 rotate-90 animate-bounce" style={{ '--animation-delay': '0s' }} />
                      <ArrowRight size={24} className="text-gray-500 rotate-90 animate-bounce" style={{ '--animation-delay': '0.1s' }} />
                      <ArrowRight size={24} className="text-gray-500 rotate-90 animate-bounce" style={{ '--animation-delay': '0.2s' }} />
                    </div>
                  </div>

                  {/* 2. MIDDLE LAYER: Backend and Ingestion (The Cloud Platform) */}
                  <div className={`w-full border-4 border-sky-400 rounded-xl p-4 md:p-6 relative mb-8 shadow-xl transform hover:shadow-2xl transition duration-300 ${isDark ? 'bg-sky-900 bg-opacity-30 border-sky-600' : 'bg-sky-50'}`}>
                    <span className="absolute -top-4 left-4 bg-sky-400 text-white text-xs md:text-sm px-3 py-1 rounded-full font-bold shadow-lg">
                      CLOUD PLATFORM (K8s Cluster)
                    </span>

                    <div className="flex justify-around items-start gap-2 md:gap-4">

                      {/* Ingestion Column */}
                      <div className="flex flex-col items-center w-1/4">
                        <MessageSquare size={28} className="text-teal-600 mb-1 md:mb-2" />
                        <span className={`font-bold text-xs md:text-sm ${themeClasses.textPrimary} text-center`}>Messaging & Ingestion</span>
                        <span className={`text-xs ${themeClasses.textBody} text-center`}>HiveMQ, <strong>Kafka</strong></span>
                        <ArrowRight size={18} className="text-teal-600 rotate-90 my-2" />
                        <div className="p-1 bg-teal-100 rounded-lg shadow-sm transform hover:scale-[1.1] transition duration-200">
                          <span className={`text-xs font-semibold text-teal-700 ${isDark ? 'text-teal-400' : ''}`}>Stream Processing</span>
                        </div>
                      </div>

                      {/* Microservices Column */}
                      <div className="flex flex-col items-center w-2/4 border-l-2 border-r-2 border-sky-200 px-2 md:px-4">
                        <Server size={28} className="text-purple-600 mb-1 md:mb-2" />
                        <span className={`font-bold text-sm md:text-base ${themeClasses.textPrimary}`}>Backend Microservices</span>
                        <span className={`text-xs ${themeClasses.textBody} text-center mb-2`}>Device Mgmt, Rental, Payments, Inventory</span>

                        {/* API Gateway & Load Balancer */}
                        <div className="p-1 md:p-2 bg-purple-100 rounded-lg shadow-md mb-2 w-full text-center transform hover:bg-purple-200 transition duration-200">
                          <span className={`text-xs font-semibold text-purple-700 ${isDark ? 'text-purple-400' : ''}`}>API Gateway / LB</span>
                        </div>

                        {/* Data/Service Connections */}
                        <div className="flex justify-center gap-4 w-full mt-2">
                          <ArrowRight size={18} className="text-purple-600 rotate-90" />
                          <ArrowRight size={18} className="text-purple-600 rotate-90" />
                          <ArrowRight size={18} className="text-purple-600 rotate-90" />
                        </div>
                      </div>

                      {/* Data Lake Column */}
                      <div className="flex flex-col items-center w-1/4">
                        <HardDrive size={28} className="text-teal-600 mb-1 md:mb-2" />
                        <span className={`font-bold text-xs md:text-sm ${themeClasses.textPrimary}`}>Long-term Storage</span>
                        <span className={`text-xs ${themeClasses.textBody} text-center`}>S3 / R2 (Data Lake)</span>
                        <ArrowRight size={18} className="text-teal-600 rotate-90 my-2" />
                        <div className="p-1 bg-teal-100 rounded-lg shadow-sm transform hover:scale-[1.1] transition duration-200">
                          <span className={`text-xs font-semibold text-teal-700 ${isDark ? 'text-teal-400' : ''}`}>Reporting DB</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 3. BOTTOM LAYER: Data Persistence */}
                  <div className="flex justify-center w-full mb-6">
                    <div className={`grid grid-cols-2 md:flex md:justify-around p-4 rounded-xl shadow-md border-orange-300 border-2 w-full max-w-4xl gap-4 md:gap-8 transform hover:shadow-lg transition duration-300 ${isDark ? 'bg-orange-900 bg-opacity-30 border-orange-700' : 'bg-orange-50'}`}>

                      <div className={`flex flex-col items-center p-2 rounded-lg ${isDark ? 'hover:bg-orange-700' : 'hover:bg-orange-100'} transition duration-200`}>
                        <Database size={24} className="text-orange-600 mb-1" />
                        <span className={`font-bold text-sm text-orange-800 ${isDark ? 'text-orange-300' : ''}`}>PostgreSQL</span>
                        <span className={`text-xs ${themeClasses.textBody}`}>(Transactions)</span>
                      </div>

                      <div className={`flex flex-col items-center p-2 rounded-lg ${isDark ? 'hover:bg-orange-700' : 'hover:bg-orange-100'} transition duration-200`}>
                        <Clock size={24} className="text-orange-600 mb-1" />
                        <span className={`font-bold text-sm text-orange-800 ${isDark ? 'text-orange-300' : ''}`}>TimescaleDB</span>
                        <span className={`text-xs ${themeClasses.textBody}`}>(Telemetry)</span>
                      </div>

                      <div className={`flex flex-col items-center p-2 rounded-lg ${isDark ? 'hover:bg-orange-700' : 'hover:bg-orange-100'} transition duration-200`}>
                        <Aperture size={24} className="text-orange-600 mb-1" />
                        <span className={`font-bold text-sm text-orange-800 ${isDark ? 'text-orange-300' : ''}`}>Neo4j</span>
                        <span className={`text-xs ${themeClasses.textBody}`}>(Relationships)</span>
                      </div>

                      <div className={`flex flex-col items-center p-2 rounded-lg ${isDark ? 'hover:bg-orange-700' : 'hover:bg-orange-100'} transition duration-200`}>
                        <Zap size={24} className="text-orange-600 mb-1" />
                        <span className={`font-bold text-sm text-orange-800 ${isDark ? 'text-orange-300' : ''}`}>Redis</span>
                        <span className={`text-xs ${themeClasses.textBody}`}>(Cache/State)</span>
                      </div>
                    </div>
                  </div>

                  {/* Connection Line: Ingestion to Devices */}
                  <div className="w-1/4 flex justify-center mt-4">
                    <div className="w-px h-8 bg-gray-500"></div>
                  </div>

                  {/* 4. GROUND LAYER: IoT Devices */}
                  <div className="flex justify-center w-full">
                    <div className="flex items-center p-4 bg-purple-100 rounded-lg shadow-md border-purple-300 border-2 w-2/3 md:w-1/3 animate-pulse">
                      <Cloud size={32} className="text-purple-600 mr-3" />
                      <span className="font-bold text-lg text-purple-800">IoT Devices & Chargers</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Components Tab */}
            {activeTab === 'components' && (
              <div className="space-y-6">
                <h2 className={`text-3xl font-bold mb-6 ${themeClasses.textPrimary}`}>Component-by-Component Comparison</h2>
                {Object.entries(componentComparison).map(([key, comp]) => (
                  <div key={key} className={`rounded-xl shadow-xl p-6 ${themeClasses.bgContainer} ${FLOATING_CARD_EFFECT}`}>
                    <h3 className={`text-2xl font-bold mb-4 ${themeClasses.textSecondary} border-b pb-2`}>{comp.name}</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Client Card */}
                      <div className={`border-2 border-rose-300 rounded-lg p-4 ${themeClasses.badBg.split(' ')[0]} hover:bg-rose-100 transition duration-200`}>
                        <h4 className={`font-bold text-xl mb-2 ${themeClasses.badText}`}>Client Choice</h4>
                        <p className="text-lg font-semibold mb-2">{comp.client.tech}</p>
                        <p className={`text-2xl font-bold ${themeClasses.badText} mb-3`}>{comp.client.cost}</p>
                        <div className="mb-3">
                          <p className={`font-semibold ${themeClasses.goodText} mb-1`}>Pros:</p>
                          <ul className={`list-disc list-inside space-y-1 ${themeClasses.textBody}`}>
                            {comp.client.pros.map((pro, i) => (
                              <li key={i} className="text-sm">{pro}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className={`font-semibold ${themeClasses.badText} mb-1`}>Cons:</p>
                          <ul className={`list-disc list-inside space-y-1 ${themeClasses.textBody}`}>
                            {comp.client.cons.map((con, i) => (
                              <li key={i} className="text-sm">{con}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      {/* Proposed Card */}
                      <div className={`border-2 border-teal-300 rounded-lg p-4 ${themeClasses.goodBg.split(' ')[0]} hover:bg-teal-100 transition duration-200`}>
                        <h4 className={`font-bold text-xl mb-2 ${themeClasses.goodText}`}>Proposed Alternative</h4>
                        <p className="text-lg font-semibold mb-2">{comp.proposed.tech}</p>
                        <p className={`text-2xl font-bold ${themeClasses.goodText} mb-3`}>{comp.proposed.cost}</p>
                        <div className="mb-3">
                          <p className={`font-semibold ${themeClasses.goodText} mb-1`}>Pros:</p>
                          <ul className={`list-disc list-inside space-y-1 ${themeClasses.textBody}`}>
                            {comp.proposed.pros.map((pro, i) => (
                              <li key={i} className="text-sm">{pro}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className={`font-semibold ${themeClasses.badText} mb-1`}>Cons:</p>
                          <ul className={`list-disc list-inside space-y-1 ${themeClasses.textBody}`}>
                            {comp.proposed.cons.map((con, i) => (
                              <li key={i} className="text-sm">{con}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Databases Tab */}
            {activeTab === 'databases' && (
              <div className={`rounded-xl shadow-xl p-8 ${themeClasses.bgContainer}`}>
                <h2 className={`text-3xl font-bold mb-6 ${themeClasses.textPrimary}`}>Database Strategy: Polyglot Persistence</h2>
                <p className={`text-lg mb-8 ${themeClasses.textBody}`}>
                  We leverage **specialized databases** for optimal performance and cost efficiency, ensuring we use the right tool for each data type (transactional, time-series, and relational data).
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                  {Object.entries(databaseExplanation).map(([key, db]) => (
                    <div key={key} className={`border-2 ${themeClasses.borderSecondary} rounded-lg p-6 bg-teal-50 transform ${FLOATING_CARD_EFFECT} ${isDark ? 'bg-opacity-10' : ''}`}>
                      <div className="flex items-start gap-4">
                        <Database className={themeClasses.accentColor.replace('text', '') + ' flex-shrink-0 mt-1'} size={32} />
                        <div className="flex-1">
                          <h3 className={`text-2xl font-bold mb-2 ${themeClasses.textSecondary}`}>{db.name}</h3>
                          <div className="mb-3">
                            <p className={`font-semibold ${themeClasses.textPrimary}`}>What it stores:</p>
                            <p className={`text-sm ${themeClasses.textBody}`}>{db.useCase}</p>
                          </div>
                          <div className="mb-3">
                            <p className={`font-semibold ${themeClasses.textPrimary}`}>Why this database:</p>
                            <p className={`text-sm ${themeClasses.textBody}`}>{db.why}</p>
                          </div>
                          <div className={`bg-teal-100 border border-teal-300 rounded p-3 transform hover:scale-[1.01] transition duration-200 ${isDark ? 'bg-teal-900 border-teal-700' : ''}`}>
                            <p className={`font-bold text-teal-700 ${isDark ? 'text-teal-400' : ''}`}>Cost: {db.cost}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Architecture Tab */}
            {activeTab === 'architecture' && (
              <div className={`rounded-xl shadow-xl p-8 ${themeClasses.bgContainer}`}>
                <h2 className={`text-3xl font-bold mb-6 ${themeClasses.textPrimary}`}>Clean Architecture Explained</h2>

                {architectureTypes.map((arch, idx) => (
                  <div key={idx} className="mb-8">
                    <h3 className={`text-2xl font-bold mb-4 ${themeClasses.textSecondary}`}>{arch.title}</h3>
                    <p className={`text-lg mb-6 ${themeClasses.textBody}`}>{arch.description}</p>
                    <div className="space-y-4 mb-6">
                      {arch.layers.map((layer, i) => (
                        <div key={i} className={`border-l-4 border-teal-500 pl-4 py-3 bg-teal-50 shadow-md ${isDark ? 'bg-gray-700 border-teal-700' : 'hover:bg-teal-100'} transition duration-200`}>
                          <h4 className={`font-bold text-lg ${themeClasses.textPrimary}`}>Layer {i + 1}: {layer.name}</h4>
                          <p className={themeClasses.textBody}>{layer.desc}</p>
                        </div>
                      ))}
                    </div>
                    <div className={`bg-teal-50 border-2 border-teal-300 rounded-lg p-6 shadow-lg ${isDark ? 'bg-teal-900 border-teal-700' : ''}`}>
                      <h4 className={`font-bold text-xl mb-4 ${themeClasses.goodText}`}>Key Benefits:</h4>
                      <ul className="space-y-3">
                        {arch.benefits.map((benefit, i) => (
                          <li key={i} className="flex gap-2">
                            <Check className={`${themeClasses.goodText.replace('text', '')} flex-shrink-0 mt-1`} size={20} />
                            <span className={themeClasses.textBody}>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Cost Tab */}
            {activeTab === 'cost' && (
              <div className={`rounded-xl shadow-xl p-8 ${themeClasses.bgContainer}`}>
                <h2 className={`text-3xl font-bold mb-8 ${themeClasses.textPrimary}`}>Detailed Cost Comparison</h2>

                <CostComparisonChart
                  phase="MVP (0-6 months, 100-500 devices)"
                  clientCost={costBreakdown.client.mvp.total}
                  proposedCost={costBreakdown.proposed.mvp.total}
                  themeClasses={themeClasses}
                  isDark={isDark}
                />
                <CostComparisonChart
                  phase="Growth (6-18 months, 500-5,000 devices)"
                  clientCost={costBreakdown.client.growth.total}
                  proposedCost={costBreakdown.proposed.growth.total}
                  themeClasses={themeClasses}
                  isDark={isDark}
                />
                <CostComparisonChart
                  phase="Scale (18+ months, 5,000-50,000 devices)"
                  clientCost={costBreakdown.client.scale.total}
                  proposedCost={costBreakdown.proposed.scale.total}
                  themeClasses={themeClasses}
                  isDark={isDark}
                />

                {/* Detailed breakdown table */}
                <div className="mt-8">
                  <h3 className={`text-2xl font-bold mb-4 ${themeClasses.textSecondary}`}>Component-wise Cost Breakdown (Growth Phase)</h3>
                  <div className={`overflow-x-auto border-4 ${themeClasses.borderSecondary} rounded-lg shadow-lg`}>
                    <table className="min-w-full border-collapse">
                      <thead>
                        <tr className={`${themeClasses.accentBg.split(' ')[0]} text-white sticky top-0`}>
                          <th className="border p-3 text-left">Component</th>
                          <th className="border p-3 text-right">Client (Azure)</th>
                          <th className="border p-3 text-right">Proposed</th>
                          <th className="border p-3 text-right">Savings</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.keys(costBreakdown.client.growth).filter(k => k !== 'total').map(component => (
                          <tr key={component} className={`hover:${isDark ? 'bg-gray-700' : 'bg-teal-50'} transition duration-150`}>
                            <td className={`border p-3 capitalize font-semibold ${themeClasses.textBody}`}>{component}</td>
                            <td className={`border p-3 text-right ${themeClasses.badText} font-semibold`}>
                              ${costBreakdown.client.growth[component]}
                            </td>
                            <td className={`border p-3 text-right ${themeClasses.goodText} font-semibold`}>
                              ${costBreakdown.proposed.growth[component]}
                            </td>
                            <td className={`border p-3 text-right font-bold ${themeClasses.goodText}`}>
                              ${costBreakdown.client.growth[component] - costBreakdown.proposed.growth[component]}
                            </td>
                          </tr>
                        ))}
                        <tr className={`font-extrabold text-lg border-t-4 ${themeClasses.accentBorder} ${isDark ? 'bg-gray-700' : 'bg-teal-100'}`}>
                          <td className={`border p-3 ${themeClasses.textPrimary}`}>TOTAL</td>
                          <td className={`border p-3 text-right ${themeClasses.badText}`}>
                            ${costBreakdown.client.growth.total}
                          </td>
                          <td className={`border p-3 text-right ${themeClasses.goodText}`}>
                            ${costBreakdown.proposed.growth.total}
                          </td>
                          <td className={`border p-3 text-right ${themeClasses.goodText} text-xl`}>
                            ${costBreakdown.client.growth.total - costBreakdown.proposed.growth.total}/mo
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* --- ROADMAP TABS --- */}

            {/* Combined Agile Feature Roadmap Tab */}
            {activeTab === 'agile_feature_roadmap' && renderAgileRoadmap(combinedAgileRoadmap, themeClasses, isDark)}

            {/* Technical Roadmap Tab */}
            {activeTab === 'technical_roadmap' && renderSingleRoadmap(
              technicalRoadmap,
              "Technical Roadmap: Backend & Infrastructure (8 Weeks)",
              <Server size={30} className={`text-${technicalRoadmapColor}-600`} />,
              technicalRoadmapColor,
              themeClasses,
              isDark
            )}

            {/* UI/UX Roadmap Tab */}
            {activeTab === 'ui_ux_roadmap' && renderSingleRoadmap(
              uiUxRoadmap,
              "UI/UX Roadmap: Design & User Experience (8 Weeks)",
              <Palette size={30} className={`text-${uiUxRoadmapColor}-600`} />,
              uiUxRoadmapColor, // <-- Now uses the universal Teal accent
              themeClasses,
              isDark
            )}

            {/* AI/ML Roadmap Tab */}
            {activeTab === 'ai_ml_roadmap' && renderSingleRoadmap(
              aiMlRoadmap,
              "AI/ML Roadmap: Intelligence & Analytics (8 Weeks)",
              <Brain size={30} className={`text-${aiMlRoadmapColor}-600`} />,
              aiMlRoadmapColor,
              themeClasses,
              isDark
            )}
          </ContentTransitionWrapper>
        </div>
      </div>
    </div>
  );
};

export default ArchitectureComparison;