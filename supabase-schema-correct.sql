-- SUPABASE SCHEMA CORREGIDO (syntax 100% Postgres)
-- profiles FK fix + todas tablas funcionales

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Profiles (FIX: separate PRIMARY KEY + FK constraint)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT CHECK (role IN ('admin', 'manager', 'employee', 'accountant', 'client', 'guest')) DEFAULT 'employee',
  role_level TEXT CHECK (role_level IN ('admin', 'manager', 'foreman', 'employee', 'contractor')) DEFAULT 'employee',
  hourly_rate DECIMAL(10,2) DEFAULT 0,
  portal_access BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT fk_profiles_users FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- RLS Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_view" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_own_update" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Clients (tu test OK)
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_person TEXT NOT NULL,
  company_name TEXT,
  email TEXT UNIQUE,
  phone TEXT,
  address TEXT,
  city TEXT,
  status TEXT CHECK (status IN ('active', 'prospect', 'vip', 'inactive', 'archived')) DEFAULT 'prospect',
  portal_access TEXT CHECK (portal_access IN ('yes', 'no')) DEFAULT 'no',
  service_interest TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Employees
CREATE TABLE IF NOT EXISTS public.employees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  address TEXT,
  role_level TEXT CHECK (role_level IN ('admin', 'manager', 'foreman', 'employee', 'contractor')) DEFAULT 'employee',
  hourly_rate DECIMAL(10,2),
  start_date DATE,
  bio TEXT,
  portal_access BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT,
  year INTEGER,
  src TEXT,
  alt TEXT,
  size TEXT DEFAULT 'normal',
  client_id UUID,
  client_name TEXT,
  status TEXT CHECK (status IN ('planning', 'active', 'on-hold', 'completed', 'cancelled')) DEFAULT 'planning',
  description TEXT,
  address TEXT,
  budget DECIMAL(12,2),
  start_date DATE,
  end_date DATE,
  notes TEXT,
  cover_image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT fk_projects_client FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE SET NULL
);

-- Billing Documents
CREATE TABLE IF NOT EXISTS public.billing_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT CHECK (type IN ('estimate', 'invoice', 'receipt', 'work-order', 'credit-note')),
  status TEXT CHECK (status IN ('draft', 'sent', 'delivered', 'opened', 'viewed', 'downloaded', 'approved', 'paid', 'cancelled')) DEFAULT 'draft',
  billing_source TEXT CHECK (billing_source IN ('project', 'service', 'store', 'subscription')),
  document_number TEXT,
  client_id UUID,
  client_name TEXT,
  client_email TEXT,
  client_address TEXT,
  project_id UUID,
  project_name TEXT,
  issue_date DATE,
  due_date DATE,
  line_items JSONB,
  subtotal DECIMAL(12,2) DEFAULT 0,
  tax_rate DECIMAL(5,2) DEFAULT 15,
  tax_amount DECIMAL(12,2) DEFAULT 0,
  discount_rate DECIMAL(5,2) DEFAULT 0,
  discount_amount DECIMAL(12,2) DEFAULT 0,
  total DECIMAL(12,2) DEFAULT 0,
  notes TEXT,
  payment_terms TEXT DEFAULT 'Net 30',
  company_info JSONB DEFAULT '{}',
  template TEXT DEFAULT 'classic',
  sent_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  email_log JSONB DEFAULT '[]',
  version_history JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT fk_billing_client FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE SET NULL,
  CONSTRAINT fk_billing_project FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE SET NULL
);

-- Hour Entries
CREATE TABLE IF NOT EXISTS public.hour_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID,
  employee_name TEXT NOT NULL,
  project_id UUID,
  project_name TEXT,
  date DATE NOT NULL,
  hours DECIMAL(5,2),
  cost_per_hour DECIMAL(10,2),
  total_cost DECIMAL(10,2),
  notes TEXT,
  approved TEXT CHECK (approved IN ('yes', 'no', 'pending')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT fk_hour_employee FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE,
  CONSTRAINT fk_hour_project FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE SET NULL
);

-- Expenses
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID,
  project_name TEXT,
  category TEXT DEFAULT 'other',
  description TEXT NOT NULL,
  amount DECIMAL(12,2),
  date DATE DEFAULT CURRENT_DATE,
  vendor TEXT,
  payment_method TEXT DEFAULT 'card',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT fk_expenses_project FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE SET NULL
);

-- Income
CREATE TABLE IF NOT EXISTS public.income (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID,
  project_name TEXT,
  service_type TEXT,
  description TEXT NOT NULL,
  amount DECIMAL(12,2),
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT fk_income_project FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE SET NULL
);

-- Orders
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  items JSONB,
  total DECIMAL(12,2),
  status TEXT DEFAULT 'pending',
  source TEXT DEFAULT 'store',
  shipping_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Service Products
CREATE TABLE IF NOT EXISTS public.service_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price TEXT NOT NULL,
  price_type TEXT,
  description TEXT,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leads
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  service_interest TEXT,
  source TEXT DEFAULT 'web',
  status TEXT DEFAULT 'new',
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS básico
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "clients_read" ON public.clients FOR SELECT USING (true);

-- Sample data
INSERT INTO public.service_products (name, price, price_type) VALUES 
('Maintenance', '$299', 'monthly') ON CONFLICT DO NOTHING;

INSERT INTO public.clients (contact_person, email) VALUES 
('Test Client', 'test@example.com') ON CONFLICT DO NOTHING;

-- ¡LISTO! Schema funcional
```

**PEGA TODO → RUN → "schema funcionando" → siguiente panel live! 🎉**
