import { HaliaPlugin, HaliaStack } from "../src";

export const AppPlugin: HaliaPlugin = {
  id: "app",
  name: "app",
  dependencies: [],
  install: () => undefined
};

export const TabBarLayout: HaliaPlugin = {
  id: "layout",
  name: "layout",
  dependencies: [AppPlugin.id],
  install: () => undefined
};

export const PluginPlugin: HaliaPlugin = {
  id: "plugin",
  name: "plugin",
  dependencies: [TabBarLayout.id],
  install: () => undefined
};

export const SystemPlugin: HaliaPlugin = {
  id: "system",
  name: "system",
  dependencies: [TabBarLayout.id],
  install: () => undefined
};

export const TaskPlugin: HaliaPlugin = {
  id: "task",
  name: "Task",
  dependencies: [PluginPlugin.id, TabBarLayout.id, AppPlugin.id],
  install: () => undefined
};

describe("Halia", () => {

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