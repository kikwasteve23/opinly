export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { ensureSchema, databaseUrl } = await import("./lib/db/postgres");
  if (databaseUrl()) {
    await ensureSchema();
    const { readStoreSnapshot } = await import("./lib/store");
    await readStoreSnapshot();
  }
}
