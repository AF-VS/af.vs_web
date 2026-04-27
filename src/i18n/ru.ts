import type { Dict } from './en';

export const ru: Dict = {
  a11y: {
    skipToContent: 'Перейти к содержимому',
  },
  nav: {
    services: 'Услуги',
    cases: 'Кейсы',
    brif: 'Бриф',
  },
  hero: {
    title: 'От идеи к продукту<br>От продукта к росту',
    cta: 'Начать',
    accentWords: ['идеи', 'продукту', 'продукта', 'росту'],
  },
  services: {
    kickerLabel: 'Услуги / 02',
    headTitle: 'Четыре направления. <em>Один контракт.</em>',
    ctaLabel: 'Обсудить',
    build: {
      title: 'Разработка',
      description: 'От идеи до готового к запуску продукта',
      tags: ['исследование продукта', 'ux/ui дизайн', 'разработка MVP', 'полный цикл разработки'],
    },
    ai: {
      title: 'ИИ',
      description: 'Практичный AI для реальных задач продукта',
      tags: ['AI-функции', 'автоматизация процессов', 'интеграции сервисов', 'оптимизация продукта'],
    },
    advisory: {
      title: 'Менторство',
      description: 'Стратегическая поддержка продуктовых решений',
      tags: ['продуктовая стратегия', 'техническое планирование', 'настройка процессов', 'подготовка к инвестициям'],
    },
    growth: {
      title: 'Рост',
      description: 'От запуска к долгосрочному росту продукта',
      tags: ['расширение функций', 'улучшение продукта', 'поддержка и сопровождение', 'постоянное развитие'],
    },
  },
  cases: {
    title: 'Наши последние работы',
    headTitle: 'Избранные <em>работы.</em>',
    items: [
      {
        title: 'Memolink',
        description: 'Социальная платформа для интерактивного общения пользователей',
        imageAlt: 'Memolink — превью интерфейса социального приложения',
        tags: ['web & mob', 'ui/ux дизайн', 'поддержка роста'],
        image: 'case-1',
        video: '/cases/memolink.mp4',
      },
      {
        title: 'Sisterra',
        description: 'Социальное приложение, где девушки знакомятся, общаются и находят дружбу в безопасном проверенном сообществе',
        imageAlt: 'Sisterra — превью интерфейса социального приложения для девушек',
        tags: ['mobile', 'full-cycle', 'social'],
        image: 'case-2',
        video: '/cases/sisterra.mp4',
      },
      {
        title: 'Draft AI',
        description: 'ИИ-платформа для обучения детей с персональными программами по разным направлениям',
        imageAlt: 'Draft AI — превью интерфейса платформы обучения для детей',
        tags: ['web & mob', 'ui/ux design', 'growth'],
        image: 'case-3',
      },
    ],
  },
  brif: {
    title: 'Бриф проекта',
    description:
      'Расскажите основное о вашем проекте, чтобы мы могли изучить цели, объём и требования до первого звонка',
    steps: {
      productType: {
        title: 'Тип продукта',
        description: 'Какое решение мы создаём?',
        options: ['MVP', 'Сложное решение', 'Корпоративное ПО', 'Аудит и рефакторинг'],
      },
      readiness: {
        title: 'Стадия готовности',
        description: 'На каком этапе ваш проект?',
        options: ['Только идея', 'Техническое задание', 'Дизайн готов', 'Текущий проект'],
      },
      platform: {
        title: 'Платформа',
        description: 'Где пользователи будут взаимодействовать с продуктом?',
        options: ['Сайт', 'Мобильное приложение', 'Сайт и мобильное', 'Другое'],
      },
      industry: {
        title: 'Отрасль',
        description: 'К какой сфере бизнеса относится проект?',
        options: ['E-commerce', 'Недвижимость', 'FinTech', 'Соцсети', 'EdTech', 'SaaS', 'Здравоохранение', 'Другое'],
      },
      contact: {
        title: 'Обсудим ваш проект',
        description: 'Заполните форму, чтобы мы подготовили предложение для вас',
        name: 'Имя',
        projectName: 'Название проекта',
        email: 'Email',
        phone: '+998',
      },
    },
    next: 'Далее',
    back: 'Назад',
    send: 'Отправить',
    success: {
      title: 'Заявка получена',
      description: 'Спасибо! Мы изучим информацию и свяжемся с вами в течение 24 часов',
    },
    errors: {
      selectOption: 'Выберите один из вариантов, чтобы продолжить',
      otherEmpty: 'Опишите ваш вариант (минимум 3 символа)',
      name: 'Введите ваше имя (минимум 3 символа)',
      email: 'Введите корректный email — только латиница',
      phone: 'Введите полный номер телефона, например +998 90 123-45-67',
    },
    errorUnconfigured: 'Отправка формы ещё не настроена.',
  },
  seo: {
    homeTitle: 'AF Venture Studio — Студия дизайна и разработки продуктов',
    homeDescription:
      'AF Venture Studio создаёт MVP, AI-функции и продукты полного цикла. Стратегическое консультирование, UI/UX дизайн и поддержка роста — от идеи до масштаба.',
    homeOgTitle: 'AF Venture Studio — От идеи к продукту, от продукта к росту',
    homeOgDescription:
      'Студия дизайна и разработки продуктов. Делаем MVP, встраиваем AI в реальные сценарии и сопровождаем продукт от запуска до роста.',
  },
  footer: {
    brand: 'AF Venture studio',
    copyright: '© 2026',
    headings: {
      nav: 'Навигация',
      social: 'Соцсети',
    },
    nav: [
      { label: 'Услуги', href: '#services' },
      { label: 'Кейсы', href: '#cases' },
      { label: 'Бриф', href: '#contact' },
    ],
    social: [
      { label: 'LinkedIn', href: 'https://www.linkedin.com/company/af-venture-studio/posts/?feedView=all' },
      { label: 'Instagram', href: 'https://www.instagram.com/afventurestudio?igsh=MXB6MDZ3eGhnMzY3dQ==' },
      { label: 'Telegram', href: 'https://t.me/afvsdev' },
      { label: 'Email', href: '' },
      { label: 'Clutch', href: 'https://clutch.co/profile/af-venture-studio' },
    ],
  },
};
