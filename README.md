![Halia Logo](https://github.com/CodalReef/Halia/blob/master/assets/Halia%20Cover.png?raw=true)

# Halia
### TS / JS Extensible Dependency Injector

**Build "Plugins" to encapsulate features instead of spreading them around your codebase.**

-  **Extensible**:  Install extensions to customize the injector.
-  **Tested**:  Test / Src Ratio (TSR): ~1/2.
-  **Lightweight**:  ~ 400 lines of non-test code.
-  **Independent**:  Not coupled with a particular back-end or front-end technology.
-  **Philosophy**:  Extensibility is a first-class concern as discussed in [Plugin Pattern](#plugin-pattern).

Halia is a generic, extensible dependency injection (DI) framework.  However, we believe it's particularly well suited for implementing the [Plugin Pattern](#plugin-pattern).

With this pattern, you encapsulate features as "Plugins" which are then injected into the app.  This keeps your code de-coupled, organized, and open for extension.  
.
## Table of Contents
- [Introduction](#halia)
  - [Dependency Injection](#dependency-injection)
  - [Dependency Injection Frameworks](#dependency-injection-frameworks)
  - [Plugin Pattern](#plugin-pattern)
- [Installation](#installation)
- [Example](#example)
- [API](#api)
  - [Plugins](#plugins)
  - [Stacks](#stacks)
  - [Extensions](#extensions)
- [Road Map](#road-map)
  - [Features](#features)
  - [Extensions](#extensions-1)
- [More Info](#more-info)
  - [Package Managers (like npm ) vs. Halia](#package-managers-like-npm--vs-halia)
  - [Module Systems (like JS Modules) vs. Halia](#module-systems-like-js-modules-vs-halia)
  - [Plugin Incompatibility](#plugin-incompatibility)
- [Attribution](#attribution)


### Dependency Injection

Imagine you're a goldfish (named Doug 🐠), and you love bubbles.  So much so, that you bought a Bubble Machine with a Javascript SDK!

You write a program to make bubbles when you wake up:

```typescript
import * as Bubbler from 'Bubbler';
const initBubbler = () => {

  //  Instantiate
  const bubbler = new Bubbler({ id: "dougs-bubbler" });

  //  Start the Bubbler
  bubbler.bubble({ startTime: "7:00AM", endTime: "8:00AM" })
}
initBubbler();
```

Great, now you awaken to fresh, well-oxygenated water 💦

You tell your friend Mary (🐟), and she's so excited, she buys a bubbler too.

You update the code to initialize both bubblers:


```typescript
import * as Bubbler from 'Bubbler';
const initDougsBubbler = () => {
  const bubbler = new Bubbler({ id: "dougs-bubbler" });
  bubbler.bubble({ startTime: "7:00AM", endTime: "8:00AM" })
}
const initMarysBubbler = () => {
  const bubbler = new Bubbler({ id: "marys-bubbler" });
  bubbler.bubble({ startTime: "7:00AM", endTime: "8:00AM" })
}
initDougsBubbler();
initMarysBubbler();
```

It works, but there's something fishy going on here...

Instead of duplicating and renaming the function, you can "hoist" the instantiation step outside the functions:

```typescript
import * as Bubbler from 'Bubbler';
const initBubbler = (bubbler) => { 
  bubbler.bubble({ startTime: "7:00AM", endTime: "8:00AM" })
}

const dougsBubbler = new Bubbler({ id: "dougs-bubbler" });
const marysBubbler = new Bubbler({ id: "dougs-bubbler" });

initBubbler(dougsBubbler);
initMarysBubbler(marysBubbler);
```

With that, we only need the single `initBubbler` function.  Even if your friends Larry (🐙) and Barry (🐡) decide to buy Bubblers too.

Now, the `initBubbler` function is no longer responsible for constructing a `bubbler` instance.  Instead, it's **injected** into the function from the outer scope.  This pattern is called "Dependency Injection" (DI).

Further, because the caller is now in control of initializing the Bubbler (instead of the `initBubbler` function), we say control has been "inverted".  Dependency Injection is a means by which to achieve "Inversion of Control" (IoC).

The outer scope, responsible for instantiating the `bubbler` dependency, is called the "Inversion of Control Container" (IoC Container).

In Halia (and other frameworks like Angular and Nest.js), the developer declares a function's dependencies, and the framework acts as the IoC Container, automatically invoking each function with the injected parameters.

This means, the developer is no longer responsible for ensuring there's only one copy of each dependency (Singleton Pattern) or timing the instantiation.  It all happens automatically, in a declarative, predictable way.

### Dependency Injection Frameworks
You can use a DI Framework to define a "Module", its dependencies, and the code to invoke when the dependencies become available.  

For each "Module", it generally works like this:

1.  **Declare**:  The module declares a list of dependencies along with a constructor function.
2.  **Invoke**:  Once all dependencies are initialized, the framework calls the constructor with the dependencies.

Note that some DI Frameworks don't support chaining (modules which depend upon other modules) or nesting (modules defined within other modules).  Halia supports both of these use-cases out of the box.

Now, let's look at what changes when we apply the "Plugin Pattern":


### Plugin Pattern
In a DI Framework, the state of each dependency is typically set on construction and (in many cases) it doesn't change much after that.  A function typically depends upon a module and it *uses* that module to accomplish a goal.

With what we call the "Plugin Pattern", the *intention* is slightly different.  The dependencies will still be injected into each module, but instead of simply *using* these dependencies to accomplish a goal, they can be *modified*.  Because modules in this pattern are expected to "plug" functionality into their dependencies, we call them "Plugins".

It's possible to be explicit about this by exporting multiple APIs.  For example, one for *usage* and another for *modification*.  However, Halia doesn't make this distinction, and a Plugin can export an API which does any combination of these things.

Each dependency is still responsible for defining the initial API passed to its consumers.  With the Plugin Pattern, its not unexpected for the API methods to change the dependency's *state*, and / or the *exported API itself*.

> With the introduction of API Modification, we make a distinction between the "API Contract" and "API".  The "API Contract" is a set of rules / conditions set by a Plugin, and it should remain unchanged.  The "API", which includes the exported member functions and their associated functionality, is expected to change (within the confines of the API Contract).

We call a Plugin "stable" if it's contract is well-defined and unbreakable.  Conversely, if usage of a API can lead to a breach of contract (or the contract is ambiguous), we call the Plugin "unstable".  As long as a Plugin is stable, we can still predictably use and extend its API.

With this pattern, it becomes easy to mix, match, and build new features.  It's even possible to open your app for extension by external developers (like Wordpress does).


## Installation

Install with npm:

`npm i --save git+ssh://git@github.com:CodalReef/Halia.git`

Install with Yarn:

`yarn add git+ssh://git@github.com:CodalReef/Halia.git`


## Example
You have a duck that everyone loves:

```typescript
//  duck-app.ts
export const getDuck = () => {
  return "Quack";
}
```

Everyone except Paul.  Paul wants a special **🦄 Disco Duck 🦄**, so you make an update:

```typescript
//  duck-app.ts
import { Paul } from 'client-list';
import { config } from 'config';
export const getDuck = () => {
  if (params.client === Paul) {
    return "Michael Quackson";
  }
  return "Quack";
}
```

While the code works for Paul, it's become more complex, harder to read, and coupled with the "client" concept.

Instead, we can use a Halia Plugin to encapsulate and inject this feature:

```typescript
//  duck-app-plugin.ts
import * as DuckApp from './duck-app';
export const DuckAppPlugin: HaliaPlugin = {
  id: "duckApp",
  name: "Duck App Plugin",
  install: () => ({
    setGetDuck: (getDuck) => DuckApp.getDuck = getDuck
  })
}
```

```typescript
//  disco-duck-plugin.ts
import { Paul } from 'client-list';
import * as config from 'config';
export const DiscoDuckPlugin: HaliaPlugin = {
  id: "discoDuck",
  name: "Disco Duck Plugin",
  dependencies: [DuckAppPlugin.id],
  install: ({ duckApp }) => {
    if (config.client === Paul) {
      duckApp.setGetDuck (() => "Michael Quackson")
    }
  }
}
```



Then we can build the stack and invoke the code:


```typescript
//  main.ts
import { HaliaStack } from Halia;
import { DuckApp } from './DuckApp';
import { DiscoFeature } from './DiscoFeature';

const buildApp = async () => {

  //  Initialize the Stack
  const appStack = new HaliaStack();

  //  Register Plugins
  appStack.register(DuckApp);
  appStack.register(DiscoFeature);

  //  Build the Stack
  await appStack.build();

  //  Call the Method
  const duckApp = appStack.getExports(DuckApp.id);
  duckApp.logNoise();
}

buildApp();
```

With this, the original code is left in-tact and de-coupled.

If Paul longer wants the **🦄 Disco Duck 🦄**  we just don't register the Plugin.  If he needs an additional change, we have a namespace dedicated to his unique needs.

>  This is a simple example that can be solved in other ways.  However, it demonstrates the general idea, and as features become more complex, we've found this pattern helps to keep things organized.


## API

### Plugins

Define a Plugin for each feature you wish to encapsulate.  You determine what each Plugin does and what API is exported for dependencies to use.

>  To Halia, the functional API exported by a Plugin is the sole integration point.  When manipulating a dependency, we recommend sticking to this functional interface and against direct manipulation when possible.  

```typescript
export const MyPlugin: HaliaPlugin = {
  id: "myPlugin",             //  Unique Identifier 
  name: "My Plugin",          //  Human Readable Name
  description: "My Plugin!",  //  Human Readable Description
  dependencies: [],           //  Array of Plugin Identifiers
  install: (imports) => {     //  Function to "Install" this Plugin
    return {};                //  Return a "Plugin API" for Downstream Dependencies
  }
}
```

###  Stacks

A "Stack" is a program built at run-time using several Halia Plugins.  Because it's built at runtime, the set of plugins in the stack can be changed and the system re-built.  

```typescript
//  Initialize the Stack
const stack = new HaliaStack();

//  Register Plugins
stack.register(App);
stack.register(Feature1);
stack.register(Feature1_1);
stack.register(Feature2);
// etc...

//  Build the Stack
await stack.build();

//  Extract an Export
const f1Exports = stack.getExports(Feature1.id);

//  Extract a Plugin
const f1Plugin = stack.getPlugin(Feature1.id);
```

At this point, `stack` is an initialized instance of your Plugin Set.  It may be a program, or perhaps a feature to be further nested in another Halia Stack.

To extract a Plugin or Exported API from a stack use the `getExports` and `getPlugin` Stack methods.

### Extensions

Halia is itself, a Halia Plugin, open for extension.  

For example, here we install the the "Optional Dependencies" Plugin to add a new `optionalDependencies` field to each Plugin.

```typescript
//  Initialize the Stack
const coreStack = new HaliaStack();

//  Register Elements
coreStack.register(HaliaCore);
coreStack.register(OptionalDependencies);

//  Build the Stack
await coreStack.build();
```

Now, we can define Plugins with a new `optionalDependencies` field:

```typescript

const MyPlugin: HaliaPlugin & OptionalDependenciesPatch = {
  id: "myPlugin",
  name: "My Plugin",
  install: () => {},  //  Do Something
  dependencies: [],

  //  New Feature!
  optionalDependencies: ["OtherPlugin"]
}
```

>  The "Core Stack" is currently a Global which may only be built once.  The functionality added by Plugins is integrated as it's built.  We plan to address these concerns by clearing the global and turning off modifications prior to core extension. 

##  Road Map

### Features
-  Plugin Configuration
-  Consider exporting an Object OR specifically *a Plugin* from each Halia "Stack".

### Extensions

-  Incompatibility Management
-  Plugin Versions
-  Global Injections
-  Cyclic Dependencies
-  Plugin Inheritance
-  Plugin Overloads
-  API Transformers
-  Additional Passes / Channels
-  External Integration
-  Multiple Exports:  It should be possible to export multiple APIs, for example, one for *usage* and another for *modification* and route these to modules tagged for that purpose.
-  Generic Tagging


## More Info

### Package Managers (like npm ) vs. Halia

NPM is a "Package Manager" used to manages static, package-level dependencies which typically stay constant between runs.

Halia also manages dependencies, but the dependency tree can be built on-demand at runtime, and typically between "Features" in the application domain, not static libraries used to build features.

Halia also has an "install" step, which enables Plugins to change the functionality of existing Plugins.

Halia "Plugins" are similar to "Packages", and depending on your definition, Halia may be classified as a "Package Manager".  However, with the addition of runtime construction and first-class support for mutation, we feel the label "Plugin Manager" is more fitting.

### Module Systems (like JS Modules) vs. Halia

JS Modules is a "Module System" used to bundle code across the filesystem and map it to variables in the local scope (using "import" and "export" statements).

In contrast, Halia automatically resolves dependencies between modules without the need to manually manage import order.  In addition, each Halia Plugin has a unique identifier which ensures it's registered as a singleton instance.

You don't need Halia to manage dependencies or implement the "Plugin Pattern".  However, as the number of dependencies grows and use-cases evolve, several problems emerge:

-  **Import Order**:  You need to manage import order, which can become complex and difficult to refactor.
-  **Singleton Guarantee**:  There's no guarantee the loaded module is a Singleton.
-  **Dependency Verification**:  It's your responsibility to ensure dependencies are met prior to installation.
-  **Delayed Installation**:  You'll need to manually manage installation if it occurs after initial load.
-  **Dynamic Modification**: If the set of “Features” changes at runtime, you'll need to manage that change.  For example, verifying module compatibility.

In Halia, the complete dependency graph is built at runtime, so there's no need to manually order them. Each Plugin has a unique ID associated with a singleton instance.  If the same ID is used twice, an error is thrown.  Halia Stacks can be built on-demand (and re-built) as needed.  This means, if the feature set changes at runtime, we can re-build the stack and run again.

###  Plugin Incompatibility

While using Halia (or any DI Framework with the Plugin Pattern) you might encounter incompatibility between Plugins.

An "Incompatibility" exists between two or more Plugins which, when installed together, result in a dysfunctional state. To solve this problem, try the following suggestions:

-  Remove one of the Plugins.
-  Update one of the Plugins to fix the incompatibility.
-  Build a new "Coupling Plugin" to fix the incompatibility.
-  Update the dependency's exported APIs to support the Plugins.

A "Coupling Plugin" is used to correct invalid or missing functionality that results from an incompatibility.

For example, imagine we add two new Plugins, "Video" and "Messaging".  Assuming they both inject themselves with the same API, it's possible they'd overwrite one another.  To solve this, we can build a new "Coupling Plugin", perhaps called "VideoMessaging", to inject the necessary patch.

This approach can be useful, but it's good practice to keep Plugins independent and compatible.  This helps control feature "fan-out" and keeps combinatorial explosion in check.


## Attribution

Halia is inspired by similar DI tools (like Angular and Nest.js).  Both have helped shape our understanding of DI and DI Frameworks.
