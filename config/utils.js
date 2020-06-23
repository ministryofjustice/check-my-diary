const envOrThrow = (value) => {
  const setValue = process.env[value]
  if (!setValue) throw new Error(`Missing env var ${value}`)

  return setValue
}

const envOr = (value, fallback) => process.env[value] || fallback

const envListOr = (values, fallback) => {
  const foundValue = values.find((val) => {
    const setVal = process.env[val]
    if (setVal) return setVal

    return false
  })
  if (!foundValue) return fallback

  return foundValue
}

const envListOrThrow = (values) => {
  const foundValue = values.find((val) => {
    const setVal = process.env[val]
    if (setVal) return setVal

    return false
  })
  if (!foundValue) throw new Error(`Missing one of the following env var ${values}`)

  return foundValue
}

module.exports = {
  envOrThrow,
  envOr,
  envListOr,
  envListOrThrow,
}
