import { Button, Radio, RadioGroup } from '@blueprintjs/core'
import { Dialog, toast } from 'botpress/shared'
import _ from 'lodash'
import React, { FC, useEffect, useState } from 'react'
import api from '~/app/api'

import InviteCode from './InviteCode'

interface Props {
  workspaceId?: string
  isOpen: boolean
  toggle: () => void
  refreshWorkspaces?: () => void
}

interface RolloutInfo {
  [strategyId: string]: {
    label: string
    desc: string
    inviteRequired?: boolean
  }
}

export const rolloutInfo: RolloutInfo = {
  anonymous: {
    label: 'Người dùng ẩn danh',
    desc: 'Người dùng ẩn danh có thể nói chuyện với bot (mặc định)'
  },
  authenticated: {
    label: 'Người dùng được xác thực',
    desc: 'Người dùng được xác thực sẽ tự động được thêm vào không gian làm việc, sau đó có thể nói chuyện với bot'
  },
  authorized: {
    label: 'Người dùng được phân quyền',
    desc: 'Người dùng được phân quyền có quyền truy cập hiện có vào không gian làm việc có thể nói chuyện với bot'
  },
  'anonymous-invite': {
    label: 'Người dùng ẩn danh có mã mời',
    desc: 'Người dùng ẩn danh có mã mời có thể nói chuyện với bot',
    inviteRequired: true
  },
  'authenticated-invite': {
    label: 'Người dùng được xác thực bằng mã mời',
    desc: 'Người dùng được xác thực bằng mã mời sẽ được thêm vào không gian làm việc, sau đó có thể nói chuyện với bot',
    inviteRequired: true
  }
}

const RolloutStrategyModal: FC<Props> = props => {
  const [strategy, setStrategy] = useState('anonymous')
  const [inviteCode, setInviteCode] = useState()
  const [allowedUsages, setAllowedUsages] = useState(-1)

  useEffect(() => {
    if (props.workspaceId) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      loadRolloutInfo()
    }
  }, [props.workspaceId, props.isOpen])

  const loadRolloutInfo = async () => {
    const { data } = await api.getSecured().get(`/admin/workspace/workspaces/${props.workspaceId}/rollout`)

    setInviteCode(data.inviteCode)
    setAllowedUsages(data.allowedUsages)
    setStrategy(data.rolloutStrategy)
  }

  const submit = async () => {
    try {
      await api.getSecured().post(`/admin/workspace/workspaces/${props.workspaceId}/rollout/${strategy}`)
      toast.success('Đã cập nhật thành công chiến lược triển khai')
      props.refreshWorkspaces && props.refreshWorkspaces()
    } catch (err) {
      toast.failure(err.message)
    }
  }

  const inviteRequired = ['anonymous-invite', 'authenticated-invite'].includes(strategy)

  return (
    <Dialog.Wrapper
      title="Chiến lược triển khai"
      icon="send-to-graph"
      isOpen={props.isOpen}
      onClose={() => props.toggle()}
      size="md"
    >
      <Dialog.Body>
        <p>
        Chiến lược triển khai được áp dụng cho tất cả các bot của không gian làm việc khi người dùng gặp Cổng xác thực trên quy trình. Nếu không có Cổng xác thực, chính sách sẽ không có hiệu lực.
        </p>

        <RadioGroup onChange={e => setStrategy(e.currentTarget.value)} selectedValue={strategy}>
          <Radio id="radio-anonymous" value="anonymous" label={rolloutInfo.anonymous.desc} />
          <Radio id="radio-authenticated" value="authenticated" label={rolloutInfo.authenticated.desc} />
          <Radio id="radio-authorized" value="authorized" label={rolloutInfo.authorized.desc} />
          <p>
            <strong>Các chiến lược yêu cầu mã mời</strong>
          </p>

          <Radio id="radio-anonymous-invite" value="anonymous-invite" label={rolloutInfo['anonymous-invite'].desc} />
          <Radio
            id="radio-authenticated-invite"
            value="authenticated-invite"
            label={rolloutInfo['authenticated-invite'].desc}
          />
        </RadioGroup>
        <br />
        {inviteRequired && (
          <InviteCode
            inviteCode={inviteCode}
            allowedUsages={allowedUsages}
            onUpdate={loadRolloutInfo}
            workspaceId={props.workspaceId!}
          />
        )}
      </Dialog.Body>
      <Dialog.Footer>
        <Button id="btn-submit-rollout-strategy" text="Lưu" onClick={submit} />
      </Dialog.Footer>
    </Dialog.Wrapper>
  )
}

export default RolloutStrategyModal
