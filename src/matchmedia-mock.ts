/* eslint-disable @typescript-eslint/no-explicit-any */

type MediaQueryListener = ((this: MediaQueryList, ev: MediaQueryListEvent) => any) | null;

export default class MatchMedia {
  private mediaQueries: {
    [key: string]: MediaQueryListener[];
  } = {};

  private mediaQueryList!: MediaQueryList;

  private currentMediaQuery!: string;

  constructor() {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: (query: string): MediaQueryList => {
        const mql: MediaQueryList = {
          matches: query === this.currentMediaQuery,
          media: query,
          onchange: null,
          /** @deprecated */
          addListener: (listener) => {
            this.addListener(query, listener);
          },
          /** @deprecated */
          removeListener: (listener) => {
            this.removeListener(query, listener);
          },
          addEventListener: <K extends keyof MediaQueryListEventMap>(
            type: K,
            listener: (this: MediaQueryList, ev: MediaQueryListEventMap[K]) => any,
          ) => {
            if (type !== 'change') return;

            this.addListener(query, listener);
          },
          removeEventListener: <K extends keyof MediaQueryListEventMap>(
            type: K,
            listener: (this: MediaQueryList, ev: MediaQueryListEventMap[K]) => any,
          ) => {
            if (type !== 'change') return;

            this.removeListener(query, listener);
          },
          dispatchEvent: jest.fn(),
        };

        this.mediaQueryList = mql;

        return mql;
      },
    });
  }

  /**
   * Adds a new listener function for the specified media query
   * @private
   */
  private addListener(mediaQuery: string, listener: MediaQueryListener): void {
    if (!this.mediaQueries[mediaQuery]) {
      this.mediaQueries[mediaQuery] = [];
    }

    const query = this.mediaQueries[mediaQuery];
    const listenerIndex = query.indexOf(listener);

    if (listenerIndex !== -1) return;
    query.push(listener);
  }

  /**
   * Removes a previously added listener function for the specified media query
   * @private
   */
  private removeListener(mediaQuery: string, listener: MediaQueryListener): void {
    if (!this.mediaQueries[mediaQuery]) return;

    const query = this.mediaQueries[mediaQuery];
    const listenerIndex = query.indexOf(listener);

    if (listenerIndex === -1) return;
    query.splice(listenerIndex, 1);
  }

  /**
   * Updates the currently used media query,
   * and calls previously added listener functions registered for this media query
   * @public
   */
  public useMediaQuery(mediaQuery: string): never | void {
    if (typeof mediaQuery !== 'string') throw new Error('Media Query must be a string');

    this.currentMediaQuery = mediaQuery;

    if (!this.mediaQueries[mediaQuery]) return;

    const mqListEvent: Partial<MediaQueryListEvent> = {
      matches: true,
      media: mediaQuery,
    };

    this.mediaQueries[mediaQuery].forEach((listener) => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      listener!.call(this.mediaQueryList, mqListEvent as MediaQueryListEvent);
    });
  }

  /**
   * Returns an array listing the media queries for which the matchMedia has registered listeners
   * @public
   */
  public getMediaQueries(): string[] {
    return Object.keys(this.mediaQueries);
  }

  /**
   * Returns a copy of the array of listeners for the specified media query
   * @public
   */
  public getListeners(mediaQuery: string): MediaQueryListener[] {
    if (!this.mediaQueries[mediaQuery]) return [];
    return this.mediaQueries[mediaQuery].slice();
  }

  /**
   * Clears all registered media queries and their listeners
   * @public
   */
  public clear(): void {
    this.mediaQueries = {};
  }

  /**
   * Clears all registered media queries and their listeners,
   * and destroys the implementation of `window.matchMedia`
   * @public
   */
  public destroy(): void {
    this.clear();
    delete window.matchMedia;
  }
}
