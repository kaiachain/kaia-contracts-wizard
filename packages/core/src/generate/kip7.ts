import type { KIP7Options } from '../kip7';
import { accessOptions } from '../set-access-control';
import { infoOptions } from '../set-info';
import { generateAlternatives } from './alternatives';

const booleans = [true, false];

const blueprint = {
  name: ['MyToken'],
  symbol: ['MTK'],
  burnable: booleans,
  snapshots: booleans,
  pausable: booleans,
  mintable: booleans,
  permit: booleans,
  votes: booleans,
  flashmint: booleans,
  premint: ['1'],
  access: accessOptions,
  info: infoOptions,
};

export function* generateKIP7Options(): Generator<Required<KIP7Options>> {
  yield* generateAlternatives(blueprint);
}
