import { Button, Classes, Dialog, FormGroup, InputGroup, TextArea } from '@blueprintjs/core'
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

const EditWorkspaceModal: FC<Props> = props => {
  const [name, setName] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [botPrefix, setBotPrefix] = useState<string | undefined>('')

  useEffect(() => {
    if (props.workspace) {
      const { name, description, botPrefix } = props.workspace

      setName(name)
      setDescription(description || '')
      setBotPrefix(botPrefix)
    }
  }, [props.workspace, props.isOpen])

  const submit = async () => {
    try {
      await api.getSecured().post(`/admin/workspace/workspaces/${props.workspace.id}`, { name, description, botPrefix })
      props.refreshWorkspaces()

      toast.success('Lưu workspace thành công')
      closeModal()
    } catch (err) {
      toast.failure(err.message)
    }
  }

  const closeModal = () => {
    setName('')
    setDescription('')
    props.toggle()
  }

  return (
    <Dialog isOpen={props.isOpen} icon="edit" onClose={closeModal} transitionDuration={0} title={'Chỉnh sửa thông tin Workspace'}>
      <div className={Classes.DIALOG_BODY}>
        <FormGroup label={<span>Tên Workspace</span>} labelFor="input-name" labelInfo="*">
          <InputGroup
            id="input-name"
            placeholder="Tên của workspace (phân biệt chữ hoa chữ thường)"
            value={name}
            onChange={e => setName(e.currentTarget.value)}
            tabIndex={1}
            autoFocus={true}
          />
        </FormGroup>

        <FormGroup
          label={<span>Tiền tố của  bot</span>}
          labelFor="input-botPrefix"
          labelInfo="*"
          helperText="Các bot trong không gian làm việc này phải bắt đầu bằng tiền tố này, theo sau là __"
        >
          <InputGroup
            id="input-botPrefix"
            placeholder=""
            value={botPrefix}
            onChange={e => setBotPrefix(e.target.value)}
            tabIndex={2}
          />
        </FormGroup>

        <FormGroup label={<span>Mô tả</span>} labelFor="input-description">
          <TextArea
            id="input-description"
            placeholder="Không gian làm việc này đang được sử dụng để làm gì? (không bắt buộc)"
            value={description}
            onChange={e => setDescription(e.currentTarget.value)}
            rows={3}
            fill={true}
            tabIndex={3}
            maxLength={500}
          />
        </FormGroup>
      </div>

      <div className={Classes.DIALOG_FOOTER}>
        <div className={Classes.DIALOG_FOOTER_ACTIONS}>
          <Button id="btn-submit-edit-workspace" text="Lưu" tabIndex={3} onClick={submit} />
        </div>
      </div>
    </Dialog>
  )
}

export default EditWorkspaceModal
