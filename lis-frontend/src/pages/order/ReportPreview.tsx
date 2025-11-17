import React from 'react'
import { Card, Row, Col, Button } from 'antd'
import { CloseOutlined, DownloadOutlined } from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import { useReportDeliveryStore } from '@/stores/reportDelivery'

const ReportPreview: React.FC = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { list, download } = useReportDeliveryStore()
  const item = list.find(x => x.id === id)

  const handleDownload = () => {
    if (item) download([item.id])
  }

  const handleClose = () => navigate('/order/delivery')

  return (
    <div className="h-full bg-white p-6 overflow-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">报告预览</h1>
        <div className="space-x-2">
          <Button icon={<DownloadOutlined />} onClick={handleDownload}>下载</Button>
          <Button icon={<CloseOutlined />} onClick={handleClose}>关闭</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card title="报告预览">
          <div className="h-[600px] flex items-center justify-center border border-gray-200">PDF 预览占位</div>
        </Card>
        <Card title="报告信息">
          <Row gutter={[8, 12]}>
            <Col span={8}>客户名称</Col>
            <Col span={16}>{item?.customerName || ''}</Col>

            <Col span={8}>样本编号</Col>
            <Col span={16}>{(item?.sampleNos || []).join(', ')}</Col>

            <Col span={8}>原始样本编号</Col>
            <Col span={16}></Col>

            <Col span={8}>样本类型</Col>
            <Col span={16}></Col>

            <Col span={8}>采样时间</Col>
            <Col span={16}></Col>

            <Col span={8}>产品名称</Col>
            <Col span={16}>{(item?.productNames || []).join(', ')}</Col>

            <Col span={8}>交付要求</Col>
            <Col span={16}></Col>

            <Col span={8}>患者姓名</Col>
            <Col span={16}></Col>

            <Col span={8}>患者手机号</Col>
            <Col span={16}></Col>

            <Col span={8}>患者ID</Col>
            <Col span={16}></Col>

            <Col span={8}>出生日期</Col>
            <Col span={16}></Col>

            <Col span={8}>年龄类型</Col>
            <Col span={16}></Col>

            <Col span={8}>年龄</Col>
            <Col span={16}></Col>

            <Col span={8}>月龄</Col>
            <Col span={16}></Col>

            <Col span={8}>性别</Col>
            <Col span={16}></Col>

            <Col span={8}>报告审核完成日期</Col>
            <Col span={16}></Col>
          </Row>
        </Card>
      </div>
    </div>
  )
}

export default ReportPreview
