import { Pool } from 'pg';

// Database connection
let pool: Pool | null = null;

const getDatabase = () => {
  if (!pool) {
    try {
      pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      });
    } catch (error) {
      console.error('Failed to initialize database:', error);
      return null;
    }
  }
  return pool;
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

// Initialize database tables
export const initializeDatabase = async () => {
  const database = getDatabase();
  if (!database) return;

  try {
    // Users table
    await database.query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        image TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Prompts table
    await database.query(`
      CREATE TABLE IF NOT EXISTS prompts (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        department TEXT NOT NULL,
        category TEXT NOT NULL,
        prompt TEXT NOT NULL,
        creator_id TEXT NOT NULL,
        status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (creator_id) REFERENCES users (id)
      )
    `);

    // Saved prompts table
    await database.query(`
      CREATE TABLE IF NOT EXISTS saved_prompts (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        prompt_id INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (prompt_id) REFERENCES prompts (id),
        UNIQUE(user_id, prompt_id)
      )
    `);

    // Create indexes for better performance
    await database.query(`
      CREATE INDEX IF NOT EXISTS idx_prompts_department ON prompts (department);
      CREATE INDEX IF NOT EXISTS idx_prompts_status ON prompts (status);
      CREATE INDEX IF NOT EXISTS idx_prompts_creator ON prompts (creator_id);
      CREATE INDEX IF NOT EXISTS idx_saved_prompts_user ON saved_prompts (user_id);
    `);

    console.log('Database tables initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database tables:', error);
  }
};

// Helper function to handle database operations safely
const safeDbOperation = async <T>(operation: (db: Pool) => Promise<T>, fallback: T): Promise<T> => {
  try {
    const database = getDatabase();
    if (!database) return fallback;
    return await operation(database);
  } catch (error) {
    console.error('Database operation failed:', error);
    return fallback;
  }
};

// User operations
export const userOperations = {
  create: async (user: Omit<User, 'created_at' | 'updated_at'>) => {
    return safeDbOperation(async (database) => {
      const result = await database.query(
        'INSERT INTO users (id, email, name, image) VALUES ($1, $2, $3, $4) RETURNING *',
        [user.id, user.email, user.name, user.image]
      );
      return result.rows[0];
    }, null);
  },

  findByEmail: async (email: string): Promise<User | undefined> => {
    return safeDbOperation(async (database) => {
      const result = await database.query('SELECT * FROM users WHERE email = $1', [email]);
      return result.rows[0] as User | undefined;
    }, undefined);
  },

  findById: async (id: string): Promise<User | undefined> => {
    return safeDbOperation(async (database) => {
      const result = await database.query('SELECT * FROM users WHERE id = $1', [id]);
      return result.rows[0] as User | undefined;
    }, undefined);
  },

  upsert: async (user: Omit<User, 'created_at' | 'updated_at'>) => {
    return safeDbOperation(async (database) => {
      const result = await database.query(`
        INSERT INTO users (id, email, name, image)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT(email) DO UPDATE SET
          name = EXCLUDED.name,
          image = EXCLUDED.image,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *
      `, [user.id, user.email, user.name, user.image]);
      return result.rows[0];
    }, null);
  }
};

// Prompt operations
export const promptOperations = {
  create: async (prompt: Omit<Prompt, 'id' | 'created_at' | 'updated_at'>) => {
    return safeDbOperation(async (database) => {
      const result = await database.query(`
        INSERT INTO prompts (title, description, department, category, prompt, creator_id, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `, [
        prompt.title,
        prompt.description,
        prompt.department,
        prompt.category,
        prompt.prompt,
        prompt.creator_id,
        prompt.status
      ]);
      return result.rows[0];
    }, null);
  },

  findAll: async (filters?: { department?: string; category?: string; status?: string }): Promise<Prompt[]> => {
    return safeDbOperation(async (database) => {
      let query = 'SELECT * FROM prompts WHERE 1=1';
      const params: any[] = [];
      let paramCount = 0;

      if (filters?.department) {
        paramCount++;
        query += ` AND department = $${paramCount}`;
        params.push(filters.department);
      }

      if (filters?.category) {
        paramCount++;
        query += ` AND category = $${paramCount}`;
        params.push(filters.category);
      }

      if (filters?.status) {
        paramCount++;
        query += ` AND status = $${paramCount}`;
        params.push(filters.status);
      }

      query += ' ORDER BY created_at DESC';

      const result = await database.query(query, params);
      return result.rows as Prompt[];
    }, []);
  },

  findById: async (id: number): Promise<Prompt | undefined> => {
    return safeDbOperation(async (database) => {
      const result = await database.query('SELECT * FROM prompts WHERE id = $1', [id]);
      return result.rows[0] as Prompt | undefined;
    }, undefined);
  },

  findByCreator: async (creatorId: string): Promise<Prompt[]> => {
    return safeDbOperation(async (database) => {
      const result = await database.query(
        'SELECT * FROM prompts WHERE creator_id = $1 ORDER BY created_at DESC',
        [creatorId]
      );
      return result.rows as Prompt[];
    }, []);
  },

  update: async (id: number, updates: Partial<Omit<Prompt, 'id' | 'created_at' | 'updated_at'>>) => {
    return safeDbOperation(async (database) => {
      const fields = Object.keys(updates);
      const values = Object.values(updates);
      const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
      
      const result = await database.query(`
        UPDATE prompts 
        SET ${setClause}, updated_at = CURRENT_TIMESTAMP 
        WHERE id = $${fields.length + 1}
        RETURNING *
      `, [...values, id]);
      return result.rows[0];
    }, null);
  },

  delete: async (id: number) => {
    return safeDbOperation(async (database) => {
      const result = await database.query('DELETE FROM prompts WHERE id = $1', [id]);
      return result.rowCount;
    }, null);
  },

  countByDepartment: async (): Promise<Record<string, number>> => {
    return safeDbOperation(async (database) => {
      const result = await database.query(`
        SELECT department, COUNT(*) as count 
        FROM prompts 
        WHERE status = 'approved' 
        GROUP BY department
      `);
      return result.rows.reduce((acc, { department, count }) => {
        acc[department] = parseInt(count);
        return acc;
      }, {} as Record<string, number>);
    }, {});
  }
};

// Saved prompt operations
export const savedPromptOperations = {
  save: async (userId: string, promptId: number) => {
    return safeDbOperation(async (database) => {
      const result = await database.query(`
        INSERT INTO saved_prompts (user_id, prompt_id)
        VALUES ($1, $2)
        RETURNING *
      `, [userId, promptId]);
      return result.rows[0];
    }, null);
  },

  unsave: async (userId: string, promptId: number) => {
    return safeDbOperation(async (database) => {
      const result = await database.query(`
        DELETE FROM saved_prompts 
        WHERE user_id = $1 AND prompt_id = $2
      `, [userId, promptId]);
      return result.rowCount;
    }, null);
  },

  findByUser: async (userId: string): Promise<(Prompt & { saved_at: string })[]> => {
    return safeDbOperation(async (database) => {
      const result = await database.query(`
        SELECT p.*, sp.created_at as saved_at
        FROM prompts p
        JOIN saved_prompts sp ON p.id = sp.prompt_id
        WHERE sp.user_id = $1
        ORDER BY sp.created_at DESC
      `, [userId]);
      return result.rows as (Prompt & { saved_at: string })[];
    }, []);
  },

  isSaved: async (userId: string, promptId: number): Promise<boolean> => {
    return safeDbOperation(async (database) => {
      const result = await database.query(`
        SELECT 1 FROM saved_prompts 
        WHERE user_id = $1 AND prompt_id = $2
      `, [userId, promptId]);
      return result.rows.length > 0;
    }, false);
  }
};

export default getDatabase; 