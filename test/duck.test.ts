/**
 * Copyright (C) Oranda - All Rights Reserved (January 2021 - January 2021)
 */

import { HaliaStack } from "../src/halia";
import { DiscoDuckPlugin, DuckAppPlugin } from "./duck-app-plugins";
import { expect } from "chai";

describe("Duck App", () => {

  it("should run the duck app", async () => {

      //  Initialize the Stack
    const appStack = new HaliaStack();

    //  Register Elements
    appStack.register(DuckAppPlugin);

    //  Build the Stack
    await appStack.build();

    //  Call the Method
    const duckApp = appStack.getExports(DuckAppPlugin.id);
    const res = duckApp.getDuck();

    expect(res).equals("Quack");
  });

  it("should run the duck app with the disco plugin", async () => {

    //  Initialize the Stack
  const appStack = new HaliaStack();

  //  Register Elements
  appStack.register(DuckAppPlugin);
  appStack.register(DiscoDuckPlugin);

  //  Build the Stack
  await appStack.build();

  //  Call the Method
  const duckApp = appStack.getExports(DuckAppPlugin.id);
  const res = duckApp.getDuck();

  expect(res).equals("Michael Quackson");
});
});

