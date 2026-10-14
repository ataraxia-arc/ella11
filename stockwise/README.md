# StockWise

Product inventory for a small stockroom. One Laravel application serves the React pages and the JSON API on the same domain. Accounts, products, and activity are stored in MySQL.

## Pages

| Page | Path | What it does |
| --- | --- | --- |
| Home | `/` | Navigation, hero, feature overview, how the stockroom works, footer |
| Register / login | `/register`, `/login` | Creates and resumes an account. Logout is in the sidebar |
| Dashboard | `/dashboard` | Product count, units on hand, inventory value, low-stock list, recent activity |
| Products | `/products` | Create, search, update, and delete products |

Refreshing `/dashboard` or `/products` returns the same HTML shell. React Router then opens the right page. API routes stay under `/api` and are not swallowed by the page shell.

## Stack

| Piece | Version used in this project |
| --- | --- |
| PHP | `^8.2` (built and tested here on 8.4.23) |
| Laravel | 12.70 |
| React | 19 |
| React Router | 7 |
| Tailwind CSS | 4, compiled by Vite through Laravel's Vite plugin |
| Database | MySQL-compatible. Tested on MariaDB 11.4.8 |

Laravel 11 was not used. On 14 October 2026, Composer refused `laravel/framework` 11.31 through 11.57 because of published security advisories. Laravel 12 still requires only PHP 8.2 or newer, which is the wider choice if a host is not on PHP 8.4.

There is no separate Node server in production. `npm run build` writes the CSS and JavaScript into `public/build`. Those compiled files are committed so the interface can load even if a host skips npm. `composer install` is still required.

## Caleho.cloud — what was verified, and what was not

Checked against the public site on 14 October 2026 (`https://www.caleho.cloud`):

- Caleho Host deploys from GitHub. Their own FAQ says: connect GitHub, choose the repository and branch, and Caleho clones it, runs Composer or npm build steps, and publishes it to your subdomain.
- Their FAQ says a Laravel application can be hosted **if** the plan's PHP version, database, extensions, and server configuration meet what the app needs. They do not publish those customer-runtime versions.
- The marketing site itself reports `laravelVersion` 11.51.0 and `phpVersion` 8.4.25. That is the version of **Caleho's website**, not a promise about the PHP given to customer sites.
- Plans shown on the homepage:
  - **Student** — 1 site, 1 subdomain, 50MB NVMe, 1 MySQL database (50MB), free SSL. From ₱129/month.
  - **Pro** — 3 sites, 200MB NVMe, 1 MySQL database (100MB), automated Git push sync, free SSL.
  - **Enterprise** — custom, automated Git and priority sync.
- No public page listed the MySQL/MariaDB version, the PHP extensions on customer sites, or a control for the document root.

This repository does **not** claim guaranteed compatibility with Caleho. Use the requirements below when you open a support ticket or the site CLI.

### What the app needs from the host

- PHP 8.2, 8.3, or 8.4 with `ctype`, `curl`, `dom`, `fileinfo`, `mbstring`, `openssl`, `pdo`, `pdo_mysql`, `tokenizer`, `xml`, and `bcmath`.
- A MySQL or MariaDB database. SQLite is not the application database.
- The domain's **document root set to the `public` directory**. `public/index.php` is the only front controller. `.env`, `vendor`, and the rest of the project must not be web-accessible.
- Composer 2 to install PHP dependencies.
- Writable `storage/` and `bootstrap/cache/`.
- No long-running queue worker. The queue driver is `sync`.

### Disk size

A development checkout of `vendor/` is about 72MB because it includes PHPUnit and the other dev tools. `composer install --no-dev` removes those, but the production tree, storage, and logs can still pass the Student plan's **50MB** disk. Prefer the **Pro** plan (200MB). The build script deletes `node_modules` after `npm run build` so the Node toolchain does not stay on disk. Compiled assets are already in `public/build` (about 340KB).

## Deploy to Caleho from GitHub

The GitHub repository root must be this folder: `composer.json`, `artisan`, and `public/` sit at the top, not inside another directory.

1. Create a repository and push this project. Do not commit `.env`.

   ```bash
   git init
   git add .
   git commit -m "Add StockWise inventory app"
   git branch -M main
   git remote add origin git@github.com:YOUR_USER/stockwise.git
   git push -u origin main
   ```

2. Create a Caleho account and choose a plan. Pro is the realistic size for Laravel.
3. In the Caleho panel, create the MySQL database and copy the host, port, database name, username, and password.
4. Connect GitHub and deploy the `main` branch.
5. Set the site document root to `public`. If the panel has no document-root field, ask Caleho support to point the site at `public`. A root `.htaccess` rewrites into `public/` on Apache only. Caleho's own site is served by nginx, and nginx ignores `.htaccess`, so the document root still has to be `public`. An example nginx site is in [deploy/nginx.conf.example](deploy/nginx.conf.example).
6. On the server, create `.env` from the example and fill in the database values from the panel. Never put those values in React code or in git.

   ```bash
   cp .env.example .env
   # edit DB_HOST, DB_PORT, DB_DATABASE, DB_USERNAME, DB_PASSWORD, APP_URL
   ```

7. Run the build. If the host has a build-command field, use:

   ```bash
   sh deploy/caleho-build.sh
   ```

   That script runs `composer install --no-dev`, `php artisan key:generate`, `php artisan migrate --force`, an npm production build when npm exists, then caches config, routes, and views.

8. Confirm `storage/` and `bootstrap/cache/` are writable by PHP.
9. Open the site, register an account, add a product, refresh `/products`, and sign in again. The new product should still be there. That is the MySQL check. It cannot be completed until the host database exists.

If Caleho's builder does not run shell commands, use the website CLI (their panel exposes a per-site CLI) and run the same steps by hand.

## Local setup

Requirements: PHP 8.2+ with the extensions above, Composer, Node 20+, and MySQL or MariaDB.

```bash
composer install
cp .env.example .env
php artisan key:generate
```

Edit `.env` so `DB_*` points at a real database, then:

```bash
php artisan migrate
php artisan db:seed   # optional sample stockroom
npm install
npm run build
php artisan serve
```

Optional sample account after seeding:

- Email: `clerk@stockwise.test`
- Password: `password`

Change or delete that account before a public demo. Seeding is not part of the Caleho build script.

`npm run dev` starts Vite for frontend work. Production and the Caleho deploy use `npm run build` only.

## API

All mutating requests need the session cookie and the `X-XSRF-TOKEN` header copied from the `XSRF-TOKEN` cookie. The React client does this. Passwords are hashed. The database password never leaves `.env`.

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| POST | `/api/register` | no | Create an account and sign in |
| POST | `/api/login` | no | Sign in |
| POST | `/api/logout` | yes | Sign out |
| GET | `/api/user` | session, if any | `{ "user": null }` when signed out, otherwise the current account |
| GET | `/api/dashboard` | yes | Counts, low stock, activity |
| GET | `/api/products?q=` | yes | List or search this account's products |
| POST | `/api/products` | yes | Create |
| GET | `/api/products/{id}` | yes | Read one |
| PUT | `/api/products/{id}` | yes | Update |
| DELETE | `/api/products/{id}` | yes | Delete |

Each account sees only its own products. A request for someone else's id returns 404.

## Tests run in this workspace

`php artisan test` was run against MariaDB 11.4.8 (MySQL protocol), not SQLite and not the browser's localStorage. The suite registers a user, writes a product, searches it, updates the quantity, deletes it, checks the row is gone, rejects a bad password, and blocks one account from editing another's product. The home page and `/dashboard` both return the React shell.

What still depends on the real host:

- Whether Caleho's customer PHP is 8.2 or newer and has `pdo_mysql`.
- The MySQL hostname, which may not be `127.0.0.1`.
- Whether you can set the document root to `public`.
- Whether the build hook actually runs `deploy/caleho-build.sh`.

## Project layout

```text
app/Http/Controllers/Api   register, login, dashboard, products
database/migrations        users, sessions, products, activity
resources/js               React pages
resources/views/app.blade.php
public/                    document root, compiled assets, front controller
routes/api.php             /api endpoints
routes/web.php             SPA fallback
deploy/caleho-build.sh     production install, migrate, asset build
```
