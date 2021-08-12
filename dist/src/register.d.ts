/**
 * Register functions to be synchronously invoked.  Similar to an "Event Emitter".
 */
export declare class Register<Params> {
    private registerList;
    size: () => number;
    addRegister: (id: string, func: (params: Params) => void) => void;
    removeRegister: (id: string) => void;
    invoke: (input: Params) => void;
}
