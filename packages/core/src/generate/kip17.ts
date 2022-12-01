import type { KIP17Options } from '../kip17';
import { accessOptions } from '../set-access-control';
import { infoOptions } from '../set-info';
import { upgradeableOptions } from '../set-upgradeable';
import { generateAlternatives } from './alternatives';

const booleans = [true, false];

const blueprint = {
    name: ['MyToken'],
    symbol: ['MTK'],
    baseUri: ['https://example.com/'],
    enumerable: booleans,
    uriStorage: booleans,
    burnable: booleans,
    pausable: booleans,
    mintable: booleans,
    incremental: booleans,
    access: accessOptions,
    upgradeable: upgradeableOptions,
    info: infoOptions,
    votes: booleans,
};

export function* generateKIP17Options(): Generator<Required<KIP17Options>> {
    yield* generateAlternatives(blueprint);
}
