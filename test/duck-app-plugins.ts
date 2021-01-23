/**
 * Copyright (C) Oranda - All Rights Reserved (January 2021 - January 2021)
 */

import { HaliaPlugin } from "../src";

/**
 * Duck App Plugin
 */
import * as DuckApp from "./duck-app";

export const DuckAppPlugin: HaliaPlugin = {
  id: "duckApp",
  name: "Duck App Plugin",
  install: () => DuckApp
};


/**
 * Disco Duck Plugin
 */

const UnhappyClient = "Stevie McGrouch";

const config = {
  client: UnhappyClient
};

export const DiscoDuckPlugin: HaliaPlugin = {
  id: "discoDuck",
  name: "Disco Duck Plugin",
  dependencies: [DuckAppPlugin.id],
  install: ({ duckApp }) => {
    if (config.client === UnhappyClient) {
      duckApp.getDuck = () => "Michael Quackson";
    }
  }
};
