import { Pool } from "pg";

// Create a connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_PUBLIC_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Initialize database tables
export async function initializeDatabase() {
  const client = await pool.connect();
  try {
    // Create conversations table with user_id
    await client.query(`
      CREATE TABLE IF NOT EXISTS conversations (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        title VARCHAR(255) NOT NULL DEFAULT 'New Conversation',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Add user_id column if it doesn't exist (for existing tables)
    await client.query(`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'conversations' AND column_name = 'user_id'
        ) THEN 
          ALTER TABLE conversations ADD COLUMN user_id VARCHAR(36) NOT NULL DEFAULT 'anonymous';
        END IF;
      END $$;
    `);

    // Create index for faster user queries
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_conversations_user_id 
      ON conversations(user_id)
    `);

    // Create messages table
    await client.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        conversation_id INTEGER REFERENCES conversations(id) ON DELETE CASCADE,
        role VARCHAR(20) NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create index for faster message retrieval
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_messages_conversation_id 
      ON messages(conversation_id)
    `);

    console.log("Database tables initialized successfully");
    return true;
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  } finally {
    client.release();
  }
}

// Conversation operations
export async function createConversation(userId: string, title?: string) {
  const result = await pool.query(
    "INSERT INTO conversations (user_id, title) VALUES ($1, $2) RETURNING *",
    [userId, title || "New Conversation"]
  );
  return result.rows[0];
}

export async function getConversations(userId: string) {
  const result = await pool.query(
    "SELECT * FROM conversations WHERE user_id = $1 ORDER BY updated_at DESC",
    [userId]
  );
  return result.rows;
}

export async function getConversation(id: number) {
  const result = await pool.query(
    "SELECT * FROM conversations WHERE id = $1",
    [id]
  );
  return result.rows[0];
}

export async function updateConversationTitle(id: number, title: string) {
  const result = await pool.query(
    "UPDATE conversations SET title = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *",
    [title, id]
  );
  return result.rows[0];
}

export async function deleteConversation(id: number) {
  await pool.query("DELETE FROM conversations WHERE id = $1", [id]);
}

// Message operations
export async function addMessage(
  conversationId: number,
  role: "user" | "assistant",
  content: string
) {
  // Add message
  const result = await pool.query(
    "INSERT INTO messages (conversation_id, role, content) VALUES ($1, $2, $3) RETURNING *",
    [conversationId, role, content]
  );

  // Update conversation's updated_at timestamp
  await pool.query(
    "UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = $1",
    [conversationId]
  );

  return result.rows[0];
}

export async function getMessages(conversationId: number) {
  const result = await pool.query(
    "SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC",
    [conversationId]
  );
  return result.rows;
}

// Get recent messages for context (memory)
export async function getRecentMessages(conversationId: number, limit: number = 20) {
  const result = await pool.query(
    `SELECT role, content FROM messages 
     WHERE conversation_id = $1 
     ORDER BY created_at DESC 
     LIMIT $2`,
    [conversationId, limit]
  );
  // Reverse to get chronological order
  return result.rows.reverse();
}

export default pool;
