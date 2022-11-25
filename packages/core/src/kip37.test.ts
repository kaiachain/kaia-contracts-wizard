import test from 'ava';
import { kip37 } from '.';

import { buildKIP37, KIP37Options } from './kip37';
import { printContract } from './print';

function testKIP37(title: string, opts: Partial<KIP37Options>) {
  test(title, t => {
    const c = buildKIP37({
      name: 'MyToken',
      uri: 'https://gateway.pinata.cloud/ipfs/QmcP9hxrnC1T5ATPmq2saFeAM1ypFX9BnAswCdHB9JCjLA/',
      ...opts,
    });
    t.snapshot(printContract(c));
  });
}

/**
 * Tests external API for equivalence with internal API
 */
 function testAPIEquivalence(title: string, opts?: KIP37Options) {
  test(title, t => {
    t.is(kip37.print(opts), printContract(buildKIP37({
      name: 'MyToken',
      uri: '',
      ...opts,
    })));
  });
}

testKIP37('basic', {});

testKIP37('basic + roles', {
  access: 'roles',
});

testKIP37('no updatable uri', {
  updatableUri: false,
});

testKIP37('burnable', {
  burnable: true,
});

testKIP37('pausable', {
  pausable: true,
});

testKIP37('mintable', {
  mintable: true,
});

testKIP37('mintable + roles', {
  mintable: true,
  access: 'roles',
});

testKIP37('supply tracking', {
  supply: true,
});

/*testKIP37('full upgradeable transparent', {
  mintable: true,
  access: 'roles',
  burnable: true,
  pausable: true,
  upgradeable: 'transparent',
});

testKIP37('full upgradeable uups', {
  mintable: true,
  access: 'roles',
  burnable: true,
  pausable: true,
  upgradeable: 'uups',
});*/

testAPIEquivalence('API default');

testAPIEquivalence('API basic', { name: 'CustomToken', uri: 'https://gateway.pinata.cloud/ipfs/QmcP9hxrnC1T5ATPmq2saFeAM1ypFX9BnAswCdHB9JCjLA/' });

/*testAPIEquivalence('API full upgradeable', {
  name: 'CustomToken',
  uri: 'https://gateway.pinata.cloud/ipfs/QmcP9hxrnC1T5ATPmq2saFeAM1ypFX9BnAswCdHB9JCjLA/',
  mintable: true,
  access: 'roles',
  burnable: true,
  pausable: true,
  upgradeable: 'uups',
});*/

test('API assert defaults', async t => {
  t.is(kip37.print(kip37.defaults), kip37.print());
});

test('API isAccessControlRequired', async t => {
  t.is(kip37.isAccessControlRequired({ updatableUri: false, mintable: true,  }), true);
  t.is(kip37.isAccessControlRequired({ updatableUri: false, pausable: true }), true);
  // t.is(kip37.isAccessControlRequired({ updatableUri: false, upgradeable: 'uups' }), true);
  t.is(kip37.isAccessControlRequired({ updatableUri: true }), true);
  t.is(kip37.isAccessControlRequired({ updatableUri: false}), false);
  t.is(kip37.isAccessControlRequired({}), true); // updatableUri is true by default
});
