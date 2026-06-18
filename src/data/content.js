/**
 * Single source of truth for all portfolio copy. Sections stay presentational
 * and read from here. Update content in this file only.
 */

export const GITHUB_USERNAME = 'Kishan0503'

export const identity = {
  name: 'Kishan Panchal',
  title: 'Software Engineer',
  tagline:
    'I build intelligent AI-powered solutions and scalable backend systems that transform ideas into high-performance products.',
  experience: '4.4 years',
  focus: 'Backend engineering with AI/ML',
  location: 'Ahmedabad, Gujarat, India',
  timezone: 'IST · UTC+5:30',
  availability: 'Anytime',
  profileImage: '/ProfileImage.jpg',
  resume: '/Kishan-Panchal-CV.pdf',
}

export const socials = {
  email: 'kishanpanchal0503@gmail.com',
  phone: '+91 6356183766',
  github: `https://github.com/${GITHUB_USERNAME}`,
  linkedin: 'https://www.linkedin.com/in/kishan-panchal-15792622b',
}

export const about = {
  bio: 'Full-time software engineer with a backend focus. Hands-on with backend frameworks including FastAPI (microservice architecture) and Django REST Framework. Experienced in team leadership and daily client communication. Has built AI-related projects using LangChain, LangGraph, RAG, and vector databases.',
  // Architecture diagram: a backend core wired to AI/ML and Leadership nodes.
  core: {
    label: 'Backend Core',
    detail: 'FastAPI microservices · Django DRF · PostgreSQL · Redis',
  },
  nodes: [
    {
      label: 'AI / ML',
      detail: 'LangChain · LangGraph · RAG · Vector DBs · Prompt Engineering',
    },
    {
      label: 'Leadership',
      detail: 'Team leadership · Mentoring · Code reviews · Client communication',
    },
    {
      label: 'Delivery',
      detail: 'Production ownership · Tight-deadline delivery · Live client onboarding',
    },
  ],
}

export const skills = [
  {
    category: 'Backend',
    primary: true,
    items: ['Python', 'FastAPI (microservices)', 'Django', 'Django REST Framework', 'Celery'],
  },
  {
    category: 'AI / ML',
    primary: true,
    items: ['LangChain', 'LangGraph', 'RAG', 'Vector Databases', 'Prompt Engineering', 'GPT-4', 'Vapi.AI'],
  },
  {
    category: 'Databases & Infra',
    items: ['PostgreSQL', 'Redis', 'AWS'],
  },
  {
    category: 'Leadership & Practice',
    items: ['Team leadership', 'Mentoring', 'Code reviews', 'Client communication', 'Delivery ownership'],
  },
]

export const timeline = [
  {
    period: 'Mar 2022 – Jun 2025',
    company: 'Samcom Technobrains Pvt. Ltd.',
    title: 'Python Developer',
    growth: 'Python Developer → Senior',
    highlight:
      'Developed leadership, client communication, and the ability to handle projects in critical situations.',
  },
  {
    period: 'Jul 2025 – Present',
    company: 'Openxcell Technolab',
    title: 'Software Engineer',
    growth: 'Software Engineer → Tech Lead',
    highlight:
      'Led a 20-member team on Kairos OS; earned client trust through clear product guidance, kept the project on track, and delivered within deadline.',
  },
]

export const featuredProject = {
  name: 'Kairos OS',
  tagline: 'A property operations platform connecting Kairos employees and vendors.',
  description:
    'A platform for Kairos employees and vendors to collaborate with proper workflow management for property construction and maintenance work — including every module required to run property maintenance end to end.',
  stack: ['FastAPI', 'PostgreSQL', 'Microservices', 'Redis'],
  role: 'Tech Lead',
  highlights: [
    'Led a 20-developer team across the full build.',
    'Architected 12+ microservices for the platform.',
    'Delivered on a tight deadline while meeting all client requirements.',
    'Drove client communication and product guidance throughout.',
  ],
}

export const projects = [
  {
    name: 'AI Email Writer',
    description:
      'AI-based email generator that produces email content based on user-selected writing style, persona, product details, and tone.',
    stack: ['LangChain', 'GPT-4', 'PostgreSQL'],
    role: 'Backend Developer',
    highlights: ['Persona & tone control', 'Style-driven generation', 'Generated emails persisted for reuse'],
    tag: 'AI / LLM',
  },
  {
    name: 'XEMI',
    description:
      'Platform for importers/exporters to track shipments and containers live, with document extraction surfacing live data, plus custom clearance for customs and duties.',
    stack: ['Django DRF', 'Celery', 'PostgreSQL'],
    role: 'Backend Developer',
    highlights: ['Real-time shipment tracking', 'Document data extraction', 'Customs & duty clearance'],
    tag: 'Logistics',
  },
  {
    name: 'AI Marketing Agents',
    description:
      'AI voice-calling agents for product marketing, built on the Vapi.AI platform and implemented via prompt engineering.',
    stack: ['Vapi.AI', 'Prompt Engineering'],
    role: 'Backend Developer',
    highlights: ['Automated voice outreach', 'Prompt-engineered agents', 'Product marketing at scale'],
    tag: 'AI / Voice',
  },
]

export const leadership = {
  tagline: 'Leading from the backend — turning ideas into production-ready systems and lasting client trust.',
  metrics: [
    { value: 5, suffix: '–15', label: 'Team size led', detail: 'members per project' },
    { value: 3, suffix: ' yrs', label: 'Leadership', detail: '~2–3 years in a lead capacity', approx: true },
    { value: 3, suffix: '', label: 'Projects shipped', detail: 'to production with live clients' },
  ],
  owned: ['Mentoring', 'Code reviews', 'Client communication', 'Delivery'],
  outcomes: 'Brought 3 projects to a production-ready state and onboarded live clients for them.',
}

export const chatbot = {
  intro:
    "Hi! I'm Kishan's scripted assistant. Pick a question below and I'll answer from his profile.",
  qa: [
    {
      q: "What's your tech stack?",
      a: 'Backend: Python, FastAPI (microservices), Django & DRF, Celery. AI/ML: LangChain, LangGraph, RAG, vector databases, prompt engineering, GPT-4, Vapi.AI. Data & infra: PostgreSQL, Redis, AWS.',
    },
    {
      q: 'How many years of experience do you have?',
      a: '4.4 years as a software engineer with a backend focus.',
    },
    {
      q: 'Have you led a team?',
      a: 'Yes — most recently as Tech Lead on Kairos OS, leading a 20-developer team across 12+ microservices and delivering on a tight deadline. Typical per-project teams range from 5–15 members.',
    },
    {
      q: 'What kind of AI projects have you built?',
      a: 'An AI Email Writer (LangChain + GPT-4) that generates emails by style, persona, product, and tone; and AI Marketing Agents — AI voice-calling agents built on Vapi.AI via prompt engineering.',
    },
    {
      q: 'Are you open to opportunities?',
      a: "Yes — availability is Anytime. I'm based in Ahmedabad, India (IST, UTC+5:30).",
    },
    {
      q: 'How do I contact you / get your resume?',
      a: 'Email kishanpanchal0503@gmail.com or call +91 6356183766. You can download the resume from the hero or the Recruiter Snapshot card, and connect on LinkedIn & GitHub.',
    },
  ],
}

export const navLinks = [
  { id: 'hero', label: 'Home' },
  { id: 'snapshot', label: 'Snapshot' },
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'featured', label: 'Featured' },
  { id: 'projects', label: 'Projects' },
  { id: 'leadership', label: 'Leadership' },
  { id: 'github', label: 'GitHub' },
  { id: 'assistant', label: 'Assistant' },
  { id: 'contact', label: 'Contact' },
]
