# mp_vobraz — платформа памятных страниц

Сервис для создания памятных страниц с QR-кодом для установки на таблички памятников.

## Стек

- Next.js 15 (App Router), TypeScript, Tailwind CSS
- SQLite + Drizzle ORM
- Session auth (iron-session + bcrypt)
- QR: PNG + SVG (error correction H)

## Быстрый старт

```bash
cp .env.example .env
npm install
npm run db:setup
npm run dev
```

Откройте http://localhost:3000

**Админка:** http://localhost:3000/admin/login  
**Логин по умолчанию:** `admin@mp-vobraz.local` / `admin12345`

## Основные маршруты

| Маршрут | Назначение |
|---------|------------|
| `/` | Лендинг |
| `/m/[publicId]` | Постоянная ссылка для QR |
| `/memorial/[slug]` | SEO-страница |
| `/admin/*` | Админ-панель |

## QR-код

1. Создайте страницу памяти в админке
2. Загрузите фото и заполните контент
3. Нажмите **Опубликовать** — сгенерируются `publicId` и QR
4. Скачайте **SVG** для подрядчика (гравировка) или **PNG** для предпросмотра

QR всегда указывает на `{SITE_URL}/m/{publicId}` — slug можно менять без перепечатки таблички.

## Переменные окружения

| Переменная | Описание |
|------------|----------|
| `SITE_URL` | Базовый URL сайта (для QR и SEO) |
| `SESSION_SECRET` | Секрет сессии (мин. 32 символа) |
| `DATABASE_URL` | Путь к SQLite БД |
| `ADMIN_EMAIL` | Email первого админа (seed) |
| `ADMIN_PASSWORD` | Пароль первого админа (seed) |

## Деплой на VPS

### Docker

```bash
docker compose up -d --build
docker compose exec app npm run db:migrate
docker compose exec app npm run db:seed
```

### PM2 + Nginx

```bash
npm install
npm run db:setup
npm run build
pm2 start ecosystem.config.js
```

Пример Nginx:

```nginx
server {
    listen 80;
    server_name your-domain.ru;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

**Важно:** установите `SITE_URL=https://your-domain.ru` перед публикацией страниц.

## Хранилище файлов

- `/uploads/images` — фото
- `/uploads/qr` — QR-коды

Регулярно делайте бэкап папки `data/` (SQLite) и `uploads/`.

## Скрипты

```bash
npm run dev          # разработка
npm run build        # сборка
npm run start        # production
npm run db:generate  # генерация миграций
npm run db:migrate   # применение миграций
npm run db:seed      # создание админа
```
