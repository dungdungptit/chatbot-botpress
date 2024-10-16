import { Button } from '@blueprintjs/core'
import { toast } from 'botpress/shared'
import ms from 'ms'
import React, { useState } from 'react'

import api from '~/app/api'

export const DiagReport = () => {
  const [loading, setLoading] = useState(false)

  const getDiagReport = async () => {
    setLoading(true)

    try {
      const { data } = await api.getSecured({ timeout: ms('2m') }).get('/admin/management/checklist/diag')

      const link = document.createElement('a')
      link.href = URL.createObjectURL(new Blob([data]))
      link.download = 'diagnostic.txt'
      link.click()
    } catch (err) {
      toast.failure(`Không thể tạo báo cáo chẩn đoán: ${err}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={getDiagReport} text={loading ? 'Vui lòng đợi...' : 'Tạo báo cáo'} disabled={loading}></Button>
  )
}
