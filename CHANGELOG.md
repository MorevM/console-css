# Changelog

## [0.1.0](https://github.com/MorevM/console-css/compare/v0.0.5...v0.1.0) (2026-11-22)

### Use the same styled message in DevTools and Node.js

The same import now works in browser apps and Node.js 20 or later. For example, a build script can print a green, bold status and include the warning count even when it's zero.

```js
import ConsoleCSS from '@morev/console-css';

ConsoleCSS.styled.log('<b style="color: green">Build complete</b> · %d warnings', 0);
```

Terminals can display text and background colors, bold, italic, underline and strikethrough. They use their own font size and spacing, and show an image's `alt` text. Redirecting output to a file or pipe produces plain text by default.

### Import the package in TypeScript

TypeScript now finds the bundled declarations for both ESM and CommonJS. Importing from `@morev/console-css` gives you type checking and editor completion for methods such as `add()` and `styled.log()`.

### More reliable browser console output

- Substitutions keep values such as `0`, `false` and `''` in the right positions. Objects passed after the message remain available to inspect in DevTools.
- Escaped markup such as `&lt;b&gt;` prints literally next to styled text. Messages with several images keep the text between them and each image's own dimensions.
- Compact rules such as `.build-status{color:green}` now work. When classes set the same property, their definition order decides which value wins. Inline styles take precedence over class rules.
- With `override()` enabled, `console.time()` and `console.timeEnd()` keep their labels, and `console.assert()` formats the message after the condition.

### [0.0.5](https://github.com/MorevM/console-css/compare/v0.0.4...v0.0.5) (2022-10-26)


### Chores

* Replace dot in package name with dash ([4b92598](https://github.com/MorevM/console-css/commit/4b925980d4a9d3c0e80e8f159e9e588c286e1b5b))
* Upgrade all deps ([513147f](https://github.com/MorevM/console-css/commit/513147f4b4bd04c6aaaaac6ada5153cf0e7392ff))

### [0.0.4](https://github.com/MorevM/console-css/compare/v0.0.3...v0.0.4) (2022-10-09)


### Chores

* Set explicit `registry-url` ([9275376](https://github.com/MorevM/console-css/commit/9275376af1f9c9375f4b93946bd0c47124dc3d81))

### [0.0.3](https://github.com/MorevM/console-css/compare/v0.0.2...v0.0.3) (2022-10-09)


### Chores

* Set the correct package scope ([4738745](https://github.com/MorevM/console-css/commit/47387459ef35e2d33b6203e871ae3a039fc9002e))

### [0.0.2](https://github.com/MorevM/console-css/compare/v0.0.1...v0.0.2) (2022-10-09)


### Chores

* Set NPM token instead of GH ([8cb93d5](https://github.com/MorevM/console-css/commit/8cb93d59e0141bda14c0e8aaf64a791fd0475eea))

### 0.0.1 (2022-10-09)

First release 🎉
