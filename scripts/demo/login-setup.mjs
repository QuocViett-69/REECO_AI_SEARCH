// Gets the demo accounts ready to sign in on the client (5173) and admin (5174) apps.
//
//   npm run demo:login                          check config, accounts and a real sign-in
//   npm run demo:login -- --anon-key=<key>      also write the Supabase public anon key
//   npm run demo:login -- --fix-accounts        create/reset the 2 demo accounts (writes to Supabase Auth)
//
// Reads SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from apps/api/.env. The anon key is the
// public "anon"/"publishable" key from Supabase Dashboard → Project Settings → API; it can
// also come from SUPABASE_ANON_KEY. It is written to apps/client/.env.local and
// apps/admin/.env.local, which git ignores. Secret values are never printed.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createAdminClient, DEMO_PASSWORD, DEMO_USERS, findUserByEmail } from './seed-demo.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const APPS = ['apps/client', 'apps/admin'];
const USERNAMES = { customer: 'haitran' };

const args = process.argv.slice(2);
const fixAccounts = args.includes('--fix-accounts');
const anonArg = args.find((a) => a.startsWith('--anon-key='))?.slice('--anon-key='.length);

const ok = (msg) => console.log(`  ✓ ${msg}`);
const bad = (msg) => console.log(`  ✗ ${msg}`);
let problems = 0;
const fail = (msg) => {
  problems += 1;
  bad(msg);
};

function readEnv(file) {
  if (!fs.existsSync(file)) return {};
  return Object.fromEntries(
    fs
      .readFileSync(file, 'utf8')
      .split('\n')
      .map((line) => line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/))
      .filter(Boolean)
      .map(([, k, v]) => [k, v.replace(/^["']|["']$/g, '')]),
  );
}

// Sets keys in an env file, keeping every other line as it is
function writeEnv(file, values) {
  let text = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
  for (const [key, value] of Object.entries(values)) {
    const line = `${key}=${value}`;
    const pattern = new RegExp(`^\\s*${key}\\s*=.*$`, 'm');
    if (pattern.test(text)) text = text.replace(pattern, line);
    else text = `${text}${text && !text.endsWith('\n') ? '\n' : ''}${line}\n`;
  }
  fs.writeFileSync(file, text);
}

// Which env value a CRA dev server would use (.env.local wins over .env)
function appEnv(app) {
  return { ...readEnv(path.join(rootDir, app, '.env')), ...readEnv(path.join(rootDir, app, '.env.local')) };
}

function isServiceRoleKey(key) {
  if (key.startsWith('sb_secret_')) return true;
  try {
    return JSON.parse(Buffer.from(key.split('.')[1], 'base64url').toString()).role === 'service_role';
  } catch {
    return false;
  }
}

async function signIn(url, anonKey, email) {
  const response = await fetch(`${url}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: anonKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: DEMO_PASSWORD }),
  });
  const data = await response.json().catch(() => ({}));
  return { status: response.status, data };
}

async function main() {
  const apiEnv = readEnv(path.join(rootDir, 'apps/api/.env'));
  const url = (process.env.SUPABASE_URL || apiEnv.SUPABASE_URL || '').replace(/\/$/, '');
  process.env.SUPABASE_URL = url;
  process.env.SUPABASE_SERVICE_ROLE_KEY ||= apiEnv.SUPABASE_SERVICE_ROLE_KEY || '';

  console.log('1. Supabase config');
  if (!url || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    fail('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required in apps/api/.env');
    return;
  }
  ok(`project ${new URL(url).host}`);

  // The anon key: --anon-key, then SUPABASE_ANON_KEY, then whatever an app already has
  const existingAnon = APPS.map((app) => appEnv(app).REACT_APP_SUPABASE_ANON_KEY).find(Boolean);
  const anonKey = anonArg || process.env.SUPABASE_ANON_KEY || existingAnon || '';
  if (anonKey && isServiceRoleKey(anonKey)) {
    fail('that key is the service-role key; the browser apps need the public anon key');
    return;
  }

  console.log('\n2. Client and admin env');
  for (const app of APPS) {
    const env = appEnv(app);
    const updates = {};
    if (env.REACT_APP_SUPABASE_URL !== url) updates.REACT_APP_SUPABASE_URL = url;
    if (anonKey && env.REACT_APP_SUPABASE_ANON_KEY !== anonKey) updates.REACT_APP_SUPABASE_ANON_KEY = anonKey;
    if (Object.keys(updates).length) {
      writeEnv(path.join(rootDir, app, '.env.local'), updates);
      ok(`${app}/.env.local: set ${Object.keys(updates).join(', ')} (restart that dev server)`);
    } else if (anonKey) {
      ok(`${app}: already configured`);
    }
  }
  if (!anonKey) {
    fail(
      'REACT_APP_SUPABASE_ANON_KEY is missing. Copy the anon/publishable key from Supabase Dashboard →\n' +
        '    Project Settings → API, then run: npm run demo:login -- --anon-key=<key>',
    );
  }

  console.log(`\n3. Demo accounts${fixAccounts ? ' (creating/resetting)' : ''}`);
  const supabase = createAdminClient();
  for (const { email, role, ...profile } of DEMO_USERS) {
    const user = await findUserByEmail(supabase, email);
    const healthy = user && user.app_metadata?.role === role && user.email_confirmed_at;
    if (fixAccounts) {
      const attributes = { password: DEMO_PASSWORD, email_confirm: true, user_metadata: profile };
      const { error } = user
        ? await supabase.auth.admin.updateUserById(user.id, {
            ...attributes,
            app_metadata: { ...user.app_metadata, role },
          })
        : await supabase.auth.admin.createUser({ email, ...attributes, app_metadata: { role } });
      if (error) fail(`${email}: ${error.message}`);
      else ok(`${user ? 'reset' : 'created'} ${role} ${email}`);
    } else if (!user) {
      fail(`${role} ${email} does not exist (run with --fix-accounts)`);
    } else if (!healthy) {
      fail(`${role} ${email} has the wrong role or is unconfirmed (run with --fix-accounts)`);
    } else {
      ok(`${role} ${email}`);
    }
  }

  console.log('\n4. Sign-in test');
  if (!anonKey) {
    bad('skipped: needs the anon key');
    return;
  }
  for (const { email, role } of DEMO_USERS) {
    const { status, data } = await signIn(url, anonKey, email);
    if (status === 401 && /api key/i.test(JSON.stringify(data))) {
      fail('Supabase rejected the anon key; check that it belongs to this project');
      return;
    }
    if (!data.access_token) {
      fail(`${email}: ${data.error_description || data.msg || data.message || `HTTP ${status}`}` +
        (fixAccounts ? '' : ' (run with --fix-accounts to reset the password)'));
    } else if (data.user?.app_metadata?.role !== role) {
      fail(`${email}: signed in but role is "${data.user?.app_metadata?.role}" instead of "${role}"`);
    } else {
      ok(`${email} signs in as ${role}`);
    }
  }
}

main()
  .catch((error) => fail(error.message ?? String(error)))
  .finally(() => {
    if (problems) {
      console.log(`\n${problems} problem(s) to fix before signing in.`);
      process.exitCode = 1;
      return;
    }
    const password = process.env.DEMO_PASSWORD ? 'the DEMO_PASSWORD value' : DEMO_PASSWORD;
    console.log('\nReady. Sign in with:');
    console.log(`  Customer  http://localhost:5173/login   ${USERNAMES.customer} / ${password}`);
    console.log(`  Admin     http://localhost:5174         admin@reeco.vn / ${password}`);
  });
