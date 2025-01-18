import { getStats } from '~~/server/utils/stats'

class StatsWebSocketManager {

  private static instance: StatsWebSocketManager
  private intervals = new Map<string, NodeJS.Timer>()
  private connectedPeers = new Set<string>()

  private constructor() {}

  static getInstance(): StatsWebSocketManager {
    if (!this.instance) {
      this.instance = new StatsWebSocketManager()
    }
    return this.instance
  }

  addPeer(peerId: string) {
    this.connectedPeers.add(peerId)
    this.logConnectionStats()
  }

  removePeer(peerId: string) {
    this.connectedPeers.delete(peerId)
    this.clearInterval(peerId)
    this.logConnectionStats()
  }

  setInterval(peerId: string, interval: NodeJS.Timer) {
    this.clearInterval(peerId)
    this.intervals.set(peerId, interval)
  }

  getActiveVisitors(): number {
    return this.connectedPeers.size
  }

  private clearInterval(peerId: string) {
    const interval = this.intervals.get(peerId)
    if (interval) {
      clearInterval(interval)
      this.intervals.delete(peerId)
    }
  }

  private logConnectionStats() {
    console.log(`Active stats connections: ${this.connectedPeers.size}`)
  }

}

const wsManager = StatsWebSocketManager.getInstance()

export default defineWebSocketHandler({
  async open(peer) {
    try {
      wsManager.addPeer(peer.id)

      const activeVisitors = wsManager.getActiveVisitors()

      const initialStats = await getStats(activeVisitors)
      peer.send(JSON.stringify(initialStats))

      const interval = setInterval(async () => {
        const activeVisitors = wsManager.getActiveVisitors()
        try {
          if (peer.websocket?.readyState !== 1) {
            throw new Error('WebSocket not ready')
          }
          const stats = await getStats(activeVisitors)
          peer.send(JSON.stringify(stats))
        } catch (error) {
          console.error('Stats interval error:', error)
          wsManager.removePeer(peer.id)
        }
      }, 2000)

      wsManager.setInterval(peer.id, interval)
    } catch (error) {
      console.error('Stats WebSocket open error:', error)
      peer.close(1011, error instanceof Error ? error.message : 'Unknown error')
    }
  },

  close(peer) {
    wsManager.removePeer(peer.id)
    console.log('Stats WebSocket disconnected:', peer.id)
  },

  error(peer, error) {
    wsManager.removePeer(peer.id)
    console.error('Stats WebSocket error:', error)
  }
})
