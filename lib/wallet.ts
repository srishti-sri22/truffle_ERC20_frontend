import { getProvider } from "./contracts"
import { useTokenStore } from "./store"

export const wallet = {
  connect: async () => {
    const store = useTokenStore.getState()
    try {
      const provider = getProvider()
      const accounts = await provider.send("eth_requestAccounts", [])
      if (accounts.length > 0) {
        store.setUserAddress(accounts[0])
        store.setConnected(true)
        localStorage.setItem('walletConnected', 'true')
      }
    } catch (error) {
      console.error("Wallet connection failed:", error)
      store.setError("Failed to connect wallet")
    }
  },

  disconnect: () => {
    const store = useTokenStore.getState()
    store.resetAll()
    store.setConnected(false)
    localStorage.removeItem('walletConnected')
  },

  checkConnection: async () => {
    const store = useTokenStore.getState()
    const wasConnected = localStorage.getItem('walletConnected')
    
    if (!wasConnected) return

    if (typeof window === "undefined" || !window.ethereum) return

    try {
      const provider = getProvider()
      const accounts = await provider.send("eth_accounts", [])
      
      if (accounts.length > 0) {
        store.setUserAddress(accounts[0])
        store.setConnected(true)
      } else {
        localStorage.removeItem('walletConnected')
      }
    } catch (error) {
      console.error("Failed to check connection:", error)
      localStorage.removeItem('walletConnected')
    }
  },

  initListeners: () => {
    const store = useTokenStore.getState()
    if (typeof window === "undefined" || !window.ethereum) return

    window.ethereum.removeAllListeners("accountsChanged")
    window.ethereum.removeAllListeners("chainChanged")

    window.ethereum.on("accountsChanged", (accounts: string[]) => {
      if (accounts.length === 0) {
        store.resetAll()
        store.setConnected(false)
        localStorage.removeItem('walletConnected')
      } else {
        store.setUserAddress(accounts[0])
        store.setConnected(true)
        localStorage.setItem('walletConnected', 'true')
      }
    })

    window.ethereum.on("chainChanged", (_chainId: string) => {
      window.location.reload()
    })
  }
}