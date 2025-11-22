#!/bin/bash
set -a
source .env.local
set +a
npx tsx scripts/check-database.ts
