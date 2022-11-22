import test from 'ava';
import { kip17 } from '.';

import { buildKIP17, KIP17Options } from './kip17';
import { printContract } from './print';

function testKIP17(title: string, opts: Partial<KIP17Options>) {
  test(title, t => {
    const c = buildKIP17({
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
 function testAPIEquivalence(title: string, opts?: KIP17Options) {
  test(title, t => {
    t.is(kip17.print(opts), printContract(buildKIP17({
      name: 'MyToken',
      symbol: 'MTK',
      ...opts,
    })));
  });
}

testKIP17('basic', {});

testKIP17('base uri', {
  baseUri: 'https://gateway.pinata.cloud/ipfs/QmcP9hxrnC1T5ATPmq2saFeAM1ypFX9BnAswCdHB9JCjLA/',
});

testKIP17('enumerable', {
  enumerable: true,
});

testKIP17('uri storage', {
  uriStorage: true,
});

testKIP17('mintable + uri storage', {
  mintable: true,
  uriStorage: true,
});

testKIP17('mintable + uri storage + incremental', {
  mintable: true,
  uriStorage: true,
  incremental: true,
});

testKIP17('burnable', {
  burnable: true,
});

testKIP17('burnable + uri storage', {
  uriStorage: true,
  burnable: true,
});

testKIP17('pausable', {
  pausable: true,
});

testKIP17('mintable', {
  mintable: true,
});

testKIP17('mintable + roles', {
  mintable: true,
  access: 'roles',
});

testKIP17('mintable + incremental', {
  mintable: true,
  incremental: true,
});

testKIP17('votes', {
  votes: true,
});

testKIP17('full upgradeable transparent', {
  mintable: true,
  enumerable: true,
  pausable: true,
  burnable: true,
  votes: true,
  upgradeable: 'transparent',
});

testKIP17('full upgradeable uups', {
  mintable: true,
  enumerable: true,
  pausable: true,
  burnable: true,
  votes: true,
  upgradeable: 'uups',
});

testAPIEquivalence('API default');

testAPIEquivalence('API basic', { name: 'CustomToken', symbol: 'CTK' });

testAPIEquivalence('API full upgradeable', {
  name: 'CustomToken',
  symbol: 'CTK',
  mintable: true,
  enumerable: true,
  pausable: true,
  burnable: true,
  votes: true,
  upgradeable: 'uups',
});

test('API assert defaults', async t => {
  t.is(kip17.print(kip17.defaults), kip17.print());
});

test('API isAccessControlRequired', async t => {
  t.is(kip17.isAccessControlRequired({ mintable: true }), true);
  t.is(kip17.isAccessControlRequired({ pausable: true }), true);
  t.is(kip17.isAccessControlRequired({ upgradeable: 'uups' }), true);
  t.is(kip17.isAccessControlRequired({ upgradeable: 'transparent' }), false);
});
