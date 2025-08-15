/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {
  /** Show Testnets - Include testnet networks in search results */
  "showTestnets": boolean
}

/** Preferences accessible in all the extension's commands */
declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Preferences accessible in the `convert` command */
  export type Convert = ExtensionPreferences & {}
}

declare namespace Arguments {
  /** Arguments passed to the `convert` command */
  export type Convert = {
  /** Type network name or coin type (e.g., 0, bitcoin, eth)... */
  "query": string
}
}

