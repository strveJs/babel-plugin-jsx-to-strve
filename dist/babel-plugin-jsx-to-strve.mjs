import jsx from '@babel/plugin-syntax-jsx';

/**
 * @param {Babel} babel
 * @param {object} [options]
 * @param {string} [options.tag='h']  The tagged template "tag" function name to produce.
 */
function jsxToStrveBabelPlugin({
  types: t
}, options = {}) {
  const tagString = options.tag || "h";
  const tag = dottedIdentifier(tagString);
  function dottedIdentifier(keypath) {
    const path = keypath.split(".");
    let out;
    for (let i = 0; i < path.length; i++) {
      const ident = t.identifier(path[i]);
      out = i === 0 ? ident : t.memberExpression(out, ident);
    }
    return out;
  }
  let quasis = [];
  let expressions = [];
  function expr(value) {
    expressions.push(value);
    quasis.push(t.templateElement({
      raw: "",
      cooked: ""
    }));
  }
  function raw(str) {
    const last = quasis[quasis.length - 1];
    last.value.raw += str;
    last.value.cooked += str;
  }
  function escapeText(text) {
    if (text.indexOf("<") < 0) {
      return raw(text);
    }
    return expr(t.stringLiteral(text));
  }
  function escapePropValue(node) {
    const value = node.value;
    if (value.match(/^.*$/u)) {
      if (value.indexOf('"') < 0) {
        return raw(`"${value}"`);
      } else if (value.indexOf("'") < 0) {
        return raw(`'${value}'`);
      }
    }
    return expr(t.stringLiteral(node.value));
  }
  const FRAGMENT_EXPR = dottedIdentifier("React.Fragment");
  function isFragmentName(node) {
    return t.isNodesEquivalent(FRAGMENT_EXPR, node);
  }
  function isComponentName(node) {
    if (t.isJSXNamespacedName(node)) return false;
    return !t.isIdentifier(node) || node.name.match(/^[$_A-Z]/);
  }
  function getNameExpr(node) {
    if (t.isJSXNamespacedName(node)) {
      return t.identifier(node.namespace.name + ":" + node.name.name);
    }
    if (!t.isJSXMemberExpression(node)) {
      return t.identifier(node.name);
    }
    return t.memberExpression(getNameExpr(node.object), t.identifier(node.property.name));
  }
  function processChildren(node, name, isFragment) {
    const children = t.react.buildChildren(node);
    if (children && children.length !== 0) {
      if (!isFragment) {
        raw(">");
      }
      for (let i = 0; i < children.length; i++) {
        let child = children[i];
        if (t.isStringLiteral(child)) {
          escapeText(child.value);
        } else if (t.isJSXElement(child)) {
          processNode(child);
        } else {
          expr(child);
        }
      }
      if (!isFragment) {
        if (isComponentName(name)) {
          raw("</");
          expr(name);
          raw(">");
        } else {
          raw("</");
          raw(name.name);
          raw(">");
        }
      }
    } else if (!isFragment) {
      raw("/>");
    }
  }
  function processNode(node, path, isRoot) {
    const open = node.openingElement;
    const name = getNameExpr(open.name);
    const isFragment = isFragmentName(name);
    if (!isFragment) {
      if (isComponentName(name)) {
        raw("<");
        expr(name);
      } else {
        raw("<");
        raw(name.name);
      }
      if (open.attributes) {
        for (let i = 0; i < open.attributes.length; i++) {
          const attr = open.attributes[i];
          raw(" ");
          if (t.isJSXSpreadAttribute(attr)) {
            raw("...");
            expr(attr.argument);
            continue;
          }
          const {
            name,
            value
          } = attr;
          if (t.isJSXNamespacedName(name)) {
            raw(name.namespace.name + ":" + name.name.name);
          } else {
            raw(name.name);
          }
          if (value) {
            raw("=");
            if (value.expression) {
              expr(value.expression);
            } else if (t.isStringLiteral(value)) {
              escapePropValue(value);
            } else {
              expr(value);
            }
          }
        }
      }
    }
    processChildren(node, name, isFragment);
    if (isRoot) {
      const template = t.templateLiteral(quasis, expressions);
      const replacement = t.taggedTemplateExpression(tag, template);
      path.replaceWith(replacement);
    }
  }
  function jsxVisitorHandler(path, state, isFragment) {
    let quasisBefore = quasis;
    let expressionsBefore = expressions;
    quasis = [t.templateElement({
      raw: "",
      cooked: ""
    })];
    expressions = [];
    if (isFragment) {
      processChildren(path.node, null, true);
      const template = t.templateLiteral(quasis, expressions);
      const replacement = t.taggedTemplateExpression(tag, template);
      path.replaceWith(replacement);
    } else {
      processNode(path.node, path, true);
    }
    quasis = quasisBefore;
    expressions = expressionsBefore;
    state.set("jsxElement", true);
  }
  return {
    name: "jsx-to-strve",
    inherits: jsx,
    visitor: {
      JSXElement(path, state) {
        jsxVisitorHandler(path, state, false);
      },
      JSXFragment(path, state) {
        jsxVisitorHandler(path, state, true);
      }
    }
  };
}

export { jsxToStrveBabelPlugin as default };
