import { isWeb } from 'universal-env';

const RPX_REG = /[-+]?\d*\.?\d+rpx/g;
const GLOBAL_RPX_UNIT = '__rpx_coefficient__';
const GLOBAL_VIEWPORT_WIDTH = '__rpx_viewport_width__';
const global =
  typeof window === 'object'
    ? window
    : typeof global === 'object'
      ? global
      : {};

// Init toFixed method
const unitPrecision = 4;
const toFixed = (number, precision) => {
  const multiplier = Math.pow(10, precision + 1);
  const wholeNumber = Math.floor(number * multiplier);
  return Math.round(wholeNumber / 10) * 10 / multiplier;
};


// Dedault decimal px transformer.
let decimalPixelTransformer = (rpx) => parseFloat(rpx) * getRpx() + 'px';

// Default decimal vw transformer.
let decimalVWTransformer = (rpx) => toFixed(parseFloat(rpx) / (getViewportWidth() / 100), unitPrecision) + 'vw';

// Default 1 rpx to 1 px
if (getRpx() === undefined) {
  setRpx(1);
}

// Viewport width, default to 750.
if (getViewportWidth() === undefined) {
  setViewportWidth(750);
}

/**
 * Is string contains rpx
 * note: rpx is an alias to rpx
 * @param {String} str
 * @returns {Boolean}
 */
export function isRpx(str) {
  return typeof str === 'string' && RPX_REG.test(str);
}

/**
 * Calculate rpx to pixels: '1.2rpx' => 1.2 * rpx
 * @param {String} str
 * @returns {String}
 */
export function calcRpx(str) {
  if (isWeb) {
    // In Web convert rpx to 'vw', same as driver-dom and driver-universal
    return str.replace(RPX_REG, decimalVWTransformer);
  } else {
    // In WEEX and miniApp convert rpx to 'px'
    return str.replace(RPX_REG, decimalPixelTransformer);
  }
}

export function getRpx() {
  return global[GLOBAL_RPX_UNIT];
}

export function setRpx(rpx) {
  global[GLOBAL_RPX_UNIT] = rpx;
}

export function getViewportWidth() {
  return global[GLOBAL_VIEWPORT_WIDTH];
}

export function setViewportWidth(viewport) {
  global[GLOBAL_VIEWPORT_WIDTH] = viewport;
}

/**
 * Set a function to transform unit of pixel,
 * default to passthrough.
 * @param {Function} transformer function
 */
export function setDecimalPixelTransformer(transformer) {
  decimalPixelTransformer = transformer;
}

const cache = Object.create(null);
/**
 * Convert rpx.
 * @param value
 * @param prop
 * @return {String} Transformed value.
 */
export function convertUnit(value, prop) {
  const cacheKey = `${prop}-${value}`;
  const hit = cache[cacheKey];
  if (hit) {
    return hit;
  } else {
    value = value + '';
    return cache[cacheKey] = isRpx(value) ? calcRpx(value) : value;
  }
}
