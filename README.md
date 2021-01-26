![Halia Logo](https://github.com/CodalReef/Halia/blob/master/assets/Halia%20Cover.png?raw=true)

# Halia
### TS / JS Extensible Dependency Injection

**Build "Plugins" to encapsulate and inject features instead of spreading them throughout the codebase.**

-  **Extensible**:  Use (or write) extensions to build a dependency injector tuned to your needs.
-  **Tested**:  Test / Src Ratio (TSR): ~1/2.
-  **Lightweight**:  ~ 400 lines of non-test code.
-  **Independent**:  Not coupled with a particular back-end or front-end technology.
-  **Philosophy**:  Extensibility is a first-class concern as discussed in [Plugin Pattern](#plugin-pattern).

Halia is a generic, extensible dependency injection (DI) framework.  However, we believe it's particularly well suited for implementing the [Plugin Pattern](#plugin-pattern).

With this pattern, you encapsulate each features in a "Plugin", which is then injected into your app.  Further, your Plugin may export its own "Plugin API", or "API-API" which downstream consumers can then use to change and augment its API.

The "Plugin Pattern" can help keep your code organized and extensible.  When you need to add a feature, there's no reason to understand the whole codebase.  Identify the application-level dependencies, learn their APIs and build a Plugin.  

It becomes easy to mix, match, and build new features.  It's even possible to open your app for injection by external developers (like Wordpress does).  That said, everything has a cost, and at least for now, it does complicate static typing.

For more information regarding how Halia compares to existing Package Managers, Module Systems, and DI Solutions, please see [More Info](#more-info).

## Table of Contents**
[Introduction](#halia)
[Dependency Injection](#dependency-injection)
[Plugin Pattern](#plugin-patternn)
[Installation](#installation)
[Example](#example)
[API](#api)
[More Info](#more-info)

#### Dependency Injection

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

#### Plugin Pattern
DI Frameworks automatically initialize dependencies and inject them into their consumers.  The state of each dependency is often determined on construction.

With what we call the "Plugin Pattern", the intention is slightly different.  Each dependency is still initialized and injected, but their state *and* API is open to modification by consumers.

In Halia, once a Plugin's dependencies are installed, its "install" function is invoked with the "Plugin APIs" exported by its dependencies.

You can then use these dependency APIs to predictably augment existing functionality. Then, export your own "Plugin API" for down-stream consumers.

As new Plugins inject changes, they might change a parent API.  However, if a change breaks the API contract we call this an "unstable" modification. To stay stable, it's a Plugin's responsibility to ensure its dependencies aren't breaking its API contract.

On that note, it doesn't mean the API shouldn't change at all.  It's up to the Plugin to define its API contract and for dependencies to understand that contract.  That contract can include a level of acceptable change, and that's up to the Plugin developer.

The "Plugin Pattern" can help keep keep your code organized and extensible.  When you need to add a feature, there's no reason to understand the whole codebase.  Identify the application-level dependencies, learn their APIs and build a Plugin.  

It becomes easy to mix, match, and build new features.  It's even possible to open your app for injection by external developers (like Wordpress).  That said, everything has a cost, and at least for now, it does complicate static typing.

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

##  Roadmap

### Features
-  Plugin Configuration
-  Consider exporting an Object OR specifically *a Plugin* from each Halia "Stack".

### Extensions

-  Incompatibility Management
-  Global Injections
-  Cyclic Dependencies
-  Plugin Inheritance
-  Plugin Overloads
-  API Transformers
-  Additional Passes / Channels
-  External Integration
-  Multiple exports for different "Targets".


## More Info

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

Halia has feature overlap with existing DI solutions, but we prioritize extensibility.

For example, while many DI solutions use a class constructor for initialization, we accept a standard JS Function.  We also support custom extensions, and therefore, it's possible to build an extension for something like "Asynchronous Installation".

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

Halia is inspired by similar DI tools (like Angular and Nest Providers).  They both have strong documentation which has helped shape my understanding of DI and DI Frameworks.
