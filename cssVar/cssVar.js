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

      const cssProperties = [...style.style]
        .map((propName) => {
          return {
            name: propName.trim(),
            value: style.style.getPropertyValue(propName).trim(),
          };
        })
        //Only picking the CSS variables
        .filter((property) => {
          if (property.name.startsWith("--")) {
            return property;
          }
        })
        //Remove the -- prefix in the CSS variable
        .map((property) => {
          property.name = property.name.slice(2);
          return property;
        });

      styleObject[selectorText] = [
        ...styleObject[selectorText],
        ...cssProperties,
      ];

      if (styleObject[selectorText].length === 0) {
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
}
