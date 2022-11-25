import type { KIP37Options } from '../kip37';
import { accessOptions } from '../set-access-control';
import { infoOptions } from '../set-info';
import { upgradeableOptions } from '../set-upgradeable';
import { generateAlternatives } from './alternatives';

const booleans = [true, false];

const blueprint = {
  name: ['MyToken'],
  uri: ['https://example.com/'],
  burnable: booleans,
  pausable: booleans,
  mintable: booleans,
  supply: booleans,
  updatableUri: booleans,
  access: accessOptions,
  upgradeable: upgradeableOptions,
  info: infoOptions,
};

export function* generateKIP37Options(): Generator<Required<KIP37Options>> {
  yield* generateAlternatives(blueprint);
}
