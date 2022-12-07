import { t, Trans } from '@lingui/macro'
import { PERMIT2_ADDRESS } from '@uniswap/permit2-sdk'
import ActionButton from 'components/ActionButton'
import EtherscanLink from 'components/EtherscanLink'
import { usePendingApproval } from 'hooks/transactions'
import { PermitState } from 'hooks/usePermit2'
import { Spinner } from 'icons'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { InterfaceTrade } from 'state/routing/types'
import { ApprovalTransactionInfo } from 'state/transactions'
import { Colors } from 'theme'
import { ExplorerDataType } from 'utils/getExplorerLink'

/**
 * An approving PermitButton.
 * Should only be rendered if a valid trade exists that is not yet permitted.
 */
export default function PermitButton({
  color,
  trade,
  state,
  callback,
  onSubmit,
}: {
  color: keyof Colors
  trade?: InterfaceTrade
  state: PermitState
  callback?: () => Promise<ApprovalTransactionInfo | void>
  onSubmit: (submit?: () => Promise<ApprovalTransactionInfo | void>) => Promise<void>
}) {
  const currency = trade?.inputAmount?.currency
  const [isPending, setIsPending] = useState(false)
  const [isFailed, setIsFailed] = useState(false)
  useEffect(() => {
    // Reset pending/failed state if currency changes.
    setIsPending(false)
    setIsFailed(false)
  }, [currency])

  const onClick = useCallback(async () => {
    setIsPending(true)
    try {
      await onSubmit(callback)
      setIsFailed(false)
    } catch (e) {
      console.error(e)
      setIsFailed(true)
    } finally {
      setIsPending(false)
    }
  }, [callback, onSubmit])

  const pendingApproval = usePendingApproval(currency?.isToken ? currency : undefined, PERMIT2_ADDRESS)

  const actionProps = useMemo(() => {
    switch (state) {
      case PermitState.UNKNOWN:
      case PermitState.PERMITTED:
        return
      case PermitState.APPROVAL_NEEDED:
      case PermitState.PERMIT_NEEDED:
    }

    if (isPending) {
      return {
        icon: Spinner,
        message: t`Approve in your wallet`,
      }
    } else if (pendingApproval) {
      return {
        icon: Spinner,
        message: (
          <EtherscanLink type={ExplorerDataType.TRANSACTION} data={pendingApproval}>
            <Trans>Approval pending</Trans>
          </EtherscanLink>
        ),
      }
    } else if (isFailed) {
      return {
        message: t`Approval failed`,
        onClick,
      }
    } else {
      return {
        tooltip: t`Permission is required for Uniswap to swap each token. This will expire after one month for your security.`,
        message: `Approve use of ${currency?.symbol ?? 'token'}`,
        onClick,
      }
    }
  }, [currency?.symbol, isFailed, isPending, onClick, pendingApproval, state])

  return (
    <ActionButton color={color} disabled={!actionProps?.onClick} action={actionProps}>
      {isFailed ? t`Try again` : t`Approve`}
    </ActionButton>
  )
}
