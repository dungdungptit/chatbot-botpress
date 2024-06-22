import { Button, Callout } from '@blueprintjs/core'
import { ModuleUI, toast } from 'botpress/shared'
import _ from 'lodash'
import React from 'react'

const { Container } = ModuleUI

const FullView = props => {
  const migrateBot = async () => {
    try {
      await props.bp.axios.post('/mod/ndu/migrate')
      toast.success('Bot đã migrate thành công! Đang tải lại...')

      window.location.reload()
    } catch (err) {
      toast.failure(err.message)
    }
  }

  return (
    <Container sidePanelHidden={true}>
      <div />
      <div style={{ padding: 10 }}>
        <Callout title="Migrate">
        Quá trình migration sẽ thực hiện các hành động sau:
          <ol>
            <li>Nhập các luồng cần thiết vào bot này</li>
            <li>Tạo các thành phần nội dung cần thiết</li>
            <li>Cập nhật các luồng hiện tại của bạn</li>
            <li>Cập nhật tệp cấu hình bot</li>
            <li>Tạo chủ đề cho từng ngữ cảnh NLU hiện có</li>
          </ol>
          <Button onClick={migrateBot}>Migrate</Button>
        </Callout>
      </div>
    </Container>
  )
}

export default FullView
