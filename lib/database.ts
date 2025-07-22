import Database from 'better-sqlite3';
import path from 'path';

// Database path
const dbPath = path.join(process.cwd(), 'prompts.db');

// Initialize database lazily
let db: Database.Database | null = null;
let isInitialized = false;

const getDatabase = () => {
  if (!db) {
    try {
      db = new Database(dbPath);
      // Enable foreign keys
      db.pragma('foreign_keys = ON');
      
      if (!isInitialized) {
        initializeDatabase();
        isInitialized = true;
      }
    } catch (error) {
      console.error('Failed to initialize database:', error);
      // Return null if database can't be initialized (e.g., during build)
      return null;
    }
  }
  return db;
};

// Type definitions
export interface User {
  id: string;
  email: string;
  name: string;
  image?: string;
  created_at: string;
  updated_at: string;
}

export interface Prompt {
  id: number;
  title: string;
  description: string;
  department: string;
  category: string;
  prompt: string;
  creator_id: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface SavedPrompt {
  id: number;
  user_id: string;
  prompt_id: number;
  created_at: string;
}

// Create tables
const initializeDatabase = () => {
  const database = getDatabase();
  if (!database) return;

  // Users table
  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      image TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Prompts table
  database.exec(`
    CREATE TABLE IF NOT EXISTS prompts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      department TEXT NOT NULL,
      category TEXT NOT NULL,
      prompt TEXT NOT NULL,
      creator_id TEXT NOT NULL,
      status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (creator_id) REFERENCES users (id)
    )
  `);

  // Saved prompts table (many-to-many relationship between users and prompts)
  database.exec(`
    CREATE TABLE IF NOT EXISTS saved_prompts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      prompt_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (prompt_id) REFERENCES prompts (id),
      UNIQUE(user_id, prompt_id)
    )
  `);

  // Create indexes for better performance
  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_prompts_department ON prompts (department);
    CREATE INDEX IF NOT EXISTS idx_prompts_status ON prompts (status);
    CREATE INDEX IF NOT EXISTS idx_prompts_creator ON prompts (creator_id);
    CREATE INDEX IF NOT EXISTS idx_saved_prompts_user ON saved_prompts (user_id);
  `);
};

// Helper function to handle database operations safely
const safeDbOperation = <T>(operation: (db: Database.Database) => T, fallback: T): T => {
  try {
    const database = getDatabase();
    if (!database) return fallback;
    return operation(database);
  } catch (error) {
    console.error('Database operation failed:', error);
    return fallback;
  }
};

// User operations
export const userOperations = {
  create: (user: Omit<User, 'created_at' | 'updated_at'>) => {
    return safeDbOperation((database) => {
      const stmt = database.prepare(`
        INSERT INTO users (id, email, name, image)
        VALUES (?, ?, ?, ?)
      `);
      return stmt.run(user.id, user.email, user.name, user.image);
    }, null);
  },

  findByEmail: (email: string): User | undefined => {
    return safeDbOperation((database) => {
      const stmt = database.prepare('SELECT * FROM users WHERE email = ?');
      return stmt.get(email) as User | undefined;
    }, undefined);
  },

  findById: (id: string): User | undefined => {
    return safeDbOperation((database) => {
      const stmt = database.prepare('SELECT * FROM users WHERE id = ?');
      return stmt.get(id) as User | undefined;
    }, undefined);
  },

  upsert: (user: Omit<User, 'created_at' | 'updated_at'>) => {
    return safeDbOperation((database) => {
      const stmt = database.prepare(`
        INSERT INTO users (id, email, name, image)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(email) DO UPDATE SET
          name = excluded.name,
          image = excluded.image,
          updated_at = CURRENT_TIMESTAMP
      `);
      return stmt.run(user.id, user.email, user.name, user.image);
    }, null);
  }
};

// Prompt operations
export const promptOperations = {
  create: (prompt: Omit<Prompt, 'id' | 'created_at' | 'updated_at'>) => {
    return safeDbOperation((database) => {
      const stmt = database.prepare(`
        INSERT INTO prompts (title, description, department, category, prompt, creator_id, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      return stmt.run(
        prompt.title,
        prompt.description,
        prompt.department,
        prompt.category,
        prompt.prompt,
        prompt.creator_id,
        prompt.status
      );
    }, null);
  },

  findAll: (filters?: { department?: string; category?: string; status?: string }): Prompt[] => {
    return safeDbOperation((database) => {
      let query = 'SELECT * FROM prompts WHERE 1=1';
      const params: any[] = [];

      if (filters?.department) {
        query += ' AND department = ?';
        params.push(filters.department);
      }

      if (filters?.category) {
        query += ' AND category = ?';
        params.push(filters.category);
      }

      if (filters?.status) {
        query += ' AND status = ?';
        params.push(filters.status);
      }

      query += ' ORDER BY created_at DESC';

      const stmt = database.prepare(query);
      return stmt.all(...params) as Prompt[];
    }, []);
  },

  findById: (id: number): Prompt | undefined => {
    return safeDbOperation((database) => {
      const stmt = database.prepare('SELECT * FROM prompts WHERE id = ?');
      return stmt.get(id) as Prompt | undefined;
    }, undefined);
  },

  findByCreator: (creatorId: string): Prompt[] => {
    return safeDbOperation((database) => {
      const stmt = database.prepare('SELECT * FROM prompts WHERE creator_id = ? ORDER BY created_at DESC');
      return stmt.all(creatorId) as Prompt[];
    }, []);
  },

  update: (id: number, updates: Partial<Omit<Prompt, 'id' | 'created_at' | 'updated_at'>>) => {
    return safeDbOperation((database) => {
      const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
      const values = Object.values(updates);
      
      const stmt = database.prepare(`
        UPDATE prompts 
        SET ${fields}, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `);
      return stmt.run(...values, id);
    }, null);
  },

  delete: (id: number) => {
    return safeDbOperation((database) => {
      const stmt = database.prepare('DELETE FROM prompts WHERE id = ?');
      return stmt.run(id);
    }, null);
  },

  countByDepartment: (): Record<string, number> => {
    return safeDbOperation((database) => {
      const stmt = database.prepare(`
        SELECT department, COUNT(*) as count 
        FROM prompts 
        WHERE status = 'approved' 
        GROUP BY department
      `);
      const results = stmt.all() as { department: string; count: number }[];
      return results.reduce((acc, { department, count }) => {
        acc[department] = count;
        return acc;
      }, {} as Record<string, number>);
    }, {});
  }
};

// Saved prompt operations
export const savedPromptOperations = {
  save: (userId: string, promptId: number) => {
    return safeDbOperation((database) => {
      const stmt = database.prepare(`
        INSERT INTO saved_prompts (user_id, prompt_id)
        VALUES (?, ?)
      `);
      return stmt.run(userId, promptId);
    }, null);
  },

  unsave: (userId: string, promptId: number) => {
    return safeDbOperation((database) => {
      const stmt = database.prepare(`
        DELETE FROM saved_prompts 
        WHERE user_id = ? AND prompt_id = ?
      `);
      return stmt.run(userId, promptId);
    }, null);
  },

  findByUser: (userId: string): (Prompt & { saved_at: string })[] => {
    return safeDbOperation((database) => {
      const stmt = database.prepare(`
        SELECT p.*, sp.created_at as saved_at
        FROM prompts p
        JOIN saved_prompts sp ON p.id = sp.prompt_id
        WHERE sp.user_id = ?
        ORDER BY sp.created_at DESC
      `);
      return stmt.all(userId) as (Prompt & { saved_at: string })[];
    }, []);
  },

  isSaved: (userId: string, promptId: number): boolean => {
    return safeDbOperation((database) => {
      const stmt = database.prepare(`
        SELECT 1 FROM saved_prompts 
        WHERE user_id = ? AND prompt_id = ?
      `);
      return !!stmt.get(userId, promptId);
    }, false);
  }
};

export default getDatabase; 