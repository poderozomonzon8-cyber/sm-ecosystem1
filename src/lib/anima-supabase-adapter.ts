import { supabaseQuery, supabaseMutation } from './supabase';

const MOCK_DATA = {
  Client: [{ id: 1, name: 'Test Client' }],
  Employee: [{ id: 1, name: 'Test Employee' }],
  Project: [{ id: 1, title: 'Test Project' }],
  // Add more mocks...
};

export function useQuery(collection: string, options = {}) {
  // Mock for dev
  const data = MOCK_DATA[collection as keyof typeof MOCK_DATA] || [];
  return {
    data,
    isPending: false,
    error: null,
  };
}

export function useMutation(collection: string) {
  return {
    create: async (data: any) => await supabaseMutation(collection.toLowerCase(), null, data),
    update: async (id: string, data: any) => await supabaseMutation(collection.toLowerCase(), id, data),
    remove: async (id: string) => await supabaseMutation(collection.toLowerCase(), id, { deleted: true }),
    isPending: false,
  };
}

