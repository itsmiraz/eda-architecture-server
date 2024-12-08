import { Hono } from "hono";
import { RedisConfig } from "../config/redis.config";
import { Post } from "../model/posts";

const app = new Hono();
const redis = new RedisConfig();

app.get("/post/:pid", async (c) => {
  const id = c.req.param("pid");

  if (!id) {
    c.json({
      message: "Id id required",
    });

    return;
  }

  try {
    const cachedPost = await redis.getPost(id);

    if (cachedPost && Object.keys(cachedPost).length > 0) {
      console.log("post from redis");
      return c.json(cachedPost);
    }

    const post = await Post.findOne({ pid: id });
    if (!post) {
      return c.json({
        message: "Post not found",
      });
    }
    await redis.feedCache(post);
    return c.json(post, 200);
  } catch (err) {
    console.log(err);
    c.json(
      {
        message: "Error getting post",
      },
      500
    );
  }
});

export default app;
