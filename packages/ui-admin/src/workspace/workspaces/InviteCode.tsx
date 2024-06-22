import { Button, ControlGroup, NumericInput, Tab, Tabs } from '@blueprintjs/core'
import { toast } from 'botpress/shared'
import _ from 'lodash'
import React, { FC, useState } from 'react'
import api from '~/app/api'

interface Props {
  workspaceId: string
  inviteCode?: string
  allowedUsages: number
  onUpdate: () => void
}

const InviteCode: FC<Props> = props => {
  const [tab, setTab] = useState<any>('current')
  const [inviteLimit, setInviteLimit] = useState(-1)

  const submit = async () => {
    try {
      await api.getSecured().post(`/admin/workspace/workspaces/${props.workspaceId}/resetInvite`, { inviteLimit })

      toast.success('Đã cập nhật mã mời thành công')
      props.onUpdate()
      setTab('current')
    } catch (err) {
      toast.failure(err.message)
    }
  }

  return (
    <Tabs id="tabs" onChange={t => setTab(t)} selectedTabId={tab}>
      <Tab
        id="current"
        title="Mã mời hiện tại"
        panel={
          <div>
            Mã hiện tại: <strong>{props.inviteCode}</strong>
            <br /> <br />
            Thời gian sử dụng còn lại: {props.allowedUsages === -1 ? 'unlimited' : props.allowedUsages}
          </div>
        }
      />
      <Tab
        id="advanced"
        title="Thay đổi mã mời"
        panel={
          <div>
            <p>
            Mã mời được tạo tự động. Chọn số lần mã có thể được sử dụng (-1 = không giới hạn). Sau khi thay đổi, mã cũ không thể được sử dụng nữa.
            </p>

            <ControlGroup>
              <NumericInput
                id="input-allowed"
                placeholder="Số lần tối đa có thể được sử dụng"
                value={inviteLimit}
                onValueChange={value => setInviteLimit(value)}
              />
              <Button text="Tạo mã mới" onClick={submit} />
            </ControlGroup>
          </div>
        }
      />
    </Tabs>
  )
}

export default InviteCode
