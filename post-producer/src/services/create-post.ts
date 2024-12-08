import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import kafkaConfig from "../config/kafka.config";
import {v4 as uuid} from 'uuid'
import { RedisConfig } from "../config/redis.config";


const app = new Hono();

const redis = new RedisConfig()
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
    
    const pid = uuid()
    try {
      await kafkaConfig.sendTopic("post", JSON.stringify({ pid, title, desc }));
     
      // save in redis
      await redis.feedCache({
        pid,
        title,
        desc
      })


      return c.json({ message: "Post Created" , pid });
    } catch (err) {
      console.log(err);
      c.json({ error: "Error sending message" }, 500);
    }
  }
);

export default app;
