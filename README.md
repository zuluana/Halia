![Halia Logo](https://github.com/CodalReef/Halia/blob/master/assets/Halia%20Cover.png?raw=true)

# Halia

### Extensible TS / JS Dependency Injection Framework
>  Write Less Code and Play with Blocks 🧱

Use "Plugins" to encapsulate and inject features into your app (and other plugins).  This keeps features simple, de-coupled, and open for extension.  

Halia is a generic, extensible dependency injection (DI) framework.  We use it to generate ReactNative apps at runtime using the [Plugin Pattern](#plugin-pattern).

-  **Extensible**:  Install extensions to customize the injector.
-  **Tested**:  Test / Src Ratio (TSR): ~1/2.
-  **Lightweight**:  ~ 400 lines of non-test code.
-  **Independent**:  Not coupled with a particular back-end or front-end technology.
-  **Philosophy**:  Extensibility is a first-class concern as discussed in [Plugin Pattern](#plugin-pattern).



## 📖 Table of Contents
- [Introduction](#halia)
- [Installation](#installation)
- [API](#api)
  - [Plugins](#plugins)
  - [Stacks](#stacks)
  - [Extensions](#extensions)
- [Concepts](#concepts)
  - [Dependency Injection](#dependency-injection)
  - [Pluggable Systems](#plugin-based-architecture)
- [Example](#example)
- [Road Map](#road-map)
  - [Features](#features)
  - [Extensions](#extensions-1)
- [More Info](#more-info)
  - [Package Managers (like npm ) vs. Halia](#package-managers-like-npm--vs-halia)
  - [Module Systems (like JS Modules) vs. Halia](#module-systems-like-js-modules-vs-halia)
  - [Pluggable Systems with DI](#pluggable-systems-with-di)
  - [API Modification](#api-modification)
  - [Plugin Incompatibility](#plugin-incompatibility)
- [Attribution](#attribution)



## Installation

Install with npm:

`npm i --save git+ssh://git@github.com:CodalReef/Halia.git`

Install with Yarn:

`yarn add git+ssh://git@github.com:CodalReef/Halia.git`


## API

### Plugins

Build a "HaliaPlugin" for each feature you wish to encapsulate.  

Each Plugin has an `install` function which is "injected" with the dependencies defined in the `dependencies` list.  

Each Plugin also exports an API which will be injected downstream consuming plugins.


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

Note that some DI Frameworks don't support chaining (modules which depend upon other modules) or nesting (modules defined within other modules).  Halia supports both of these use-cases out of the box.

##  Concepts

Halia is a "Dependency Injection Framework".  Before using Halia, it's good to have an understanding of "Dependency Injection", the "Plugin Pattern", and related concepts.  

### Dependency Injection

![Doug](https://github.com/CodalReef/Halia/blob/master/assets/Doug.png?raw=true)

If you're new to Dependency Injection, we recommend reading our article:  [Learn Dependency Injection with Doug the Goldfish 🐠](https://dev.to/codalreef/learn-dependency-injection-with-doug-the-goldfish-3j43)

### Pluggable Systems

![Lenny](https://github.com/CodalReef/Halia/blob/master/assets/Lenny.jpg?raw=true)

If you're new to building "Pluggable" systems, we recommend reading our article:  [Build Pluggable Apps with Lenny the Duck 🦆](https://dev.to/codalreef/pluggable-apps-with-lenny-the-duck-2oj3)

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

##  Road Map

### Features
-  Plugin Configuration
-  Plugin Factories / Plugin "Instances" (we can currently do this just building a Plugin before we build the stack)
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

NPM is a "Package Manager" used to manage static dependencies.  Halia also manages dependencies, but the dependency tree can be built on-demand at runtime.

Halia also has an "install" step, which enables Plugins to change the functionality of existing Plugins.

Halia "Plugins" are similar to "Packages", and depending on your definition, Halia may be classified as a "Package Manager".  However, with the addition of runtime construction and first-class support for mutation, we feel the label "Plugin Manager" is more fitting.

### Module Systems vs. Halia

JS Modules is a "Module System" used to bundle code across the filesystem and map it to variables in the local scope (using "import" and "export" statements).

You don't need Halia to manage dependencies or to implement the "Plugin Pattern".  But, we believe it offers several advantages over existing alternatives:

- **Dynamic Loading**:  The Halia module tree can be re-built at runtime after adding / removing modules.
- **Asynchronous Loading**:  Halia modules can block instantiation with asynchronous code.
- **Singletons**:  The Halia injection framework ensures only a single instantiation of each module.
- **Multi-Dimensional**:  Halia is decoupled from the file-system.  Code elements can be injected and joined to a module from multiple places.
- **Extensibility**:  Halia is built to be extended.  If you need one-off features in your module system, you can inject them without building a new module system.
- **Introspection**:  We're building a suite of tools to visually and dynamically interact with Halia apps.  This means adding, removing, building, and configuring "Plugins" using graphical tools with a tight feedback loop.

### Pluggable Systems with DI

In some cases, the the state of each dependency is set on construction, and it doesn't change much after that.  A function typically depends on a module and it *uses* that module to accomplish a goal.

However, when using DI to manage "Plugins", the *intention* is slightly different.  The dependencies will still be injected into each module, but instead of simply *using* these dependencies to accomplish a goal, we can *modify* them.  Because modules in this pattern may "inject" functionality into their dependencies, we call them "Plugins".

###  API Modification

Each dependency is still responsible for defining the initial API passed to its consumers.  With the Plugin Pattern, its not unexpected for the API methods to change the dependency's *state*, and / or the *exported API itself*.

> With the introduction of API Modification, we make a distinction between the "API Contract" and "API".  The "API Contract" is a set of rules / conditions set by a Plugin, and it should remain unchanged.  The "API", which includes the exported member functions and their associated functionality, is expected to change (within the confines of the API Contract).

We call a Plugin "stable" if it's contract is well-defined and unbreakable.  Conversely, if usage of a API can lead to a breach of contract (or the contract is ambiguous), we call the Plugin "unstable".  As long as a Plugin is stable, we can still predictably use and extend its API.

It's possible to be explicit about which types of APIs a Plugin exports.  For example, one for *usage* and another for *modification*.  However, Halia doesn't make this distinction, and a Plugin can export an API which does any combination of these things.

With this pattern, it becomes easy to mix, match, and build new features.  It's even possible to open your app for extension by external developers (like Wordpress does).


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

Halia is inspired by similar DI tools like [Angular](https://angular.io/guide/providers) and [Nest](https://docs.nestjs.com/fundamentals/custom-providers).  Both resources helped shape our understanding of DI, IoC Container, and DI Frameworks.
