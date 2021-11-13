/**
 * Check if the stylesheet is of same domain to avoid security errors
 * Only stylesheeets of the same domain are used with this tool
 *
 * @param {StyleSheet} Stylesheet Object containing information about a particular stylesheet
 * @returns Boolean: true if the stylesheet is in the same origin, else return false
 */
const isSameDomain = (styleSheet) => {
  if (!styleSheet.href) {
    return true;
  }

  return styleSheet.href.indexOf(window.location.origin) === 0;
};

/**
 * Check if the style is CSSRule type (To avoid other types as Media Query, Import Statement rules, etc)
 *
 * @param {CSSStyleRule} rule CSS Rule object with all details about a CSS block
 * @returns True if the CssRule is of type styleRule(type=1), else return false
 */
const isStyleRule = (rule) => rule.type === 1;

//
/**
 * Check if the CSS property is a variable declaration by checking the first part of the CSS property
 *
 * @param {String} cssProperty Css Property name
 * @returns True if the CSS property is a CSS variable declaration, else return false
 */
const isVariable = (cssProperty) => {
  return cssProperty.startsWith("--");
};

/**
 * Set a particular CSS variable with given name, value selector text
 *
 * @param {String} selector Selector text for getting the particular element
 * @param {String} name Name of the CSS variable
 * @param {String} value  New value to set
 */
const setVariable = (selector = ":root", name, value) => {
  let element = document.querySelector(selector);
  element.style.setProperty("--" + name, value);
};

/**
 *
 * @param {String} selector Selector text to get the particular element from the DOM
 * @param {String} name Name of the CSS vaiable to fetch from the given selector element
 * @returns The value of the particular CSS variable with the given selector and name
 */
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

/**
 * Main class of the library with the methods to work with CSS variables
 */
class CssVar {
  selector; //Selector text, Initialized when creating the object
  variables; //An object containing all the selectors and their corresponding CSS variables

  /**
   * Create a new instance of the CSSVar object with given selector text
   *
   * @param {String} selector Selector text used as default selector. Default is ":root"
   */
  constructor(selector = ":root") {
    this.refreshVariables();

    this.selector = selector;
  }

  /**
   * Refresh the variables and set the variables member of the class
   */
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

  /**
   *
   * @param {Object} property And object with name and value of a particular CSS variable
   * @returns True if the variable is a global variable, else return false
   */
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

  /**
   * Log all the CSS variables if no selector is passed or If the selector is passed, then log all the variable
   * in that particular selector
   *
   * @param {String} selector (Optional) Selector used to scope the variable
   */
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

  /**
   *
   * @param {String} varname Name of the CSS variable without "--"
   * @param {String} selector (Optional) Selector text to select the scoped CSS variables
   * @returns The value of the CSS variable or NULL in case of errors
   */
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

  /**
   * Set the particular CSS variable with given name and value
   *
   * @param {String} varname Name of the CSS variable
   * @param {String} value (Optional) New value to set for the variable
   * @param {String} selector (Optional) CSS selector to scope the variable
   * @returns
   */
  set = (varname, value, selector) => {
    this.refreshVariables();

    if (!varname) {
      console.log(
        "CssVar: Variable Name is mandatory parameters for set() method"
      );
      return;
    }

    if (!value) {
      //If no value given, erase the current data of that variable by assigning it with a whitespace ' '
      value = " ";
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

export default CssVar;
