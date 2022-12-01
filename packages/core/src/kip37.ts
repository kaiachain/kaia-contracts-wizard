import { Contract, ContractBuilder } from './contract';
import { Access, setAccessControl, requireAccessControl } from './set-access-control';
import { addPausable } from './add-pausable';
import { supportsInterface } from './common-functions';
import { defineFunctions } from './utils/define-functions';
import { CommonOptions, withCommonDefaults, defaults as commonDefaults } from './common-options';
// import { setUpgradeable } from './set-upgradeable';
import { setInfo } from './set-info';
import { printContract } from './print';

export interface KIP37Options extends CommonOptions {
  name: string;
  uri: string;
  burnable?: boolean;
  pausable?: boolean;
  mintable?: boolean;
  supply?: boolean;
  updatableUri?: boolean;
}

export const defaults: Required<KIP37Options> = {
  name: 'MyToken',
  uri: '',
  burnable: false,
  pausable: false,
  mintable: false,
  supply: false,
  updatableUri: true,
  access: false,
  upgradeable: commonDefaults.upgradeable,
  info: commonDefaults.info
} as const;

function withDefaults(opts: KIP37Options): Required<KIP37Options> {
  return {
    ...opts,
    ...withCommonDefaults(opts),
    burnable: opts.burnable ?? defaults.burnable,
    pausable: opts.pausable ?? defaults.pausable,
    mintable: opts.mintable ?? defaults.mintable,
    supply: opts.supply ?? defaults.supply,
    updatableUri: opts.updatableUri ?? defaults.updatableUri,
  };
}

export function printKIP37(opts: KIP37Options = defaults): string {
  return printContract(buildKIP37(opts));
}

export function isAccessControlRequired(opts: Partial<KIP37Options>): boolean {
  return opts.mintable || opts.pausable || opts.updatableUri !== false;
}

export function buildKIP37(opts: KIP37Options): Contract {
  const allOpts = withDefaults(opts);

  const c = new ContractBuilder(allOpts.name);

  const { access, upgradeable, info } = allOpts;

  addBase(c, allOpts.uri);

  if (allOpts.updatableUri) {
    addSetUri(c, access);
  }

  if (allOpts.pausable) {
    addPausable(c, access, [functions._beforeTokenTransfer], true);
  }

  if (allOpts.burnable) {
    addBurnable(c);
  }

  if (allOpts.mintable) {
    addMintable(c, access);
  }

  if (allOpts.supply) {
    addSupply(c);
  }

  setAccessControl(c, access, true);
  // setUpgradeable(c, upgradeable, access);
  setInfo(c, info);

  return c;
}

function addBase(c: ContractBuilder, uri: string) {
  c.addParent(
    {
      name: 'KIP37',
      path: '@klaytn/contracts/KIP/token/KIP37/KIP37.sol',
    },
    [uri],
  );

  c.addOverride('KIP37', functions._beforeTokenTransfer);
  c.addOverride('KIP37', supportsInterface);
}

function addBurnable(c: ContractBuilder) {
  c.addParent({
    name: 'KIP37Burnable',
    path: '@klaytn/contracts/KIP/token/KIP37/extensions/KIP37Burnable.sol',
  });
  c.addOverride('KIP37Burnable', supportsInterface);
}

function addMintable(c: ContractBuilder, access: Access) {
  requireAccessControl(c, functions.mint, access, 'MINTER', true);
  requireAccessControl(c, functions.mintBatch, access, 'MINTER', true);
  c.addFunctionCode('_mint(account, id, amount, data);', functions.mint);
  c.addFunctionCode('_mintBatch(to, ids, amounts, data);', functions.mintBatch);
}

function addSetUri(c: ContractBuilder, access: Access) {
  requireAccessControl(c, functions.setURI, access, 'URI_SETTER', true);
  c.addFunctionCode('_setURI(newuri);', functions.setURI);
}

function addSupply(c: ContractBuilder) {
  c.addParent({
    name: 'KIP37Supply',
    path: '@klaytn/contracts/KIP/token/KIP37/extensions/KIP37Supply.sol',
  });
  // c.addOverride('KIP37Supply', functions._beforeTokenTransfer);
}

const functions = defineFunctions({
  _beforeTokenTransfer: {
    kind: 'internal' as const,
    args: [
      { name: 'operator', type: 'address' },
      { name: 'from', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'ids', type: 'uint256[] memory' },
      { name: 'amounts', type: 'uint256[] memory' },
      { name: 'data', type: 'bytes memory' },
    ],
  },

  setURI: {
    kind: 'public' as const,
    args: [
      { name: 'newuri', type: 'string memory' },
    ],
  },

  mint: {
    kind: 'public' as const,
    args: [
      { name: 'account', type: 'address' },
      { name: 'id', type: 'uint256' },
      { name: 'amount', type: 'uint256' },
      { name: 'data', type: 'bytes memory' },
    ],
  },

  mintBatch: {
    kind: 'public' as const,
    args: [
      { name: 'to', type: 'address' },
      { name: 'ids', type: 'uint256[] memory' },
      { name: 'amounts', type: 'uint256[] memory' },
      { name: 'data', type: 'bytes memory' },
    ],
  },

});
