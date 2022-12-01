# Klaytn Contracts Wizard for Solidity

[![NPM Package](https://img.shields.io/npm/v/@klaytn/wizard?color=%234e5de4)](https://www.npmjs.com/package/@klaytn/wizard)

Interactively build a contract out of components from OpenZeppelin Contracts. Provide parameters and desired features for the kind of contract that you want, and the Wizard will generate all the code necessary. The resulting code is ready to be compiled and deployed, or it can serve as a starting point and customized further with application specific logic.

This package provides a programmatic API. For a web interface, see https://wizard.openzeppelin.com

### Installation

`npm install @klaytn/wizard`

### Contract types

The following contract types are supported:
- `kip7`
- `kip17`
- `kip37`
- `erc20`
- `erc721`
- `erc1155`
- `governor`
- `custom`

Each contract type has functions/constants as defined below.

### Functions

#### `print`
```js
function print(opts?: KIP7Options): string
```
```js
function print(opts?: KIP17Options): string
```
```js
function print(opts?: KIP37Options): string
```
```js
function print(opts?: ERC20Options): string
```
```js
function print(opts?: ERC721Options): string
```
```js
function print(opts?: ERC1155Options): string
```
```js
function print(opts?: GovernorOptions): string
```
```js
function print(opts?: CustomOptions): string
```
Returns a string representation of a contract generated using the provided options. If `opts` is not provided, uses [`defaults`](#defaults).

#### `defaults`
```js
const defaults: Required<KIP7Options>
```
```js
const defaults: Required<KIP17Options>
```
```js
const defaults: Required<KIP37Options>
```
```js
const defaults: Required<ERC20Options>
```
```js
const defaults: Required<ERC721Options>
```
```js
const defaults: Required<ERC1155Options>
```
```js
const defaults: Required<GovernorOptions>
```
```js
const defaults: Required<CustomOptions>
```
The default options that are used for [`print`](#print).

#### `isAccessControlRequired`
```js
function isAccessControlRequired(opts: Partial<KIP7Options>): boolean
```
```js
function isAccessControlRequired(opts: Partial<KIP17Options>): boolean
```
```js
function isAccessControlRequired(opts: Partial<KIP37Options>): boolean
```
```js
function isAccessControlRequired(opts: Partial<ERC20Options>): boolean
```
```js
function isAccessControlRequired(opts: Partial<ERC721Options>): boolean
```
```js
function isAccessControlRequired(opts: Partial<ERC1155Options>): boolean
```
```js
function isAccessControlRequired(opts: Partial<GovernorOptions>): boolean
```
```js
function isAccessControlRequired(opts: Partial<CustomOptions>): boolean
```
Whether any of the provided options require access control to be enabled. If this returns `true`, then calling `print` with the same options would cause the `access` option to default to `'ownable'` if it was `undefined` or `false`. 

### Examples

Import the contract type(s) that you want to use from the `@klaytn/wizard` package:

```js
import { kip7 } from '@klaytn/wizard';
```

To generate the source code for an KIP7 contract with all the default settings:
```js
const contract = kip7.print();
```

To generate the source code for an KIP7 contract with a custom name and symbol, along with some custom settings:
```js
const contract = kip7.print({
  name: 'ExampleToken',
  symbol: 'ETK',
  burnable: true,
  premint: '1000000',
});
```
