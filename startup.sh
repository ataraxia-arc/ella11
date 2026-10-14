#!/bin/sh
# Brings the StockWise preview back: MariaDB (MySQL) plus Laravel on port 8080.
set -eu

if curl -sf -o /dev/null --max-time 2 http://127.0.0.1:8080/; then
    exit 0
fi

PHP="${PHP:-/usr/local/bin/php}"
MDB="${MDB:-/opt/mariadb-11.4.8-linux-systemd-x86_64}"
DATADIR="${DATADIR:-/var/lib/stockwise-mysql}"

if [ -x "$MDB/bin/mariadbd" ]; then
    if ! "$MDB/bin/mariadb-admin" --socket=/tmp/mysql.sock ping >/dev/null 2>&1; then
        "$MDB/bin/mariadbd" \
            --datadir="$DATADIR" \
            --bind-address=127.0.0.1 \
            --port=3306 \
            --socket=/tmp/mysql.sock \
            --pid-file=/tmp/mysql.pid \
            --user=root \
            >/tmp/mysql.log 2>&1 &
        i=0
        while [ "$i" -lt 50 ]; do
            if "$MDB/bin/mariadb-admin" --socket=/tmp/mysql.sock ping >/dev/null 2>&1; then
                break
            fi
            i=$((i + 1))
            sleep 0.2
        done
    fi
fi

cd /workspace/stockwise
"$PHP" artisan serve --host=0.0.0.0 --port=8080 >/tmp/stockwise-serve.log 2>&1 &

i=0
while [ "$i" -lt 40 ]; do
    if curl -sf -o /dev/null --max-time 1 http://127.0.0.1:8080/; then
        exit 0
    fi
    i=$((i + 1))
    sleep 0.25
done

echo "StockWise did not answer on port 8080" >&2
exit 1
