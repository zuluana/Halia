/**
 * Copyright (C) Oranda - All Rights Reserved (January 2019 - January 2021)
 */

 export interface HaliaPlugin<I = any, E = any> {
  id: string;
  name: string;
  description?: string;
  dependencies?: string[];
  install: (imports: I) => E;
 }


/**
 * HaliaCore
 */

export class HaliaCoreAPI {
  //  TODO:  This is where we can build the API used to extend Halia itself.
  //         For example, optional dependencies, incompatibility management, multiple passes / channels (not just install), module inheritance / overloads, piping / transform system, cyclic dependencies, etc...
}

const haliaCoreAPI = new HaliaCoreAPI();

export const HaliaCore: HaliaPlugin<undefined, HaliaCoreAPI> = {
  id: "haliaCore",
  name: "Halia Core",
  description: "The Extensible Halia Core",
  dependencies: [],
  install: () => {
    return haliaCoreAPI;
  }
};


/**
 * HaliaProgram
 */

export type handler = (dependencies: HaliaPlugin[]) => void;

export interface Program {
  registerCode: (handler: handler) => void;
}

export class HaliaProgramAPI {

  public code: any[] = [];
  public registerCode = (handler: handler) => {
    this.code.push(handler);
  };

  public run = async () => {
    const results = [];
    for (const handler of this.code) {
      const res = await handler();
      results.push(res);
    }
    return results;
  };
}


export const HaliaProgram: HaliaPlugin<undefined, HaliaCoreAPI> = {
  id: "haliaProgram",
  name: "Halia Program",
  description: "Extensible Program",
  dependencies: [],
  install: () => {
    return new HaliaProgramAPI();
  }
};
