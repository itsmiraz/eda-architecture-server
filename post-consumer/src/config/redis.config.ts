import Redis from "ioredis";

interface POST {
  pid: string;
  title: string;
  desc: string;
}

export class RedisConfig {
  public redis: Redis | undefined;

  constructor() {
    if (this.redis) {
      console.log("Already to redis");
      return;
    }
    try {
      this.redis = new Redis();
    } catch (err) {
      throw new Error("Some thing went wrong: Error in connecting redis");
    }
  }

  // method - save post to redis

  async feedCache(post: POST) {
    // check
    if (!this.redis) {
      console.log("Redis is not connected");
      return;
    }

    try {
      await this.redis.hset(`post:${post.pid}`, post);
      console.log("post saved in to redis");
    } catch (err) {
      console.log(err);
      throw new Error("Some thing went wrong while saving the post");
    }
  }

  async getPost(pid: string): Promise<POST | null> {
    if (!this.redis) {
      console.log("Redis is not connected");
      return null;
    }

    try {
      const post = await this.redis.hgetall(`post:${pid}`);
      console.log(post);
      return {
        pid: post.pid,
        title: post.title,
        desc: post.desc,
      };
    } catch (err) {
      console.log(err);
      throw new Error('Some thing went wrong')
    //   return null;
    }
  }
}
