import test from 'ava';
import { kip7 } from '.';

import { buildKIP7, KIP7Options } from './kip7';
import { printContract } from './print';

function testKIP7(title: string, opts: Partial<KIP7Options>) {
  test(title, t => {
    const c = buildKIP7({
      name: 'MyToken',
      symbol: 'MTK',
      ...opts,
    });
    t.snapshot(printContract(c));
  });
}

/**
 * Tests external API for equivalence with internal API
 */
 function testAPIEquivalence(title: string, opts?: KIP7Options) {
  test(title, t => {
    t.is(kip7.print(opts), printContract(buildKIP7({
      name: 'MyToken',
      symbol: 'MTK',
      ...opts,
    })));
  });
}

testKIP7('basic kip7', {});

testKIP7('kip7 with snapshots', {
  snapshots: true,
});

testKIP7('kip7 burnable', {
  // burnable: true,
});

testKIP7('kip7 burnable with snapshots', {
  // burnable: true,
  snapshots: true,
});

testKIP7('kip7 pausable', {
  pausable: true,
  access: 'ownable',
});

testKIP7('kip7 pausable with roles', {
  pausable: true,
  access: 'roles',
});

testKIP7('kip7 burnable pausable', {
  // burnable: true,
  pausable: true,
});

testKIP7('kip7 burnable pausable with snapshots', {
  // burnable: true,
  pausable: true,
  snapshots: true,
});

testKIP7('kip7 preminted', {
  premint: '1000',
});

testKIP7('kip7 premint of 0', {
  premint: '0',
});

testKIP7('kip7 mintable', {
  mintable: true,
  access: 'ownable',
});

testKIP7('kip7 mintable with roles', {
  mintable: true,
  access: 'roles',
});

testKIP7('kip7 permit', {
  permit: true,
});

testKIP7('kip7 votes', {
  votes: true,
});

testKIP7('kip7 flashmint', {
  flashmint: true,
});

testKIP7('kip7 full', {
  premint: '2000',
  access: 'roles',
  // burnable: true,
  mintable: true,
  pausable: true,
  snapshots: true,
  permit: true,
  votes: true,
  flashmint: true,
});

testAPIEquivalence('kip7 API default');

testAPIEquivalence('kip7 API basic', { name: 'CustomToken', symbol: 'CTK' });

testAPIEquivalence('kip7 API full', {
  name: 'CustomToken',
  symbol: 'CTK',
  premint: '2000',
  access: 'roles',
  // burnable: true,
  mintable: true,
  pausable: true,
  snapshots: true,
  permit: true,
  votes: true,
  flashmint: true,
});

test('kip7 API assert defaults', async t => {
  t.is(kip7.print(kip7.defaults), kip7.print());
});

test('kip7 API isAccessControlRequired', async t => {
  t.is(kip7.isAccessControlRequired({ mintable: true }), true);
  t.is(kip7.isAccessControlRequired({ pausable: true }), true);
  t.is(kip7.isAccessControlRequired({ snapshots: true }), true);
});