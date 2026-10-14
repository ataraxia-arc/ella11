#!/bin/sh
# Run from the Laravel project root on the Caleho host, after .env exists.
set -eu

composer install --no-dev --optimize-autoloader --no-interaction

if [ ! -f .env ]; then
    echo "Copy .env.example to .env and set the MySQL credentials from the Caleho database panel before migrating."
    exit 1
fi

php artisan key:generate --force --ansi
php artisan migrate --force --ansi

if command -v npm >/dev/null 2>&1; then
    npm install --include=dev
    npm run build
    rm -rf node_modules
else
    echo "npm is not on PATH. Using the committed public/build assets."
fi

php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "StockWise build finished. Document root must be the public directory."
