// dsh-sidebar-expand — 自测。
//
// 这个仓库只有 bundle 清单，没有插件代码，所以自测做的是「清单是否自洽」：
//   · package.json 是合法的 DSH bundle（dsh.bundle.patch、manifestVersion、无 client 半）
//   · cordis.patch.yml 插的行与 dependencies 一一对应、id 唯一、版本精确钉死
//   · 组件的行 id 与组件自己的 patch 一致（换 bundle 后用户的开关覆盖仍然有效）
//   · locale / icon / 发布文件清单 / exports 都在位
//
// 运行：node --test test/verify.mjs

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
const patchText = readFileSync(join(ROOT, 'cordis.patch.yml'), 'utf8');

/** 组件行：id 必须与组件包自己的 bundle patch 一致，name 必须是裸包名。 */
const EXPECTED_ROWS = [
  { id: 'sidebar-marks', name: 'dsh-sidebar-marks', version: '0.1.1' },
  { id: 'active-sessions', name: 'dsh-active-sessions', version: '0.1.1' },
  { id: 'dsh-sidebar-shortcuts', name: 'dsh-sidebar-shortcuts', version: '0.1.0' },
  { id: 'dsh-back-to-chat', name: 'dsh-back-to-chat', version: '0.1.1' }
];

/** 把本仓库的 bundle patch 解析成 [{id, name}]；只认 `- insert:` 下的 id/name 行。 */
function parseBundleRows(text) {
  const rows = [];
  let current = null;
  let inInsert = false;
  for (const raw of text.split('\n')) {
    const line = raw.replace(/\s+#.*$/, '').trimEnd();
    if (!line.trim() || line.trimStart().startsWith('#')) continue;
    if (/^- insert:\s*$/.test(line)) {
      inInsert = true;
      continue;
    }
    if (!inInsert) continue;
    const id = /^\s*-\s+id:\s*(\S+)\s*$/.exec(line);
    if (id) {
      current = { id: id[1] };
      rows.push(current);
      continue;
    }
    const name = /^\s+name:\s*(\S+)\s*$/.exec(line);
    if (name && current) current.name = name[1];
  }
  return rows;
}

const EXACT_VERSION = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/;

test('package.json 是一个合法的 DSH bundle 清单', () => {
  assert.equal(pkg.name, 'dsh-sidebar-expand');
  assert.match(pkg.version, EXACT_VERSION);
  assert.equal(pkg.license, 'MIT');
  assert.equal(pkg.private, false);
  assert.equal(pkg.dsh.manifestVersion, 1);
  assert.equal(pkg.dsh.bundle.patch, './cordis.patch.yml');
  // 组合包不承载任何浏览器半：这是它只当 bundle 层、不注册 entry 的关键。
  assert.equal(pkg.dsh.client, undefined);
  assert.equal(pkg.main, undefined);
  assert.equal(typeof pkg.description, 'string');
  assert.ok(pkg.description.length > 20);
});

test('cordis.patch.yml 插的行与依赖一一对应', () => {
  const rows = parseBundleRows(patchText);
  assert.deepEqual(
    rows,
    EXPECTED_ROWS.map(({ id, name }) => ({ id, name })),
    'patch 行必须与 EXPECTED_ROWS 完全一致'
  );
  const ids = rows.map((row) => row.id);
  assert.equal(new Set(ids).size, ids.length, '行 id 不能重复');
  const names = rows.map((row) => row.name);
  assert.equal(new Set(names).size, names.length, '同一个包不能插两行');
});

test('每个组件都作为精确版本的依赖出现', () => {
  const deps = pkg.dependencies ?? {};
  assert.deepEqual(
    Object.keys(deps).sort(),
    EXPECTED_ROWS.map((row) => row.name).sort(),
    'dependencies 必须正好是这些组件'
  );
  for (const row of EXPECTED_ROWS) {
    assert.equal(deps[row.name], row.version, `${row.name} 必须钉死到 ${row.version}`);
  }
  for (const [name, version] of Object.entries(deps)) {
    assert.match(version, EXACT_VERSION, `${name} 的版本必须是精确版本（不能 ^ ~ *）`);
  }
});

test('组件行用的都是裸包名（client 半要靠它挂载）', () => {
  for (const row of parseBundleRows(patchText)) {
    assert.ok(!row.name.includes('/'), `${row.name} 不应是子路径`);
    assert.ok(row.name in pkg.dependencies, `${row.name} 必须在 dependencies 里`);
  }
});

test('locale、icon 与发布文件清单齐全', () => {
  for (const file of ['cordis.patch.yml', 'icon.svg', 'README.md', 'README_EN.md', 'LICENSE', 'CHANGELOG.md']) {
    assert.ok(existsSync(join(ROOT, file)), `缺少文件 ${file}`);
    assert.ok(pkg.files.includes(file), `files 里缺少 ${file}`);
  }
  assert.ok(pkg.files.includes('locale/*.json'), 'files 必须包含 locale/*.json');
  const locals = ['zh', 'en'].map((lang) => JSON.parse(readFileSync(join(ROOT, 'locale', `${lang}.json`), 'utf8')));
  for (const [index, locale] of locals.entries()) {
    assert.equal(typeof locale.meta?.title, 'string', `locale[${index}] 缺少 meta.title`);
    assert.equal(typeof locale.meta?.description, 'string', `locale[${index}] 缺少 meta.description`);
  }
  assert.equal(pkg.exports['./cordis.patch.yml'], './cordis.patch.yml');
  assert.equal(pkg.exports['./locale/*.json'], './locale/*.json');
  assert.equal(pkg.exports['./package.json'], './package.json');
});

test('README 写清了安装与「不要和单装组件同时用」', () => {
  const zh = readFileSync(join(ROOT, 'README.md'), 'utf8');
  const en = readFileSync(join(ROOT, 'README_EN.md'), 'utf8');
  for (const text of [zh, en]) {
    assert.ok(text.includes('dsh-sidebar-expand'), '安装说明必须提到包名');
    assert.ok(text.includes('dsh-sidebar-marks'), '组件表必须列出组件');
  }
  assert.ok(/不要和单独安装|不要同时|先卸载它们/.test(zh), '中文 README 必须提示与单装互斥');
  assert.ok(/Do not install|uninstall the standalone/i.test(en), '英文 README 必须提示与单装互斥');
  assert.ok(/插件/.test(zh) && /Plugins page/.test(en), 'README 必须说明组件开关在哪');
});
