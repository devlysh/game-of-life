/**
 * Game of Life implementation using vanilla JavaScript
 * Copyright (C) Artem Devlysh, 2015
 */

define(function () {
  var config = {
    STEP: 0,
    UNIVERSE_WIDTH: 121,
    UNIVERSE_HEIGHT: 81,
    CELL_WIDTH: 5,
    CELL_HEIGHT: 5,
    BORDER_WIDTH: 1,
    MIN_NEIGHBORS_TO_LIVE: 2,
    MAX_NEIGHBORS_TO_LIVE: 3,
    NEIGHBORS_TO_BE_BORN: 3,
    AGE_COLOR_MULTIPLYER: 10,
    DEATH_COUNT_WITHRAW: 0.2,
    ALIVE_NEIGHBORS_COLOR_MULTIPLYER: 3,
    DEAD_COLOR_MULTIPLYER: 10,
    TIME_INTERVAL: 40,
    ALIVE_MULTI_COLOR_THRESHOLD: 100,
    DEAD_MULTI_COLOR_THRESHOLD: 255,
    ALIVE_COLOR: 'black',
    DEAD_COLOR: 'white',
    keys: {
      space: 32,
      q: 113,
      w: 119,
      e: 101,
      r: 114,
      t: 116,
      y: 121,
      u: 117,
      i: 105,
      o: 111,
      a: 97,
      s: 115,
      d: 100,
      f: 102,
      g: 103,
      h: 104,
      j: 106,
      k: 107,
      l: 108,
      z: 122,
      x: 120,
      c: 99,
      v: 118,
      b: 98,
      n: 110,
      m: 109,
      comma: 44,
      period: 46
    }
  };
  return config;
});