# CssVar

CssVar is a node module used to manage CSS variables dynamically using JavaScript. This module allows to log, get and set CSS variables. CssVar is capable of doing each operation withing a particular scope of CSS variables.

# Installation

```bash
npm install @thadathilsinan/cssvar
```

## Initialization

First of all you have to import the module

```javascript
import CssVar from "@thadathilsinan/cssvar";
```

After that we can initialize the module with a particular variable scope.

> **NOTE :** CSS variables are scoped using the CSS selectors. The global scope is referred as the selector ":root". We can have any local scope such as our class selectors, id selectors, etc.

```javascript
let cssVar = new CssVar("selector"); //For global scope use :root as selector
```

# Usage

The primary operations we can do with this module are:

- Log variables
- Set value for variable
- Get value of a variable

## log()

This method call will log all the variables into the console.

```javascript
cssVar.log();
```

## log(selector)

This method call will log all the variables in a particular scope into the console.

```javascript
cssVar.log(":root"); //Log all global variables
```

---

> **NOTE:** Normally CSS variable name start with "- -". But you have to remove the prefix when using with **get(), set()** methods.
> Example variable declaration: - -my-var-name: 10px;
> We can use this variable by removing "- -", that is "my-var-name"

---

## get(variablename)

To return the value of a particular variable in any scope (global/local)

```javascript
cssVar.get("my-var-name");
```

## get(variablename, selector)

To return the value of a particular variable in a particular scope

```javascript
cssVar.get("my-var-name", "#my-container-div-id");
```

## set(variablename)

To erase the current value of a particular variable in any scope by setting it as empty string

```javascript
cssVar.set("my-var-name");
```

## set(variablename, newValue)

To set a particular variable in any scope with a new value

```javascript
cssVar.set("my-var-name", "100px");
```

## set(variablename, newValue, selector)

To set a particular variable in a given scope with a new value

```javascript
cssVar.set("my-var-name", "100px", ".my-class-name");
```
