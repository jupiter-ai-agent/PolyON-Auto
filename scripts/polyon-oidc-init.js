#!/usr/bin/env node
/**
 * PolyON-Auto OIDC 설정 DB 주입
 * N8N_OIDC_* env를 읽어 n8n Settings 테이블에 features.oidc 로 저장한다.
 * n8n Cipher와 동일한 AES-256-CBC 암호화로 clientSecret을 저장한다.
 */

const crypto = require('crypto');

const OIDC_KEY = 'features.oidc';
const RANDOM_BYTES = Buffer.from('53616c7465645f5f', 'hex'); // Salted__

function getKeyAndIv(salt, encryptionKey) {
  const password = Buffer.concat([Buffer.from(encryptionKey, 'binary'), salt]);
  const hash1 = crypto.createHash('md5').update(password).digest();
  const hash2 = crypto.createHash('md5').update(Buffer.concat([hash1, password])).digest();
  const iv = crypto.createHash('md5').update(Buffer.concat([hash2, password])).digest();
  const key = Buffer.concat([hash1, hash2]);
  return [key, iv];
}

function encrypt(plainText, encryptionKey) {
  const salt = crypto.randomBytes(8);
  const [key, iv] = getKeyAndIv(salt, encryptionKey);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  const encrypted = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);
  return Buffer.concat([RANDOM_BYTES, salt, encrypted]).toString('base64');
}

async function main() {
  const discoveryUrl = process.env.N8N_OIDC_DISCOVERY_URL;
  const clientId = process.env.N8N_OIDC_CLIENT_ID;
  const clientSecret = process.env.N8N_OIDC_CLIENT_SECRET;
  const encryptionKey = process.env.N8N_ENCRYPTION_KEY;

  if (!discoveryUrl || !clientId || !clientSecret || !encryptionKey) {
    console.log('PolyON OIDC init: N8N_OIDC_* 또는 N8N_ENCRYPTION_KEY 미설정, 스킵');
    return;
  }

  const tablePrefix = (process.env.DB_TABLE_PREFIX || '').replace(/[^a-z0-9_]/gi, '');
  const tableName = tablePrefix ? `${tablePrefix}settings` : 'settings';

  const clientSecretEncrypted = encrypt(clientSecret, encryptionKey);
  const value = JSON.stringify({
    clientId,
    clientSecret: clientSecretEncrypted,
    discoveryEndpoint: discoveryUrl,
    loginEnabled: true,
    prompt: 'select_account',
    authenticationContextClassReference: [],
  });

  const { Client } = require('pg');
  const client = new Client({
    host: process.env.DB_POSTGRESDB_HOST || 'localhost',
    port: parseInt(process.env.DB_POSTGRESDB_PORT || '5432', 10),
    database: process.env.DB_POSTGRESDB_DATABASE || 'auto',
    user: process.env.DB_POSTGRESDB_USER || 'postgres',
    password: process.env.DB_POSTGRESDB_PASSWORD || '',
  });

  try {
    await client.connect();
    await client.query(
      `INSERT INTO "${tableName}" ("key", "value", "loadOnStartup") VALUES ($1, $2, true)
       ON CONFLICT ("key") DO UPDATE SET "value" = EXCLUDED.value, "loadOnStartup" = EXCLUDED."loadOnStartup"`,
      [OIDC_KEY, value]
    );
    console.log('PolyON OIDC init: features.oidc 설정을 DB에 반영했습니다.');
  } catch (err) {
    console.error('PolyON OIDC init 실패:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
