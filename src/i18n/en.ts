// Source of truth for EN copy is DESIGN.md → Figma.

export const en = {
  nav: {
    services: 'Services',
    cases: 'Cases',
    brif: 'Brif',
  },
  hero: {
    title: 'From idea to product<br>From product to growth',
    cta: 'Get started',
    accentWords: ['idea', 'product', 'growth'],
  },
  services: {
    build: {
      title: 'Build',
      description: 'From idea to launch-ready product',
      tags: ['product discovery', 'ui/ux design', 'mvp development', 'full-cycle product'],
    },
    ai: {
      title: 'AI',
      description: 'Practical AI for real product use cases',
      tags: ['ai-powered features', 'integrations'],
    },
    advisory: {
      title: 'Advisory',
      description: 'Strategic support for product decisions',
      tags: ['product strategy', 'delivery setup'],
    },
    growth: {
      title: 'Growth',
      description: 'From launch to long-term product growth',
      tags: ['expansion', 'upgrade', 'support', 'iteration'],
    },
  },
  cases: {
    title: 'Our latest work',
    items: [
      {
        title: 'Memolink',
        description: 'Connecting users through an interactive social networking app',
        tags: ['web & mob', 'ui/ux design', 'growth support'],
        image: 'case-1',
        video: '/cases/memolink.mp4',
      },
    ],
  },
  brif: {
    title: 'Project Brif',
    description:
      'Share the basics of your project so we can review your goals, scope, and requirements before the first call',
    steps: {
      productType: {
        title: 'Product type',
        description: 'What kind of solution are we building?',
        options: ['MVP', 'Complex solution', 'Enterprise software', 'Audit & Refactoring'],
      },
      readiness: {
        title: 'Readiness stage',
        description: 'How far along is your project?',
        options: ['Just an idea', 'Technical specification', 'The design is ready', 'Current project'],
      },
      platform: {
        title: 'Platform',
        description: 'Where will your users interact with the product?',
        options: ['Website', 'Mobile app', 'Web & Mobile', 'Other'],
      },
      industry: {
        title: 'Industry',
        description: 'Which business domain does this project belong to?',
        options: ['E-commerce', 'Real estate', 'FinTech', 'Social', 'EdTech', 'SaaS', 'Healthcare', 'Other'],
      },
      contact: {
        title: "Let's discuss your project",
        description: 'Please fill out the form so we can prepare a quote for you',
        name: 'Name',
        projectName: 'Project name',
        email: 'Email',
        phone: '+998',
      },
    },
    next: 'Next',
    send: 'Send',
    success: {
      title: 'Request received',
      description: 'Thank you! We will review the information and get back to you within 24 hours',
    },
    errorUnconfigured: 'Form delivery not configured yet.',
  },
  seo: {
    homeTitle: 'AF Venture Studio — Product Design & Development Studio',
    homeDescription:
      'AF Venture Studio builds MVPs, AI-powered features, and full-cycle products. Strategic product advisory, UI/UX design, and growth support from idea to scale.',
    homeOgTitle: 'AF Venture Studio — From idea to product, from product to growth',
    homeOgDescription:
      'A product design and development studio. We ship MVPs, integrate AI into real workflows, and support products from launch through growth.',
  },
  footer: {
    brand: 'AF Venture studio',
    copyright: '© 2026',
    nav: [
      { label: 'Services', href: '#services' },
      { label: 'Cases', href: '#cases' },
      { label: 'Brif', href: '#contact' },
    ],
    social: [
      { label: 'LinkedIn', href: 'https://linkedin.com' },
      { label: 'Instagram', href: 'https://instagram.com' },
      { label: 'Telegram', href: 'https://t.me' },
      { label: 'Mail', href: 'mailto:hello@afvs.dev' },
      { label: 'Clutch', href: 'https://clutch.co' },
    ],
  },
};

export type Dict = typeof en;
