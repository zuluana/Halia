
/**
 * Register functions to be synchronously invoked.  Similar to an "Event Emitter".
 */
export class Register<Params> {
  private registerList: { id: string, func: (params: Params) => void }[] = [];

  public size = () => {
    return this.registerList.length;
  }

  public addRegister = (id: string, func: (params: Params) => void ) => {
    this.registerList.push({ id, func });
  }

  public removeRegister = (id: string) => {
    const index = this.registerList.findIndex((register) => { register.id === id; });
    if (index === -1) { throw `No register registered with ID '${ id }'.`; }
    this.registerList.splice(index, 1);
  }

  public invoke = (input: Params): void => {
    for (let i = 0; i < this.registerList.length; i++) {
      const func = this.registerList[i].func;
      func(input);
    }
  }
 }
