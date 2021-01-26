/**
 * Copyright (C) Oranda - All Rights Reserved (January 2021 - January 2021)
 */

import { HaliaCore, HaliaPlugin, OptionalDependencies, OptionalDependenciesPatch } from "../src";
import { haliaCoreAPI, HaliaStack } from "../src/halia";
import expect = require("expect");

describe("Extensions", () => {

  it("should have no registered elements", async () => {
    expect(haliaCoreAPI.importRegister.size()).toEqual(0);
  });

  it("should not inject optional dependencies", async () => {

    //  Initialize the Stack
    const stack = new HaliaStack<HaliaPlugin & OptionalDependenciesPatch>();

    stack.register({ name: "P1", install: () => "P1", id: "p1" });
    stack.register({ name: "P2", install: ({ p1 }) => expect(p1).toEqual(undefined), id: "p2", optionalDependencies: ["p1"] });

    //  Build the Stack
    await stack.build();

  });

  it("should build with optional dependencies", async () => {

    //  Initialize the Stack
    const coreStack = new HaliaStack();

    //  Register Elements
    coreStack.register(HaliaCore);
    coreStack.register(OptionalDependencies);

    //  Build the Stack
    await coreStack.build();

    expect(haliaCoreAPI.importRegister.size()).toEqual(1);
  });

  it("should inject optional dependencies", async () => {

    //  Initialize the Stack
    const stack = new HaliaStack<HaliaPlugin & OptionalDependenciesPatch>();

    stack.register({ name: "P1", install: () => "P1", id: "p1" });
    stack.register({ name: "P2", install: ({ p1 }) => expect(p1).toEqual("P1"), id: "p2", optionalDependencies: ["p1"] });

    //  Build the Stack
    await stack.build();

  });
});
