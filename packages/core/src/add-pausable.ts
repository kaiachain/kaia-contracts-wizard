import type { ContractBuilder, BaseFunction } from './contract';
import { Access, requireAccessControl } from './set-access-control';
import { defineFunctions } from './utils/define-functions';

export function addPausable(c: ContractBuilder, access: Access, pausableFns: BaseFunction[], kaia: boolean = false) {
  const prefix = kaia ? '@kaiachain/contracts' : '@openzeppelin/contracts'
  c.addParent({
    name: 'Pausable',
    path: `${prefix}/security/Pausable.sol`,
  });

  for (const fn of pausableFns) {
    c.addModifier('whenNotPaused', fn);
  }

  requireAccessControl(c, functions.pause, access, 'PAUSER', kaia);
  c.addFunctionCode('_pause();', functions.pause);

  requireAccessControl(c, functions.unpause, access, 'PAUSER', kaia);
  c.addFunctionCode('_unpause();', functions.unpause);
}

const functions = defineFunctions({
  pause: {
    kind: 'public' as const,
    args: [],
  },

  unpause: {
    kind: 'public' as const,
    args: [],
  },
});
