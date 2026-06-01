import { useState, useEffect, useRef } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

export function useInventory(listingId, initialData) {
  const [inventory, setInventory] = useState(initialData || null)
  const clientRef = useRef(null)

  useEffect(() => {
    if (!listingId) return

    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe(
          `/topic/listing/${listingId}/inventory`,
          (message) => {
            const update = JSON.parse(message.body)
            setInventory(prev => ({ ...prev, ...update }))
          }
        )
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
  }, [listingId])

  return inventory
}