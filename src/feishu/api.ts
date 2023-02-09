import axios, { AxiosInstance } from 'axios'

export class FeishuAPI {
  appID: string
  appSecret: string
  tenantAccessToken: string | null = null
  axios: AxiosInstance
  constructor(appID: string, appSecret: string) {
    this.appID = appID
    this.appSecret = appSecret
    this.axios = axios.create()
    this.axios.interceptors.response.use(response => response, async (error) => {
      console.log(error.response)
      if (error.response.status === 400 && error.response.data.code === 99991668) {
        await this.refreshToken()
        const config = error.config
        if (config.headers) {
          config.headers.Authorization = 'Bearer ' + this.tenantAccessToken
        }
        return await this.axios.request(config)
      }
      console.log('fake resolve')
      return Promise.resolve(error)
    })
    this.axios.interceptors.request.use(async (config) => {
      if (!this.tenantAccessToken) {
        await this.refreshToken()
      }
      config.headers.Authorization = 'Bearer ' + this.tenantAccessToken
      return config
    })
  }
  async refreshToken() {
    const response = await axios.post(
      'https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal',
      {
        app_id: this.appID,
        app_secret: this.appSecret
      }
    )
    const data: { code: number; msg: string; tenant_access_token: string; expire: number } = response.data
    this.tenantAccessToken = data.tenant_access_token
    console.log('Refreshed Tenant access token: ' + this.tenantAccessToken)
    return data
  }
  async replyMessage(replyMessageId: string, message: { content: string; msg_type: string }) {
    const response = await this.axios.post(
      `https://open.feishu.cn/open-apis/im/v1/messages/${replyMessageId}/reply`,
      message
    )
    return response
  }
  async sendMessage(
    receiveIdType: string,
    message: { receive_id: string; content: string; msg_type: string, uuid?: string }
  ) {
    const response = await this.axios.post(
      'https://open.feishu.cn/open-apis/im/v1/messages',
      message,
      {
        params: {
          receive_id_type: receiveIdType
        }
      }
    )
    return response
  }
}

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
export default new FeishuAPI(process.env.GLB_APP_ID!, process.env.GLB_APP_SECRET!)
