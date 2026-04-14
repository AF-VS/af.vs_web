import type { Dict } from './en';

export const uz: Dict = {
  nav: {
    services: 'Xizmatlar',
    cases: 'Loyihalar',
    brif: 'Brif',
  },
  hero: {
    title: "G'oyadan mahsulotga, mahsulotdan o'sishga",
    cta: 'Boshlash',
    accentWords: ['mahsulotga', "o'sishga"],
  },
  services: {
    build: {
      title: 'Build',
      description: "G'oyadan ishga tayyor mahsulotgacha",
      tags: ['product discovery', 'ui/ux dizayn', 'MVP ishlab chiqish', "to'liq tsikl"],
    },
    ai: {
      title: 'AI',
      description: 'Haqiqiy mahsulot vazifalari uchun amaliy AI',
      tags: ['AI-funksiyalar', 'integratsiyalar'],
    },
    advisory: {
      title: 'Advisory',
      description: 'Mahsulot qarorlari uchun strategik yordam',
      tags: ['mahsulot strategiyasi', 'jarayonlarni sozlash'],
    },
    growth: {
      title: 'Growth',
      description: "Ishga tushirishdan uzoq muddatli o'sishgacha",
      tags: ['kengaytirish', 'yaxshilash', "qo'llab-quvvatlash", 'iteratsiya'],
    },
  },
  cases: {
    title: 'Oxirgi ishlarimiz',
    items: [
      {
        title: 'Memolink',
        description: "Foydalanuvchilarni interaktiv ijtimoiy tarmoq ilovasi orqali bog'lash",
        tags: ['web & mob', 'ui/ux dizayn', "o'sishni qo'llab-quvvatlash"],
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
    send: 'Yuborish',
    success: {
      title: "So'rov qabul qilindi",
      description: "Rahmat! Ma'lumotlarni ko'rib chiqamiz va 24 soat ichida siz bilan bog'lanamiz",
    },
    errorUnconfigured: "Forma yuborish hali sozlanmagan.",
  },
  footer: {
    brand: 'AF Venture studio',
    copyright: '© 2026',
    nav: [
      { label: 'Xizmatlar', href: '#services' },
      { label: 'Loyihalar', href: '#cases' },
      { label: 'Brif', href: '#contact' },
    ],
    social: [
      { label: 'LinkedIn', href: 'https://linkedin.com' },
      { label: 'Instagram', href: 'https://instagram.com' },
      { label: 'Telegram', href: 'https://t.me' },
      { label: 'Mail', href: 'mailto:hello@afvs.studio' },
      { label: 'Clutch', href: 'https://clutch.co' },
    ],
  },
};
