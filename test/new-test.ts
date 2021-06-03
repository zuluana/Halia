import { HaliaPlugin, HaliaStack } from "../src";

export const AppPlugin: HaliaPlugin = {
  id: "app",
  name: "app",
  dependencies: [],
  install: () => null
};

export const TabBarLayout: HaliaPlugin = {
  id: "layout",
  name: "layout",
  dependencies: [AppPlugin.id],
  install: () => null
};

export const PluginPlugin: HaliaPlugin = {
  id: "plugin",
  name: "plugin",
  dependencies: [TabBarLayout.id],
  install: () => null
};

export const SystemPlugin: HaliaPlugin = {
  id: "system",
  name: "system",
  dependencies: [TabBarLayout.id],
  install: () => null
};

export const TaskPlugin: HaliaPlugin = {
  id: "task",
  name: "Task",
  dependencies: [PluginPlugin.id, TabBarLayout.id, AppPlugin.id],
  install: () => null
};

describe("Halia", () => {

  let haliaStack: HaliaStack;

  it("should successfully start the program", async () => {

    const haliaStack = new HaliaStack();
    
    haliaStack.register(AppPlugin);
    haliaStack.register(TabBarLayout);
    haliaStack.register(PluginPlugin);
    haliaStack.register(SystemPlugin);
    haliaStack.register(TaskPlugin);

    await haliaStack.build();
  });
});