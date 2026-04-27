import type { Dict } from './en';

export const uz: Dict = {
  a11y: {
    skipToContent: 'Mazmunga oʻtish',
  },
  nav: {
    services: 'Xizmatlar',
    cases: 'Loyihalar',
    brif: 'Brif',
  },
  hero: {
    title: "G'oyadan mahsulotga<br>Mahsulotdan o'sishga",
    cta: 'Boshlash',
    accentWords: ['mahsulotga', "o'sishga"],
  },
  services: {
    kickerLabel: 'Xizmatlar / 02',
    headTitle: "To'rt yo'nalish. <em>Bitta shartnoma.</em>",
    ctaLabel: 'Muhokama qilish',
    build: {
      title: 'Build',
      description: "G'oyadan ishga tayyor mahsulotgacha",
      tags: ['mahsulotni tadqiq qilish', 'ux/ui dizayn', 'MVP ishlab chiqish', "to'liq tsikl ishlab chiqish"],
    },
    ai: {
      title: 'AI',
      description: 'Haqiqiy mahsulot vazifalari uchun amaliy AI',
      tags: ['AI-funksiyalar', 'jarayonlarni avtomatlashtirish', 'xizmatlar integratsiyasi', 'mahsulotni optimallashtirish'],
    },
    advisory: {
      title: 'Advisory',
      description: 'Mahsulot qarorlari uchun strategik yordam',
      tags: ['mahsulot strategiyasi', 'texnik rejalashtirish', 'jarayonlarni sozlash', 'investitsiyaga tayyorgarlik'],
    },
    growth: {
      title: 'Growth',
      description: "Ishga tushirishdan uzoq muddatli o'sishgacha",
      tags: ['funksiyalarni kengaytirish', 'mahsulotni yaxshilash', "qo'llab-quvvatlash va xizmat ko'rsatish", 'uzluksiz rivojlantirish'],
    },
  },
  cases: {
    title: 'Oxirgi ishlarimiz',
    headTitle: 'Tanlangan <em>ishlar.</em>',
    items: [
      {
        title: 'Memolink',
        description: "Foydalanuvchilarni interaktiv ijtimoiy tarmoq ilovasi orqali bog'lash",
        imageAlt: "Memolink — ijtimoiy tarmoq ilovasi interfeysi ko'rinishi",
        tags: ['web & mob', 'ui/ux dizayn', "o'sishni qo'llab-quvvatlash"],
        image: 'case-1',
        video: '/cases/memolink.mp4',
      },
      {
        title: 'Sisterra',
        description: "Qizlar tanishadigan, muloqot qiladigan va do'stlashadigan ijtimoiy ilova — xavfsiz va tekshirilgan jamiyat ichida",
        imageAlt: "Sisterra — qizlar uchun ijtimoiy ilova interfeysi ko'rinishi",
        tags: ['mobile', 'full-cycle', 'social'],
        image: 'case-2',
        video: '/cases/sisterra.mp4',
      },
      {
        title: 'Draft AI',
        description: "Bolalarni turli yo'nalishlar bo'yicha o'qitish uchun shaxsiy dasturlarga ega AI platforma",
        imageAlt: "Draft AI — bolalar uchun o'quv platformasi interfeysi ko'rinishi",
        tags: ['web & mob', 'ui/ux design', 'growth'],
        image: 'case-3',
      },
    ],
  },
  brif: {
    title: 'Loyiha brifi',
    description:
      "Birinchi qo'ng'iroqdan oldin maqsadlaringiz, ko'lami va talablaringizni ko'rib chiqishimiz uchun loyihangiz haqida asosiy ma'lumotlarni ulashing",
    steps: {
      productType: {
        title: 'Mahsulot turi',
        description: 'Qanday yechim yaratmoqdamiz?',
        options: ['MVP', 'Murakkab yechim', 'Korporativ dastur', 'Audit va refaktoring'],
      },
      readiness: {
        title: 'Tayyorlik bosqichi',
        description: 'Loyihangiz qaysi bosqichda?',
        options: ["Faqat g'oya", 'Texnik topshiriq', 'Dizayn tayyor', 'Joriy loyiha'],
      },
      platform: {
        title: 'Platforma',
        description: "Foydalanuvchilar mahsulot bilan qayerda o'zaro aloqa qiladi?",
        options: ['Veb-sayt', 'Mobil ilova', 'Veb va mobil', 'Boshqa'],
      },
      industry: {
        title: 'Soha',
        description: 'Loyiha qaysi biznes sohasiga tegishli?',
        options: ['E-commerce', "Ko'chmas mulk", 'FinTech', 'Ijtimoiy tarmoq', 'EdTech', 'SaaS', "Sog'liqni saqlash", 'Boshqa'],
      },
      contact: {
        title: 'Loyihangizni muhokama qilaylik',
        description: "Siz uchun taklif tayyorlashimiz uchun formani to'ldiring",
        name: 'Ism',
        projectName: 'Loyiha nomi',
        email: 'Email',
        phone: '+998',
      },
    },
    next: 'Keyingi',
    back: 'Orqaga',
    send: 'Yuborish',
    success: {
      title: "So'rov qabul qilindi",
      description: "Rahmat! Ma'lumotlarni ko'rib chiqamiz va 24 soat ichida siz bilan bog'lanamiz",
    },
    errorUnconfigured: "Forma yuborish hali sozlanmagan.",
  },
  seo: {
    homeTitle: 'AF Venture Studio — Mahsulot dizayni va ishlab chiqish studiyasi',
    homeDescription:
      "AF Venture Studio MVP, AI asosidagi imkoniyatlar va to'liq tsikl mahsulotlarini yaratadi. Mahsulot strategiyasi, UI/UX dizayn va o'sish qo'llab-quvvatlashi — g'oyadan miqyosgacha.",
    homeOgTitle: "AF Venture Studio — G'oyadan mahsulotga, mahsulotdan o'sishga",
    homeOgDescription:
      "Mahsulot dizayni va ishlab chiqish studiyasi. MVP yaratamiz, AI ni real stsenariylarga integratsiya qilamiz va mahsulotni ishga tushirishdan o'sishgacha qo'llab-quvvatlaymiz.",
  },
  footer: {
    brand: 'AF Venture studio',
    copyright: '© 2026',
    headings: {
      nav: 'Navigatsiya',
      social: 'Ijtimoiy tarmoqlar',
    },
    nav: [
      { label: 'Xizmatlar', href: '#services' },
      { label: 'Loyihalar', href: '#cases' },
      { label: 'Brif', href: '#contact' },
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
