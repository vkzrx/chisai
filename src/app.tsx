import { Hono } from "hono";
import { serveStatic } from "hono/cloudflare-workers";
import { jsxRenderer } from "hono/jsx-renderer";
import { api } from "./api/api";
import { HomePage } from "./pages/home";

declare module "hono" {
  interface ContextRenderer {
    (content: string, props: { title: string }): Response;
  }
}

const app = new Hono();

app.route("/api", api);

app.use("/app.css", serveStatic({ path: "./app.css" }));

app.get(
  "*",
  jsxRenderer((props) => {
    return (
      <html lang="en">
        <head>
          <title>{props.title}</title>
          <meta charset="UTF-8" />
          <meta name="description" content="Shorty: URL shortener" />
          <link href="/app.css" rel="stylesheet" />
        </head>
        <body>{props.children}</body>
      </html>
    );
  }),
);

app.get("/", (c) => {
  return c.render(<HomePage name="World" />, { title: "Shorty | Home" });
});

export default app;
