export type Operation = 'r' | 'w'

const r: Operation = 'r'
const w: Operation = 'w'

export interface Resource {
  name: string
  displayName?: string
  description?: string
  operations?: Operation[]
  children?: Resource[]
}

const _enrichResources = (resources: Resource[] | undefined, parent?: string): Resource[] | undefined => {
  if (!resources) {
    return resources
  }

  return resources.map(res => {
    const fullName = parent != null ? `${parent}.${res.name}` : res.name
    return {
      ...res,
      displayName: res.name,
      name: fullName,
      children: _enrichResources(res.children, fullName)
    } as Resource
  })
}

export const enrichResources = (resources: Resource[]) => _enrichResources(resources)

const _RESOURCES: Resource[] = [
  {
    name: '*',
    description: 'Tất cả các tài nguyên, cùng một lúc. Sử dụng cẩn thận',
    operations: [r, w]
  },
  {
    name: 'bot',
    description: 'Các thuộc tính của bot, chẳng hạn như nội dung, luồng, v.v.',
    children: [
      {
        name: '*',
        description: 'Tất cả các thuộc tính của bot.',
        operations: [r, w]
      },
      {
        name: 'notifications',
        description: 'Thông báo bot, chẳng hạn như lỗi thời gian chạy',
        operations: [r]
      },
      {
        name: 'information',
        description: 'Thông tin tổng quan về bot',
        operations: [r]
      },
      {
        name: 'information.license',
        description: 'Giấy phép của bot',
        operations: [w]
      },
      {
        name: 'logs',
        description: 'Logs của bot',
        operations: [r]
      },
      {
        name: 'logs.archive',
        description: 'Nhật ký lưu trữ của bot',
        operations: [r]
      },
      {
        name: 'content',
        description: 'Mục nội dung bot',
        operations: [r, w]
      },
      {
        name: 'ghost_content',
        description:
          'Phần lớn nội dung bot, chẳng hạn như nội dung và luồng, được quản lý ma, tức là được đồng bộ hóa từ máy chủ với mã nguồn bot',
        operations: [r, w]
      },
      {
        name: 'media',
        description: 'Tải lên tệp cho bot',
        operations: [w]
      },
      {
        name: 'flows',
        description: 'Luồng của bot, tức là logic của nó được mô tả dưới dạng sơ đồ luồng',
        operations: [r, w]
      },
      {
        name: 'skills',
        description: 'Nút kỹ năng luồng của bot',
        operations: [w]
      }
    ]
  }
].sort((a, b) => a.name.localeCompare(b.name))

export const RESOURCES = enrichResources(_RESOURCES)!
