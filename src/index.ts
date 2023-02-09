import "reflect-metadata";
import { Probot } from "probot";
import t, { i18nInit } from "./i18n/i18n.config";
import feishuApi from "./feishu/api";
import feishuHandler from "./feishu/handler";
import dataSource from "./database/data-source";

export = async (app: Probot) => {
  await i18nInit();
  await dataSource.initialize();
  feishuHandler.handle();

  app.on(
    [
      "issues.opened",
      "issues.reopened",
      "issues.closed",
      "issues.edited",
      "issues.assigned",
      "issues.unassigned",
    ],
    async (context) => {
      app.log.debug(t(`color.${context.payload.action}`));
      const config = {
        wide_screen_mode: true,
      };
      const header = {
        template: t(`color.${context.payload.action}`),
        title: {
          content: `**[${t(`tag.${context.payload.action}`)}]** #${
            context.payload.issue.number
          } ${context.payload.issue.title}`,
          tag: "plain_text",
        },
      };
      const content = {
        tag: "div",
        text: {
          content: `${t(`content.${context.payload.action}`, {
            context: "issue",
            user: `[${context.payload.sender.login}](${context.payload.sender.html_url})`,
            // assignee: `[@${context.payload.assignee?.login}](${context.payload.assignee?.html_url})`
          })}\n**[#${context.payload.issue.number} ${
            context.payload.issue.title
          }](${context.payload.issue.html_url})**\n${
            context.payload.issue.body || ""
          }`,
          tag: "lark_md",
        },
      };
      const assignees = {
        tag: "div",
        text: {
          content: t("assignees", {
            assignees: context.payload.issue.assignees.map(
              (v) => `[@${v.login}](${v.html_url})`
            ),
          }),
          tag: "lark_md",
        },
      };
      const commentAndTime = {
        fields: [
          {
            is_short: true,
            text: {
              content: `**Comments**\n${context.payload.issue.comments}`,
              tag: "lark_md",
            },
          },
          {
            is_short: true,
            text: {
              content: `**时间**\n${new Date(
                context.payload.issue.updated_at
              ).toLocaleDateString()}`,
              tag: "lark_md",
            },
          },
        ],
        tag: "div",
      };
      const hr = {
        tag: "hr",
      };
      const note = {
        elements: [
          {
            content: `[${context.payload.repository.full_name}](${context.payload.repository.html_url})`,
            tag: "lark_md",
          },
        ],
        tag: "note",
      };
      const elements = [content, assignees, commentAndTime, hr, note];
      const repo = context.payload.repository.full_name
      const chats = await feishuHandler.getChats(repo)
      for (const chat of chats) {
        const res = await feishuApi.sendMessage("chat_id", {
          msg_type: "interactive",
          content: JSON.stringify({
            config,
            header,
            elements,
          }),
          receive_id: chat.chatId,
        });
        app.log.debug(res.data);
      }
      const issueComment = context.issue({
        body: "Thanks for opening this issue!",
      });
      await context.octokit.issues.createComment(issueComment);
    }
  );
};
