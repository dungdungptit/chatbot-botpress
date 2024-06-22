import { Button, Callout, Classes, Dialog, FormGroup, InputGroup, Intent, TextArea } from '@blueprintjs/core'
import { toast } from 'botpress/shared'
import { Workspace } from 'common/typings'
import React, { FC, useEffect, useState } from 'react'
import api from '~/app/api'

interface Props {
  workspace: Workspace
  isOpen: boolean
  toggle: () => void
  refreshWorkspaces: () => void
}

const DeleteWorkspaceModal: FC<Props> = props => {
  const [name, setName] = useState<string>('')

  const submit = async () => {
    try {
      await api.getSecured().post(`/admin/workspace/workspaces/${props.workspace.id}/delete`)
      props.refreshWorkspaces()

      toast.success('Xóa workspace thành công')
      closeModal()
    } catch (err) {
      toast.failure(err.message)
    }
  }

  const closeModal = () => {
    setName('')
    props.toggle()
  }

  if (!props.workspace) {
    return null
  }

  const botsWarning = `${props.workspace.bots.length} bot${
    props.workspace.bots.length === 1 ? '' : 's'
  } cũng sẽ bị xóa`

  return (
    <Dialog
      isOpen={props.isOpen}
      icon="trash"
      onClose={closeModal}
      transitionDuration={0}
      title={`Xóa workspace "${props.workspace.name}"`}
    >
      <div className={Classes.DIALOG_BODY}>
        <Callout intent={Intent.WARNING} title={botsWarning}>
        Xóa một workspace. Tất cả các bot được liên kết cũng sẽ bị xóa.
        </Callout>
        <br />
        <FormGroup label={<span>Tên workspace</span>} labelFor="input-workspaceName" labelInfo="*">
          <InputGroup
            id="input-workspaceName"
            placeholder="Nhập tên của workspace (phân biệt chữ hoa chữ thường)"
            value={name}
            onChange={e => setName(e.currentTarget.value)}
            tabIndex={1}
            autoFocus={true}
          />
        </FormGroup>
      </div>

      <div className={Classes.DIALOG_FOOTER}>
        <div className={Classes.DIALOG_FOOTER_ACTIONS}>
          <Button
            id="btn-submit-delete-workspace"
            intent={Intent.DANGER}
            text="Xóa"
            tabIndex={2}
            onClick={submit}
            disabled={props.workspace.name !== name}
          />
        </div>
      </div>
    </Dialog>
  )
}

export default DeleteWorkspaceModal
