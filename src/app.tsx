import { hc } from "hono/client";
import * as React from "react";
import { AppType } from "../functions/api/[[route]]";

type ErrorType = "invalid" | "internal";

const errors: Record<ErrorType, string> = {
  invalid: "The URL doesn't appear to be valid",
  internal: "An internal error has occurred",
};

const baseUrl = "https://chisai.pages.dev";

const client = hc<AppType>(`${baseUrl}/api`);

export function App(): JSX.Element {
  const [url, setURL] = React.useState("");
  const [error, setError] = React.useState<ErrorType | null>(null);
  const [shorten, setShorten] = React.useState<string | null>(null);

  const onChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (error) setError(null);
    setURL(event.target.value);
  };

  const onKeyDown = async (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return;
    const re = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;
    if (!url.match(re)) {
      setError("invalid");
      return;
    }
    const response = await client.api.shorten.$post({
      json: { url },
    });
    if (!response.ok) {
      setError("internal");
      return;
    }
    const res = await response.json();
    setShorten(res.shorten);
  };

  return (
    <main className="h-[100dvh] flex justify-center">
      <div className="w-1/3 flex flex-col space-y-4 mt-32">
        <div className="text-2xl">Create short links</div>
        <input
          value={url}
          onChange={onChange}
          onKeyDown={onKeyDown}
          placeholder="Paste your long url"
          className="border border-gray-500 rounded p-2"
        />
        {shorten ? (
          <a
            href={`${baseUrl}/api/${shorten}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {baseUrl}/api/{shorten}
          </a>
        ) : null}
        {error ? <p className="text-red-500">{errors[error]}</p> : null}
      </div>
    </main>
  );
}
