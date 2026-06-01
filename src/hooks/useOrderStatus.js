import { useEffect, useRef } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

export function useOrderStatus(onStatusChange) {
  const clientRef = useRef(null)

  useEffect(() => {
    if (!onStatusChange) return

    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe('/user/queue/orders', (message) => {
          const update = JSON.parse(message.body)
          onStatusChange(update)
        })
      },
      onStompError: (frame) => {
        console.error('STOMP error', frame)
      }
    })

    client.activate()
    clientRef.current = client

    return () => {
      client.deactivate()
    }
  }, [])

  return clientRef
}