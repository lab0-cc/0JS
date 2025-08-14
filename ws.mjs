// This module provides a wrapper over WebSockets with reconnection and queue mechanisms


export class WS extends EventTarget {
    #closed;
    #protocols;
    #queue;
    #timer;
    #url;
    #ws;

    constructor(url, protocols) {
        super();
        this.#url = url;
        this.#protocols = protocols;
        this.#ws = null;
        this.#queue = [];
        this.#timer = null;
        this.#closed = false;
        this.#connect();
    }

    // Initialize the socket if it is not already there
    #connect() {
        if (this.#ws !== null && (this.#ws.readyState === WebSocket.OPEN ||
                                  this.#ws.readyState === WebSocket.CONNECTING))
            return;

        this.#ws = new WebSocket(this.#url);
        this.#ws.addEventListener('open', () => {
            for (const job of this.#queue.splice(0)) {
                try {
                    this.#ws.send(job.data);
                    job.resolve?.();
                }
                catch (err) {
                    job.reject?.(err);
                }
            }
            this.dispatchEvent(new Event('open'));
        });

        this.#ws.addEventListener('message', e => {
            this.dispatchEvent(new MessageEvent('message', { data: e.data }));
        });

        this.#ws.addEventListener('close', () => {
            this.dispatchEvent(new Event('close'));
            if (!this.#closed)
                this.#scheduleReconnect();
        });

        this.#ws.addEventListener('error', () => {
            try {
                this.#ws.close();
            }
            catch {}
        });
    }

    // Schedule WebSocket reconnection 1 second later
    #scheduleReconnect() {
        if (this.#timer !== null)
            return;
        if (!this.#closed) {
            this.#timer = setTimeout(() => {
                this.#timer = null;
                this.#connect();
            }, 1000);
        }
    }

    // Send data
    async send(data) {
        if (this.#ws.readyState === WebSocket.OPEN)
            return this.#ws.send(data);
        return new Promise((resolve, reject) => {
            this.#queue.push({ data, resolve, reject });
            this.#connect();
        });
    }

    // Close the socket for good
    close(code, reason) {
        this.#closed = true;
        if (this.#timer !== null) {
          clearTimeout(this.#timer);
          this.#timer = null;
        }
        this.#ws.close(code, reason);
    }
}
