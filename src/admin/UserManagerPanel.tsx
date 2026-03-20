import { useState, useEffect } from "react";
import { Users, ShieldCheck, EnvelopeSimple, CaretRight, MagnifyingGlass } from "@phosphor-icons/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabaseQuery } from "@/lib/supabase";
import { ROLE_PERMISSIONS, Role, setStoredRole } from "@/contexts/AuthContext";

const ROLES: Role[] = ["admin","manager","employee","accountant","client"];

const ROLE_BADGE: Record<Role, string> = {
  admin:      "bg-gold/20 text-gold",
  manager:    "bg-blue-100 text-blue-700",
  employee:   "bg-purple-100 text-purple-700",
  accountant: "bg-emerald-100 text-emerald-700",
  client:     "bg-gray-100 text-gray-600",
  guest:      "bg-gray-100 text-gray-400",
};

export default function UserManagerPanel() {
  const [clients, setClients] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isPending, setIsPending] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsPending(true);
        const [clientsData, employeesData] = await Promise.all([
          supabaseQuery('clients', { orderBy: 'created_at:desc' }),
          supabaseQuery('employees', { orderBy: 'last_name:asc' })
        ]);
        setClients(clientsData);
        setEmployees(employeesData);
      } catch (error) {
        console.error('Error loading users:', error);
      } finally {
        setIsPending(false);
      }
    };
    loadData();
  }, []);

  const [search, setSearch] = useState("");
  const [assignedRoles, setAssignedRoles] = useState<Record<string, Role>>({});
  const [flashId, setFlashId] = useState<string | null>(null);

  const handleAssignRole = (email: string, role: Role) => {
    if (!email) return;
    setStoredRole(email, role);
    setAssignedRoles(prev => ({ ...prev, [email]: role }));
    setFlashId(email);
    setTimeout(() => setFlashId(null), 1800);
  };

  // Build user list from clients + employees
  type UserRow = { id: string; name: string; email: string; type: "employee" | "client"; role: Role };
  const allUsers: UserRow[] = [
    ...employees.map(e => ({
      id: e.id,
      name: `${e.firstName} ${e.lastName}`,
      email: e.email,
      type: "employee" as const,
      role: (assignedRoles[e.email] ?? (e.roleLevel as Role)) ?? "employee",
    })),
    ...clients.map(c => ({
      id: c.id,
      name: c.contactPerson,
      email: c.email ?? "",
      type: "client" as const,
      role: (c.email ? assignedRoles[c.email] : undefined) ?? "client",
    })),
  ].filter(u => {
    if (!search) return true;
    const q = search.toLowerCase();
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });



  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-headline font-bold text-2xl text-charcoal">User Manager</h1>
          <p className="font-sans text-sm text-gray-500 mt-1">View all system users and manage their access roles.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Users",    value: allUsers.length },
          { label: "Staff Members",  value: allUsers.filter(u => u.type === "employee").length },
          { label: "Clients",        value: allUsers.filter(u => u.type === "client").length },
          { label: "Admin Accounts", value: 1 },
        ].map(s => (
          <Card key={s.label} className="bg-white border-gray-200 shadow-sm">
            <CardContent className="p-4">
              <p className="font-mono text-2xl font-bold text-charcoal">{s.value}</p>
              <p className="font-sans text-xs text-gray-400 mt-0.5">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4 max-w-sm">
        <MagnifyingGlass size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" placeholder="Search by name or email…" value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 text-sm font-sans bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-charcoal/30" />
      </div>

      <Card className="bg-white border-gray-200 shadow-sm">
        <CardContent className="p-0">
          {isPending ? (
            <div className="flex items-center justify-center py-16">
              <span className="w-7 h-7 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
            </div>
          ) : allUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Users size={28} weight="regular" className="text-gray-300 mb-2" />
              <p className="font-sans text-sm text-gray-400">No users found. Add Clients or Employees first.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {/* Admin row */}
              <div className="flex items-center justify-between px-6 py-4 bg-gold/5">
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center flex-shrink-0">
                    <span className="font-headline font-bold text-xs text-gold">S</span>
                  </div>
                  <div>
                    <p className="font-sans font-medium text-sm text-charcoal">Silviol Monzon</p>
                    <p className="font-mono text-[10px] text-gray-400">silviolmonzon@amenagementmonzon.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 text-[10px] font-mono rounded-full bg-gold/20 text-gold">Admin</span>
                  <span className="px-2.5 py-1 text-[10px] font-mono rounded-full bg-gray-100 text-gray-500">System</span>
                </div>
              </div>

              {allUsers.map(u => (
                <div key={u.id} className={`flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors ${flashId === u.email ? "bg-emerald-50" : ""}`}>
                  <div className="flex items-center gap-4">
                    <div className="w-9 h-9 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0">
                      <span className="font-headline font-bold text-xs text-gray-500">{u.name[0]}</span>
                    </div>
                    <div>
                      <p className="font-sans font-medium text-sm text-charcoal">{u.name}</p>
                      <p className="font-mono text-[10px] text-gray-400">{u.email || "No email"} · <span className="capitalize">{u.type}</span></p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap justify-end">
                    <span className={`px-2.5 py-1 text-[10px] font-mono rounded-full capitalize ${ROLE_BADGE[u.role as Role] ?? ROLE_BADGE.client}`}>
                      {u.role}
                    </span>
                    {u.email && (
                      <select
                        value={u.role}
                        onChange={e => handleAssignRole(u.email, e.target.value as Role)}
                        className="px-2.5 py-1.5 text-xs font-sans border border-gray-200 rounded-xl bg-white text-gray-500 focus:outline-none focus:border-charcoal/30 cursor-pointer">
                        {ROLES.map(r => (
                          <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                        ))}
                      </select>
                    )}
                    {flashId === u.email && <span className="text-emerald-500 text-[10px] font-mono">✓ Saved</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
