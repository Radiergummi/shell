'use strict';

function assertPath ( path ) {
  if ( typeof path !== 'string' ) {
    throw new TypeError( `Path must be a string. Received ${typeof path}` );
  }
}

// Resolves . and .. elements in a path with directory names
function normalizeString ( path, allowAboveRoot ) {
  let res       = '';
  let lastSlash = -1;
  let dots      = 0;
  let code;

  for ( let i = 0; i <= path.length; ++i ) {
    if ( i < path.length ) {
      code = path.charCodeAt( i );
    } else if ( code === 47 /* / */ ) {
      break;
    } else {
      code = 47 /* / */;
    }

    if ( code === 47 /* / */ ) {
      if ( lastSlash === i - 1 || dots === 1 ) {

        // NOOP
      } else if ( lastSlash !== i - 1 && dots === 2 ) {
        if ( res.length < 2 ||
             res.charCodeAt( res.length - 1 ) !== 46 /* . */ ||
             res.charCodeAt( res.length - 2 ) !== 46 /* . */ ) {

          if ( res.length > 2 ) {
            const start = res.length - 1;
            let j       = start;

            for ( ; j >= 0; --j ) {
              if ( res.charCodeAt( j ) === 47 /* / */ ) {
                break;
              }
            }

            if ( j !== start ) {
              if ( j === -1 ) {
                res = '';
              } else {
                res = res.slice( 0, j );
              }

              lastSlash = i;
              dots      = 0;

              continue;
            }
          } else if ( res.length === 2 || res.length === 1 ) {
            res       = '';
            lastSlash = i;
            dots      = 0;

            continue;
          }
        }

        if ( allowAboveRoot ) {
          if ( res.length > 0 ) {
            res += '/..';
          } else {
            res = '..';
          }
        }
      } else {
        if ( res.length > 0 ) {
          res += '/' + path.slice( lastSlash + 1, i );
        } else {
          res = path.slice( lastSlash + 1, i );
        }
      }

      lastSlash = i;
      dots      = 0;
    } else if ( code === 46/*.*/ && dots !== -1 ) {
      ++dots;
    } else {
      dots = -1;
    }
  }

  return res;
}

function _format ( sep, pathObject ) {
  const dir  = pathObject.dir || pathObject.root;
  const base = pathObject.base || ( ( pathObject.name || '' ) + ( pathObject.ext || '' ) );

  if ( !dir ) {
    return base;
  }

  if ( dir === pathObject.root ) {
    return dir + base;
  }

  return dir + sep + base;
}

/**
 * The path.resolve() method resolves a sequence of paths or path segments into an absolute path.
 * The given sequence of paths is processed from right to left, with each subsequent path prepended
 * until an absolute path is constructed. For instance, given the sequence of path segments:
 * /foo, /bar, baz, calling path.resolve('/foo', '/bar', 'baz') would return /bar/baz.
 * If after processing all given path segments an absolute path has not yet been generated, the
 * current working directory is used.
 * The resulting path is normalized and trailing slashes are removed unless the path is resolved to
 * the root directory.
 * Zero-length path segments are ignored.
 * If no path segments are passed, path.resolve() will return the absolute path of the current
 * working directory.
 *
 * @example path.resolve('/foo/bar', './baz'); // Returns: '/foo/bar/baz'
 * @example path.resolve('/foo/bar', '/tmp/file/'); // Returns: '/tmp/file'
 * @example path.resolve('wwwroot', 'static_files/png/', '../gif/image.gif');
 *          // if the current working directory is /home/myself/node,
 *          // this returns '/home/myself/node/wwwroot/static_files/gif/image.gif'
 *
 * @param  {string[]}  paths sequence of paths or path segments
 * @return {string}          resolved path
 * @throws {TypeError}       if path is not a string
 */
export function resolve ( ...paths ) {
  let resolvedPath     = '';
  let resolvedAbsolute = false;
  let cwd;

  for ( let i = paths.length - 1; i >= -1 && !resolvedAbsolute; i-- ) {
    let path;

    if ( i >= 0 ) {
      path = paths[ i ];
    } else {
      if ( cwd === undefined ) {
        cwd = process.cwd();
      }

      path = cwd;
    }

    assertPath( path );

    // Skip empty entries
    if ( path.length === 0 ) {
      continue;
    }

    resolvedPath     = path + '/' + resolvedPath;
    resolvedAbsolute = path.charCodeAt( 0 ) === 47 /* / */;
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeString( resolvedPath, !resolvedAbsolute );

  if ( resolvedAbsolute ) {
    if ( resolvedPath.length > 0 ) {
      return '/' + resolvedPath;
    } else {
      return '/';
    }
  } else if ( resolvedPath.length > 0 ) {
    return resolvedPath;
  } else {
    return '.';
  }
}

/**
 * The path.normalize() method normalizes the given path, resolving '..' and '.' segments.
 * When multiple, sequential path segment separation characters are found (e.g. /), they are replaced by a
 * single instance of it. Trailing separators are preserved.
 * If the path is a zero-length string, '.' is returned, representing the current working directory.
 *
 * @example path.normalize('/foo/bar//baz/asdf/quux/..'); // Returns: '/foo/bar/baz/asdf'
 *
 * @param  {string}    path path to normalize
 * @return {string}         normalized path
 * @throws {TypeError}      if path is not a string
 */
export function normalize ( path ) {
  assertPath( path );

  if ( path.length === 0 ) {
    return '.';
  }

  const isAbsolute        = path.charCodeAt( 0 ) === 47 /* / */;
  const trailingSeparator = path.charCodeAt( path.length - 1 ) === 47 /* / */;

  // Normalize the path
  path = normalizeString( path, !isAbsolute );

  if ( path.length === 0 && !isAbsolute ) {
    path = '.';
  }

  if ( path.length > 0 && trailingSeparator ) {
    path += '/';
  }

  if ( isAbsolute ) {
    return '/' + path;
  }

  return path;
}

/**
 * The path.isAbsolute() method determines if path is an absolute path.
 * If the given path is a zero-length string, false will be returned.
 *
 * @example path.isAbsolute('/foo/bar'); // true
 * @example path.isAbsolute('/baz/..');  // true
 * @example path.isAbsolute('qux/');     // false
 * @example path.isAbsolute('.');        // false
 *
 * @param  {string}    path path to check for absoluteness
 * @return {boolean}        whether the path is absolute
 * @throws {TypeError}      if path is not a string
 */
export function isAbsolute ( path ) {
  assertPath( path );

  return path.length > 0 && path.charCodeAt( 0 ) === 47 /* / */;
}

/**
 * The path.join() method joins all given path segments together using the platform specific separator
 * as a delimiter, then normalizes the resulting path.
 * Zero-length path segments are ignored. If the joined path string is a zero-length string then '.'
 * will be returned, representing the current working directory.
 *
 * @example path.join('/foo', 'bar', 'baz/asdf', 'quux', '..'); // Returns: '/foo/bar/baz/asdf'
 * @example path.join('foo', {}, 'bar'); // throws 'TypeError: Path must be a string. Received {}'
 *
 * @param  {string[]}  paths sequence of path segments
 * @return {string}          joined path
 * @throws {TypeError}       if any of the path segments is not a string
 */
export function join ( ...paths ) {
  if ( arguments.length === 0 ) {
    return '.';
  }

  let joined;

  for ( let arg of paths ) {
    assertPath( arg );

    if ( arg.length > 0 ) {
      if ( joined === undefined ) {
        joined = arg;
      } else {
        joined += '/' + arg;
      }
    }
  }

  if ( joined === undefined ) {
    return '.';
  }

  return normalize( joined );
}

/**
 * The path.relative() method returns the relative path from from to to based on the current working
 * directory. If from and to each resolve to the same path (after calling path.resolve() on each), a
 * zero-length string is returned.
 * If a zero-length string is passed as from or to, the current working directory will be used
 * instead of the zero-length strings.
 *
 * @example path.relative('/data/orandea/test/aaa', '/data/orandea/impl/bbb');
 *          // Returns: '../../impl/bbb'
 *
 * @param  {string}    from from-path
 * @param  {string}    to   to-path
 * @return {string}         relative path
 * @throws {TypeError}      if either from or to is not a string
 */
export function relative ( from, to ) {
  assertPath( from );
  assertPath( to );

  if ( from === to ) {
    return '';
  }

  from = resolve( from );
  to   = resolve( to );

  if ( from === to ) {
    return '';
  }

  // Trim any leading backslashes
  let fromStart = 1;

  for ( ; fromStart < from.length; ++fromStart ) {
    if ( from.charCodeAt( fromStart ) !== 47 /* / */ ) {
      break;
    }
  }

  const fromEnd = from.length;
  const fromLen = ( fromEnd - fromStart );

  // Trim any leading backslashes
  let toStart = 1;

  for ( ; toStart < to.length; ++toStart ) {
    if ( to.charCodeAt( toStart ) !== 47 /* / */ ) {
      break;
    }
  }

  const toEnd = to.length;
  const toLen = ( toEnd - toStart );

  // Compare paths to find the longest common path from root
  const length      = ( fromLen < toLen ? fromLen : toLen );
  let lastCommonSep = -1;
  let i             = 0;

  for ( ; i <= length; ++i ) {
    if ( i === length ) {
      if ( toLen > length ) {
        if ( to.charCodeAt( toStart + i ) === 47 /* / */ ) {

          // We get here if `from` is the exact base path for `to`.
          // For example: from='/foo/bar'; to='/foo/bar/baz'
          return to.slice( toStart + i + 1 );
        } else if ( i === 0 ) {

          // We get here if `from` is the root
          // For example: from='/'; to='/foo'
          return to.slice( toStart + i );
        }
      } else if ( fromLen > length ) {
        if ( from.charCodeAt( fromStart + i ) === 47 /* / */ ) {

          // We get here if `to` is the exact base path for `from`.
          // For example: from='/foo/bar/baz'; to='/foo/bar'
          lastCommonSep = i;
        } else if ( i === 0 ) {

          // We get here if `to` is the root.
          // For example: from='/foo'; to='/'
          lastCommonSep = 0;
        }
      }

      break;
    }

    const fromCode = from.charCodeAt( fromStart + i );
    const toCode   = to.charCodeAt( toStart + i );
    if ( fromCode !== toCode ) {
      break;
    } else if ( fromCode === 47 /* / */ ) {
      lastCommonSep = i;
    }
  }

  let out = '';

  // Generate the relative path based on the path difference between `to`
  // and `from`
  for ( i = fromStart + lastCommonSep + 1; i <= fromEnd; ++i ) {
    if ( i === fromEnd || from.charCodeAt( i ) === 47 /* / */ ) {
      if ( out.length === 0 ) {
        out += '..';
      } else {
        out += '/..';
      }
    }
  }

  // Lastly, append the rest of the destination (`to`) path that comes after
  // the common path parts
  if ( out.length > 0 ) {
    return out + to.slice( toStart + lastCommonSep );
  } else {
    toStart += lastCommonSep;

    if ( to.charCodeAt( toStart ) === 47 /* / */ ) {
      ++toStart;
    }

    return to.slice( toStart );
  }
}

/**
 * The path.dirname() method returns the directory name of a path, similar to the Unix dirname command.
 * Trailing directory separators are ignored, see path.sep.
 *
 * @example path.dirname('/foo/bar/baz/asdf/quux');  // Returns: '/foo/bar/baz/asdf'
 *
 * @param  {string}    path path to find the directory name of
 * @return {string}         directory name
 * @throws {TypeError}      if path is not a string
 */
export function dirname ( path ) {
  assertPath( path );

  if ( path.length === 0 ) {
    return '.';
  }

  let code         = path.charCodeAt( 0 );
  const hasRoot    = ( code === 47 /* / */ );
  let end          = -1;
  let matchedSlash = true;

  for ( let i = path.length - 1; i >= 1; --i ) {
    code = path.charCodeAt( i );

    if ( code === 47 /* / */ ) {
      if ( !matchedSlash ) {
        end = i;

        break;
      }
    } else {

      // We saw the first non-path separator
      matchedSlash = false;
    }
  }

  if ( end === -1 ) {
    return hasRoot ? '/' : '.';
  }

  if ( hasRoot && end === 1 ) {
    return '//';
  }

  return path.slice( 0, end );
}

/**
 * The path.basename() methods returns the last portion of a path, similar to the Unix basename command.
 * Trailing directory separators are ignored, see path.sep.
 *
 * @example path.basename('/foo/bar/baz/asdf/quux.html'); // Returns: 'quux.html'
 * @example path.basename('/foo/bar/baz/asdf/quux.html', '.html'); // Returns: 'quux'
 *
 * @param  {string}    path  path to find the basename for
 * @param  {string}    [ext] optional file extension
 * @return {string}          path basename
 * @throws {TypeError}       if path is not a string or if ext is given and is not a string
 */
export function basename ( path, ext ) {
  if ( ext !== undefined && typeof ext !== 'string' ) {
    throw new TypeError( '"ext" argument must be a string' );
  }

  assertPath( path );

  let start        = 0;
  let end          = -1;
  let matchedSlash = true;
  let i;

  if ( ext !== undefined && ext.length > 0 && ext.length <= path.length ) {
    if ( ext.length === path.length && ext === path ) {
      return '';
    }

    let extIdx           = ext.length - 1;
    let firstNonSlashEnd = -1;

    for ( i = path.length - 1; i >= 0; --i ) {
      const code = path.charCodeAt( i );

      if ( code === 47 /* / */ ) {

        // If we reached a path separator that was not part of a set of path
        // separators at the end of the string, stop now
        if ( !matchedSlash ) {
          start = i + 1;

          break;
        }
      } else {
        if ( firstNonSlashEnd === -1 ) {

          // We saw the first non-path separator, remember this index in case
          // we need it if the extension ends up not matching
          matchedSlash     = false;
          firstNonSlashEnd = i + 1;
        }
        if ( extIdx >= 0 ) {

          // Try to match the explicit extension
          if ( code === ext.charCodeAt( extIdx ) ) {
            if ( --extIdx === -1 ) {

              // We matched the extension, so mark this as the end of our path
              // component
              end = i;
            }
          } else {

            // Extension does not match, so our result is the entire path
            // component
            extIdx = -1;
            end    = firstNonSlashEnd;
          }
        }
      }
    }

    if ( start === end ) {
      end = firstNonSlashEnd;
    } else if ( end === -1 ) {
      end = path.length;
    }

    return path.slice( start, end );
  } else {
    for ( i = path.length - 1; i >= 0; --i ) {
      if ( path.charCodeAt( i ) === 47 /* / */ ) {

        // If we reached a path separator that was not part of a set of path
        // separators at the end of the string, stop now
        if ( !matchedSlash ) {
          start = i + 1;

          break;
        }
      } else if ( end === -1 ) {

        // We saw the first non-path separator, mark this as the end of our
        // path component
        matchedSlash = false;
        end          = i + 1;
      }
    }

    if ( end === -1 ) {
      return '';
    }

    return path.slice( start, end );
  }
}

/**
 * The path.extname() method returns the extension of the path, from the last occurrence of
 * the . (period) character to end of string in the last portion of the path. If there is no . in
 * the last portion of the path, or if the first character of the basename of path (see path.basename())
 * is ., then an empty string is returned.
 *
 * @example path.extname('index.html'); // Returns: '.html'
 * @example path.extname('index.coffee.md'); // Returns: '.md'
 * @example path.extname('index.'); // Returns: '.'
 * @example path.extname('index'); // Returns: ''
 * @example path.extname('.index'); // Returns: ''
 *
 * @param  {string}    path path to find the extension name for
 * @return {string}         file extension name
 * @throws {TypeError}      if path is not a string
 */
export function extname ( path ) {
  assertPath( path );

  let startDot     = -1;
  let startPart    = 0;
  let end          = -1;
  let matchedSlash = true;

  // Track the state of characters (if any) we see before our first dot and
  // after any path separator we find
  let preDotState = 0;

  for ( let i = path.length - 1; i >= 0; --i ) {
    const code = path.charCodeAt( i );

    if ( code === 47 /* / */ ) {

      // If we reached a path separator that was not part of a set of path
      // separators at the end of the string, stop now
      if ( !matchedSlash ) {
        startPart = i + 1;

        break;
      }

      continue;
    }

    if ( end === -1 ) {

      // We saw the first non-path separator, mark this as the end of our
      // extension
      matchedSlash = false;
      end          = i + 1;
    }

    if ( code === 46 /* . */ ) {

      // If this is our first dot, mark it as the start of our extension
      if ( startDot === -1 ) {
        startDot = i;
      } else if ( preDotState !== 1 ) {
        preDotState = 1;
      }
    } else if ( startDot !== -1 ) {

      // We saw a non-dot and non-path separator before our dot, so we should
      // have a good chance at having a non-empty extension
      preDotState = -1;
    }
  }

  if (
    startDot === -1 ||
    end === -1 ||

    // We saw a non-dot character immediately before the dot
    preDotState === 0 ||

    // The (right-most) trimmed path component is exactly '..'
    (
      preDotState === 1 &&
      startDot === end - 1 &&
      startDot === startPart + 1
    )
  ) {
    return '';
  }

  return path.slice( startDot, end );
}

/**
 * The path.format() method returns a path string from an object. This is the opposite of path.parse().
 *  When providing properties to the pathObject remember that there are combinations where one property
 *  has priority over another:
 *   - pathObject.root is ignored if pathObject.dir is provided
 *   - pathObject.ext and pathObject.name are ignored if pathObject.base exists
 *
 * @example
 *    // If `dir`, `root` and `base` are provided,
 *    // `${dir}${path.sep}${base}`
 *    // will be returned. `root` is ignored.
 *    path.format({
 *      root: '/ignored',
 *      dir: '/home/user/dir',
 *      base: 'file.txt'
 *    });
 *    // Returns: '/home/user/dir/file.txt'
 *
 * @example
 *    // `root` will be used if `dir` is not specified.
 *    // If only `root` is provided or `dir` is equal to `root` then the
 *    // platform separator will not be included. `ext` will be ignored.
 *    path.format({
 *      root: '/',
 *      base: 'file.txt',
 *      ext: 'ignored'
 *    });
 *    // Returns: '/file.txt'
 *
 * @example
 *    // `name` + `ext` will be used if `base` is not specified.
 *    path.format({
 *      root: '/',
 *      name: 'file',
 *      ext: '.txt'
 *    });
 *    // Returns: '/file.txt'
 *
 * @param  {Object}    pathObject      object of path properties
 * @param  {string}    pathObject.dir
 * @param  {string}    pathObject.root
 * @param  {string}    pathObject.base
 * @param  {string}    pathObject.name
 * @param  {string}    pathObject.ext
 * @return {string}                    formatted path
 * @throws {TypeError}                 if path is not a string
 */
export function format ( pathObject ) {
  if ( pathObject === null || typeof pathObject !== 'object' ) {
    throw new TypeError( `Parameter "pathObject" must be an object, not ${typeof pathObject}` );
  }

  return _format( '/', pathObject );
}

/**
 * The path.parse() method returns an object whose properties represent significant elements
 * of the path. Trailing directory separators are ignored, see path.sep.
 *
 * @example
 *    path.parse('/home/user/dir/file.txt');
 *    // Returns:
 *    // { root: '/',
 *    //   dir: '/home/user/dir',
 *    //   base: 'file.txt',
 *    //   ext: '.txt',
 *    //   name: 'file' }
 *
 *    ┌─────────────────────┬────────────┐
 *    │          dir        │    base    │
 *    ├──────┬              ├──────┬─────┤
 *    │ root │              │ name │ ext │
 *    "  /    home/user/dir / file  .txt "
 *    └──────┴──────────────┴──────┴─────┘
 *    (all spaces in the "" line should be ignored — they are purely for formatting)
 *
 * @param  {string}                                                               path path to parse
 * @return {{root: string, dir: string, base: string, ext: string, name: string}}      parsed path properties
 * @throws {TypeError}                                                                 if path is not a string
 */
export function parse ( path ) {
  assertPath( path );

  let ret = { root: '', dir: '', base: '', ext: '', name: '' };

  if ( path.length === 0 ) {
    return ret;
  }

  let code       = path.charCodeAt( 0 );
  let isAbsolute = ( code === 47 /* / */ );
  let start;

  if ( isAbsolute ) {
    ret.root = '/';
    start    = 1;
  } else {
    start = 0;
  }

  let startDot     = -1;
  let startPart    = 0;
  let end          = -1;
  let matchedSlash = true;
  let i            = path.length - 1;

  // Track the state of characters (if any) we see before our first dot and
  // after any path separator we find
  let preDotState = 0;

  // Get non-dir info
  for ( ; i >= start; --i ) {
    code = path.charCodeAt( i );

    if ( code === 47 /* / */ ) {

      // If we reached a path separator that was not part of a set of path
      // separators at the end of the string, stop now
      if ( !matchedSlash ) {
        startPart = i + 1;

        break;
      }

      continue;
    }

    if ( end === -1 ) {

      // We saw the first non-path separator, mark this as the end of our
      // extension
      matchedSlash = false;
      end          = i + 1;
    }

    if ( code === 46/*.*/ ) {

      // If this is our first dot, mark it as the start of our extension
      if ( startDot === -1 ) {
        startDot = i;
      } else if ( preDotState !== 1 ) {
        preDotState = 1;
      }
    } else if ( startDot !== -1 ) {

      // We saw a non-dot and non-path separator before our dot, so we should
      // have a good chance at having a non-empty extension
      preDotState = -1;
    }
  }

  if (
    startDot === -1 ||
    end === -1 ||

    // We saw a non-dot character immediately before the dot
    preDotState === 0 ||

    // The (right-most) trimmed path component is exactly '..'
    (
      preDotState === 1 &&
      startDot === end - 1 &&
      startDot === startPart + 1
    )
  ) {
    if ( end !== -1 ) {
      if ( startPart === 0 && isAbsolute ) {
        ret.base = ret.name = path.slice( 1, end );
      } else {
        ret.base = ret.name = path.slice( startPart, end );
      }
    }
  } else {
    if ( startPart === 0 && isAbsolute ) {
      ret.name = path.slice( 1, startDot );
      ret.base = path.slice( 1, end );
    } else {
      ret.name = path.slice( startPart, startDot );
      ret.base = path.slice( startPart, end );
    }

    ret.ext = path.slice( startDot, end );
  }

  if ( startPart > 0 ) {
    ret.dir = path.slice( 0, startPart - 1 );
  } else if ( isAbsolute ) {
    ret.dir = '/';
  }

  return ret;
}

/**
 * Holds the path separator character
 *
 * @type {string}
 */
export const separator = '/';

/**
 * Holds the path delimiter character
 *
 * @type {string}
 */
export const delimiter = ':';

/**
 * Provides a custom version of the Node.js path module for the browser, including documentation
 * and ES2015-style import/exports, stripped away the win32 functionality.
 */
export default {
  resolve,
  normalize,
  isAbsolute,
  join,
  relative,
  dirname,
  basename,
  extname,
  format,
  parse,
  separator,
  delimiter
};
