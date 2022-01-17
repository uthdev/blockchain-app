const cache = {};

const accessEnv = (key, defaultValue) => {
  if(!(key in process.env) || typeof process.env[key] === undefined) {
    if(defaultValue) return defaultValue
    throw new Error(`${key} not found in process.env`)
  }

  if(!(key in cache)) {
    cache[key] = process.env[key]
  }

  return cache[key]
}

export default accessEnv;