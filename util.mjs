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

// Create several elements and return them
export function createElements(...elements) {
    return elements.map(e => {
        if (typeof e === 'string')
            return createElement(e);
        const { tag, className, attributes, content } = e;
        return createElement(tag, className, attributes, content);
    });
}

// Append several elements to a node
export function appendElements(node, ...elements) {
    return createElements(...elements).map(e => node.appendChild(e));
}

Node.prototype.appendElements = function (...elements) { return appendElements(this, ...elements); };
Node.prototype.appendElement = function (element) { return appendElements(this, element)[0]; };

// Wrapper around the fetch API that expects JSON output
export function jfetch(url, callback) {
    return fetch(url).then(r => r.json().then(callback));
}
