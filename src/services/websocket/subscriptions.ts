// Channel subscription management

import { ChannelMessage, Subscription, ChannelName } from './types'

export class SubscriptionManager {
  private subscriptions: Map<string, Set<Subscription>> = new Map()
  private channelHistory: Map<string, ChannelMessage[]> = new Map()
  private globalListeners: Set<(message: ChannelMessage) => void> = new Set()

  subscribe(channel: ChannelName, callback: (message: ChannelMessage) => void): Subscription {
    if (!this.subscriptions.has(channel)) {
      this.subscriptions.set(channel, new Set())
    }

    const subscriptionSet = this.subscriptions.get(channel)!
    
    const subscription: Subscription = {
      channel,
      callback,
      unsubscribe: () => this.unsubscribe(channel, subscription),
    }

    subscriptionSet.add(subscription)
    
    return subscription
  }

  unsubscribe(channel: string, subscription: Subscription): void {
    const subscriptionSet = this.subscriptions.get(channel)
    if (subscriptionSet) {
      subscriptionSet.delete(subscription)
    }
  }

  unsubscribeAll(channel: string): void {
    this.subscriptions.delete(channel)
  }

  unsubscribeAllGlobal(): void {
    this.subscriptions.clear()
  }

  broadcast(channel: string, message: ChannelMessage): void {
    // Store in history
    this.addToHistory(channel, message)

    // Notify channel-specific listeners
    const subscriptionSet = this.subscriptions.get(channel)
    if (subscriptionSet) {
      for (const subscription of subscriptionSet) {
        try {
          subscription.callback(message)
        } catch (error) {
          console.error(`[Subscriptions] Error in callback for channel ${channel}:`, error)
        }
      }
    }

    // Notify global listeners
    for (const listener of this.globalListeners) {
      try {
        listener(message)
      } catch (error) {
        console.error('[Subscriptions] Error in global listener:', error)
      }
    }
  }

  private addToHistory(channel: string, message: ChannelMessage): void {
    if (!this.channelHistory.has(channel)) {
      this.channelHistory.set(channel, [])
    }

    const history = this.channelHistory.get(channel)!
    history.push(message)

    // Keep only last 500 messages per channel
    if (history.length > 500) {
      history.splice(0, history.length - 500)
    }
  }

  getHistory(channel: string, limit: number = 50): ChannelMessage[] {
    const history = this.channelHistory.get(channel) || []
    return history.slice(-limit)
  }

  addGlobalListener(callback: (message: ChannelMessage) => void): () => void {
    this.globalListeners.add(callback)
    return () => this.globalListeners.delete(callback)
  }

  removeGlobalListener(callback: (message: ChannelMessage) => void): void {
    this.globalListeners.delete(callback)
  }

  getSubscribedChannels(): ChannelName[] {
    return Array.from(this.subscriptions.keys()) as ChannelName[]
  }

  getSubscriptionCount(channel: string): number {
    return this.subscriptions.get(channel)?.size || 0
  }

  getTotalSubscriptions(): number {
    let total = 0
    for (const subs of this.subscriptions.values()) {
      total += subs.size
    }
    return total
  }

  clearHistory(): void {
    this.channelHistory.clear()
  }
}
