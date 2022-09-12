import { CustomOptions, buildCustom } from './custom';
import { KIP7Options, buildKIP7 } from './kip7';
import { ERC20Options, buildERC20 } from './erc20';
import { ERC721Options, buildERC721 } from './erc721';
import { ERC1155Options, buildERC1155 } from './erc1155';
import { GovernorOptions, buildGovernor } from './governor';

export interface KindedOptions {
  KIP7:     { kind: 'KIP7' }     & KIP7Options;
  ERC20:    { kind: 'ERC20' }    & ERC20Options;
  ERC721:   { kind: 'ERC721' }   & ERC721Options;
  ERC1155:  { kind: 'ERC1155' }  & ERC1155Options;
  Governor: { kind: 'Governor' } & GovernorOptions;
  Custom:   { kind: 'Custom' }   & CustomOptions;
}

export type GenericOptions = KindedOptions[keyof KindedOptions];

export function buildGeneric(opts: GenericOptions) {
  switch (opts.kind) {
    case 'KIP7':
      return buildKIP7(opts);

    case 'ERC20':
      return buildERC20(opts);

    case 'ERC721':
      return buildERC721(opts);

    case 'ERC1155':
      return buildERC1155(opts);

    case 'Governor':
      return buildGovernor(opts);

    case 'Custom':
      return buildCustom(opts);

    default:
      const _: never = opts;
      throw new Error('Unknown ERC');
  }
}
