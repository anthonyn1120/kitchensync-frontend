#!/bin/sh
# Rebuild the web export and stage it with the phone-frame demo page at /demo.
# Deploy: cd presentation/batchmatch-demo && vercel link --yes --project kitchen-sync-demo && vercel deploy --prod
# (Live at https://kitchen-sync-demo.vercel.app/demo. Leave the legacy batchmatch-demo project alone; printed QR codes use it.)
set -e
cd "$(dirname "$0")/.."
rm -rf dist presentation/batchmatch-demo
npx expo export --platform web --clear
cp -R dist presentation/batchmatch-demo
cp -R presentation/demo-site/. presentation/batchmatch-demo/
# Vercel never uploads folders named node_modules, which is where Expo puts font/icon assets.
mv presentation/batchmatch-demo/assets/node_modules presentation/batchmatch-demo/assets/nm
sed -i '' 's#/assets/node_modules/#/assets/nm/#g' presentation/batchmatch-demo/_expo/static/js/web/*.js
