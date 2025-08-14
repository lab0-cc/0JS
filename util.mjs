// This module provides helper functions


// Wrapper around document.createElement, with good properties
export function createElement(tag, className=null, attributes={}, content=null) {
    const el = document.createElement(tag);
    if (className !== null)
        el.className = className;
    for (const attribute in attributes)
        el.setAttribute(attribute.replace(/_$/, '').replace(/([A-Z])/g, '-$1').toLowerCase(), attributes[attribute]);
    if (content !== null)
        el.textContent = content;
    return el;
}
