![Halia Logo](https://github.com/CodalReef/Halia/blob/master/assets/Halia%20Cover.png?raw=true)

# Halia
### TS / JS Dependency Injector

**Build "Plugins" to encapsulate and inject features instead of spreading them around your codebase.**

Halia is an extensible, lightweight dependency injection (DI) tool used to build extensible, modular systems.  Write "Plugins" to centralize features and inject them into your App (or other Plugins).

To differentiate from existing DI solutions, Halia prioritizes "extensibility".  Each Plugin has an "install" phase where it initializes itself **and** injects functionality back into its dependencies.  It then exports its own API for downstream Plugins to inject back into it.

For more information regarding how Halia compares to existing Package Managers, Module Systems, and DI Solutions, please see [More Info](#More Info).

#### Plugin Overview

Each Plugin may depend upon other Plugins.  Once a Plugin's dependencies are installed, its "install" function is invoked with the "Plugin APIs" exported by its dependencies.

Use these dependency APIs to predictably augment existing functionality. Then, export your own "Plugin API" for down-stream consumers.

The set of installed Plugins can be changed at runtime and the app re-built. Halia is itself, a Halia Plugin, so it's open for extension.

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


## Usage

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

A "Stack" is a program built at run-time using several Halia Plugins.

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


##  Roadmap

-  Plugin Configuration
-  Consider exporting an Object OR specifically *a Plugin* from each Halia "Stack".

## Extensions

Halia will eventually be extensible via the "HaliaCore" Plugin.  This can be used for building several augmentations onto Halia.  Some ideas include:

-  Incompatibility Management
-  Global Injections
-  Cyclic Dependencies
-  Plugin Inheritance
-  Plugin Overloads
-  API Transformers
-  Additional Passes / Channels
-  External Integration
-  Multiple exports for different "Targets".

## (More-Info)

### Package Managers (like npm ) vs. Halia

NPM is a "Package Manager" used to manages static, package-level dependencies which typically stay constant between runs.

Halia also manages dependencies, but the dependency tree can be built on-demand at runtime, and typically between "Features" in the application domain, not static libraries used to build features.

Halia also has an "install" step, which enables Plugins to change the functionality of existing Plugins.

Halia "Plugins" are similar to "Packages", and depending on your definition, Halia may be classified as a "Package Manager".  However, with the addition of runtime construction and first-class support for mutation, we feel the label "Plugin Manager" is more fitting.

### Module Systems (like JS Modules) vs. Halia

JS Modules is a "Module System" used to bundle code across the filesystem and map it to variables in the local scope (using "import" and "export" statements).

In contrast, Halia automatically resolves dependencies between features without the need to manually manage import order.

In addition, each Halia Plugin has a unique identifier which ensures it's registered as a singleton instance.

### Vanilla JS vs. Halia

You don't need Halia to implement the "Plugin Manager" pattern.  However, as the number of dependencies grows and use-cases evolve, several problems emerge:

-  **Import Order**:  You need to manage import order, which can become complex and difficult to refactor.
-  **Singleton Guarantee**:  There's no guarantee the loaded module is a Singleton.
-  **Dependency Verification**:  It's your responsibility to ensure dependencies are met prior to installation.
-  **Delayed Installation**:  You'll need to manually manage installation if it occurs after initial load.
-  **Dynamic Modification**: If the set of “Features” changes at runtime, you'll need to manage that change.  For example, verifying module compatibility.

With Halia, the complete dependency graph is built at build-time, so there's no need to manually order them, just declare their existence.  

Each Plugin has a unique ID to which a singleton instance is associated.  If the same ID is used twice, an error is thrown.

>  We hope to support versioned Plugins in the future.  Possibly through a Core Plugin.

A Plugin will not be installed unless all dependencies were installed successfully.

>  We hope to make this configurable, perhaps globally, per Plugin, with an injected config function, etc.

Halia Stacks can be built on-demand (and re-built) as needed.  This means, if the feature set changes at runtime, we can re-build the stack and run again.

### Other DI Solutions vs. Halia

Our *intent* is for Halia to be a generic, extensible Dependency Injection tool.  However, we see a lot of value in the "Plugin Pattern".  Therefore, extensibility is a first-class concern of ours, this this repo, and Halia Extensions.

For example, while most DI solutions use a class constructor for initialization, we accept a standard JS Function.  This makes it possible to build an extension for "Asynchronous Installation".

 However, you *can* use Halia as a standard DI solution without implementing the "Plugin Pattern" with back-installation. 

Other DI Solutions, like Angular and Nest.js Providers can be used to solve a lot of the same problems, but with some key differences:


-  **Extensible**:  Use existing (or build your own) "Halia Extensions" to install the features you need.  For example, add optional dependencies, incompatibility management, etc...
-  **Independent**:  Halia is not coupled with a particular back-end or front-end technology.  But, with Halia Extensions, it can be made to work with most tech stacks.
-  **Team**:  We have a deep interest in extensibility, cross-eco integration, cross-eco context, loose coupling, system staking, virtualized centralization, and lots more.  You can expect to see more of these concepts as we release extensions, associated packages, and posts.

### Principles

#### Responsibility
Each Plugin is responsible for the valid use of the imported APIs.  Without a standard mechanism to enforce or define "valid" use, the responsibility is deferred to the Plugin developers.  For this reason, it's important to understand the usage rules and limitations of each imported API and your own.  However, a Plugin is not responsible for the validity of its dependencies.

###  Problems

While using Halia (or any Plugin manager) you might encounter several common problems.  Most of these can be solved by applying one or more design patterns.

#### Incompatibility
An "Incompatibility" exists between two or more Plugins which cannot co-exist.  For example, when installed together, the functionality of the system may be invalid compared to the expected functional state.  To solve this problem, try the following suggestions:

-  Remove one of the Plugins.
-  Update one of the Plugins to fix the incompatibility.
-  Build a new "Coupling Plugin" to fix the incompatibility.
-  Update the dependency APIs to support the Plugins.

### Patterns

These are common patterns you can apply to help you build robust, modular systems.

####  Coupling Plugin
A "Coupling Plugin" is used to correct invalid or missing functionality that results from an incompatibility.

For example, imagine we add two new Plugins, "Video" and "Messaging".  Assuming they both inject themselves with the same API, it's possible they'd overwrite one another.  To solve this, we can build a new "Coupling Plugin", perhaps called "VideoMessaging", to inject the necessary patch.

This approach can be useful, but it's good practice to keep Plugins independent and compatible.  This helps control feature "fan-out" and keeps combinatorial explosion in check.


### Attribution

Halia is inspired by similar dependency injection tools (like Angular and Nest Providers), but de-coupled from the specific back-end and front-end technology.
