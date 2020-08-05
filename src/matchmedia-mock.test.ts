import MatchMediaMock from './matchmedia-mock';

let matchMedia: MatchMediaMock;

const appearanceMq = {
  light: '(prefers-color-scheme: light)',
  dark: '(prefers-color-scheme: dark)',
};

describe('MatchMedia Mock', () => {
  beforeAll(() => {
    matchMedia = new MatchMediaMock();
  });

  afterEach(() => {
    matchMedia.clear();
  });

  describe('Adding Listeners', () => {
    test('adds a new listener function for media query', () => {
      const firstListener = jest.fn();
      const secondListener = jest.fn();
      const mql = window.matchMedia(appearanceMq.light);

      mql.addListener(firstListener);
      mql.addEventListener<'change'>('change', secondListener);

      expect(matchMedia.getListeners(appearanceMq.light)).toHaveLength(2);
    });

    test("does not add a listener function for a media query if the event name is not 'change'", () => {
      const listener = jest.fn();
      const mql = window.matchMedia(appearanceMq.light);

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      mql.addEventListener<'click'>('click', listener);

      expect(matchMedia.getListeners(appearanceMq.light)).toHaveLength(0);
    });

    test('does not add the same listener function twice for media query', () => {
      const listener = jest.fn();
      const mql = window.matchMedia(appearanceMq.light);

      mql.addListener(listener);
      mql.addEventListener<'change'>('change', listener);

      expect(matchMedia.getListeners(appearanceMq.light)).toHaveLength(1);
    });
  });

  describe('Removing Listeners', () => {
    test('removes a listener function previously added for media query', () => {
      const firstListener = jest.fn();
      const secondListener = jest.fn();
      const mql = window.matchMedia(appearanceMq.light);

      mql.addListener(firstListener);
      mql.addEventListener('change', secondListener);

      expect(matchMedia.getListeners(appearanceMq.light)).toHaveLength(2);

      mql.removeListener(firstListener);
      mql.removeEventListener('change', secondListener);

      expect(matchMedia.getListeners(appearanceMq.light)).toHaveLength(0);
    });

    test("does not remove a listener function for a media query if the event name is not 'change'", () => {
      const listener = jest.fn();
      const mql = window.matchMedia(appearanceMq.light);

      mql.addEventListener<'change'>('change', listener);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      mql.removeEventListener<'click'>('click', listener);

      expect(matchMedia.getListeners(appearanceMq.light)).toHaveLength(1);
    });

    test('does not remove a listener function for unkwown media query', () => {
      const listener = jest.fn();

      expect(matchMedia.getMediaQueries()).not.toContain(listener);
      window.matchMedia(appearanceMq.dark).removeListener(listener);
      expect(matchMedia.getMediaQueries()).not.toContain(listener);
    });

    test('does not remove the same listener function twice for media query', () => {
      const firstListener = jest.fn();
      const secondListener = jest.fn();
      const mql = window.matchMedia(appearanceMq.light);

      mql.addListener(firstListener);
      mql.addEventListener<'change'>('change', secondListener);

      expect(matchMedia.getListeners(appearanceMq.light)).toHaveLength(2);

      mql.removeListener(firstListener);
      mql.removeEventListener<'change'>('change', firstListener);

      expect(matchMedia.getListeners(appearanceMq.light)).toHaveLength(1);
      expect(matchMedia.getListeners(appearanceMq.light)).toContain(secondListener);
    });
  });

  describe('Calling Listeners', () => {
    test('throws an error when an applicable media query is not a string', () => {
      expect(() => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        matchMedia.useMediaQuery(true);
      }).toThrow();
    });

    test('performs a one-time instant check when applying a media query, but before adding listener functions', () => {
      matchMedia.useMediaQuery(appearanceMq.light);

      expect(window.matchMedia(appearanceMq.light).matches).toBeTruthy();
    });

    test('calls listener functions when applying a media query with previously registered listeners', () => {
      const firstListener = jest.fn<void, []>();
      const secondListener = jest.fn<void, []>();

      const mql = window.matchMedia(appearanceMq.light);

      mql.addListener((ev) => ev.matches && firstListener());
      mql.addListener((ev) => ev.matches && secondListener());

      matchMedia.useMediaQuery(appearanceMq.light);

      expect(firstListener).toBeCalledTimes(1);
      expect(secondListener).toBeCalledTimes(1);
    });
  });

  describe('Clearing and destroying', () => {
    test('clears all registered media queries and their listeners', () => {
      const firstListener = jest.fn();
      const secondListener = jest.fn();
      const mql = window.matchMedia(appearanceMq.light);

      mql.addListener(firstListener);
      mql.addEventListener<'change'>('change', secondListener);

      expect(matchMedia.getMediaQueries()).toHaveLength(1);
      expect(matchMedia.getListeners(appearanceMq.light)).toHaveLength(2);

      matchMedia.clear();

      expect(matchMedia.getMediaQueries()).toHaveLength(0);
      expect(matchMedia.getListeners(appearanceMq.light)).toHaveLength(0);
    });

    test('destroys the implementation of window.matchMedia', () => {
      matchMedia.destroy();

      expect(window.matchMedia).toBeUndefined();

      // Restoring the mock in case of reordering tests
      matchMedia = new MatchMediaMock();
    });
  });
});
