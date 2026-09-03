# Taplux — Premium Mobile Landing Constructor

Создай мобильный лендинг за 5 минут. Без бэкенда, без билдов, без регистрации.

## 🚀 Запуск за 3 шага

### 1. Используй этот template
Нажми зелёную кнопку **"Use this template"** → **"Create a new repository"** вверху страницы GitHub. Это создаст твою копию репозитория.

### 2. Задеплой на Vercel
Зайди на [vercel.com/new](https://vercel.com/new), выбери свой новый репо и нажми **Deploy**. Через 30 секунд получишь публичную ссылку вида `my-taplux-site.vercel.app`.

### 3. Открой админку
Перейди по адресу `https://my-taplux-site.vercel.app/admin.html` (или добавь `?admin=1` к основному URL). Введи свой GitHub Personal Access Token, чтобы редактировать контент через визуальный конструктор.

## ✏️ Что внутри

- `index.html` — публичная страница, рендерится ядром Taplux
- `admin.html` — визуальный конструктор (drag-and-drop блоки, настройка дизайна)
- `js/core-loader.js` — тонкий загрузчик (3 КБ), тянет ядро с CDN
- `data.json` — контент твоего лендинга
- `vercel.json` — SPA rewrites для мульти-страниц

## 🔐 GitHub Personal Access Token

Нужен, чтобы админка могла сохранять изменения в `data.json` через GitHub API.

1. Открой [github.com/settings/tokens?type=beta](https://github.com/settings/tokens?type=beta)
2. **Generate new token** → Fine-grained
3. **Repository access**: Only select repositories → выбери свой `my-taplux-site`
4. **Permissions**: Contents = Read and Write
5. Скопируй токен (покажется только один раз)
6. Вставь в админку при первом входе

## 🧱 Что умеет

- 12 готовых блоков: avatar, link, text, divider, socials, banner, banner_pro, lists_pro, split_pro, hero_pro, offer_pro, qa, video, icon_text
- Drag-and-drop конструктор
- Multi-page (несколько страниц в одном деплое)
- Кастомные шрифты, цвета, отступы
- Live Preview при редактировании

## 📦 Лицензия

Шаблон бесплатный. Ядро конструктора (Taplux Core) лицензируется отдельно — тарифы **Starter / Pro / Premium**.

После покупки ключ вводится в админке. PRO-блоки становятся доступны сразу.

## 🔗 Полезные ссылки

- [Vercel Deploy](https://vercel.com/new) — деплой за 30 сек
- [GitHub PAT](https://github.com/settings/tokens?type=beta) — токен для админки
- [Документация Taplux](https://taplux.ru) — скоро

---

**Taplux** · сделано с ❤ для инста-блогеров, экспертов и малого бизнеса.
