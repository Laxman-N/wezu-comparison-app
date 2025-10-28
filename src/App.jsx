import React, { useState } from 'react';
import {
  ArrowRight, DollarSign, Database, Shield, Zap, Cloud, Check, X, Info, Layers,
  Workflow as WorkflowIcon, Code, Terminal, Server, MessageSquare, HardDrive,
  Cpu, ShoppingCart, TrendingUp, Home, Calendar, Clock, Lock, Truck, Repeat,
  Feather, Layout, Palette, Brain, Target, Aperture, Power, GitBranch
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

// --- FEATURE ROADMAP DATA (Updated with <strong> tags) ---

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

// Combine the two roadmaps into a single array for easier iteration
const combinedAgileRoadmap = customerFeatureRoadmap.map((customerSprint, index) => ({
  customer: customerSprint,
  admin: adminFeatureRoadmap[index],
}));

// Technical Roadmap Data (Updated with <strong> tags)
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

// UI/UX Roadmap Data (Updated with <strong> tags)
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

// AI/ML Roadmap Data (Updated with <strong> tags)
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


// --- UI HELPERS ---

// Renaming workflow labels to be more persona/Agile focused
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
  agile_feature_roadmap: 'Agile Feature Roadmap (CUST & ADMIN)', // Combined
};

// Updated tab order
const tabOrder = [
  'overview',
  'diagram',
  'components',
  'databases',
  'architecture',
  'cost',
  'agile_feature_roadmap', // Single combined tab
  'technical_roadmap',
  'ui_ux_roadmap',
  'ai_ml_roadmap',
];


const CostComparisonChart = ({ phase, clientCost, proposedCost }) => {
  const maxCost = Math.max(clientCost, proposedCost);
  const clientWidth = (clientCost / maxCost) * 100;
  const proposedWidth = (proposedCost / maxCost) * 100;
  const savings = ((clientCost - proposedCost) / clientCost * 100).toFixed(0);

  return (
    <div className="mb-8">
      <h3 className="text-xl font-bold mb-4">{phase} Phase</h3>
      <div className="space-y-4">
        <div>
          <div className="flex justify-between mb-2">
            <span className="font-semibold text-red-600">Client Architecture (Azure-heavy)</span>
            <span className="font-bold text-red-600">${clientCost.toLocaleString()}/month</span>
          </div>
          <div className="bg-gray-200 rounded-full h-8">
            <div
              className="bg-red-500 h-8 rounded-full flex items-center justify-end pr-4 text-white font-semibold"
              style={{ width: `${clientWidth}%` }}
            >
              ${clientCost.toLocaleString()}
            </div>
          </div>
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <span className="font-semibold text-green-600">Proposed Architecture (Multi-cloud)</span>
            <span className="font-bold text-green-600">${proposedCost.toLocaleString()}/month</span>
          </div>
          <div className="bg-gray-200 rounded-full h-8">
            <div
              className="bg-green-500 h-8 rounded-full flex items-center justify-end pr-4 text-white font-semibold"
              style={{ width: `${proposedWidth}%` }}
            >
              ${proposedCost.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4 text-center">
          <span className="text-2xl font-bold text-green-700">
            💰 Save {savings}% = ${(clientCost - proposedCost).toLocaleString()}/month
          </span>
        </div>
      </div>
    </div>
  );
};

// Simplified rendering logic to remove .replace()
const renderAgileRoadmap = (combinedRoadmap) => (
  <div className="bg-white rounded-xl shadow-xl p-6 md:p-8">
    <h2 className="text-2xl md:text-3xl font-bold mb-6 text-indigo-900 flex items-center gap-2">
      <GitBranch size={30} />
      Agile Feature Roadmap (8-Week MVP)
    </h2>
    <p className="text-base md:text-lg mb-8 text-gray-700">
      This integrated roadmap shows parallel feature development for the core customer application and the internal administration portal across four 2-week sprints.
    </p>

    <div className="space-y-12">
      {combinedRoadmap.map((sprintGroup, index) => (
        <div key={index} className="border-4 border-indigo-500 rounded-xl p-4 md:p-6 bg-indigo-50 relative">
          <div className="absolute -top-4 left-4 bg-indigo-700 text-white text-xs md:text-sm px-3 md:px-4 py-1 rounded-full font-bold shadow-lg">
            {`SPRINT ${sprintGroup.customer.sprint}: 2 WEEKS`}
          </div>

          <h3 className="text-xl md:text-2xl font-bold text-indigo-900 pt-4 mb-4 md:mb-6">
            Sprint {sprintGroup.customer.sprint} Focus: {sprintGroup.customer.theme} & {sprintGroup.admin.theme}
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Customer Deliverables Column */}
            <div className="bg-white rounded-lg p-4 shadow-lg border-t-4 border-green-500">
              <div className="flex items-center gap-3 mb-4">
                <ShoppingCart size={24} className="text-green-600" />
                <h4 className="text-lg md:text-xl font-bold text-green-700">Customer Focus: {sprintGroup.customer.title}</h4>
              </div>
              <ul className="space-y-3">
                {sprintGroup.customer.deliverables.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-gray-700 text-sm md:text-base">
                    <div className="text-xl flex-shrink-0 mt-1">{item.icon}</div>
                    <span dangerouslySetInnerHTML={{ __html: item.desc }}></span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Admin Deliverables Column */}
            <div className="bg-white rounded-lg p-4 shadow-lg border-t-4 border-red-500">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp size={24} className="text-red-600" />
                <h4 className="text-lg md:text-xl font-bold text-red-700">Admin/Ops Focus: {sprintGroup.admin.title}</h4>
              </div>
              <ul className="space-y-3">
                {sprintGroup.admin.deliverables.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-gray-700 text-sm md:text-base">
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

// Simplified rendering logic to remove .replace()
const renderSingleRoadmap = (roadmap, title, icon, color) => (
  // Used for Technical, UI/UX, AI/ML roadmaps
  <div className="bg-white rounded-xl shadow-xl p-6 md:p-8">
    <h2 className="text-2xl md:text-3xl font-bold mb-6 text-indigo-900 flex items-center gap-2">
      {icon}
      {title}
    </h2>
    <p className="text-base md:text-lg mb-8 text-gray-700">
      This is an <strong>8-week MVP roadmap</strong> (four 2-week sprints) focusing on delivering core value quickly with clear, tangible results at each stage.
    </p>

    <div className="space-y-10">
      {roadmap.map((sprint, index) => (
        <div key={index} className={`border-4 border-${color}-200 rounded-xl p-4 md:p-6 bg-${color}-50 relative`}>
          {/* Using fixed indigo-700 for high contrast on the sprint label */}
          <div className="absolute -top-4 left-4 bg-indigo-700 text-white text-xs md:text-sm px-3 md:px-4 py-1 rounded-full font-bold shadow-lg">
            {`SPRINT ${sprint.sprint}: ${sprint.duration}`}
          </div>

          <div className="flex items-center gap-4 pt-4 mb-4">
            <div className="text-4xl md:text-5xl flex-shrink-0">{sprint.icon}</div>
            <div>
              <h3 className={`text-xl md:text-2xl font-bold text-${color}-800`}>{sprint.title}</h3>
              <p className="text-indigo-600 font-semibold text-sm md:text-base">{sprint.theme}</p>
            </div>
          </div>

          <h4 className="font-bold text-lg md:text-xl mb-3 text-gray-700">Key Deliverables:</h4>
          <div className="grid md:grid-cols-2 gap-x-6 gap-y-3">
            {sprint.deliverables.map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm border border-gray-100">
                <div className="text-xl flex-shrink-0 mt-1">{item.icon}</div>
                <span
                  className="text-gray-700 text-sm md:text-base"
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

// --- MAIN COMPONENT ---

const ArchitectureComparison = () => {
  // FIX: Set initial page to 'overview' (Quick Summary) as requested
  const [activeTab, setActiveTab] = useState('overview');

  return (
    // Universal view compatibility is ensured by using fluid widths and responsive padding
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-2 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl md:text-4xl font-extrabold text-center mb-6 md:mb-8 text-indigo-900 leading-tight p-2">
          Wezu Smart Battery System - Strategic Architecture & Roadmap
        </h1>

        {/* Tab Navigation (Responsive scrolling for universal compatibility) */}
        <div className="flex gap-2 mb-8 overflow-x-auto bg-white rounded-xl p-2 shadow-xl border border-indigo-200">
          {tabOrder.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              // Adjusted text size and padding for better mobile/universal fit
              className={`px-3 py-2 text-xs md:px-4 md:py-2 md:text-sm lg:text-base rounded-lg font-semibold transition whitespace-nowrap flex-shrink-0 ${activeTab === tab
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-indigo-50 hover:text-indigo-700'
                }`}
            >
              {tabLabels[tab]}
            </button>
          ))}
        </div>

        {/* --- TABS --- */}

        {/* Overview Tab (Quick Summary) */}
        {activeTab === 'overview' && (
          <div className="bg-white rounded-xl shadow-xl p-6 md:p-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-indigo-900">Quick Summary: Strategy & Savings</h2>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="border-4 border-red-300 rounded-xl p-6 bg-red-50">
                <h3 className="text-xl md:text-2xl font-bold mb-4 text-red-700 flex items-center gap-2"><X size={24} /> Client Architecture (Azure)</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-2">
                    <X className="text-red-500 mt-1 flex-shrink-0" size={20} />
                    <span>Vendor Lock-in: Fully dependent on Azure managed services.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <X className="text-red-500 mt-1 flex-shrink-0" size={20} />
                    <span>High Costs: Premium Azure services for standard tasks.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <X className="text-red-500 mt-1 flex-shrink-0" size={20} />
                    <span>Over-engineered: CosmosDB and Data Explorer are complex for phase 1 IoT.</span>
                  </li>
                </ul>
                <div className="mt-6 p-4 bg-red-100 rounded-lg">
                  <p className="font-bold text-xl text-red-800">MVP Cost: ${costBreakdown.client.mvp.total.toLocaleString()}/month</p>
                </div>
              </div>

              <div className="border-4 border-green-300 rounded-xl p-6 bg-green-50">
                <h3 className="text-xl md:text-2xl font-bold mb-4 text-green-700 flex items-center gap-2"><Check size={24} /> Proposed Architecture (Multi-cloud)</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-2">
                    <Check className="text-green-500 mt-1 flex-shrink-0" size={20} />
                    <span>Cloud Agnostic: Uses Kubernetes and open-source for portability.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="text-green-500 mt-1 flex-shrink-0" size={20} />
                    <span>Cost Efficiency: 60% reduction using specialized open-source DBs.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="text-green-500 mt-1 flex-shrink-0" size={20} />
                    <span>Polyglot Persistence: Right database for the right job (Time-Series, Graph, Relational).</span>
                  </li>
                </ul>
                <div className="mt-6 p-4 bg-green-100 rounded-lg">
                  <p className="font-bold text-xl text-green-800">MVP Cost: ${costBreakdown.proposed.mvp.total.toLocaleString()}/month</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-400 to-green-600 text-white rounded-xl p-8 text-center shadow-2xl">
              <h3 className="text-2xl md:text-3xl font-bold mb-4">💰 Projected 2-Year Cost Reduction</h3>
              <p className="text-4xl md:text-5xl font-bold mb-2">$157,680</p>
              <p className="text-base md:text-xl">This savings is achieved by optimizing data services and leveraging open-source components, allowing for more investment in feature development.</p>
            </div>
          </div>
        )}

        {/* --- DIAGRAM TAB --- */}
        {activeTab === 'diagram' && (
          <div className="bg-white rounded-xl shadow-xl p-6 md:p-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-indigo-900 flex items-center gap-2">
              <Layers size={30} />
              Wezu Smart Battery System - High-Level Architecture
            </h2>

            {/* Key Principles Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Clean Architecture Card */}
              <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-indigo-600 transition-all duration-300 hover:scale-[1.02]">
                <div className="flex items-center space-x-3 mb-3">
                  <Layers size={24} className="text-indigo-600" />
                  <h3 className="text-xl font-bold text-gray-900">Clean Architecture Principles</h3>
                </div>
                <p className="text-gray-600 text-sm">
                  The entire system is built on <strong>Clean Architecture</strong> principles for maximum separation of concerns, ensuring the application is highly testable, maintainable, and independent of specific frameworks or databases.
                </p>
                <div className="mt-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                    High Maintainability
                  </span>
                </div>
              </div>
              {/* Cloud Agnostic Card */}
              <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-emerald-600 transition-all duration-300 hover:scale-[1.02]">
                <div className="flex items-center space-x-3 mb-3">
                  <Cloud size={24} className="text-emerald-600" />
                  <h3 className="text-xl font-bold text-gray-900">Cloud Agnostic (K8s)</h3>
                </div>
                <p className="text-gray-600 text-sm">
                  We guarantee portability by using <strong>Kubernetes (K8s)</strong> orchestration, avoiding vendor lock-in and allowing seamless deployment across AWS, Azure, or GCP.
                </p>
                <div className="mt-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                    Vendor Lock-in Avoided
                  </span>
                </div>
              </div>
            </div>

            {/* The Diagram structure itself, optimized for responsiveness */}
            <div className="overflow-x-auto w-full">
              <div className="flex flex-col items-center border-4 border-gray-200 rounded-xl p-4 bg-gray-50 w-full min-w-[300px]">

                {/* 1. TOP LAYER: Client Apps & Monitoring */}
                <div className="flex flex-col md:flex-row justify-between w-full mb-6 gap-4">
                  <div className="flex flex-col items-center p-3 md:p-4 bg-red-100 rounded-lg shadow-md border-red-300 border-2 w-full md:w-1/3">
                    <Code size={24} className="text-red-600 mb-1 md:mb-2" />
                    <span className="font-bold text-sm md:text-lg text-red-800 text-center">Client Applications</span>
                    <span className="text-xs text-gray-600 text-center hidden md:block">Customer, Admin, Dealer Portals</span>
                  </div>
                  <div className="flex flex-col items-center p-3 md:p-4 bg-yellow-100 rounded-lg shadow-md border-yellow-300 border-2 w-full md:w-1/3">
                    <Terminal size={24} className="text-yellow-600 mb-1 md:mb-2" />
                    <span className="font-bold text-sm md:text-lg text-yellow-800 text-center">Monitoring & Alerting</span>
                    <span className="text-xs text-gray-600 text-center hidden md:block">Prometheus, Grafana, ELK</span>
                  </div>
                  <div className="flex flex-col items-center p-3 md:p-4 bg-green-100 rounded-lg shadow-md border-green-300 border-2 w-full md:w-1/3">
                    <Brain size={24} className="text-green-600 mb-1 md:mb-2" />
                    <span className="font-bold text-sm md:text-lg text-green-800 text-center">AI/ML Services</span>
                    <span className="text-xs text-gray-600 text-center hidden md:block">Predictive Maintenance, Fraud</span>
                  </div>
                </div>

                {/* Connection Line: Apps/Monitoring to API Gateway (Cloud Layer) */}
                <div className="w-full flex justify-center mb-6">
                  <div className="w-1/2 md:w-2/3 flex justify-around">
                    <ArrowRight size={24} className="text-gray-500 rotate-90" />
                    <ArrowRight size={24} className="text-gray-500 rotate-90" />
                    <ArrowRight size={24} className="text-gray-500 rotate-90" />
                  </div>
                </div>

                {/* 2. MIDDLE LAYER: Backend and Ingestion (The Cloud Platform) */}
                <div className="w-full border-4 border-blue-400 rounded-xl p-4 md:p-6 bg-blue-50 relative mb-8">
                  <span className="absolute -top-4 left-4 bg-blue-400 text-white text-xs md:text-sm px-3 py-1 rounded-full font-bold shadow-lg">
                    CLOUD PLATFORM (K8s Cluster)
                  </span>

                  {/* Stacks vertically on mobile, horizontally on medium screens and up */}
                  <div className="flex flex-col md:flex-row justify-around items-start gap-4">

                    {/* Ingestion Column */}
                    <div className="flex flex-col items-center w-full md:w-1/4 pb-4 border-b-2 border-blue-200 md:border-b-0 md:border-r-2 md:pr-4">
                      <MessageSquare size={28} className="text-indigo-600 mb-1 md:mb-2" />
                      <span className="font-bold text-xs md:text-sm text-indigo-800 text-center">Messaging & Ingestion</span>
                      <span className="text-xs text-gray-700 text-center">HiveMQ, <strong>Kafka</strong></span>
                      <ArrowRight size={18} className="text-indigo-600 rotate-90 my-2" />
                      <div className="p-1 bg-indigo-100 rounded-lg shadow-sm">
                        <span className="text-xs font-semibold text-indigo-700">Stream Processing</span>
                      </div>
                    </div>

                    {/* Microservices Column */}
                    <div className="flex flex-col items-center w-full md:w-2/4 border-y-2 border-blue-200 md:border-y-0 md:border-l-2 md:border-r-2 px-0 md:px-4 py-4 md:py-0">
                      <Server size={28} className="text-purple-600 mb-1 md:mb-2" />
                      <span className="font-bold text-sm md:text-base text-purple-800">Backend Microservices</span>
                      <span className="text-xs text-gray-700 text-center mb-2">Device Mgmt, Rental, Payments, Inventory</span>

                      {/* API Gateway & Load Balancer */}
                      <div className="p-1 md:p-2 bg-purple-100 rounded-lg shadow-sm mb-2 w-full text-center">
                        <span className="text-xs font-semibold text-purple-700">API Gateway / LB</span>
                      </div>

                      {/* Data/Service Connections */}
                      <div className="flex justify-center gap-4 w-full mt-2">
                        <ArrowRight size={18} className="text-purple-600 rotate-90" />
                        <ArrowRight size={18} className="text-purple-600 rotate-90" />
                        <ArrowRight size={18} className="text-purple-600 rotate-90" />
                      </div>
                    </div>

                    {/* Data Lake Column */}
                    <div className="flex flex-col items-center w-full md:w-1/4 pt-4 md:pt-0 md:pl-4 md:border-l-2 md:border-blue-200">
                      <HardDrive size={28} className="text-red-600 mb-1 md:mb-2" />
                      <span className="font-bold text-xs md:text-sm text-red-800">Long-term Storage</span>
                      <span className="text-xs text-gray-700 text-center">S3 / R2 (Data Lake)</span>
                      <ArrowRight size={18} className="text-red-600 rotate-90 my-2" />
                      <div className="p-1 bg-red-100 rounded-lg shadow-sm">
                        <span className="text-xs font-semibold text-red-700">Reporting DB</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. BOTTOM LAYER: Data Persistence (Uses responsive grid) */}
                <div className="flex justify-center w-full mb-6">
                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 p-4 bg-orange-50 rounded-xl shadow-md border-orange-300 border-2 w-full max-w-4xl gap-4 md:gap-8">

                    <div className="flex flex-col items-center">
                      <Database size={24} className="text-orange-600 mb-1" />
                      <span className="font-bold text-sm text-orange-800">PostgreSQL</span>
                      <span className="text-xs text-gray-600">(Transactions)</span>
                    </div>

                    <div className="flex flex-col items-center">
                      <Clock size={24} className="text-orange-600 mb-1" />
                      <span className="font-bold text-sm text-orange-800">TimescaleDB</span>
                      <span className="text-xs text-gray-600">(Telemetry)</span>
                    </div>

                    <div className="flex flex-col items-center">
                      <Aperture size={24} className="text-orange-600 mb-1" />
                      <span className="font-bold text-sm text-orange-800">Neo4j</span>
                      <span className="text-xs text-gray-600">(Relationships)</span>
                    </div>

                    <div className="flex flex-col items-center">
                      <Zap size={24} className="text-orange-600 mb-1" />
                      <span className="font-bold text-sm text-orange-800">Redis</span>
                      <span className="text-xs text-gray-600">(Cache/State)</span>
                    </div>
                  </div>
                </div>

                {/* Connection Line: Ingestion to Devices */}
                <div className="w-1/4 flex justify-center mt-4">
                  <div className="w-px h-8 bg-gray-500"></div>
                </div>

                {/* 4. GROUND LAYER: IoT Devices */}
                <div className="flex justify-center w-full">
                  <div className="flex items-center p-4 bg-purple-100 rounded-lg shadow-md border-purple-300 border-2 w-full md:w-1/3">
                    <Cloud size={32} className="text-purple-600 mr-3" />
                    <span className="font-bold text-lg text-purple-800">IoT Devices & Chargers</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Components Tab (Responsive grid) */}
        {activeTab === 'components' && (
          <div className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-indigo-900">Component-by-Component Comparison</h2>
            {Object.entries(componentComparison).map(([key, comp]) => (
              <div key={key} className="bg-white rounded-xl shadow-xl p-6">
                <h3 className="text-xl md:text-2xl font-bold mb-4 text-indigo-800">{comp.name}</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="border-2 border-red-300 rounded-lg p-4 bg-red-50">
                    <h4 className="font-bold text-xl mb-2 text-red-700">Client Choice</h4>
                    <p className="text-lg font-semibold mb-2">{comp.client.tech}</p>
                    <p className="text-2xl font-bold text-red-600 mb-3">{comp.client.cost}</p>
                    <div className="mb-3">
                      <p className="font-semibold text-green-700 mb-1">Pros:</p>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        {comp.client.pros.map((pro, i) => (
                          <li key={i}>{pro}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold text-red-700 mb-1">Cons:</p>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        {comp.client.cons.map((con, i) => (
                          <li key={i}>{con}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="border-2 border-green-300 rounded-lg p-4 bg-green-50">
                    <h4 className="font-bold text-xl mb-2 text-green-700">Proposed Alternative</h4>
                    <p className="text-lg font-semibold mb-2">{comp.proposed.tech}</p>
                    <p className="text-2xl font-bold text-green-600 mb-3">{comp.proposed.cost}</p>
                    <div className="mb-3">
                      <p className="font-semibold text-green-700 mb-1">Pros:</p>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        {comp.proposed.pros.map((pro, i) => (
                          <li key={i}>{pro}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold text-red-700 mb-1">Cons:</p>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        {comp.proposed.cons.map((con, i) => (
                          <li key={i}>{con}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Databases Tab (Responsive grid) */}
        {activeTab === 'databases' && (
          <div className="bg-white rounded-xl shadow-xl p-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-indigo-900">Database Strategy: Polyglot Persistence</h2>
            <p className="text-base md:text-lg mb-8 text-gray-700">
              We leverage <strong>specialized databases</strong> for optimal performance and cost efficiency, ensuring we use the right tool for each data type (transactional, time-series, and relational data).
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              {Object.entries(databaseExplanation).map(([key, db]) => (
                <div key={key} className="border-2 border-indigo-200 rounded-lg p-6 bg-indigo-50">
                  <div className="flex items-start gap-4">
                    <Database className="text-indigo-600 flex-shrink-0 mt-1" size={32} />
                    <div className="flex-1">
                      <h3 className="text-xl md:text-2xl font-bold mb-2 text-indigo-800">{db.name}</h3>
                      <div className="mb-3">
                        <p className="font-semibold text-gray-700 text-base">What it stores:</p>
                        <p className="text-gray-600 text-sm">{db.useCase}</p>
                      </div>
                      <div className="mb-3">
                        <p className="font-semibold text-gray-700 text-base">Why this database:</p>
                        <p className="text-gray-600 text-sm">{db.why}</p>
                      </div>
                      <div className="bg-green-100 border border-green-300 rounded p-3">
                        <p className="font-bold text-green-700 text-sm md:text-base">Cost: {db.cost}</p>
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
          <div className="bg-white rounded-xl shadow-xl p-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-indigo-900">Clean Architecture Explained</h2>

            {architectureTypes.map((arch, idx) => (
              <div key={idx} className="mb-8">
                <h3 className="text-xl md:text-2xl font-bold mb-4 text-indigo-800">{arch.title}</h3>
                <p className="text-base md:text-lg mb-6 text-gray-700">{arch.description}</p>
                <div className="space-y-4 mb-6">
                  {arch.layers.map((layer, i) => (
                    <div key={i} className="border-l-4 border-indigo-500 pl-4 py-3 bg-indigo-50">
                      <h4 className="font-bold text-lg text-indigo-800">Layer {i + 1}: {layer.name}</h4>
                      <p className="text-gray-700 text-sm">{layer.desc}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">
                  <h4 className="font-bold text-xl mb-4 text-green-800">Key Benefits:</h4>
                  <ul className="space-y-3">
                    {arch.benefits.map((benefit, i) => (
                      <li key={i} className="flex gap-2 text-sm md:text-base">
                        <Check className="text-green-500 flex-shrink-0 mt-1" size={20} />
                        <span className="text-gray-700">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Cost Tab (Responsive tables with overflow-x-auto) */}
        {activeTab === 'cost' && (
          <div className="bg-white rounded-xl shadow-xl p-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-8 text-indigo-900">Detailed Cost Comparison</h2>

            <CostComparisonChart
              phase="MVP (0-6 months, 100-500 devices)"
              clientCost={costBreakdown.client.mvp.total}
              proposedCost={costBreakdown.proposed.mvp.total}
            />
            <CostComparisonChart
              phase="Growth (6-18 months, 500-5,000 devices)"
              clientCost={costBreakdown.client.growth.total}
              proposedCost={costBreakdown.proposed.growth.total}
            />
            <CostComparisonChart
              phase="Scale (18+ months, 5,000-50,000 devices)"
              clientCost={costBreakdown.client.scale.total}
              proposedCost={costBreakdown.proposed.scale.total}
            />

            {/* Detailed breakdown table */}
            <div className="mt-8">
              <h3 className="text-2xl font-bold mb-4 text-indigo-800">Component-wise Cost Breakdown (Growth Phase)</h3>
              {/* Universal Fix: Ensure tables do not cause overflow by allowing horizontal scrolling */}
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr className="bg-indigo-600 text-white text-sm md:text-base">
                      <th className="border p-3 text-left">Component</th>
                      <th className="border p-3 text-right">Client (Azure)</th>
                      <th className="border p-3 text-right">Proposed</th>
                      <th className="border p-3 text-right">Savings</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm md:text-base">
                    {Object.keys(costBreakdown.client.growth).filter(k => k !== 'total').map(component => (
                      <tr key={component} className="hover:bg-gray-50">
                        <td className="border p-3 capitalize font-semibold">{component}</td>
                        <td className="border p-3 text-right text-red-600 font-semibold">
                          ${costBreakdown.client.growth[component]}
                        </td>
                        <td className="border p-3 text-right text-green-600 font-semibold">
                          ${costBreakdown.proposed.growth[component]}
                        </td>
                        <td className="border p-3 text-right font-bold text-green-700">
                          ${costBreakdown.client.growth[component] - costBreakdown.proposed.growth[component]}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-gray-100 font-bold text-base md:text-lg">
                      <td className="border p-3">TOTAL</td>
                      <td className="border p-3 text-right text-red-700">
                        ${costBreakdown.client.growth.total}
                      </td>
                      <td className="border p-3 text-right text-green-700">
                        ${costBreakdown.proposed.growth.total}
                      </td>
                      <td className="border p-3 text-right text-green-700 text-lg md:text-xl">
                        ${costBreakdown.client.growth.total - costBreakdown.proposed.growth.total}/mo
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* --- COMBINED AGILE FEATURE ROADMAP TAB --- */}
        {activeTab === 'agile_feature_roadmap' && renderAgileRoadmap(combinedAgileRoadmap)}

        {/* --- TECHNICAL ROADMAP TAB --- */}
        {activeTab === 'technical_roadmap' && renderSingleRoadmap(
          technicalRoadmap,
          "Technical Roadmap: Backend & Infrastructure (8 Weeks)",
          <Server size={30} />,
          'blue'
        )}

        {/* --- UI/UX ROADMAP TAB --- */}
        {activeTab === 'ui_ux_roadmap' && renderSingleRoadmap(
          uiUxRoadmap,
          "UI/UX Roadmap: Design & User Experience (8 Weeks)",
          <Palette size={30} />,
          'indigo'
        )}

        {/* --- AI/ML ROADMAP TAB --- */}
        {activeTab === 'ai_ml_roadmap' && renderSingleRoadmap(
          aiMlRoadmap,
          "AI/ML Roadmap: Intelligence & Analytics (8 Weeks)",
          <Brain size={30} />,
          'purple'
        )}
      </div>
    </div>
  );
};

export default ArchitectureComparison;
