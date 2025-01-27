import type { Peer } from 'crossws'

class StatsWebSocketManager {

  private static instance: StatsWebSocketManager
  private connectedPeers = new Set<Peer>()

  private constructor() {}

  static getInstance(): StatsWebSocketManager {
    if (!this.instance) {
      this.instance = new StatsWebSocketManager()
    }
    return this.instance
  }

  addPeer(peer: Peer) {
    this.connectedPeers.add(peer)
    this.logConnectionStats()
  }

  removePeer(peer: Peer) {
    this.connectedPeers.delete(peer)
    this.logConnectionStats()
  }

  getActiveVisitors(): number {
    return this.connectedPeers.size
  }

  updateActiveVisitors(visitors: number) {
    // when the number of visitors changes, send the new value to all connected peers
    this.connectedPeers.forEach(peer => {
      peer.send(JSON.stringify(visitors))
    })
  }

  private logConnectionStats() {
    console.log(`Active visitors connections: ${this.connectedPeers.size}`)
  }

}

const wsManager = StatsWebSocketManager.getInstance()

export default defineWebSocketHandler({
  open(peer) {
    try {
      wsManager.addPeer(peer)

      const visitors = wsManager.getActiveVisitors()
      wsManager.updateActiveVisitors(visitors)
    } catch (error) {
      console.error('Visitors WebSocket open error:', error)
      peer.close(1011, error instanceof Error ? error.message : 'Unknown error')
    }
  },

  close(peer) {
    wsManager.removePeer(peer)
    const visitors = wsManager.getActiveVisitors()
    wsManager.updateActiveVisitors(visitors)
    console.log('Visitors WebSocket disconnected:', peer.id)
  },

  error(peer, error) {
    wsManager.removePeer(peer)
    console.error('Visitors WebSocket error:', error)
  }
})
