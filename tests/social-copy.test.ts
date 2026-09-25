import { describe, expect, it } from "vitest";
import { socialCaptions } from "../lib/social-copy";

describe("social captions", () => {
  it("explains the path and includes the join link", () => {
    const captions = socialCaptions("https://example.test/register");
    expect(captions).toHaveLength(5);
    const blob = captions.map((c) => c.caption).join("\n");
    expect(blob).toMatch(/https:\/\/example\.test\/register/);
    expect(blob).toMatch(/free/i);
    expect(blob).toMatch(/\$500/);
    expect(blob).not.toMatch(/points that expire/i);
  });
});
