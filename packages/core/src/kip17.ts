import { Contract, ContractBuilder } from './contract';
import { Access, setAccessControl, requireAccessControl } from './set-access-control';
import { addPausable } from './add-pausable';
import { supportsInterface } from './common-functions';
import { defineFunctions } from './utils/define-functions';
import { CommonOptions, withCommonDefaults, defaults as commonDefaults } from './common-options';
// import { setUpgradeable } from './set-upgradeable';
import {Info, setInfo} from './set-info';
import { printContract } from './print';

export interface KIP17Options {
  name: string;
  symbol: string;
  baseUri?: string;
  enumerable?: boolean;
  uriStorage?: boolean;
  burnable?: boolean;
  pausable?: boolean;
  mintable?: boolean;
  incremental?: boolean;
  votes?: boolean;
  access?: Access;
  info?: Info;
}

export const defaults: Required<KIP17Options> = {
  name: 'MyToken',
  symbol: 'MTK',
  baseUri: '',
  enumerable: false,
  uriStorage: false,
  burnable: false,
  pausable: false,
  mintable: false,
  incremental: false,
  votes: false,
  access: commonDefaults.access,
  info: commonDefaults.info
} as const;

function withDefaults(opts: KIP17Options): Required<KIP17Options> {
  return {
    ...opts,
    ...withCommonDefaults(opts),
    baseUri: opts.baseUri ?? defaults.baseUri,
    enumerable: opts.enumerable ?? defaults.enumerable,
    uriStorage: opts.uriStorage ?? defaults.uriStorage,
    burnable: opts.burnable ?? defaults.burnable,
    pausable: opts.pausable ?? defaults.pausable,
    mintable: opts.mintable ?? defaults.mintable,
    incremental: opts.incremental ?? defaults.incremental,
    votes: opts.votes ?? defaults.votes,
  };
}

export function printKIP17(opts: KIP17Options = defaults): string {
  return printContract(buildKIP17(opts));
}

export function isAccessControlRequired(opts: Partial<KIP17Options>): boolean {
  return !!(opts.mintable || opts.pausable);
}

export function buildKIP17(opts: KIP17Options): Contract {
  const allOpts = withDefaults(opts);

  const c = new ContractBuilder(allOpts.name);

  const { access, info } = allOpts;

  addBase(c, allOpts.name, allOpts.symbol);

  if (allOpts.baseUri) {
    addBaseURI(c, allOpts.baseUri);
  }

  if (allOpts.enumerable) {
    addEnumerable(c);
  }

  if (allOpts.uriStorage) {
    addURIStorage(c);
  }

  if (allOpts.pausable) {
    addPausable(c, access, [functions._beforeTokenTransfer], true);
  }

  if (allOpts.burnable) {
    addBurnable(c);
  }

  if (allOpts.mintable) {
    addMintable(c, access, allOpts.incremental, allOpts.uriStorage);
  }

  if (allOpts.votes) {
    addVotes(c, allOpts.name);
  }

  setAccessControl(c, access, true);
  // setUpgradeable(c, upgradeable, access);
  setInfo(c, info);

  return c;
}

function addBase(c: ContractBuilder, name: string, symbol: string) {
  c.addParent(
    {
      name: 'KIP17',
      path: '@klaytn/contracts/contracts/KIP/token/KIP17/KIP17.sol',
    },
    [name, symbol],
  );

  c.addOverride('KIP17', functions._beforeTokenTransfer);
  c.addOverride('KIP17', functions._afterTokenTransfer);
  c.addOverride('KIP17', functions._burn);
  c.addOverride('KIP17', functions.tokenURI);
  c.addOverride('KIP17', supportsInterface);
}

function addBaseURI(c: ContractBuilder, baseUri: string) {
  c.addOverride('KIP17', functions._baseURI);
  c.setFunctionBody([`return ${JSON.stringify(baseUri)};`], functions._baseURI);
}

function addEnumerable(c: ContractBuilder) {
  c.addParent({
    name: 'KIP17Enumerable',
    path: '@klaytn/contracts/contracts/KIP/token/KIP17/extensions/KIP17Enumerable.sol',
  });

  c.addOverride('KIP17Enumerable', functions._beforeTokenTransfer);
  c.addOverride('KIP17Enumerable', supportsInterface);
}

function addURIStorage(c: ContractBuilder) {
  c.addParent({
    name: 'KIP17URIStorage',
    path: '@klaytn/contracts/contracts/KIP/token/KIP17/extensions/KIP17URIStorage.sol',
  });

  c.addOverride('KIP17URIStorage', functions._burn);
  c.addOverride('KIP17URIStorage', functions.tokenURI);
}

function addBurnable(c: ContractBuilder) {
  c.addParent({
    name: 'KIP17Burnable',
    path: '@klaytn/contracts/contracts/KIP/token/KIP17/extensions/KIP17Burnable.sol',
  });
  c.addOverride('KIP17Burnable', supportsInterface);
}

function addMintable(c: ContractBuilder, access: Access, incremental = false, uriStorage = false) {
  const fn = getMintFunction(incremental, uriStorage);
  requireAccessControl(c, fn, access, 'MINTER', true);

  if (incremental) {
    c.addUsing({
      name: 'Counters',
      path: '@klaytn/contracts/contracts/utils/Counters.sol',
    }, 'Counters.Counter');
    c.addVariable('Counters.Counter private _tokenIdCounter;');
    c.addFunctionCode('uint256 tokenId = _tokenIdCounter.current();', fn);
    c.addFunctionCode('_tokenIdCounter.increment();', fn);
    c.addFunctionCode('_safeMint(to, tokenId);', fn);
  } else {
    c.addFunctionCode('_safeMint(to, tokenId);', fn);
  }

  if (uriStorage) {
    c.addFunctionCode('_setTokenURI(tokenId, uri);', fn);
  }
}

function addVotes(c: ContractBuilder, name: string) {
  c.addParent(
    {
      name: 'EIP712',
      path: '@klaytn/contracts/contracts/utils/cryptography/draft-EIP712.sol',
    },
    [name, "1"]
  );
  c.addParent(
    {
      name: 'KIP17Votes',
      path: '@klaytn/contracts/contracts/KIP/token/KIP17/extensions/draft-KIP17Votes.sol',
    });
  c.addOverride('KIP17Votes', functions._afterTokenTransfer);
}

const functions = defineFunctions({
  _beforeTokenTransfer: {
    kind: 'internal' as const,
    args: [
      { name: 'from', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'tokenId', type: 'uint256' },
    ],
  },

  _afterTokenTransfer: {
    kind: 'internal' as const,
    args: [
      { name: 'from', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'tokenId', type: 'uint256' },
    ],
  },

  _burn: {
    kind: 'internal' as const,
    args: [
      { name: 'tokenId', type: 'uint256' },
    ],
  },

  tokenURI: {
    kind: 'public' as const,
    args: [
      { name: 'tokenId', type: 'uint256' },
    ],
    returns: ['string memory'],
    mutability: 'view' as const,
  },

  _baseURI: {
    kind: 'internal' as const,
    args: [],
    returns: ['string memory'],
    mutability: 'pure' as const,
  },
});

function getMintFunction(incremental: boolean, uriStorage: boolean) {
  const fn = {
    name: 'safeMint',
    kind: 'public' as const,
    args: [
      { name: 'to', type: 'address' },
    ],
  };

  if (!incremental) {
    fn.args.push({ name: 'tokenId', type: 'uint256' });
  }

  if (uriStorage) {
    fn.args.push({ name: 'uri', type: 'string memory' });
  }

  return fn;
}
