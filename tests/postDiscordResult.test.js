import test from "node:test";
import assert from "node:assert/strict";

import { buildFollowupBody } from "../src/worker/postDiscordResult.js";

test("buildFollowupBody returns fallback for empty content", () => {
  assert.deepEqual(buildFollowupBody({ content: "" }), {
    content: "Request completed, but no response content was generated."
  });
});

test("buildFollowupBody keeps short content as plain message", () => {
  const body = buildFollowupBody({ content: "hello world", command: "tldr" });
  assert.deepEqual(body, { content: "hello world" });
});

test("buildFollowupBody uses embed for long TLDR content", () => {
  const longText = "x".repeat(2500);
  const body = buildFollowupBody({ content: longText, command: "tldr" });

  assert.equal(typeof body.content, "undefined");
  assert.equal(Array.isArray(body.embeds), true);
  assert.equal(body.embeds.length, 1);
  assert.equal(body.embeds[0].title, "TL;DR");
  assert.ok(body.embeds[0].description.length <= 4096);
  assert.equal(body.embeds[0].color, 0x0f766e);
});

test("buildFollowupBody uses command-specific formatting for fact check", () => {
  const longText = "x".repeat(2500);
  const body = buildFollowupBody({ content: longText, command: "fc" });

  assert.equal(body.embeds[0].title, "Fact Check");
  assert.equal(body.embeds[0].color, 0x2563eb);
});
