<div align="center">
  <img src="public/favicon.svg" width=130px, height=130px>
  <h3>af.vs_web</h3>
  <p>Инновационные решения, адаптированные для вашего цифрового роста</p>
  <p>
    <img src="https://img.shields.io/badge/Astro-6.0-orange.svg" alt="Astro 6.0">
    <img src="https://img.shields.io/badge/Stack-Astro%20%2B%20Tailwind-blue.svg" alt="Stack">
    <img src="https://img.shields.io/badge/Architecture-Islands-brightgreen" alt="Architecture Islands">
    <img src="https://img.shields.io/badge/UI-Tailwind%204.0-blueviolet.svg" alt="UI Tailwind">
    <img src="https://img.shields.io/badge/Animation-Motion-yellow" alt="Animation">
  </p>
  <p>
    <img src="https://img.shields.io/badge/Language-TypeScript-blue" alt="TypeScript">
    <img src="https://img.shields.io/badge/I18n-Custom-orange" alt="I18n">
  </p>
</div>

---

<div align="left">
  <h3>О проекте</h3>
  <p>
    <b>af.vs_web</b> — это лендинг сайт, разработанный для привлечения клиентов. 
    Проект использует архитектуру островов (Islands Architecture) для минимизации клиентского JavaScript и обеспечения молниеносной загрузки страниц. 
    В основе лежит мощный стек на базе Astro и Tailwind CSS 4, дополненный сложными анимациями и полной поддержкой мультиязычности (RU/EN).
  </p>
  <hr>
  <h3>Секции</h3>
</div>

| <img src="src/screens/hero.png" width="200"/> | <img src="src/screens/services.png" width="200"/> | <img src="src/screens/cases.png" width="200"/> | <img src="src/screens/calculator.png" width="200"/> |
| --------------------------------------------- | ------------------------------------------------- | ---------------------------------------------- | --------------------------------------------------- |
| **Hero**                                      | **Services**                                      | **Portfolio**                                  | **Calculator**                                      |

<div align="left">
  <h3>Структура</h3>

  <pre>
    af.vs_web/
    ├── src/
    │   ├── components/    # Секции сайта (Hero, Services, etc.)
    │   ├── i18n/          # Система интернационализации
    │   ├── layouts/       # Базовые шаблоны страниц
    │   ├── pages/         # Роутинг (включая /ru)
    │   └── styles/        # Глобальные стили и Tailwind
    └── public/            # Статические ресурсы
  </pre>

  <h3>Установка</h3>
  <pre>
    git clone https://github.com/Yuldshev/af.vs_web
    npm install
    npm run dev
  </pre>
</div>
