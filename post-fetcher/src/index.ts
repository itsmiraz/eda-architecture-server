import { Hono } from "hono";
import { init } from "./start.services";
import getPostRoute from "./services/get-post";
const app = new Hono();

init();

app.get("/", (c) => {
  return c.text("Hello Hono Post Revicever!");
});
app.route("/", getPostRoute);
export default {
  port: 3002,
  fetch: app.fetch,
};
