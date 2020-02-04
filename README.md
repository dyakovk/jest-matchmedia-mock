# 🔌 MatchMedia Mock for Jest

[build:passing][coverage:100%][downloads:2M/month][dependencies:up to date][vulnerabilities:0][typescript:100%][node:10+][jest:*]

>

## Installation

NPM

```bash
npm i --save-dev jest-matchmedia-mock
```

Yarn

```bash
yarn add --dev jest-matchmedia-mock
```

## Usage

```javascript
import MatchMediaMock from 'jest-matchmedia-mock';

let matchMedia;

describe('Your testing module' => {
  beforeAll(() => {
    matchMedia = new MatchMediaMock();
  });

  afterEach(() => {
    matchMedia.clear();
  });

  test('Your test case', () => {
    const mediaQuery = '(prefers-color-scheme: light)';
    const firstListener = jest.fn();
    const secondListener = jest.fn();
    const mql = window.matchMedia(mediaQuery);

    mql.addListener(ev => ev.matches && firstListener());
    mql.addListener(ev => ev.matches && secondListener());

    matchMedia.useMediaQuery(mediaQuery);

    expect(firstListener).toBeCalledTimes(1);
    expect(secondListener).toBeCalledTimes(1);
  })
})
```

This works if `window.matchMedia()` is used in a function (or method) which is invoked in the test. If `window.matchMedia()` is executed directly in the tested file, Jest returns `TypeError: window.matchMedia is not a function` and doesn't properly execute the test.

In this case, the solution is to move the instantiation of the mock into a separate file and include this one in the test before the tested file:

```javascript
import matchMedia from './matchMedia.mock.ts'; // Must be imported before the tested file
import { myMethod } from './file-to-test';

describe('myMethod()', () => {
  // Test the method here...
});
```

## API

### `new MatchMediaMock()`

Implements `window.matchMedia` and returns an instance with methods listed below

### `matchMedia.useMediaQuery()`

Updates the currently used media query, and calls previously added listener functions registered for this media query

- Arguments:

  - `mediaQuery: string;`

- Returns: `never | void`

### `matchMedia.getMediaQueries()`

Returns an array listing the media queries for which the matchMedia has registered listeners

- Returns: `string[]`

### `matchMedia.getListeners(mediaQuery)`

Returns a copy of the array of listeners for the specified media query

- Arguments:

  - `mediaQuery: string;`

- Returns: `MediaQueryListener[]`

### `matchMedia.clear()`

Clears all registered media queries and their listeners

### `matchMedia.destroy()`

Clears all registered media queries and their listeners, and destroys the implementation of `window.matchMedia`

## License

[MIT](http://opensource.org/licenses/MIT)

Copyright (c) 2020-present, Kirill Dyakov
