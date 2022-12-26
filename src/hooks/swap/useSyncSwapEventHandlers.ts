import { useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { SwapEventHandlers, swapEventHandlersAtom } from 'state/swap'
export type { SwapEventHandlers } from 'state/swap'

export default function useSyncSwapEventHandlers(handlers: SwapEventHandlers): void {
  const setSwapEventHandlersAtom = useSetAtom(swapEventHandlersAtom)
  useEffect(() => setSwapEventHandlersAtom(handlers), [handlers, setSwapEventHandlersAtom])
}
