#!/usr/bin/env node
// VAPID鍵ペアを生成するヘルパースクリプト
// 使い方: node scripts/generate-vapid-keys.js
//
// 出力された公開鍵を js/common.js の VAPID_PUBLIC_KEY に設定し、
// 秘密鍵を GitHub Secrets の VAPID_PRIVATE_KEY に設定する。

const webpush = require('web-push');
const keys = webpush.generateVAPIDKeys();

console.log('=== VAPID Keys Generated ===\n');
console.log('Public Key (js/common.js に設定):');
console.log(keys.publicKey);
console.log('\nPrivate Key (GitHub Secrets VAPID_PRIVATE_KEY に設定):');
console.log(keys.privateKey);
console.log('\n=== 設定手順 ===');
console.log('1. js/common.js の VAPID_PUBLIC_KEY を上の Public Key に置き換える');
console.log('2. GitHub リポジトリ Settings → Secrets → VAPID_PUBLIC_KEY に Public Key を追加');
console.log('3. GitHub リポジトリ Settings → Secrets → VAPID_PRIVATE_KEY に Private Key を追加');
console.log('4. GitHub リポジトリ Settings → Secrets → VAPID_EMAIL に連絡先メールを追加');
