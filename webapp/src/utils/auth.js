const TOKEN_PROP = 'lb-token'

export function isLoggedIn () {
  const token = getToken()
  if (token) {
    return true
  } else {
    return false
  }
}

export function getToken () {
  return localStorage.getItem(TOKEN_PROP)
}

export function storeToken (token) {
  localStorage.setItem(TOKEN_PROP, token)
}

export function clearToken () {
  localStorage.removeItem(TOKEN_PROP)
}
