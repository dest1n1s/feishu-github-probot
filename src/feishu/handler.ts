import dataSource from "../database/data-source";
import { ChatModel, HookModel } from "../database/entities";
import express from "../express";
import feishuApi from "./api";
import decrypt from "./decrypt";

interface FeishuMessage {
  message_id: string;
  root_id?: string;
  parent_id?: string;
  create_time: string;
  chat_id: string;
  chat_type: "p2p" | "group";
  message_type: string;
  content: string;
  mentions?: {
    key: string;
    id: {
      union_id: string;
      user_id: string;
      open_id: string;
    };
    name: string;
    tenant_key: string;
  }[];
}

interface FeishuMessageEvent {
  sender: {
    sender_id: {
      union_id: string;
      user_id: string;
      open_id: string;
    };
    sender_type: string;
    tenant_key: string;
  };
  message: FeishuMessage;
}

export class FeishuHandler {
  botOpenId: string;
  constructor(botOpenId) {
    this.botOpenId = botOpenId;
  }
  async getChats(repo?: string) {
    const hooks = await dataSource.getRepository(HookModel).find({
      where: {
        repo,
      },
      relations: {
        chats: true,
      },
    });
    console.log("Hooks: ", hooks);
    return hooks.reduce((v: ChatModel[], hook) => [...v, ...hook.chats], []);
  }
  handle() {
    express.post('/lark', async (req, res) => {
      const encodedBody = req.body
      const body = decrypt(encodedBody.encrypt)
      console.log(body)
      let response = null
      if (body.challenge) {
        response = {
          challenge: body.challenge,
        };
      }
      const result = res.send(response)
      if (
        body.schema === "2.0" &&
        body.header.event_type === "im.message.receive_v1"
      )
        this.handleMessageEvent(body.event);
      console.log("Response to send: ", response)
      return result 
    })
  }
  async handleMessageEvent(event: FeishuMessageEvent) {
    const message = event.message;
    console.log(message)
    if (
      message.chat_type === "group" &&
      message.mentions &&
      message.mentions.length === 1 &&
      message.mentions[0].id.open_id === this.botOpenId &&
      message.message_type === "text"
    ) {
      const content: { text: string } = JSON.parse(message.content);

      const testSubscribe = async (text: string): Promise<string | null> => {
        const regexResult = /^\s*@_user_1\s+subscribe\s+(\S+)\s*$/.exec(text);
        if (!regexResult) return null;
        const repoRegexResult = /^([\w-+#]+\/[\w-+#]+)\/*$/.exec(
          regexResult[1]
        );
        if (!repoRegexResult) return "Invalid repository value!";
        const repo = repoRegexResult[1];
        let hook = await dataSource.getRepository(HookModel).findOne({
          where: {
            repo,
          },
          relations: {
            chats: true,
          },
        });
        if (!hook) {
          hook = new HookModel(repo, [])
          await dataSource.manager.save(hook)
        }
        if (hook.chats.find((v) => v.chatId === message.chat_id))
          return "Already subscribed!";
        const chat = new ChatModel(message.chat_id);
        await dataSource.manager.save(chat);
        hook.chats.push(chat);
        await dataSource.manager.save(hook);
        return "Successfully subscribed!";
      };
      const testUnsubscribe = async (text: string) => {
        const regexResult = /^\s*@_user_1\s+unsubscribe\s+(\S+)\s*$/.exec(text);
        if (!regexResult) return null;
        const repoRegexResult = /^([\w-+#]+\/[\w-+#]+)\/*$/.exec(
          regexResult[1]
        );
        if (!repoRegexResult) return "Invalid repository value!";
        const repo = repoRegexResult[1];
        const hook = await dataSource.getRepository(HookModel).findOne({
          where: {
            repo,
          },
          relations: {
            chats: true,
          },
        });
        if (!hook) return "This repository has not been subscribed!";
        if (!hook.chats.find((v) => v.chatId === message.chat_id))
          return "This repository has not been subscribed in this chat!";
        hook.chats = hook.chats.filter((v) => v.chatId !== message.chat_id);
        await dataSource.manager.save(hook);
        return "Successfully unsubscribed!";
      };
      const tests = [testSubscribe, testUnsubscribe];
      for (const test of tests) {
        const res = await test(content.text);
        console.log("Return Message: ", res);
        if (res) {
          return await feishuApi.replyMessage(message.message_id, {
            content: JSON.stringify({ text: res }),
            msg_type: "text",
          });
        }
      }
    }
    return null;
  }
}

export default new FeishuHandler(process.env.GLB_BOT_OPEN_ID)