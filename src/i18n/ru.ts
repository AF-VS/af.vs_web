import type { Dict } from './en';

export const ru: Dict = {
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
    build: {
      title: 'Разработка',
      description: 'От идеи до готового к запуску продукта',
      tags: ['product discovery', 'ui/ux дизайн', 'разработка MVP', 'полный цикл'],
    },
    ai: {
      title: 'ИИ',
      description: 'Практичный AI для реальных задач продукта',
      tags: ['AI-функции', 'интеграции'],
    },
    advisory: {
      title: 'Менторство',
      description: 'Стратегическая поддержка продуктовых решений',
      tags: ['продуктовая стратегия', 'настройка процессов'],
    },
    growth: {
      title: 'Рост',
      description: 'От запуска к долгосрочному росту продукта',
      tags: ['масштабирование', 'улучшение', 'поддержка', 'итерации'],
    },
  },
  cases: {
    title: 'Наши последние работы',
    items: [
      {
        title: 'Memolink',
        description: 'Социальная платформа для интерактивного общения пользователей',
        tags: ['web & mob', 'ui/ux дизайн', 'поддержка роста'],
        image: 'case-1',
        video: '/cases/memolink.mp4',
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
    send: 'Отправить',
    success: {
      title: 'Заявка получена',
      description: 'Спасибо! Мы изучим информацию и свяжемся с вами в течение 24 часов',
    },
    errorUnconfigured: 'Отправка формы ещё не настроена.',
  },
  footer: {
    brand: 'AF Venture studio',
    copyright: '© 2026',
    nav: [
      { label: 'Услуги', href: '#services' },
      { label: 'Кейсы', href: '#cases' },
      { label: 'Бриф', href: '#contact' },
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
