import { version as openzeppelinContractsVersion } from "@openzeppelin/contracts/package.json";
import { version as klaytnContractsVersion } from "@klaytn/contracts/package.json";

export function injectHyperlinks(code: string) {
  const openzeppelinImportRegex = /(@openzeppelin\/)(contracts-upgradeable\/|contracts\/)(.*)(&quot;)/g // we are modifying HTML, so use HTML escaped chars
  const klaytnImportRegex = /(@klaytn\/)(contracts-upgradeable\/|contracts\/)(.*)(&quot;)/g             //
  return code
    .replace(openzeppelinImportRegex, `<a class="import-link" href="https://github.com/OpenZeppelin/openzeppelin-$2blob/v${openzeppelinContractsVersion}/contracts/$3" target="_blank" rel="noopener noreferrer">$1$2$3</a>$4`)
    .replace(klaytnImportRegex, `<a class="import-link" href="https://github.com/klaytn/klaytn-$2blob/v${klaytnContractsVersion}/$3" target="_blank" rel="noopener noreferrer">$1$2$3</a>$4`);
}
