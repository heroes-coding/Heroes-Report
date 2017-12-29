module.exports = {
    "extends": [
      "standard",
      "plugin:react/recommended"
    ],
    "rules": {
      "space-before-function-paren": ["error", "never"],
      "comma-dangle": ["error", {
        "arrays": "ignore",
        "objects": "ignore",
        "imports": "ignore",
        "exports": "ignore",
        "functions": "ignore"
      }],
      "react/prop-types":"ignore",
      "react/jsx-uses-vars": [2],
      "quotes": "off",
      "comma-spacing": "off",
      "key-spacing": "off",
      "space-infix-ops": "off",
      "semi-spacing": "off",
      "react/display-name": "off"
    }
};
