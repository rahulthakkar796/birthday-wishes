import sqlite3 from "sqlite3";
import { open, Database } from "sqlite";
import { Wish } from "./types";

let db: Database<sqlite3.Database, sqlite3.Statement> | null = null;

export const initDb = async (): Promise<void> => {
  try {
    db = await open({
      filename: ":memory:",
      driver: sqlite3.Database,
    });

    await db.exec(`
      CREATE TABLE IF NOT EXISTS wishes (
        uuid TEXT PRIMARY KEY,
        wishes TEXT,
        "from" TEXT,
        "to" TEXT,
        computation_started_at TEXT,
        computation_finished_at TEXT,
        pow_nonce INTEGER,
        hash TEXT,
        done_by_worker_id TEXT
      )
    `);
  } catch (error) {
    console.error("Error initializing database:", error);
    throw new Error("Failed to initialize database");
  }
};

export const closeDb = async (): Promise<void> => {
  try {
    if (db) {
      await db.close();
      db = null;
      console.log("Database connection closed.");
    }
  } catch (error) {
    console.error("Error closing database connection:", error);
    throw new Error("Failed to close database connection");
  }
};

export const insertWish = async (wish: Wish): Promise<void> => {
  if (!db) throw new Error("Database not initialized");
  try {
    await db.run(
      `INSERT INTO wishes (uuid, wishes, "from", "to") VALUES (?, ?, ?, ?)`,
      [wish.uuid, wish.wishes, wish.from, wish.to]
    );
    console.log("Wish inserted:", wish);
  } catch (error) {
    console.error("Error inserting wish:", error);
    throw new Error("Failed to insert wish");
  }
};

export const updateWish = async (
  uuid: string,
  data: Partial<Wish>
): Promise<void> => {
  if (!db) throw new Error("Database not initialized");
  try {
    const fields = Object.keys(data)
      .map((key) => `"${key}" = ?`)
      .join(", ");
    const values = Object.values(data);
    values.push(uuid);
    await db.run(`UPDATE wishes SET ${fields} WHERE uuid = ?`, values);
    console.log(`Wish updated: ${uuid} with data: ${JSON.stringify(data)}`);
  } catch (error) {
    console.error(`Error updating wish with uuid ${uuid}:`, error);
    throw new Error("Failed to update wish");
  }
};

export const getWish = async (uuid: string): Promise<Wish | undefined> => {
  if (!db) throw new Error("Database not initialized");
  try {
    return await db.get<Wish>(`SELECT * FROM wishes WHERE uuid = ?`, uuid);
  } catch (error) {
    console.error(`Error fetching wish with uuid ${uuid}:`, error);
    throw new Error("Failed to fetch wish");
  }
};

export const clearDb = async (): Promise<void> => {
  if (db) {
    try {
      await db.run(`DELETE FROM wishes`);
      console.log("Database cleared");
    } catch (error) {
      console.error("Error clearing database:", error);
      throw new Error("Failed to clear database");
    }
  } else {
    console.warn("Database connection is not properly initialized.");
  }
};
