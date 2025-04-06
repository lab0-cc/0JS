// This module provides component Mixins


// Component with a shadow node
export const Shadow = Base => class extends Base {
    #shadow;

    constructor() {
        super();
        if (this.shadowRoot === null)
            this.#shadow = this.attachShadow({ mode: 'open' });
        else
            this.#shadow = this.shadowRoot;
    }

    appendToShadow(child) {
        this.#shadow.appendChild(child);
    }
}

// Stylable shadow component
export const Stylable = Base => class extends Shadow(Base) {
    #stylesheets;

    constructor() {
        super();
        this.#stylesheets = [];
    }

    addStylesheet(url) {
        if (!this.#stylesheets.includes(url)) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = `/css/${url}`;
            this.appendToShadow(link);
            this.#stylesheets.push(url);
        }
    }
}

// Component with dynamic shadow DOM
export const DynamicShadow = Base => class extends Shadow(Base) {
    #childrenObserver;

    constructor() {
        super();
        this.#childrenObserver = new MutationObserver(() => this.#ready());
    }

    connectedCallback() {
        super.connectedCallback?.();
        this.#childrenObserver.observe(this, { childList: true, subtree: true });
        if (this.hasChildNodes()) {
            this.#ready();
        }
    }

    #ready() {
        [...this.children].forEach(e => this.appendToShadow(e));
    }
}
