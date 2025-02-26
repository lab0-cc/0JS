// This module provides helper functions


export function createElement(tag, className=null, attributes={}, content=null) {
    const el = document.createElement(tag);
    if (className !== null)
        el.className = className;
    for (const attribute in attributes)
        el.setAttribute(attribute, attributes[attribute]);
    if (content !== null)
        el.textContent = content;
    return el;
}
