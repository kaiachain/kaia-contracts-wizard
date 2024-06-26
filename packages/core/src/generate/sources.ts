import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';

import { generateKIP7Options } from './kip7';
import { generateKIP17Options } from './kip17';
import { generateKIP37Options } from './kip37';
import { generateERC20Options } from './erc20';
import { generateERC721Options } from './erc721';
import { generateERC1155Options } from './erc1155';
import { generateGovernorOptions } from './governor';
import { generateCustomOptions } from './custom';
import { buildGeneric, GenericOptions } from '../build-generic';
import { printContract } from '../print';
import { OptionsError } from '../error';
import { findCover } from '../utils/find-cover';
import type { Contract } from '../contract';

type Subset = 'all' | 'minimal-cover';

export function* generateOptions(): Generator<GenericOptions> {
  for (const kindOpts of generateKIP7Options()) {
    yield { kind: 'KIP7', ...kindOpts };
  }

  for (const kindOpts of generateKIP17Options()) {
    yield { kind: 'KIP17', ...kindOpts };
  }

  for (const kindOpts of generateKIP37Options()) {
    yield { kind: 'KIP37', ...kindOpts };
  }

  for (const kindOpts of generateERC20Options()) {
    yield { kind: 'ERC20', ...kindOpts };
  }

  for (const kindOpts of generateERC721Options()) {
    yield { kind: 'ERC721', ...kindOpts };
  }

  for (const kindOpts of generateERC1155Options()) {
    yield { kind: 'ERC1155', ...kindOpts };
  }

  for (const kindOpts of generateGovernorOptions()) {
    yield { kind: 'Governor', ...kindOpts };
  }

  for (const kindOpts of generateCustomOptions()) {
    yield { kind: 'Custom', ...kindOpts };
  }
}

interface GeneratedContract {
  id: string;
  options: GenericOptions;
  contract: Contract;
}

interface GeneratedSource extends GeneratedContract {
  source: string;
}

function generateContractSubset(subset: Subset): GeneratedContract[] {
  const contracts = [];

  for (const options of generateOptions()) {
    const id = crypto
      .createHash('sha1')
      .update(JSON.stringify(options))
      .digest()
      .toString('hex');

    try {
      const contract = buildGeneric(options);
      contracts.push({ id, options, contract });
    } catch (e: unknown) {
      if (e instanceof OptionsError) {
        continue;
      } else {
        throw e;
      }
    }
  }

  if (subset === 'all') {
    return contracts;
  } else {
    const getParents = (c: GeneratedContract) => c.contract.parents.map(p => p.contract.path);
    return [
      ...findCover(contracts.filter(c => !!('upgradeable' in c.options ? c.options.upgradeable : false)), getParents),
      ...findCover(contracts.filter(c => !('upgradeable' in c.options ? c.options.upgradeable : false)), getParents),
    ];
  }
}

export function* generateSources(subset: Subset): Generator<GeneratedSource> {
  for (const c of generateContractSubset(subset)) {
    const source = printContract(c.contract);
    yield { ...c, source };
  }
}

export async function writeGeneratedSources(dir: string, subset: Subset): Promise<void> {
  await fs.mkdir(dir, { recursive: true });

  for (const { id, source } of generateSources(subset)) {
    await fs.writeFile(path.format({ dir, name: id, ext: '.sol' }), source);
  }
}
