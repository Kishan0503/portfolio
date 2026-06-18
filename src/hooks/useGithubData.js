import { useEffect, useState } from 'react'
import { fetchProfile, fetchLanguages, fetchContributions } from '../lib/github'

/**
 * Generic async-data hook returning { data, loading, error }.
 * Fetches once on mount.
 */
function useAsync(fn, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null })

  useEffect(() => {
    let active = true
    setState({ data: null, loading: true, error: null })
    fn()
      .then((data) => active && setState({ data, loading: false, error: null }))
      .catch((error) => active && setState({ data: null, loading: false, error }))
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return state
}

export function useGithubProfile() {
  return useAsync(fetchProfile)
}

export function useGithubLanguages() {
  return useAsync(fetchLanguages)
}

export function useGithubContributions() {
  return useAsync(fetchContributions)
}
