if (!process.env.TD_API_KEY?.trim()) {
  console.error("Set TD_API_KEY before running production browser tests. See docs/testing.md.");
  process.exit(1);
}
