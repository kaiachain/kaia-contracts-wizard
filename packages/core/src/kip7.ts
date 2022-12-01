import { Contract, ContractBuilder } from './contract';
import { Access, setAccessControl, requireAccessControl } from './set-access-control';
import { addPausable } from './add-pausable';
import { defineFunctions } from './utils/define-functions';
import { withCommonDefaults, defaults as commonDefaults } from './common-options';
import { setInfo } from './set-info';
import type { Info } from "./set-info";
import { printContract } from './print';
import {supportsInterface} from "./common-functions";

export interface KIP7Options {
  access?: Access;
  info?: Info;
  name: string;
  symbol: string;
  burnable?: boolean;
  snapshots?: boolean;
  pausable?: boolean;
  premint?: string;
  mintable?: boolean;
  permit?: boolean;
  votes?: boolean;
  flashmint?: boolean;
}

export const defaults: Required<KIP7Options> = {
  name: 'MyToken',
  symbol: 'MTK',
  burnable: false,
  snapshots: false,
  pausable: false,
  premint: '0',
  mintable: false,
  permit: false,
  votes: false,
  flashmint: false,
  access: commonDefaults.access,
  info: commonDefaults.info
} as const;

function withDefaults(opts: KIP7Options): Required<KIP7Options> {
  return {
    ...opts,
    ...withCommonDefaults(opts),
    burnable: opts.burnable ?? defaults.burnable,
    snapshots: opts.snapshots ?? defaults.snapshots,
    pausable: opts.pausable ?? defaults.pausable,
    premint: opts.premint || defaults.premint,
    mintable: opts.mintable ?? defaults.mintable,
    permit: opts.permit ?? defaults.permit,
    votes: opts.votes ?? defaults.votes,
    flashmint: opts.flashmint ?? defaults.flashmint,
  };
}

export function printKIP7(opts: KIP7Options = defaults): string {
  return printContract(buildKIP7(opts));
}

export function isAccessControlRequired(opts: Partial<KIP7Options>): boolean {
  return !!(opts.mintable || opts.pausable || opts.snapshots);
}

export function buildKIP7(opts: KIP7Options): Contract {
  const allOpts = withDefaults(opts);

  const c = new ContractBuilder(allOpts.name);

  const { access, info } = allOpts;

  if (allOpts.burnable || allOpts.snapshots || allOpts.pausable || allOpts.permit || allOpts.mintable || allOpts.votes || allOpts.flashmint) {
    addSupportsInterface(c, access, allOpts.permit, allOpts.votes);
  }

  addBase(c, allOpts.name, allOpts.symbol);

  if (allOpts.burnable) {
    addBurnable(c);
  }

  if (allOpts.snapshots) {
    addSnapshot(c, access);
  }

  if (allOpts.pausable) {
    addPausable(c, access, [functions._beforeTokenTransfer], true);
  }

  if (allOpts.premint) {
    addPremint(c, allOpts.premint);
  }

  if (allOpts.mintable) {
    addMintable(c, access);
  }

  // Note: Votes requires Permit
  if (allOpts.permit || allOpts.votes) {
    addPermit(c, allOpts.name);
  }

  if (allOpts.votes) {
    addVotes(c);
  }

  if (allOpts.flashmint) {
    addFlashMint(c);
  }

  setAccessControl(c, access, true);
  setInfo(c, info);

  return c;
}

function addBase(c: ContractBuilder, name: string, symbol: string) {
  c.addParent(
    {
      name: 'KIP7',
      path: '@klaytn/contracts/contracts/KIP/token/KIP7/KIP7.sol',
    },
    [name, symbol],
  );

  c.addOverride('KIP7', functions._beforeTokenTransfer);
  c.addOverride('KIP7', functions._afterTokenTransfer);
  c.addOverride('KIP7', functions._mint);
  c.addOverride('KIP7', functions._burn);
  c.addOverride('KIP7', supportsInterface);
}

function addBurnable(c: ContractBuilder) {
  c.addParent({
    name: 'KIP7Burnable',
    path: '@klaytn/contracts/contracts/KIP/token/KIP7/extensions/KIP7Burnable.sol',
  });

  c.addOverride('KIP7Burnable', functions.supportsInterface)
}

function addSupportsInterface(c: ContractBuilder, access: Access, permit: boolean, votes: boolean) {
  c.addModifier('view', functions.supportsInterface);
  c.addModifier('virtual', functions.supportsInterface);
  c.addOverride('KIP7', functions.supportsInterface);
  if (access === 'roles') {
    c.addOverride('AccessControl', functions.supportsInterface);
  }
  let body = 'return';
  if (permit) body = body + `
            interfaceId == type(IKIP7Permit).interfaceId ||`
  if (votes) body = body + `
            interfaceId == type(IVotes).interfaceId ||`
            body = body + `
            super.supportsInterface(interfaceId);`
  c.setFunctionBody([body], functions.supportsInterface);
}

function addSnapshot(c: ContractBuilder, access: Access) {
  c.addParent({
    name: 'KIP7Snapshot',
    path: '@klaytn/contracts/contracts/KIP/token/KIP7/extensions/KIP7Snapshot.sol',
  });

  c.addOverride('KIP7Snapshot', functions._beforeTokenTransfer);

  requireAccessControl(c, functions.snapshot, access, 'SNAPSHOT', true);
  c.addFunctionCode('_snapshot();', functions.snapshot);
}

export const premintPattern = /^(\d*)(?:\.(\d+))?(?:e(\d+))?$/;

function addPremint(c: ContractBuilder, amount: string) {
  const m = amount.match(premintPattern);
  if (m) {
    const integer = m[1]?.replace(/^0+/, '') ?? '';
    const decimals = m[2]?.replace(/0+$/, '') ?? '';
    const exponent = Number(m[3] ?? 0);

    if (Number(integer + decimals) > 0) {
      const decimalPlace = decimals.length - exponent;
      const zeroes = new Array(Math.max(0, -decimalPlace)).fill('0').join('');
      const units = integer + decimals + zeroes;
      const exp = decimalPlace <= 0 ? 'decimals()' : `(decimals() - ${decimalPlace})`;
      c.addConstructorCode(`_mint(msg.sender, ${units} * 10 ** ${exp});`);
    }
  }
}

function addMintable(c: ContractBuilder, access: Access) {
  requireAccessControl(c, functions.mint, access, 'MINTER', true);
  c.addFunctionCode('_mint(to, amount);', functions.mint);
}

function addPermit(c: ContractBuilder, name: string) {
  c.addParent({
    name: 'KIP7Permit',
    path: '@klaytn/contracts/contracts/KIP/token/KIP7/extensions/draft-KIP7Permit.sol',
  }, [name]);
}

function addVotes(c: ContractBuilder) {
  if (!c.parents.some(p => p.contract.name === 'KIP7Permit')) {
    throw new Error('Missing KIP7Permit requirement for KIP7Votes');
  }

  c.addParent({
    name: 'KIP7Votes',
    path: '@klaytn/contracts/contracts/KIP/token/KIP7/extensions/KIP7Votes.sol',
  });
  c.addOverride('KIP7Votes', functions._mint);
  c.addOverride('KIP7Votes', functions._burn);
  c.addOverride('KIP7Votes', functions._afterTokenTransfer);
}

function addFlashMint(c: ContractBuilder) {
  c.addParent({
    name: 'KIP7FlashMint',
    path: '@klaytn/contracts/contracts/KIP/token/KIP7/extensions/KIP7FlashMint.sol',
  });
}

const functions = defineFunctions({
  supportsInterface: {
    kind: 'public' as const,
    returns: ['bool'],
    args: [
      { name: 'interfaceId', type: 'bytes4' },
    ],
  },

  _beforeTokenTransfer: {
    kind: 'internal' as const,
    args: [
      { name: 'from', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
  },

  _afterTokenTransfer: {
    kind: 'internal' as const,
    args: [
      { name: 'from', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
  },

  _burn: {
    kind: 'internal' as const,
    args: [
      { name: 'account', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
  },

  _mint: {
    kind: 'internal' as const,
    args: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
  },

  mint: {
    kind: 'public' as const,
    args: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
  },

  pause: {
    kind: 'public' as const,
    args: [],
  },

  unpause: {
    kind: 'public' as const,
    args: [],
  },

  snapshot: {
    kind: 'public' as const,
    args: [],
  },
});
