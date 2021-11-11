//Check if the stylesheet is of same domain to avoid security errors
/*Only stylesheeets of the same domain are used with this tool */
const isSameDomain = (styleSheet) => {
  if (!styleSheet.href) {
    return true;
  }

  return styleSheet.href.indexOf(window.location.origin) === 0;
};

//Check if the style is CSSRule type (To avoid other types as Media Query, Import Statement rules, etc)
const isStyleRule = (rule) => rule.type === 1;

//Check if the CSS property is a variabrl declaration
const isVariable = (cssProperty) => {
  return cssProperty.startsWith("--");
};

//Set the CSS property
const setVariable = (selector = ":root", name, value) => {
  let element = document.querySelector(selector);
  element.style.setProperty("--" + name, value);
};

const getVariable = (selector, name) => {
  try {
    let element = document.querySelector(selector);
    let computedStyle = getComputedStyle(element);

    return computedStyle.getPropertyValue("--" + name).trim();
  } catch (e) {
    return null;
  }
};

//=======================================================================================================================
//=======================================================================================================================

//CssVar main class with helper methods
export default class CssVar {
  //Selector of the element which have the CSS variables defined
  selector;
  variables;

  //Default constructor to set the :root as selector
  constructor(selector = ":root") {
    this.refreshVariables();

    this.selector = selector;
  }

  //Setup the variables
  refreshVariables = () => {
    //Get all the stylesheets.(Exclude the Cross Origin stylesheets to avoid security errors)
    let stylesheets = [...document.styleSheets].filter(isSameDomain);

    //Combine the styles from each stylesheet
    let styles = stylesheets.reduce(
      (finalArr, sheet) =>
        finalArr.concat([...sheet.cssRules].filter(isStyleRule)),
      []
    );

    //Object with each selectors and their properties
    let styleObject = {};

    for (let style of styles) {
      let selectorText = style.selectorText;

      if (!styleObject[selectorText]) {
        styleObject[selectorText] = [];
      }

      //Removing CSS properties other than CSS variable declarations
      let variables = [...style.style].filter(isVariable);
      let variableObjects = [];

      //Getting the value for each variable and generating an object
      for (let variable of variables) {
        let name = variable.trim().slice(2);

        variableObjects.push({
          name: name,
          value: getVariable(selectorText, name),
        });
      }

      styleObject[selectorText] = [
        ...styleObject[selectorText],
        ...variableObjects,
      ];

      if (styleObject[selectorText].length < 1) {
        delete styleObject[selectorText];
      }
    }

    this.variables = styleObject;
  };

  //Check if the variable is global or not
  isGlobal = (property) => {
    try {
      for (let variable of this.variables[":root"]) {
        if (variable.name === property) {
          return true;
        }
      }

      return false;
    } catch (e) {
      return false;
    }
  };

  //Console log all the css variables available
  log = (selector) => {
    this.refreshVariables();

    //Based on parameter check log the variable in console
    if (selector) {
      if (this.variables[selector] && this.variables[selector].length > 0) {
        console.log(this.variables[selector]);
      } else {
        console.log("CssVar: No CSS variables available for the selector");
      }
    } else {
      console.log(this.variables);
    }
  };

  //Get the current value of a property
  get = (varname, selector) => {
    this.refreshVariables();

    if (varname && selector) {
      try {
        for (let variable of this.variables[selector]) {
          if (variable.name === varname) {
            return variable.value;
          }
        }
        console.log(
          "CssVar: Variable with the given selector and name not found"
        );
      } catch (e) {
        console.log(
          "CssVar: Variable with the given selector and name not found"
        );
      }
    } else if (varname && !selector) {
      try {
        for (let index in this.variables) {
          for (let variable of this.variables[index]) {
            if (variable.name === varname) {
              return variable.value;
            }
          }
        }

        console.log("CssVar: Variable with the given name not found");
      } catch (e) {
        console.log("CssVar: Variable with the given name not found");
      }
    } else {
      return this.variables;
    }
  };

  //Set the value for a variable
  set = (varname, value, selector) => {
    this.refreshVariables();

    if (!varname) {
      console.log(
        "CssVar: Variable Name is mandatory parameters for set() method"
      );
      return;
    }

    if (!value) {
      value = "";
    }

    if (selector) {
      try {
        for (let variable of this.variables[selector]) {
          if (variable.name === varname) {
            setVariable(selector, varname, value);
            return;
          }
        }
        console.log(
          "CssVar: Variable with the given selector and name not found"
        );
      } catch (e) {
        console.log("CssVar: Cannot set the value for variable");
      }
    } else {
      try {
        for (let index in this.variables) {
          for (let variable of this.variables[index]) {
            if (variable.name === varname) {
              setVariable(index, varname, value);
              return;
            }
          }
        }

        console.log("CssVar: Variable with the given name not found");
      } catch (e) {
        console.log("CssVar: Cannot set the value for variable");
      }
    }
  };
}
