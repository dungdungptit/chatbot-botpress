import { Callout, Intent, Tag } from '@blueprintjs/core'
import _ from 'lodash'
import React, { FC, useEffect, useState } from 'react'
import { connect, ConnectedProps } from 'react-redux'

import api from '~/app/api'
import PageContainer from '~/app/common/PageContainer'
import { AppState } from '~/app/rootReducer'
import { DiagReport } from './DiagReport'
import Item from './Item'
import { fetchServerConfig } from './reducer'
import style from './style.scss'

const NOT_SET = 'Not set'

const getDisplayValue = (val: any) => {
  if (val === undefined || val === null) {
    return NOT_SET
  } else if (val === false || val === true) {
    return val.toString()
  } else {
    return val.length ? val.toString() : NOT_SET
  }
}

const isSet = (value: any): boolean => value !== NOT_SET

const protocol = window.location.protocol.substr(0, window.location.protocol.length - 1)

type Props = ConnectedProps<typeof connector>

const Container = props => {
  return (
    <PageContainer
      title="Production Checklist"
      superAdmin={true}
      helpText={
        <span>
          Đây là danh sách kiểm tra các cài đặt được đề xuất khi chạy Botpress trong sản xuất.
          <br />Các biến môi trường được hiển thị bằng <Tag>gray</Tag> và các giá trị từ cấu hình botpress.config.json
          tệp có <Tag intent={Intent.PRIMARY}>blue</Tag>
          <br />
          <br />
          Sau khi máy chủ của bạn được thiết lập chính xác, chúng tôi khuyên bạn nên tắt trang này bằng cách đặt biến môi trường
          BP_DISABLE_SERVER_CONFIG thành "true"
        </span>
      }
    >
      {props.children}
    </PageContainer>
  )
}

export const Checklist: FC<Props> = props => {
  const [langSource, setLangSource] = useState<any>()
  const [hasAuditTrail, setAuditTrail] = useState(false)

  useEffect(() => {
    if (!props.serverConfigLoaded) {
      props.fetchServerConfig()
    }
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    loadData()
  }, [])

  const loadData = async () => {
    const { data: sources } = await api.getSecured().get('/admin/management/languages/sources')
    setLangSource(sources.languageSources)

    await checkAuditTrail()
  }

  const checkAuditTrail = async () => {
    const { data: debug } = await api.getSecured().get('/admin/health/debug')
    const audit = Object.keys(debug)
      .filter(x => x.startsWith('bp:audit'))
      .map(x => debug[x])

    setAuditTrail(_.some(audit, Boolean))
  }

  if (!props.serverConfig) {
    return (
      <Container>
        <Callout intent={Intent.PRIMARY}>
        Cấu hình máy chủ bị vô hiệu hóa. Để xem trang này, hãy đặt biến môi trường "BP_DISABLE_SERVER_CONFIG" thành false
        </Callout>
      </Container>
    )
  }

  const getEnv = (key: string): any => getDisplayValue(_.get(props.serverConfig!.env, key))
  const getConfig = (path: string): any => getDisplayValue(_.get(props.serverConfig!.config, path))
  const getLive = (path: string): any => getDisplayValue(_.get(props.serverConfig!.live, path))

  const languageEndpoint = _.get(langSource, '[0].endpoint', '')

  return (
    <Container>
      <div className={style.checklist}>
        <Item
          title="Sử dụng Postgres làm cơ sở dữ liệu"
          docs="https://botpress.com/docs/building-chatbots/developers/database#how-to-switch-from-sqlite-to-postgressql"
          status={getEnv('DATABASE_URL').startsWith('postgres') ? 'success' : 'warning'}
          source={[{ type: 'env', key: 'DATABASE_URL', value: getEnv('DATABASE_URL') }]}
        >
          Theo mặc định, Botpress sử dụng cơ sở dữ liệu SQLite, không được khuyến nghị trong môi trường sản xuất. Postgres linh hoạt hơn và cho phép chạy Botpress ở chế độ cụm (sử dụng nhiều máy chủ để xử lý tải).
        </Item>

        <Item
          title="Sử dụng cơ sở dữ liệu lưu trữ BPFS"
          docs="https://botpress.com/docs/enterprise/server-and-cicd-management/production-checklist#use-the-database-bpfs-storage"
          status={getEnv('BPFS_STORAGE') === 'database' ? 'success' : 'warning'}
          source={[{ type: 'env', key: 'BPFS_STORAGE', value: getEnv('BPFS_STORAGE') }]}
        >
          Khi tùy chọn này được đặt, mọi bot và tệp cấu hình được lưu trữ trong cơ sở dữ liệu và chỉ bản sao đó được chỉnh sửa khi bạn thay đổi chúng bằng giao diện. Bằng cách này, nhiều máy chủ có thể truy cập cùng một dữ liệu cập nhật cùng một lúc.
        </Item>

        <Item
          title="Chạy Botpress ở chế độ production"
          docs="https://botpress.com/docs/enterprise/server-and-cicd-management/production-checklist#run-botpress-in-production-mode"
          status={getEnv('BP_PRODUCTION') === 'true' ? 'success' : 'warning'}
          source={[{ type: 'env', key: 'BP_PRODUCTION', value: getEnv('BP_PRODUCTION') }]}
        >
          Khi bạn chạy Botpress trong sản xuất, những thay đổi này sẽ xảy ra:
          <ul>
            <li>Ẩn dấu vết ngăn xếp khi xảy ra lỗi</li>
            <li>Ẩn nhật ký gỡ lỗi và ghi nhật ký lỗi tiêu chuẩn để tối ưu hóa tốc độ</li>
            <li>Tối ưu hóa một số xác nhận về tốc độ</li>
            <li>Cho phép sử dụng nhiều máy chủ (chế độ cụm)</li>
          </ul>
        </Item>

        <Item
          title="Định cấu hình URL máy chủ bên ngoài"
          docs="https://botpress.com/docs/enterprise/server-and-cicd-management/production-checklist#configure-the-external-server-url"
          status={isSet(getEnv('EXTERNAL_URL')) || isSet(getConfig('httpServer.externalUrl')) ? 'success' : 'warning'}
          source={[
            { type: 'env', key: 'EXTERNAL_URL', value: getEnv('EXTERNAL_URL') },
            { type: 'config', key: 'httpServer.externalUrl', value: getConfig('httpServer.externalUrl') }
          ]}
        >
          <span>
          Điều này có thể gây ra nhiều sự cố trong quá trình sản xuất, chẳng hạn như tài nguyên không hiển thị chính xác hoặc liên kết không hoạt động. Khi không được đặt, nó sẽ mặc định là http://localhost:3000. Khi sử dụng Botpress Professional, giá trị này cũng được sử dụng để xác thực giấy phép của bạn.
          </span>
        </Item>

        <Item
          title="Kích hoạt hỗ trợ Redis"
          status={isSet(getEnv('REDIS_URL')) && isSet(getEnv('CLUSTER_ENABLED')) ? 'success' : 'warning'}
          source={[
            { type: 'env', key: 'REDIS_URL', value: getEnv('REDIS_URL') },
            { type: 'env', key: 'CLUSTER_ENABLED', value: getEnv('CLUSTER_ENABLED') },
            { type: 'env', key: 'BP_REDIS_SCOPE', value: getEnv('BP_REDIS_SCOPE') }
          ]}
        >
          Redis cho phép bạn chạy nhiều máy chủ Botpress, tất cả đều sử dụng cùng một dữ liệu. Chỉ cần có 'REDIS_URL' và 'CLUSTER_ENABLED' để Redis hoạt động bình thường. Đặt phạm vi Redis cho phép bạn chạy nhiều cụm Botpress (ví dụ: staging và production) trên cùng một cụm Redis mà không ảnh hưởng đến nhau (không được khuyến nghị). Chỉ cần sử dụng lại cùng một URL cho Redis và đặt biến môi trường 'BP_REDIS_SCOPE' thành sản phẩm trên phiên bản production của bạn và chạy thử trên môi trường chạy thử của bạn.
        </Item>

        <Item
          title="Hạn chế CORS cho miền của riêng bạn"
          status={
            getConfig('httpServer.cors.enabled') === 'false' || isSet(getConfig('httpServer.cors.origin'))
              ? 'success'
              : 'warning'
          }
          source={[
            { type: 'config', key: 'httpServer.cors.enabled', value: getConfig('httpServer.cors.enabled') },
            { type: 'config', key: 'httpServer.cors.origin', value: getConfig('httpServer.cors.origin') }
          ]}
        >
          Theo mặc định, Botpress cho phép bất kỳ nguồn gốc nào tiếp cận máy chủ. Bạn có thể tắt hoàn toàn CORS (đặt cấu hình thành false) hoặc đặt nguồn gốc được phép
        </Item>

        <Item
          title="Kích hoạt lưu trữ Cookie cho JWT Token"
          docs="https://botpress.com/docs/enterprise/server-and-cicd-management/production-checklist#enable-cookie-storage-for-the-jwt-token"
          status={getConfig('jwtToken.useCookieStorage') === 'true' ? 'success' : 'warning'}
          source={[
            { type: 'config', key: 'jwtToken.useCookieStorage', value: getConfig('jwtToken.useCookieStorage') },
            { type: 'config', key: 'jwtToken.cookieOptions', value: getConfig('jwtToken.cookieOptions') },
            { type: 'config', key: 'httpServer.cors.credentials', value: getConfig('httpServer.cors.credentials') }
          ]}
        >
          Lưu trữ token trong cookie sẽ thêm một lớp bảo mật bổ sung cho phiên của người dùng. Chính sách CORS phải được cấu hình trước. Vui lòng tham khảo tài liệu trước khi kích hoạt tính năng này.
        </Item>

        <Item
          title="Cài đặt máy chủ ngôn ngữ của riêng bạn"
          docs="https://botpress.com/docs/enterprise/server-and-cicd-management/production-checklist#host-your-own-language-server"
          status={languageEndpoint.includes('botpress.io') ? 'warning' : 'success'}
          source={[{ type: 'config', key: 'nlu.json: languageSources', value: languageEndpoint }]}
        >
          Máy chủ ngôn ngữ mặc định được định cấu hình với Botpress là máy chủ công cộng, có giới hạn yêu cầu và không nên dựa vào khi phục vụ khách hàng. Vui lòng làm theo hướng dẫn trong tài liệu của chúng tôi để thiết lập của riêng bạn, sau đó thay đổi URL máy chủ trong tệp cấu hình <strong>global/data/config/nlu.json</strong>
        </Item>

        <Item
          title="Bảo vệ máy chủ của bạn bằng HTTPS"
          docs="https://botpress.com/docs/enterprise/server-and-cicd-management/production-checklist#securing-your-server-with-https"
          status={protocol === 'https' ? 'success' : 'warning'}
          source={[{ key: 'Detected protocol', value: protocol }]}
        >
          Botpress không xử lý trực tiếp các chứng chỉ và tiêu đề https. Những thứ đó nên được xử lý bởi một máy chủ NGINX phía trước nó. Chúng tôi có mẫu cấu hình NGINX được đề xuất trong tài liệu.
        </Item>

        <Item
          title="Kích hoạt kiểm tra dấu vết"
          docs="https://botpress.com/docs/enterprise/server-and-cicd-management/production-checklist#enable-audit-trail"
          status={hasAuditTrail ? 'success' : 'warning'}
        >
          Bạn có thể bật phạm vi gỡ lỗi đặc biệt để theo dõi mọi yêu cầu được gửi đến máy chủ (và địa chỉ IP/người dùng tương ứng) và xuất chúng vào tệp nhật ký. Bạn có thể định cấu hình các phạm vi đó bằng cách nhấp vào 'Gỡ lỗi' trong menu bên trái
        </Item>

        <Item
          title="Kích hoạt phiên cố định"
          docs="https://botpress.com/docs/enterprise/server-and-cicd-management/production-checklist#enable-sticky-sessions"
          status="none"
          source={[
            { type: 'config', key: 'httpServer.socketTransports', value: getConfig('httpServer.socketTransports') }
          ]}
        >
          Khi sử dụng "Polling" làm phương tiện vận chuyển socket chính hoặc phụ, bắt buộc phải bật các phiên cố định, nếu không quá trình bắt tay có thể không bao giờ hoàn tất. Nếu bạn quyết định sử dụng "Websocket" làm phương tiện vận chuyển duy nhất, đây là một tùy chọn hợp lệ hiện nay, thì bạn không cần kích hoạt các phiên cố định.
          <br />
          <br />
          Hãy xem tài liệu này để biết thêm chi tiết:{' '}
          <a href="https://socket.io/docs/v4/using-multiple-nodes/#why-is-sticky-session-required" target="_blank">
            https://socket.io/docs/v4/using-multiple-nodes/#why-is-sticky-session-required
          </a>
          <br />
          <br />
          Đây là cấu hình vận chuyển socket hiện tại của bạn:
        </Item>

        <Item
          title="Xuất nhật ký vào hệ thống tập tin"
          docs="https://botpress.com/docs/enterprise/server-and-cicd-management/production-checklist#output-logs-to-the-filesystem"
          status={getConfig('logs.fileOutput.enabled') === 'true' ? 'success' : 'none'}
          source={[{ type: 'config', key: 'logs.fileOutput.enabled', value: getConfig('logs.fileOutput.enabled') }]}
        >
          Theo mặc định, Botpress thực hiện một số thao tác ghi nhật ký tối thiểu vào cơ sở dữ liệu. Nên bật đầu ra nhật ký trên hệ thống tệp để lưu dấu vết
        </Item>

        <Item
          title="Thay đổi đường dẫn cơ sở Botpress"
          docs="https://botpress.com/docs/enterprise/server-and-cicd-management/production-checklist#change-botpress-base-path"
          status={isSet(getLive('ROOT_PATH')) ? 'success' : 'none'}
          source={[{ key: 'Current base path', value: !isSet(getLive('ROOT_PATH')) ? '/' : getLive('ROOT_PATH') }]}
        >
          Theo mặc định, tất cả các yêu cầu được xử lý ở cấp cao nhất của url bên ngoài. Có thể thay đổi đường dẫn đó (ví dụ: sử dụng http://localhost:3000/botpress). Bạn có thể làm điều đó bằng cách cập nhật EXTERNAL_URL của máy chủ và thêm hậu tố vào cuối.
        </Item>

        <Item
          title="Tạo vai trò tùy chỉnh và xem xét quyền"
          docs="https://botpress.com/docs/enterprise/server-and-cicd-management/production-checklist#create-custom-roles-and-review-permissions"
          status="none"
        >
          Có một bộ vai trò và quyền mặc định khi bạn tạo một không gian làm việc. Bạn nên xem xét và cập nhật chúng.
        </Item>

        <Item
          title="Kích hoạt cơ chế xác thực khác"
          docs="https://botpress.com/docs/enterprise/server-and-cicd-management/production-checklist#enable-other-authentication-mechanism"
          status="none"
        >
          Phương thức xác thực mặc định là tên người dùng/mật khẩu, nhưng bạn có thể kích hoạt các chiến lược xác thực bổ sung để truy cập Botpress. Chúng tôi hiện hỗ trợ LDAP, SAML và OAUTH2.
        </Item>

        <Item
          title="Định cấu hình Reverse Proxy và Cân bằng tải của bạn"
          docs="https://botpress.com/docs/enterprise/server-and-cicd-management/production-checklist#configure-your-reverse-proxy-and-load-balancing"
          status="none"
        >
          Hãy xem tài liệu để biết thêm thông tin
        </Item>

        <Item title="Tạo một báo cáo chẩn đoán" status="none">
          Công cụ này sẽ tạo ra một báo cáo có thể giúp chẩn đoán các vấn đề. Nó sẽ kiểm tra khả năng kết nối với các thành phần khác nhau, đảm bảo rằng các thư mục thích hợp có thể ghi được và cũng sẽ bao gồm các tệp cấu hình khác nhau.
          <br />
          <br />
          Mật khẩu và khóa bí mật sẽ bị xáo trộn
          <br />
          <br />
          <DiagReport />
        </Item>
      </div>
    </Container>
  )
}

const mapStateToProps = (state: AppState) => ({
  serverConfig: state.checklist.serverConfig,
  serverConfigLoaded: state.checklist.serverConfigLoaded
})

const connector = connect(mapStateToProps, { fetchServerConfig })

export default connector(Checklist)
