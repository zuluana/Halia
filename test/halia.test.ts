/**
 * Copyright (C) Oranda - All Rights Reserved (January 2019 - January 2021)
 */

import { HaliaPlugin, Program, HaliaProgramAPI, HaliaProgram } from "../src/core-plugin";
import { HaliaStack } from "../src/halia";
import expect = require("expect");

describe("Halia", () => {

  let haliaStack: HaliaStack;

  before(async() => {

    interface PIImports {
      haliaProgram: HaliaProgramAPI;
    }

    class PIAPI {
      public messages: string[] = [];
      public addMessage = (message: string) => {
        this.messages.push(message + ":PI");
      };
    }

    const PI: HaliaPlugin = {
      id: "pI",
      name: "PI",
      description: "Plugin I:  Export a function to add messages which will be returned by the Halia Program.",
      dependencies: [HaliaProgram.id],
      install: ({ haliaProgram }: PIImports) => {

        const pIAPI = new PIAPI();

        haliaProgram.registerCode(() => {
          return pIAPI.messages;
        });

        return pIAPI;
      }
    };

    //  Create the Stack
    haliaStack = new HaliaStack();

    haliaStack.register(HaliaProgram);
    haliaStack.register(PI);



    class PIIImports {
      pI: PIAPI;
    }

    class PIIAPI {
      constructor (private pI: PIAPI) {}
      public messages: string[] = [];
      public addMessage = (message: string) => {
        this.pI.addMessage(message + ":PII");
      };
    }

    const PII: HaliaPlugin = {
      id: "pII",
      name: "PII",
      description: "Plugin II:  Build a function to wrap the PI 'addMessage' function.  It adds ':II' to the message",
      dependencies: [PI.id],
      install: ({ pI }: PIIImports) => {
        const pIIAPI = new PIIAPI(pI);
        return pIIAPI;
      }
    };

    //  IF a plugin messes up something, then that things depednencies MAY not get the otherr one.
    //  MAYBE depende on the one that canges, OR maybe just
    haliaStack.register(PII);

    interface PIIIImports {
      pII: PIIAPI;
    }

    const PIII: HaliaPlugin = {
      name: "Plugin III",
      id: "pIII",
      description: "Plugin III:  Actually add the message using the P2 API.",
      dependencies: [PII.id],
      install: ({ pII }: PIIIImports) => {
        pII.addMessage("PIII");
      }
    };

    haliaStack.register(PIII);

  });

  it("should successfully start the program", async () => {
    await haliaStack.build();
    const progAPI: HaliaProgramAPI = haliaStack.getExports(HaliaProgram.id);
    const res = await progAPI.run();
    console.log(res);
    expect(JSON.stringify(res[0])).toEqual(JSON.stringify(["PIII:PII:PI"]));
  });
});

