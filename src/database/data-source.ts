import { DataSource } from 'typeorm'
import { ChatModel, HookModel } from './entities'

export default new DataSource({
  type: 'mysql',
  host: process.env.GLB_DB_HOST,
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  port: parseInt(process.env.GLB_DB_PORT!),
  username: process.env.GLB_DB_USERNAME,
  password: process.env.GLB_DB_PASSWORD,
  database: process.env.GLB_DB,
  synchronize: true,
  logging: true,
  entities: [ChatModel, HookModel],
  migrations: [],
  subscribers: []
})
