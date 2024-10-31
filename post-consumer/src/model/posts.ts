import { model, Schema } from "mongoose";

type TPost = {
  title: string;
  desc: string;
};

const postSchema = new Schema<TPost>({
  title: { type: String, required: true },
  desc: { type: String, required: true },
});

export const Post = model<TPost>("Post", postSchema);
