import { version as openzeppelinContractsVersion } from "@openzeppelin/contracts/package.json";
import { version as kaiaContractsVersion } from "@kaiachain/contracts/package.json";
import type { Contract } from "./contract";
import { printContract } from "./print";

export function printContractVersioned(contract: Contract): string {
  return printContract(contract, {
    transformImport: p =>
      p.replace(/^@openzeppelin\/contracts(-upgradeable)?/, `$&@${openzeppelinContractsVersion}`).replace(/^@kaiachain\/contracts/, `$&@${kaiaContractsVersion}`),
  });
}


