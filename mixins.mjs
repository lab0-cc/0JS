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
        return this.#shadow.appendChild(child);
    }
}

// Stylable shadow component
export const Stylable = Base => class extends Shadow(Base) {
    #stylesheets;

    constructor() {
        super();
        globalThis.loadedStyleSheets ??= new Map();
        globalThis.pendingStyleSheets ??= new Map();
        this.#stylesheets = [];
    }

    async addStylesheet(url) {
        return this.addStylesheets(url);
    }

    async addStylesheets(...urls) {
        await Promise.all(urls.map(async (url) => {
            if (globalThis.loadedStyleSheets.has(url))
                return;
            if (globalThis.pendingStyleSheets.has(url))
                return globalThis.pendingStyleSheets.get(url);
            const load = (async () => {
                const res = await fetch(`/css/${url}`);
                if (!res.ok)
                    throw new Error(`Failed to load stylesheet ${url} (${res.status})`);
                const css = await res.text();
                const sheet = new CSSStyleSheet();
                await sheet.replace(css);
                globalThis.loadedStyleSheets.set(url, sheet);
            })();
            globalThis.pendingStyleSheets.set(url, load);
            try {
                await load;
            } finally {
                globalThis.pendingStyleSheets.delete(url);
            }
        }));

        for (const url of urls) {
             if (!this.#stylesheets.includes(url)) {
                 this.shadowRoot.adoptedStyleSheets.push(globalThis.loadedStyleSheets.get(url));
                 this.#stylesheets.push(url);
             }
        }
    }
}

// Component with dynamic shadow DOM
export const DynamicShadow = Base => class extends Shadow(Base) {
    #childrenObserver;
    #handlers;

    constructor() {
        super();
        this.#handlers = [];
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
        [...this.children].forEach(e => {
            this.appendToShadow(e);
            this.#handlers.forEach(f => f(e));
        });
    }

    addHandler(f) {
        this.#handlers.push(f);
    }
}

// Component with a reportable status
export const Statusable = Base => class extends Base {
    #status;

    getStatus() {
        return this.#status;
    }

    setStatus(status) {
        if (this.#status !== status) {
            this.#status = status;
            this.dispatchEvent(new Event('statuschange', { bubbles: true }));
        }
    }

    static get observedAttributes() {
        return (super.observedAttributes ?? []).concat(['status']);
    }

    attributeChangedCallback(name, old, current) {
        super.attributeChangedCallback?.(name, old, current);
        switch (name) {
            case 'status':
                this.setStatus(parseInt(current));
                break;
        }
    }
}
