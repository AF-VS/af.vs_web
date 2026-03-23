export const languages = {
  en: 'En',
  ru: 'Ru',
};

export const defaultLang = 'en';

export const ui = {
  en: {
    // Navigation
    'nav.services': 'Services',
    'nav.cases': 'Cases',
    'nav.calculator': 'Calculator',
    
    // Hero
    'hero.title': 'From idea to product',
    'hero.subtitle': 'Turnkey development, AI integration, and fundraising assistance — all in one team.',
    'hero.cta': 'Get Started',
    
    // Services
    'services.title': 'Services we provide',
    'services.subtitle': 'Innovative solutions tailored for your digital growth',
    'services.explore': 'Explore Process',
    
    // Portfolio
    'portfolio.title': 'OUR LATEST WORK',
    'portfolio.subtitle': 'Showcasing our digital expertise and innovation.',
    'portfolio.type.design': 'UI/UX DESIGN',
    'portfolio.type.strategy': 'DIGITAL STRATEGY',
    
    // Calculator
    'calc.title': 'Project Cost Calculator',
    'calc.subtitle': 'Configure your MVP requirements to instantly estimate pricing and team size.',
    'calc.category': 'Select Category',
    'calc.platform': 'Select Platform',
    'calc.timeline': 'Target Timeline',
    'calc.estTotal': 'Estimated Total',
    'calc.basedOn': 'Based on average MVP complexity',
    'calc.reqDevs': 'Required Developers',
    'calc.getQuote': 'Get Your Custom Quote',
    
    // Calc values
    'calc.cat.landing': 'Landing Page',
    'calc.cat.ecommerce': 'E-commerce',
    'calc.cat.saas': 'SaaS / Web App',
    'calc.cat.mobile': 'Mobile App',
    'calc.plat.web': 'Web Only',
    'calc.plat.ios': 'iOS',
    'calc.plat.android': 'Android',
    'calc.plat.cross': 'Cross-Platform',
    'calc.month': 'month',
    'calc.months': 'months',
    'calc.dev': 'Dev',
    'calc.devs': 'Devs',
    
    // Footer
    'footer.title': 'Let\'s build something great.',
    'footer.projName': 'Project name',
    'footer.yourName': 'Your name',
    'footer.contact': 'Contact (email or phone)',
    'footer.send': 'Send Request',
    'footer.social': 'Social',
    'footer.contactSection': 'Contact',
    'footer.rights': 'All rights reserved.',
    'footer.powered': 'Powered by af.vs',
  },
  ru: {
    // Navigation
    'nav.services': 'Услуги',
    'nav.cases': 'Кейсы',
    'nav.calculator': 'Калькулятор',
    
    // Hero
    'hero.title': 'От идеи к продукту',
    'hero.subtitle': 'Разработка под ключ, интеграция ИИ и помощь в привлечении инвестиций — все в одной команде.',
    'hero.cta': 'Начать',
    
    // Services
    'services.title': 'Наши услуги',
    'services.subtitle': 'Инновационные решения, адаптированные для вашего цифрового роста',
    'services.explore': 'Изучить процесс',
    
    // Portfolio
    'portfolio.title': 'НАШИ ПОСЛЕДНИЕ РАБОТЫ',
    'portfolio.subtitle': 'Демонстрация нашего цифрового опыта и инноваций.',
    'portfolio.type.design': 'UI/UX ДИЗАЙН',
    'portfolio.type.strategy': 'ЦИФРОВАЯ СТРАТЕГИЯ',
    
    // Calculator
    'calc.title': 'Калькулятор стоимости проекта',
    'calc.subtitle': 'Настройте требования к MVP для моментальной оценки стоимости и размера команды.',
    'calc.category': 'Выберите категорию',
    'calc.platform': 'Выберите платформу',
    'calc.timeline': 'Сроки проекта',
    'calc.estTotal': 'Ориентировочная стоимость',
    'calc.basedOn': 'На основе средней сложности MVP',
    'calc.reqDevs': 'Требуемые разработчики',
    'calc.getQuote': 'Получить точный расчёт',
    
    // Calc values
    'calc.cat.landing': 'Лендинг',
    'calc.cat.ecommerce': 'E-commerce',
    'calc.cat.saas': 'SaaS / Web App',
    'calc.cat.mobile': 'Мобильное приложение',
    'calc.plat.web': 'Только Web',
    'calc.plat.ios': 'iOS',
    'calc.plat.android': 'Android',
    'calc.plat.cross': 'Кроссплатформенное',
    'calc.month': 'месяц',
    'calc.months': 'месяцев',
    'calc.dev': 'Разработчик',
    'calc.devs': 'Разработчика(-ов)',
    
    // Footer
    'footer.title': 'Давайте создадим что-то великое.',
    'footer.projName': 'Название проекта',
    'footer.yourName': 'Ваше имя',
    'footer.contact': 'Контакт (email или телефон)',
    'footer.send': 'Отправить заявку',
    'footer.social': 'Соцсети',
    'footer.contactSection': 'Контакты',
    'footer.rights': 'Все права защищены.',
    'footer.powered': 'При поддержке af.vs',
  },
} as const;

export const servicesData = {
  en: [
    {
      title: "Core Build",
      items: ["Product discovery", "UX/UI", "MVP development", "Full-cycle engineering", "Support and scaling"]
    },
    {
      title: "Growth Support",
      items: ["GTM support", "Product analytics", "Growth priorities", "Hiring support", "Operational support"]
    },
    {
      title: "Fundraising Support",
      items: ["Investor readiness", "Pitch support", "Deck and narrative", "Data room support", "Intros to investors"]
    },
    {
      title: "Studio Track",
      items: ["Selective equity participation", "Strategic advisory", "Long-term build partnership"]
    }
  ],
  ru: [
    {
      title: "Разработка",
      items: ["Исследование продукта", "UX/UI дизайн", "Разработка MVP", "Инжиниринг полного цикла", "Поддержка и масштабирование"]
    },
    {
      title: "Рост продукта",
      items: ["GTM стратегия", "Продуктовая аналитика", "Приоритеты роста", "Помощь в найме", "Операционная поддержка"]
    },
    {
      title: "Привлечение инвестиций",
      items: ["Подготовка к инвесторам", "Поддержка питчей", "Презентация и нарратив", "Подготовка Data room", "Знакомства с инвесторами"]
    },
    {
      title: "Студийный формат",
      items: ["Выборочное участие в капитале", "Стратегический эдвайзинг", "Долгосрочное партнерство"]
    }
  ]
};

export const portfolioData = {
  en: [
    { id: 'memolink', name: 'Memolink', type: 'web & mob', subtitle: 'Connecting users through an interactive social networking app.' },
    { id: 'pandev', name: 'Pandev metrics', type: 'web', subtitle: 'Advanced analytics and dashboard reporting for tracking performance.' },
    { id: 'neva', name: 'Neva marketplace', type: 'web & mob', subtitle: 'A full-scale e-commerce platform with seamless mobile experience.' },
    { id: 'hrms', name: 'HRMS ETC', type: 'web & mob', subtitle: 'Enterprise-grade human resource management system.' }
  ],
  ru: [
    { id: 'memolink', name: 'Memolink', type: 'web & mob', subtitle: 'Объединение пользователей через интерактивную социальную сеть.' },
    { id: 'pandev', name: 'Pandev metrics', type: 'web', subtitle: 'Продвинутая аналитика и панель отчетов для отслеживания производительности.' },
    { id: 'neva', name: 'Neva marketplace', type: 'web & mob', subtitle: 'Полномасштабная e-commerce платформа с идеальным мобильным UX.' },
    { id: 'hrms', name: 'HRMS ETC', type: 'web & mob', subtitle: 'Система управления персоналом корпоративного уровня.' }
  ]
};
