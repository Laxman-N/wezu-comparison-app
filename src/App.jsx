import React, { useState, useEffect, useCallback } from 'react';
import {
  ArrowRight, DollarSign, Database, Shield, Zap, Cloud, Check, X, Info, Layers,
  Code, Terminal, Server, MessageSquare, HardDrive, Cpu, ShoppingCart, TrendingUp, Home, Calendar, Clock, Lock, Truck, Repeat,
  Palette, Brain, Aperture, Power, GitBranch, Menu, X as CloseIcon, ChevronDown, ChevronUp
} from 'lucide-react';

// --- TRANSITION COMPONENT ---
// This component applies CSS transitions (fade-in) when its 'children' change.
const ContentTransitionWrapper = ({ children, activeTab }) => {
  const [content, setContent] = useState(children);
  const [transitionClass, setTransitionClass] = useState('opacity-100 translate-y-0');

  useEffect(() => {
    // 1. Start fade-out
    setTransitionClass('opacity-0 translate-y-2');

    // 2. Wait for fade-out duration (e.g., 150ms)
    const timer = setTimeout(() => {
      // 3. Update content
      setContent(children);
      // 4. Start fade-in for new content immediately after content update
      setTransitionClass('opacity-100 translate-y-0');
    }, 150); // This duration should match the Tailwind transition duration

    return () => clearTimeout(timer);
  }, [activeTab, children]);

  // Use a fixed height wrapper to prevent Cumulative Layout Shift (CLS) during transition
  // Note: We use min-h-[500px] as a reasonable minimum, replace with actual height logic if needed.
  return (
    <div className={`transition-all duration-150 ease-in-out min-h-[500px] ${transitionClass}`}>
      {content}
    </div>
  );
};


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

// --- FEATURE ROADMAP DATA ---
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

// Technical Roadmap Data
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

// UI/UX Roadmap Data
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

// AI/ML Roadmap Data
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
  technical_roadmap: 'Technical Roadmap (8 Wks)',
  ui_ux_roadmap: 'UI/UX Roadmap (8 Wks)',
  ai_ml_roadmap: 'AI/ML Roadmap (8 Wks)',
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
    <h2 className="text-3xl font-bold mb-6 text-indigo-900 flex items-center gap-2">
      <GitBranch size={30} />
      Agile Feature Roadmap (8-Week MVP)
    </h2>
    <p className="text-lg mb-8 text-gray-700">
      This integrated roadmap shows parallel feature development for the core customer application and the internal administration portal across four 2-week sprints.
    </p>

    <div className="space-y-12">
      {combinedRoadmap.map((sprintGroup, index) => (
        <div key={index} className="border-4 border-indigo-500 rounded-xl p-6 bg-indigo-50 relative">
          <div className="absolute -top-4 left-4 bg-indigo-700 text-white text-sm px-4 py-1 rounded-full font-bold shadow-lg">
            {`SPRINT ${sprintGroup.customer.sprint}: 2 WEEKS`}
          </div>

          <h3 className="text-2xl font-bold text-indigo-900 pt-4 mb-6">
            Sprint {sprintGroup.customer.sprint} Focus: {sprintGroup.customer.theme} & {sprintGroup.admin.theme}
          </h3>

          <div className="grid md:grid-cols-2 gap-6">

            {/* Customer Deliverables Column */}
            <div className="bg-white rounded-lg p-5 shadow-lg border-t-4 border-green-500">
              <div className="flex items-center gap-3 mb-4">
                <ShoppingCart size={24} className="text-green-600" />
                <h4 className="text-xl font-bold text-green-700">Customer Focus: {sprintGroup.customer.title}</h4>
              </div>
              <ul className="space-y-3">
                {sprintGroup.customer.deliverables.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-gray-700 text-base">
                    <div className="text-xl flex-shrink-0 mt-1">{item.icon}</div>
                    <span dangerouslySetInnerHTML={{ __html: item.desc }}></span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Admin Deliverables Column */}
            <div className="bg-white rounded-lg p-5 shadow-lg border-t-4 border-red-500">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp size={24} className="text-red-600" />
                <h4 className="text-xl font-bold text-red-700">Admin/Ops Focus: {sprintGroup.admin.title}</h4>
              </div>
              <ul className="space-y-3">
                {sprintGroup.admin.deliverables.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-gray-700 text-base">
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
    <h2 className="text-3xl font-bold mb-6 text-indigo-900 flex items-center gap-2">
      {icon}
      {title}
    </h2>
    <p className="text-lg mb-8 text-gray-700">
      This is an <strong>8-week MVP roadmap</strong> (four 2-week sprints) focusing on delivering core value quickly with clear, tangible results at each stage.
    </p>

    <div className="space-y-10">
      {roadmap.map((sprint, index) => (
        <div key={index} className={`border-4 border-${color}-200 rounded-xl p-6 bg-${color}-50 relative`}>
          {/* Using fixed indigo-700 for high contrast on the sprint label */}
          <div className="absolute -top-4 left-4 bg-indigo-700 text-white text-sm px-4 py-1 rounded-full font-bold shadow-lg">
            {`SPRINT ${sprint.sprint}: ${sprint.duration}`}
          </div>

          <div className="flex items-center gap-4 pt-4 mb-4">
            <div className="text-5xl flex-shrink-0">{sprint.icon}</div>
            <div>
              <h3 className={`text-2xl font-bold text-${color}-800`}>{sprint.title}</h3>
              <p className="text-indigo-600 font-semibold">{sprint.theme}</p>
            </div>
          </div>

          <h4 className="font-bold text-xl mb-3 text-gray-700">Key Deliverables:</h4>
          <div className="grid md:grid-cols-2 gap-x-6 gap-y-3">
            {sprint.deliverables.map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm border border-gray-100">
                <div className="text-xl flex-shrink-0 mt-1">{item.icon}</div>
                <span
                  className="text-gray-700 text-base"
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
  const [activeTab, setActiveTab] = useState('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    // Close menu after selection on mobile
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  };

  // --- Render Functions (Internal Content) ---

  const renderContent = useCallback(() => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="bg-white rounded-xl shadow-xl p-6 md:p-8">
            <h2 className="text-3xl font-bold mb-6 text-indigo-900">Quick Summary: Strategy & Savings</h2>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="border-4 border-red-300 rounded-xl p-6 bg-red-50">
                <h3 className="text-2xl font-bold mb-4 text-red-700 flex items-center gap-2"><X size={24} /> Client Architecture (Azure)</h3>
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
                  <p className="font-bold text-xl text-red-800">MVP Cost Estimate: ${costBreakdown.client.mvp.total.toLocaleString()}/month</p>
                </div>
              </div>

              <div className="border-4 border-green-300 rounded-xl p-6 bg-green-50">
                <h3 className="text-2xl font-bold mb-4 text-green-700 flex items-center gap-2"><Check size={24} /> Proposed Strategy (Multi-cloud)</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-2">
                    <Check className="text-green-500 mt-1 flex-shrink-0" size={20} />
                    <span>Cost-Optimized: Utilizing highly efficient, battle-tested open-source components.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="text-green-500 mt-1 flex-shrink-0" size={20} />
                    <span>Clean Architecture: Enforces separation of concerns for easy future scaling/migration.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="text-green-500 mt-1 flex-shrink-0" size={20} />
                    <span>Multi-Database: Right tool for the right job (PostgreSQL, TimescaleDB, Neo4j, Redis).</span>
                  </li>
                </ul>
                <div className="mt-6 p-4 bg-green-100 rounded-lg">
                  <p className="font-bold text-xl text-green-800">MVP Cost Estimate: ${costBreakdown.proposed.mvp.total.toLocaleString()}/month</p>
                </div>
              </div>
            </div>

            <h3 className="text-2xl font-bold text-indigo-800 mb-4 flex items-center gap-2"><DollarSign size={24} /> Overall Impact</h3>
            <p className="text-lg text-gray-700 mb-6">
              The proposed multi-cloud, open-source-first architecture delivers **over 59% cost savings** at the MVP phase while ensuring greater flexibility and performance for a high-volume IoT application.
            </p>

            <div className="text-center mt-8">
              <button
                onClick={() => setActiveTab('cost')}
                className="bg-indigo-600 text-white font-semibold py-3 px-8 rounded-full shadow-lg hover:bg-indigo-700 transition duration-150 flex items-center justify-center mx-auto"
              >
                View Detailed Cost Breakdown <ArrowRight size={20} className="ml-2" />
              </button>
            </div>
          </div>
        );

      case 'diagram':
        return (
          <div className="bg-white rounded-xl shadow-xl p-6 md:p-8">
            <h2 className="text-3xl font-bold mb-6 text-indigo-900 flex items-center gap-2"><Layers size={30} /> Proposed Architectural Diagram (High-Level)</h2>
            <p className="text-lg text-gray-700 mb-6">
              This diagram shows the flow from the IoT devices through the ingestion pipeline, into the specialized data layer, and finally to the backend services and customer/admin portals.
            </p>

            <div className="bg-indigo-50 border-4 border-indigo-200 rounded-xl p-6 overflow-x-auto">
              <div className="min-w-[900px] flex justify-between items-center text-center space-x-4">
                {/* 1. IoT Devices */}
                <div className="flex flex-col items-center flex-shrink-0 w-1/5">
                  <HardDrive size={40} className="text-indigo-600 mb-2" />
                  <span className="font-bold text-lg">IoT Devices</span>
                  <span className="text-sm text-gray-600">Batteries, Chargers, Vehicles</span>
                </div>

                <ArrowRight size={30} className="text-gray-500 flex-shrink-0" />

                {/* 2. Ingestion Layer */}
                <div className="flex flex-col items-center flex-shrink-0 w-1/5 bg-white p-4 rounded-lg shadow-md border-t-4 border-green-500">
                  <Zap size={40} className="text-green-600 mb-2" />
                  <span className="font-bold text-lg">Ingestion Pipeline</span>
                  <span className="text-sm text-gray-600">MQTT Broker (HiveMQ) → Kafka</span>
                </div>

                <ArrowRight size={30} className="text-gray-500 flex-shrink-0" />

                {/* 3. Data Layer (The Core) */}
                <div className="flex flex-col items-center flex-shrink-0 w-1/5 bg-white p-4 rounded-lg shadow-lg border-t-4 border-blue-500 relative">
                  <Database size={40} className="text-blue-600 mb-2" />
                  <span className="font-bold text-lg mb-2">Specialized Data Layer</span>
                  <div className="text-left text-sm space-y-1">
                    <p className="flex items-center"><Check size={16} className="text-blue-500 mr-2" /> **TimescaleDB** (Telemetry)</p>
                    <p className="flex items-center"><Check size={16} className="text-blue-500 mr-2" /> **PostgreSQL** (Transactions)</p>
                    <p className="flex items-center"><Check size={16} className="text-blue-500 mr-2" /> **Neo4j** (Relationships)</p>
                    <p className="flex items-center"><Check size={16} className="text-blue-500 mr-2" /> **Redis** (Cache/State)</p>
                  </div>
                </div>

                <ArrowRight size={30} className="text-gray-500 flex-shrink-0" />

                {/* 4. Service Layer / Output */}
                <div className="flex flex-col items-center flex-shrink-0 w-1/5 bg-white p-4 rounded-lg shadow-md border-t-4 border-purple-500">
                  <Server size={40} className="text-purple-600 mb-2" />
                  <span className="font-bold text-lg">Backend Services (K8s)</span>
                  <span className="text-sm text-gray-600">API Gateway, Business Logic, AI/ML</span>
                  <span className="text-xs mt-1 text-purple-700 font-semibold">FastAPI / Python</span>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-2xl font-bold text-indigo-800 mb-3 flex items-center gap-2"><Info size={24} /> Key Takeaway</h3>
              <p className="text-gray-700">
                The architecture is **event-driven**, using Kafka to decouple the high-volume telemetry ingestion from the business logic services. This maximizes performance, scalability, and resilience.
              </p>
            </div>
          </div>
        );

      case 'components':
        return (
          <div className="bg-white rounded-xl shadow-xl p-6 md:p-8">
            <h2 className="text-3xl font-bold mb-6 text-indigo-900 flex items-center gap-2"><Code size={30} /> Critical Component Comparison</h2>
            <p className="text-lg text-gray-700 mb-8">
              A side-by-side comparison of the heavy Azure-based architecture versus the proposed Multi-cloud, Open-Source strategy shows significant advantages in cost and flexibility.
            </p>

            <div className="space-y-8">
              {Object.keys(componentComparison).map((key) => {
                const item = componentComparison[key];
                return (
                  <div key={key} className="border-2 border-gray-100 rounded-xl shadow-lg overflow-hidden">
                    <h3 className="text-2xl font-bold text-white bg-indigo-700 p-4">{item.name}</h3>
                    <div className="grid md:grid-cols-2">
                      {/* Client Side */}
                      <div className="p-6 border-r border-red-200 bg-red-50">
                        <h4 className="text-xl font-bold text-red-700 mb-3 flex items-center gap-2"><X size={20} /> Client (Azure-Heavy)</h4>
                        <p className="font-semibold mb-2">Technology: <span className="text-gray-700">{item.client.tech}</span></p>
                        <p className="font-semibold mb-3">Estimated Cost: <span className="text-red-600">{item.client.cost}</span></p>
                        <p className="font-semibold mb-2">Pros:</p>
                        <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                          {item.client.pros.map((p, i) => <li key={i} className="text-green-600 flex items-center"><Check size={16} className="mr-2" />{p}</li>)}
                        </ul>
                        <p className="font-semibold mt-3 mb-2">Cons:</p>
                        <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                          {item.client.cons.map((c, i) => <li key={i} className="text-red-600 flex items-center"><X size={16} className="mr-2" />{c}</li>)}
                        </ul>
                      </div>
                      {/* Proposed Side */}
                      <div className="p-6 bg-green-50">
                        <h4 className="text-xl font-bold text-green-700 mb-3 flex items-center gap-2"><Check size={20} /> Proposed (Open-Source)</h4>
                        <p className="font-semibold mb-2">Technology: <span className="text-gray-700">{item.proposed.tech}</span></p>
                        <p className="font-semibold mb-3">Estimated Cost: <span className="text-green-600">{item.proposed.cost}</span></p>
                        <p className="font-semibold mb-2">Pros:</p>
                        <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                          {item.proposed.pros.map((p, i) => <li key={i} className="text-green-600 flex items-center"><Check size={16} className="mr-2" />{p}</li>)}
                        </ul>
                        <p className="font-semibold mt-3 mb-2">Cons:</p>
                        <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                          {item.proposed.cons.map((c, i) => <li key={i} className="text-red-600 flex items-center"><X size={16} className="mr-2" />{c}</li>)}
                        </ul>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'databases':
        return (
          <div className="bg-white rounded-xl shadow-xl p-6 md:p-8">
            <h2 className="text-3xl font-bold mb-6 text-indigo-900 flex items-center gap-2"><Database size={30} /> Database Strategy: Right Tool for the Right Job</h2>
            <p className="text-lg text-gray-700 mb-8">
              Instead of forcing all data into one generic database (like CosmosDB), the proposed architecture uses specialized, high-performance databases for specific tasks.
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              {Object.keys(databaseExplanation).map((key) => {
                const db = databaseExplanation[key];
                const iconMap = {
                  postgresql: <Shield size={32} className="text-blue-600" />,
                  timescaledb: <Clock size={32} className="text-green-600" />,
                  neo4j: <GitBranch size={32} className="text-purple-600" />,
                  redis: <Zap size={32} className="text-red-600" />,
                };

                return (
                  <div key={key} className="p-6 border-t-4 border-indigo-400 rounded-xl bg-gray-50 shadow-md">
                    <div className="flex items-center gap-4 mb-4">
                      {iconMap[key]}
                      <h3 className="text-2xl font-bold text-indigo-800">{db.name}</h3>
                    </div>
                    <p className="font-bold text-gray-700 mb-1">Key Use Case:</p>
                    <p className="text-lg text-gray-800 mb-3">{db.useCase}</p>
                    <p className="font-bold text-gray-700 mb-1">Why it's used:</p>
                    <p className="text-gray-600 italic mb-3">{db.why}</p>
                    <div className="mt-4 p-3 bg-indigo-100 rounded-lg">
                      <p className="font-semibold text-indigo-800 text-sm">Estimated Cost: {db.cost}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'architecture':
        return (
          <div className="bg-white rounded-xl shadow-xl p-6 md:p-8">
            <h2 className="text-3xl font-bold mb-6 text-indigo-900 flex items-center gap-2"><Layers size={30} /> Clean Architecture and Microservices</h2>
            <p className="text-lg text-gray-700 mb-8">
              The entire backend is designed on the principles of **Clean Architecture**, which guarantees maintainability, testability, and independence from external frameworks (like a specific cloud provider).
            </p>
            {architectureTypes.map((arch, index) => (
              <div key={index}>
                <h3 className="text-2xl font-bold text-indigo-800 mb-4">{arch.title}</h3>

                <div className="grid md:grid-cols-2 gap-8">
                  {/* Layers Section */}
                  <div className="bg-blue-50 p-6 rounded-xl shadow-inner border-l-4 border-blue-400">
                    <h4 className="text-xl font-bold mb-4 text-blue-700 flex items-center gap-2"><Layers size={20} /> Architectural Layers</h4>
                    <ol className="list-decimal list-inside space-y-3">
                      {arch.layers.map((layer, i) => (
                        <li key={i} className="text-gray-700">
                          <span className="font-semibold text-indigo-800">{layer.name}:</span> {layer.desc}
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Benefits Section */}
                  <div className="bg-green-50 p-6 rounded-xl shadow-inner border-l-4 border-green-400">
                    <h4 className="text-xl font-bold mb-4 text-green-700 flex items-center gap-2"><Check size={20} /> Core Benefits</h4>
                    <ul className="list-none space-y-3">
                      {arch.benefits.map((benefit, i) => (
                        <li key={i} className="text-gray-700 flex items-start">
                          <Check size={20} className="text-green-500 mr-2 flex-shrink-0 mt-1" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case 'cost':
        return (
          <div className="bg-white rounded-xl shadow-xl p-6 md:p-8">
            <h2 className="text-3xl font-bold mb-6 text-indigo-900 flex items-center gap-2"><DollarSign size={30} /> Detailed Cost Breakdown & Savings</h2>
            <p className="text-lg text-gray-700 mb-8">
              Cost estimations across three phases (MVP, Growth, Scale), showing the substantial savings gained by adopting open-source and multi-cloud components. Costs are based on managed services and containerized self-hosting.
            </p>

            <div className="grid lg:grid-cols-3 gap-8">
              <CostComparisonChart
                phase="MVP"
                clientCost={costBreakdown.client.mvp.total}
                proposedCost={costBreakdown.proposed.mvp.total}
              />
              <CostComparisonChart
                phase="Growth"
                clientCost={costBreakdown.client.growth.total}
                proposedCost={costBreakdown.proposed.growth.total}
              />
              <CostComparisonChart
                phase="Scale"
                clientCost={costBreakdown.client.scale.total}
                proposedCost={costBreakdown.proposed.scale.total}
              />
            </div>

            <div className="mt-8">
              <h3 className="text-2xl font-bold text-indigo-800 mb-4 flex items-center gap-2"><Info size={24} /> Component Cost Summary (MVP)</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
                  <thead>
                    <tr className="bg-indigo-50 border-b border-gray-200">
                      <th className="p-3 text-left font-semibold text-indigo-700">Component</th>
                      <th className="p-3 text-right font-semibold text-red-700">Client Cost (Monthly)</th>
                      <th className="p-3 text-right font-semibold text-green-700">Proposed Cost (Monthly)</th>
                      <th className="p-3 text-right font-semibold text-indigo-700">Savings (Proposed)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(costBreakdown.client.mvp).filter(k => k !== 'total' && k !== 'security').map(key => (
                      <tr key={key} className="border-b hover:bg-gray-50 transition">
                        <td className="p-3 font-medium capitalize">{componentComparison[key]?.name || key}</td>
                        <td className="p-3 text-right text-red-600">${costBreakdown.client.mvp[key]}</td>
                        <td className="p-3 text-right text-green-600">${costBreakdown.proposed.mvp[key]}</td>
                        <td className="p-3 text-right">${costBreakdown.client.mvp[key] - costBreakdown.proposed.mvp[key]}</td>
                      </tr>
                    ))}
                    <tr className="border-t-2 border-indigo-300 font-bold bg-indigo-50">
                      <td className="p-3 text-lg text-indigo-800">TOTAL MVP (Excl. Security)</td>
                      <td className="p-3 text-right text-red-700 text-xl">${costBreakdown.client.mvp.total - costBreakdown.client.mvp.security}</td>
                      <td className="p-3 text-right text-green-700 text-xl">${costBreakdown.proposed.mvp.total - costBreakdown.proposed.mvp.security}</td>
                      <td className="p-3 text-right text-green-700 text-xl">${(costBreakdown.client.mvp.total - costBreakdown.client.mvp.security) - (costBreakdown.proposed.mvp.total - costBreakdown.proposed.mvp.security)}/mo</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'agile_feature_roadmap':
        return renderAgileRoadmap(combinedAgileRoadmap);

      case 'technical_roadmap':
        return renderSingleRoadmap(
          technicalRoadmap,
          "Technical Roadmap: Backend & Infrastructure (8 Weeks)",
          <Server size={30} />,
          'blue'
        );

      case 'ui_ux_roadmap':
        return renderSingleRoadmap(
          uiUxRoadmap,
          "UI/UX Roadmap: Design & User Experience (8 Weeks)",
          <Palette size={30} />,
          'indigo'
        );

      case 'ai_ml_roadmap':
        return renderSingleRoadmap(
          aiMlRoadmap,
          "AI/ML Roadmap: Intelligence & Analytics (8 Weeks)",
          <Brain size={30} />,
          'purple'
        );

      default:
        return null;
    }
  }, [activeTab]); // Re-render content when activeTab changes

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-extrabold text-center mb-6 md:mb-8 text-indigo-900 leading-tight">
          Wezu Smart Battery System - Strategic Architecture & Roadmap
        </h1>

        {/* --- Tab Navigation --- */}

        {/* 2. MOBILE HAMBURGER BUTTON (visible only on mobile) */}
        <div className="block md:hidden mb-4">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="w-full bg-indigo-600 text-white px-4 py-3 rounded-lg font-semibold flex items-center justify-between shadow-md hover:bg-indigo-700 transition duration-150"
          >
            <span className="flex items-center gap-2">
              <Menu size={20} />
              {tabLabels[activeTab]}
            </span>
            {isMobileMenuOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>

          {/* Mobile Dropdown Menu */}
          {isMobileMenuOpen && (
            <div className="mt-2 bg-white border border-indigo-200 rounded-lg shadow-xl max-h-80 overflow-y-auto z-10 absolute w-[calc(100%-2rem)]">
              {tabOrder.map(tab => (
                <button
                  key={tab}
                  onClick={() => handleTabClick(tab)}
                  className={`w-full text-left px-4 py-3 text-sm font-medium transition duration-150 ${activeTab === tab
                    ? 'bg-indigo-100 text-indigo-800 font-bold'
                    : 'text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  {tabLabels[tab]}
                </button>
              ))}
            </div>
          )}
        </div>


        {/* LAPTOP/DESKTOP TABS (hidden on mobile) */}
        <div className="hidden md:flex gap-2 mb-8 overflow-x-auto bg-white rounded-xl p-2 shadow-xl border border-indigo-200">
          {tabOrder.map(tab => (
            <button
              key={tab}
              onClick={() => handleTabClick(tab)}
              className={`px-4 py-2 md:px-6 md:py-3 rounded-lg font-semibold text-sm md:text-base transition duration-150 whitespace-nowrap flex-shrink-0 ${activeTab === tab
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-indigo-50 hover:text-indigo-700'
                }`}
            >
              {tabLabels[tab]}
            </button>
          ))}
        </div>

        {/* --- TABS CONTENT --- */}
        <ContentTransitionWrapper activeTab={activeTab}>
          {renderContent()}
        </ContentTransitionWrapper>

      </div>
    </div>
  );
};

export default ArchitectureComparison;
