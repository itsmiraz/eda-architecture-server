import { model, Schema } from "mongoose";

type TPost = {
  pid: string;
  title: string;
  desc: string;
};

const postSchema = new Schema<TPost>({
  pid: { type: String, required: true },
  title: { type: String, required: true },
  desc: { type: String, required: true },
});

export const Post = model<TPost>("Post", postSchema);
