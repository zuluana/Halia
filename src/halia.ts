/**
 * Copyright (C) Oranda - All Rights Reserved (January 2019 - January 2021)
 */

import { HaliaPlugin } from "./core-plugin";

export interface Node<T> {
  id: string;
  parents: Node<T>[];
  children: Node<T>[];
  original: T;
  exports?: any;
  isInstalled: boolean;
}

interface PluginMap {
  [id: string]: HaliaPlugin;
}

export class HaliaStack {

  public plugins: PluginMap = {};
  public exports: { [pluginId: string]: any } = undefined;

  public getPlugin = (pluginId: string) => {
    return this.plugins[pluginId];
  };

  public getExports = (pluginId: string) => {
    return this.exports[pluginId];
  }

  /**
   * Returns the set of Root Nodes
   * CONSIDER:  Could we save time by providing a "converter" function to transform each object to a Node without pre-processing?
   * @param nodes
   */
  public nestNodes = async <T>(nodes: Node<T>[]): Promise<Node<T>[]> => {

    //  Node Log:  Marks whether a node has been processed
    const nodeLog: { [id: string]: boolean } = {};

    //  Define a list of Root Nodes.
    const rootNodes: Node<T>[] = [];

    //  Recursively process a node and its parents
    const processNode = async (node: Node<T>) => {

      //  Unpack
      const { id, parents } = node;

      //  Check Existing
      if (!nodeLog[id]) {

        //  Set the Node
        nodeLog[id] = true;

        //  Process Parents
        for (const parent of parents) {
          await processNode(parent);
          parent.children.push(node);
        }

        //  Check Root
        if (parents.length == 0) {
          rootNodes.push(node);
        }
      }
    };

    //  Process Nodes
    for (const node of nodes) {
      await processNode(node);
    }

    return rootNodes;
  };

  public register = (plugin: HaliaPlugin) => {

    //  TODO:  Build a more robust, contextual error handling system (like Typescript).

    if (this.plugins[plugin.id] != undefined) {
      throw `The '${ plugin.name }' plugin has already been installed.`;
    }
     this.plugins[plugin.id] = plugin;
  };

  /**
   * Builds the Halia Stack and returns the root nodes.
   */
  public build = async () => {

    const plugins = Object.keys(this.plugins).map(
      (pluginName) => this.plugins[pluginName]
    );

    //  Build the Nodes
    const nodeCache: { [pluginId: string]: Node<HaliaPlugin> } = {};

    const buildNode = (plugin: HaliaPlugin): Node<HaliaPlugin> => {

      //  Check Existing
      const existing = nodeCache[plugin.id];
      if (existing) {
        return existing;
      }

      //  Define the Node
      const node: Node<HaliaPlugin> = {
        original: plugin,
        id: plugin.id,
        parents: [],
        children: [],
        isInstalled: false,
      };

      //  Build Parents
      const parentPluginIds = plugin.dependencies || [];
      const parentNodes = parentPluginIds.map((parentPluginId) => {
        const parentPlugin = this.getPlugin(parentPluginId);
        const cachedNode = nodeCache[parentPlugin.id];
        if (cachedNode) {
          return cachedNode;
        }
        const parentNode = buildNode(parentPlugin);
        parentNode.children.push(node);
        return parentNode;
      });

      //  Attach Parents
      node.parents = parentNodes;

      //  Attach the Node
      nodeCache[node.id] = node;
      return node;
    };

    //  Get Node Plugins
    const nodes = plugins.map((plugin) => buildNode(plugin));

    //  Nest Nodes
    const rootNodes = await this.nestNodes(nodes);

    //  Build the App Depth-First
    const exportMap: { [name: string]: any } = {};

    //  Function to obtain imports
    const getExports = (dependencies: string[] = []) => {


      //  CONSIDER:  Add a registration point / hook point / event trigger for HaliaCore.

      const importMap: { [name: string]: any } = {};
      dependencies.forEach((dependencyId) => {
        importMap[dependencyId] = exportMap[dependencyId];
      });
      return importMap;
    };

    const setExports = (pluginId: string, value: any) => {

      //  CONSIDER:  Add a registration point / hook point / event trigger for HaliaCore.

      if (exportMap[pluginId] != undefined) {
        throw `An export has already been defined for the '${ pluginId }' Plugin.`;
      }
      exportMap[pluginId] = value;
    };

    const processNode = async (node: Node<HaliaPlugin>) => {

      //  Unpack
      const { original: plugin, children } = node;

      //  Gather Exports (to be used as imports)
      const imports = getExports(plugin.dependencies);

      //  Install
      let exports: any;
      try {
        exports = await plugin.install(imports);
      } catch (err) {
        throw `An error occurred while installing the '${ plugin.name }' Halia Plugin: ${ JSON.stringify(err) }`;
      }

      //  Update the Node
      node.isInstalled = true;

      //  Set Exports
      setExports(plugin.id, exports);
      node.exports = exports;

      //  Process Children
      for (const child of children) {

        //  CONSIDER:  Add a registration point / hook point / event trigger for HaliaCore.

        //  Check Installed
        if (child.isInstalled) {
          throw `A child should not be installed before all parent dependencies are installed.`;
        }

        //  Check Child Dependencies
        const isPending = child.parents
          .map((parent) => parent.isInstalled)
          .includes(false);
        if (isPending) {
          continue;
        }

        //  Process the Child
        await processNode(child);
      }
    };

    //  Process Root Nodes
    for (const node of rootNodes) {
      await processNode(node);
    }

    //  Set the Map
    this.exports = exportMap;

    return rootNodes;
  };
}
