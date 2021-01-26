/**
 * Copyright (C) Oranda - All Rights Reserved (January 2019 - January 2021)
 */

import { Register } from "./register";
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

//  TODO:  Remove "any" types where possible.

//  CONSIDER:  We could build the "Core" by adding all code to the Registers.  Or, perhaps registering as declarative "Rules".  Each Rule can have a unique ID and be declaratively manipulated.

export type ImportRegisterParams<T extends HaliaPlugin> = { stack: HaliaStack<T>, node: Node<T>, importMap: { [id: string]: any }, exportMap: { [id: string]: any } };
export type ExportRegisterParams<T extends HaliaPlugin> = { stack: HaliaStack<T>, node: Node<T>, exportMap: { [id: string]: any } };
export type ProcessRegisterParams<T extends HaliaPlugin> = { stack: HaliaStack<T>, child: Node<T>, parent: Node<T> };

/**
 * Extension API
 * Defines the HaliaCore "Plugin API" (I also call this an "API-API")
 */

 export class HaliaCoreAPI {

  public importRegister: Register<ImportRegisterParams<any>> = new Register<ImportRegisterParams<any>>();
  public exportRegister: Register<ExportRegisterParams<any>> = new Register<ExportRegisterParams<any>>();
  public processRegister: Register<ProcessRegisterParams<any>> = new Register<ProcessRegisterParams<any>>();
 }

 //  CONSIDER:  This could be made per-stack instead of global.
export const haliaCoreAPI = new HaliaCoreAPI();


//  CONSIDER:  Do we need to extend "HaliaPlugin"?  Could downstream features over-write these elements?  Let's leave it for now.
export class HaliaStack<T extends HaliaPlugin = HaliaPlugin> {

  private haliaCoreAPI = haliaCoreAPI;
  private plugins: PluginMap = {};
  private exports: { [pluginId: string]: any } = undefined;

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

  public register = (plugin: T) => {

    //  TODO:  Build a more robust, contextual error handling system (like Typescript).

    if (this.plugins[plugin.id] != undefined) {
      throw `The '${ plugin.name }' plugin has already been installed.`;
    }
     this.plugins[plugin.id] = plugin;
  };



  private buildNode = (plugin: T, nodeCache: { [pluginId: string]: Node<T> }): Node<T> => {

      //  Check Existing
      const existing = nodeCache[plugin.id];
      if (existing) {
        return existing;
      }

      //  Define the Node
      const node: Node<T> = {
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
        const parentNode = this.buildNode(parentPlugin as any, nodeCache);
        parentNode.children.push(node);
        return parentNode;
      });

      //  Attach Parents
      node.parents = parentNodes;

      //  Attach the Node
      nodeCache[node.id] = node;
      return node;
  }

  private async processNode (node: Node<T>, exportMap: { [id: string]: any }) {

      //  Unpack
      const { original: plugin, children } = node;

      //  Gather Exports (to be used as imports)
      const imports = this.getNodeExports(node, exportMap);

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
      this.setNodeExports(node, exports, exportMap);
      node.exports = exports;

      //  Process Children
      for (const child of children) {

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
        await this.processNode(child, exportMap);

        //  Invoke the Process Register
        this.haliaCoreAPI.processRegister.invoke({ stack: this, child, parent: node });
      }
    }


    //  Function to obtain imports
    private getNodeExports = (node: Node<T>, exportMap: { [id: string]: any }) => {

      const { original: { dependencies = [] } } = node;

      //  Core Requirements
      const importMap: { [name: string]: any } = {};
      dependencies.forEach((depId) => {
        importMap[depId] = exportMap[depId];
      });

      //  Iterate Import Transformers
      this.haliaCoreAPI.importRegister.invoke({ stack: this, node, importMap, exportMap });

      return importMap;
    };

    private setNodeExports = (node: Node<T>, value: any, exportMap: { [id: string]: any }) => {

      const { original: { id } } = node;

      if (exportMap[id] != undefined) {
        throw `An export has already been defined for the '${ id }' Plugin.`;
      }

      exportMap[id] = value;

      //  Iterate Export Transformers
      this.haliaCoreAPI.exportRegister.invoke({ stack: this, node, exportMap });
    };

  /**
   * Builds the Halia Stack and returns the root nodes.
   */
  public build = async () => {

    const plugins = Object.keys(this.plugins).map(
      (pluginName) => this.plugins[pluginName]
    );

    //  Build the Nodes
    const nodeCache: { [pluginId: string]: Node<T> } = {};

    //  Get Node Plugins
    const nodes = plugins.map((plugin) => this.buildNode(plugin as any, nodeCache));

    //  Nest Nodes
    const rootNodes = await this.nestNodes(nodes);

    //  Build the App Depth-First
    const exportMap: { [name: string]: any } = {};

    //  Process Root Nodes
    for (const node of rootNodes) {
      await this.processNode(node, exportMap);
    }

    //  Set the Map
    this.exports = exportMap;

    return rootNodes;
  };
}
