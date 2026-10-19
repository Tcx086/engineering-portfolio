#!/bin/sh
set -eu
export LC_ALL=C
[ "$#" -eq 2 ] || { echo 'Usage: install-publisher.sh /absolute/node /absolute/private-config.json' >&2; exit 2; }
node=$(realpath "$1")
config=$(realpath "$2")
root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
for path in "$node" "$config" "$root"; do
  case "$path" in *[!A-Za-z0-9_./-]*) echo 'Unsupported cron path' >&2; exit 2;; esac
done
[ -x "$node" ] && [ -r "$config" ]
for tool in crontab flock timeout nice ionice; do command -v "$tool" >/dev/null; done
if current=$(crontab -l 2>&1); then :
elif [ "$current" = "no crontab for $(id -un)" ]; then current=''
else printf '%s\n' "$current" >&2; exit 1
fi
case "$current" in *'# portfolio-public-telemetry'*) echo 'Publisher job already exists; inspect it before updating.' >&2; exit 1;; esac
job="* * * * * (PATH=/usr/bin:/bin; export PATH; umask 077; ulimit -t 5; flock -n '$root/publisher.lock' timeout -k 2s 20s nice -n 19 ionice -c 3 '$node' --max-old-space-size=64 '$root/telemetry/exporter.mjs' --once --config '$config') > '$root/last-run.log' 2>&1 # portfolio-public-telemetry"
printf '%s\n%s\n' "$current" "$job" | crontab -
echo 'Installed independent per-minute publisher job.'
