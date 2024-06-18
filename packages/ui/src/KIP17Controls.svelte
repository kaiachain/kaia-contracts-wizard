<script lang="ts">
  import HelpTooltip from './HelpTooltip.svelte';

  import type { KindedOptions } from '@kaiachain/wizard';
  import { kip17,  infoDefaults } from '@kaiachain/wizard';

  import AccessControlSection from './AccessControlSection.svelte';
  import UpgradeabilitySection from './UpgradeabilitySection.svelte';
  import InfoSection from './InfoSection.svelte';

  export const opts: Required<KindedOptions['KIP17']> = {
    kind: 'KIP17',
    ...kip17.defaults,
    info: { ...infoDefaults }, // create new object since Info is nested
  };

  let wasMintable = opts.mintable;
  let wasIncremental = opts.incremental;

  $: {
    if (wasMintable && !opts.mintable) {
      opts.incremental = false;
    }

    if (opts.incremental && !wasIncremental) {
      opts.mintable = true;
    }

    wasMintable = opts.mintable;
    wasIncremental = opts.incremental;
  }

  $: requireAccessControl = kip17.isAccessControlRequired(opts);
</script>

<section class="controls-section">
  <h1>Settings</h1>

  <div class="grid grid-cols-[2fr,1fr] gap-2">
    <label class="labeled-input">
      <span>Name</span>
      <input bind:value={opts.name}>
    </label>
    <label class="labeled-input">
      <span>Symbol</span>
      <input bind:value={opts.symbol}>
    </label>
  </div>
  <label class="labeled-input">
    <span class="flex justify-between pr-2">
      Base URI
      <HelpTooltip>Will be concatenated with token IDs to generate the token URIs.</HelpTooltip>
    </span>
    <input bind:value={opts.baseUri} placeholder="https://...">
  </label>
</section>

<section class="controls-section">
  <h1>Features</h1>

  <div class="checkbox-group">
    <label class:checked={opts.mintable}>
      <input type="checkbox" bind:checked={opts.mintable}>
      Mintable
      <HelpTooltip>
        Privileged accounts will be able to emit new tokens.
      </HelpTooltip>
    </label>
    <label class:checked={opts.incremental} class="subcontrol">
      <input type="checkbox" bind:checked={opts.incremental}>
      Auto Increment Ids
      <HelpTooltip>
        New tokens will be automatically assigned an incremental id.
      </HelpTooltip>
    </label>
    <label class:checked={opts.burnable}>
      <input type="checkbox" bind:checked={opts.burnable}>
      Burnable
      <HelpTooltip link="https://github.com/kaiachain/kaia-contracts/blob/main/contracts/KIP/token/KIP17/extensions/KIP17Burnable.sol">
        Token holders will be able to destroy their tokens.
      </HelpTooltip>
    </label>
    <label class:checked={opts.pausable}>
      <input type="checkbox" bind:checked={opts.pausable}>
      Pausable
      <HelpTooltip link="https://docs.openzeppelin.com/contracts/4.x/api/security#Pausable">
        Privileged accounts will be able to pause the functionality marked as <code>whenNotPaused</code>.
        Useful for emergency response.
      </HelpTooltip>
    </label>
    <label class:checked={opts.votes}>
      <input type="checkbox" bind:checked={opts.votes}>
      Votes
      <HelpTooltip link="https://github.com/kaiachain/kaia-contracts/blob/main/contracts/KIP/token/KIP17/extensions/draft-KIP17Votes.sol">
        Keeps track of individual units for voting in on-chain governance, with a way to delegate one's voting power to a trusted account.
      </HelpTooltip>
    </label>
    <label class:checked={opts.enumerable}>
      <input type="checkbox" bind:checked={opts.enumerable}>
      Enumerable
      <HelpTooltip link="https://github.com/kaiachain/kaia-contracts/blob/main/contracts/KIP/token/KIP17/extensions/KIP17Enumerable.sol">
        Allows on-chain enumeration of all tokens or those owned by an account. Increases gas cost of transfers.
      </HelpTooltip>
    </label>
    <label class:checked={opts.uriStorage}>
      <input type="checkbox" bind:checked={opts.uriStorage}>
      URI Storage
      <HelpTooltip link="https://github.com/kaiachain/kaia-contracts/blob/main/contracts/KIP/token/KIP17/extensions/KIP17URIStorage.sol">
        Allows updating token URIs for individual token IDs.
      </HelpTooltip>
    </label>
  </div>
</section>

<AccessControlSection bind:access={opts.access} required={requireAccessControl} />

<!--<UpgradeabilitySection bind:upgradeable={opts.upgradeable} />-->

<InfoSection bind:info={opts.info} />
