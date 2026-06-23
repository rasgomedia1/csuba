/**
 * CSUBA - Mock Database for Testing
 * Simulates PostgreSQL responses without needing a real database
 * Used for Phase 2 testing before Neon/Docker setup
 */

interface QueryResult {
  rows: any[];
  rowCount: number;
  command?: string;
}

const mockData: Record<string, any> = {
  users: [
    {
      id: '1',
      email: 'test@test.com',
      username: 'testuser',
      password_hash: '$2b$10$...',
      created_at: new Date(),
    }
  ],
  auctions: [
    {
      id: '1',
      external_id: 'BOE-00001',
      title: 'Subasta Vivienda Madrid',
      province: 'MADRID',
      property_type: 'Vivienda',
      price_initial: 150000,
      price_estimate: 200000,
      price_final: null,
      occupancy_status: 'Ocupada',
      risk_score_overall: 45,
      risk_score_legal: 30,
      risk_score_occupancy: 70,
      risk_score_market: 35,
      auction_status: 'Activa',
      auction_end: new Date(Date.now() + 7*24*60*60*1000),
      created_at: new Date(),
    }
  ]
};

export async function mockQuery(text: string, params?: any[]): Promise<QueryResult> {
  console.log(`[MOCK-DB] Query: ${text.substring(0, 60)}...`);

  // Test connection
  if (text.includes('SELECT NOW()')) {
    return {
      rows: [{ now: new Date() }],
      rowCount: 1,
      command: 'SELECT'
    };
  }

  // Mock SELECT queries
  if (text.includes('SELECT') && text.includes('users')) {
    return {
      rows: mockData.users,
      rowCount: mockData.users.length,
      command: 'SELECT'
    };
  }

  if (text.includes('SELECT') && text.includes('auctions')) {
    return {
      rows: mockData.auctions,
      rowCount: mockData.auctions.length,
      command: 'SELECT'
    };
  }

  // Mock INSERT
  if (text.includes('INSERT')) {
    return {
      rows: [{ id: Math.random().toString() }],
      rowCount: 1,
      command: 'INSERT'
    };
  }

  // Default response
  return {
    rows: [],
    rowCount: 0,
    command: 'SELECT'
  };
}

export async function mockInitializeDatabase() {
  console.log('✅ Mock Database initialized (testing mode)');
  console.log('⚠️  This is not a real database - for development only!');
  return { rows: [], rowCount: 0 };
}

export function getMockPool() {
  return {
    query: mockQuery,
    end: async () => console.log('[MOCK-DB] Connection closed'),
    on: () => {},
  };
}

export default {
  query: mockQuery,
  initializeDatabase: mockInitializeDatabase,
  getPool: getMockPool,
};
