import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, Relation } from 'typeorm'

@Entity()
export class ChatModel {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  chatId: string

  @ManyToOne('HookModel', 'chats')
  hook: Relation<HookModel>

  constructor(chatId: string) {
    this.chatId = chatId
  }
}

@Entity()
export class HookModel {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  repo: string

  @OneToMany('ChatModel', 'hook')
  chats: Relation<ChatModel>[]

  constructor(repo: string, chats: ChatModel[]) {
    this.repo = repo
    this.chats = chats
  }
}
