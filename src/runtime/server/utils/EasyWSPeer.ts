import type { Peer } from 'crossws'
import type { EasyWSClientRoutes, EasyWSServerArguments } from '#nuxt-easy-websocket/routes'

import type { EasyWSRawPayload, EasyWSServerArgsOptions } from '../../shared-types'
import { createEasyWSBinaryFrame, isEasyWSBinaryPayload, toWebSocketBody } from '../../shared/binary-frame'
import { createMessageEnvelope } from '../../shared/message-envelope'

export class EasyWSPeer {
  peer: Peer

  constructor(peer: Peer) {
    this.peer = peer
  }

  async send<T extends keyof EasyWSClientRoutes>(...args: EasyWSServerArguments<T>) {
    const [name, data, options] = args
    const nameString = String(name)

    if (isEasyWSBinaryPayload(data)) {
      return this.peer.send(await createEasyWSBinaryFrame(nameString, data), options)
    }

    return this.peer.send(JSON.stringify(createMessageEnvelope(nameString, data)), options)
  }

  async sendRaw(
    data: EasyWSRawPayload,
    options?: EasyWSServerArgsOptions,
  ) {
    return this.peer.send(await toWebSocketBody(data), options)
  }

  async publish<T extends keyof EasyWSClientRoutes>(...args: EasyWSServerArguments<T>) {
    const [name, data, options] = args
    const nameString = String(name)

    if (isEasyWSBinaryPayload(data)) {
      return this.peer.publish(
        nameString,
        await createEasyWSBinaryFrame(nameString, data),
        options,
      )
    }

    return this.peer.publish(nameString, JSON.stringify(createMessageEnvelope(nameString, data)), options)
  }

  async publishRaw(
    topic: string,
    data: EasyWSRawPayload,
    options?: EasyWSServerArgsOptions,
  ) {
    return this.peer.publish(topic, await toWebSocketBody(data), options)
  }

  subscribe<T extends keyof EasyWSClientRoutes>(topic: T) {
    return this.peer.subscribe(topic)
  }
}
