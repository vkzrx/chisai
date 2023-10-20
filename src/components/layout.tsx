import { html } from "hono/html";

type LayoutProps = {
  title: string;
  // biome-ignore lint: lint/suspicious/noExplicitAny
  children: any;
};

export const Layout = (props: LayoutProps) => html`<!DOCTYPE html>
  <html>
    <head>
      <title>${props.title}</title>
      <meta name="description" content="Shorty: URL shortener" />
    </head>
    <body>
      ${props.children}
    </body>
  </html>
`;
