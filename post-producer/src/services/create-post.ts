import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import kafkaConfig from "../config/kafka.config";
const app = new Hono();

app.post(
  "/create-post",
  zValidator(
    "json",
    z.object({
      title: z.string(),
      desc: z.string(),
    })
  ),
  async (c) => {
    const { title, desc } = c.req.valid("json");
    try {
      await kafkaConfig.sendTopic("post", JSON.stringify({ title, desc }));
      return c.json({ message: "Post Created" });
    } catch (err) {
      console.log(err);
      c.json({ error: "Error sending message" }, 500);
    }
  }
);

export default app;
