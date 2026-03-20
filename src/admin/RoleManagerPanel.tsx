import { useState } from "react";
import { ShieldCheck, Plus, Trash, PencilSimple, Check, X, Users, Key } from "@phosphor-icons/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ROLE_PERMISSIONS, Permission, Role } from "@/contexts/AuthContext";

const ALL_PERMISSIONS: { key: Permission; label: string; group: string }[] = [
  { key: "view",               label: "View",                group: "Basic" },
  { key: "edit",               label: "Edit",                group: "Basic" },
  { key: "create",             label: "Create",              group: "Basic" },
  { key: "delete",             label: "Delete",              group: "Basic" },
  { key: "approve",            label: "Approve",             group: "Actions" },
  { key: "manage_billing",     label: "Manage Billing",      group: "Modules" },
  { key: "manage_projects",    label: "Manage Projects",     group: "Modules" },
  { key: "manage_employees",   label: "Manage Employees",    group: "Modules" },
  { key: "manage_clients",     label: "Manage Clients",      group: "Modules" },
  { key: "manage_leads",       label: "Manage Leads",        group: "Modules" },
  { key: "manage_analytics",   label: "Manage Analytics",    group: "Modules" },
  { key: "manage_3d_assets",   label: "Manage 3D Assets",    group: "Modules" },
  { key: "manage_appearance",  label: "Manage Appearance",   group: "Modules" },
  { key: "manage_settings",    label: "Manage Settings",     group: "System" },
  { key: "manage_roles",       label: "Manage Roles",        group: "System" },
  { key: "manage_users",       label: "Manage Users",        group: "System" },
];

const PERM_GROUPS = ["Basic", "Actions", "Modules", "System"];

const ROLE_COLORS: Record<string, string> = {
  admin:      "bg-gold/20 text-gold border-gold/30",
  manager:    "bg-blue-100 text-blue-700 border-blue-200",
  employee:   "bg-purple-100 text-purple-700 border-purple-200",
  accountant: "bg-emerald-100 text-emerald-700 border-emerald-200",
  client:     "bg-gray-100 text-gray-600 border-gray-200",
};

type RoleEntry = { id: string; name: string; permissions: Permission[]; isBuiltIn: boolean };

const DEFAULT_ROLES: RoleEntry[] = (Object.entries(ROLE_PERMISSIONS) as [Role, Permission[]][]).map(([name, permissions]) => ({
  id: name,
  name: name.charAt(0).toUpperCase() + name.slice(1),
  permissions,
  isBuiltIn: true,
}));

export default function RoleManagerPanel() {
  const [roles, setRoles] = useState<RoleEntry[]>(DEFAULT_ROLES);
  const [selectedRole, setSelectedRole] = useState<RoleEntry>(DEFAULT_ROLES[0]);
  const [editMode, setEditMode] = useState(false);
  const [draftPerms, setDraftPerms] = useState<Permission[]>([]);
  const [newRoleName, setNewRoleName] = useState("");
  const [showNewRole, setShowNewRole] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  const startEdit = (r: RoleEntry) => {
    setSelectedRole(r);
    setDraftPerms([...r.permissions]);
    setEditMode(true);
  };

  const cancelEdit = () => {
    setEditMode(false);
    setDraftPerms([]);
  };

  const saveEdit = () => {
    setRoles(prev => prev.map(r => r.id === selectedRole.id ? { ...r, permissions: draftPerms } : r));
    setSelectedRole(prev => ({ ...prev, permissions: draftPerms }));
    setEditMode(false);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2000);
  };

  const togglePerm = (p: Permission) => {
    setDraftPerms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  };

  const createRole = () => {
    if (!newRoleName.trim()) return;
    const id = newRoleName.toLowerCase().replace(/\s+/g, "_");
    const entry: RoleEntry = { id, name: newRoleName.trim(), permissions: ["view"], isBuiltIn: false };
    setRoles(prev => [...prev, entry]);
    setNewRoleName("");
    setShowNewRole(false);
    setSelectedRole(entry);
    setDraftPerms(["view"]);
    setEditMode(true);
  };

  const deleteRole = (id: string) => {
    setRoles(prev => prev.filter(r => r.id !== id));
    if (selectedRole.id === id) setSelectedRole(DEFAULT_ROLES[0]);
  };

  const displayRole = editMode ? { ...selectedRole, permissions: draftPerms } : selectedRole;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-headline font-bold text-2xl text-charcoal">Role Manager</h1>
          <p className="font-sans text-sm text-gray-500 mt-1">Create, edit, and assign permissions to every role in the system.</p>
        </div>
        <button onClick={() => setShowNewRole(p => !p)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-sans font-semibold bg-charcoal text-white rounded-xl hover:bg-gray-800 transition-all cursor-pointer">
          <Plus size={13} weight="bold" /> New Role
        </button>
      </div>

      {showNewRole && (
        <div className="mb-5 flex gap-2 p-4 bg-white border border-gray-200 rounded-2xl shadow-sm">
          <input type="text" value={newRoleName} onChange={e => setNewRoleName(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") createRole(); if (e.key === "Escape") setShowNewRole(false); }}
            placeholder="New role name…"
            className="flex-1 px-3 py-2 text-sm font-sans border border-gray-200 rounded-xl focus:outline-none focus:border-charcoal/30" />
          <button onClick={createRole} className="px-4 py-2 bg-gold text-charcoal text-xs font-semibold rounded-xl hover:bg-gold-dark cursor-pointer transition-colors">Create</button>
          <button onClick={() => setShowNewRole(false)} className="px-3 py-2 bg-gray-100 text-gray-500 text-xs rounded-xl hover:bg-gray-200 cursor-pointer transition-colors"><X size={13} /></button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Role list */}
        <div className="flex flex-col gap-2">
          {roles.map(r => (
            <button key={r.id} onClick={() => { setSelectedRole(r); setEditMode(false); }}
              className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl border-2 transition-all cursor-pointer text-left ${selectedRole.id === r.id ? "border-charcoal bg-charcoal text-white" : "border-gray-200 bg-white hover:border-gray-300 text-charcoal"}`}>
              <div className="flex items-center gap-3">
                <ShieldCheck size={16} weight={selectedRole.id === r.id ? "fill" : "regular"} className={selectedRole.id === r.id ? "text-gold" : "text-gray-400"} />
                <div>
                  <p className="font-sans text-sm font-medium">{r.name}</p>
                  <p className={`font-mono text-[10px] ${selectedRole.id === r.id ? "text-gray-400" : "text-gray-400"}`}>{r.permissions.length} permissions</p>
                </div>
              </div>
              {!r.isBuiltIn && (
                <button onClick={e => { e.stopPropagation(); deleteRole(r.id); }}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${selectedRole.id === r.id ? "hover:bg-red-800 text-gray-400 hover:text-white" : "hover:bg-red-100 text-gray-300 hover:text-red-500"}`}>
                  <Trash size={12} weight="regular" />
                </button>
              )}
            </button>
          ))}
        </div>

        {/* Permission editor */}
        <div className="lg:col-span-2">
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader className="border-b border-gray-100 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`px-3 py-1 rounded-full border text-xs font-mono ${ROLE_COLORS[selectedRole.id] ?? "bg-gray-100 text-gray-600 border-gray-200"}`}>
                    {selectedRole.name}
                  </div>
                  {savedFlash && <span className="flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-600 text-xs font-mono rounded-full"><Check size={10} weight="bold" /> Saved</span>}
                </div>
                <div className="flex items-center gap-2">
                  {editMode ? (
                    <>
                      <button onClick={cancelEdit} className="px-3 py-1.5 text-xs text-gray-500 border border-gray-200 rounded-xl hover:border-gray-400 cursor-pointer transition-colors flex items-center gap-1"><X size={11} /> Cancel</button>
                      <button onClick={saveEdit} className="px-3 py-1.5 text-xs bg-gold text-charcoal font-semibold rounded-xl hover:bg-gold-dark cursor-pointer transition-colors flex items-center gap-1"><Check size={11} weight="bold" /> Save Changes</button>
                    </>
                  ) : (
                    <button onClick={() => startEdit(selectedRole)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-500 border border-gray-200 rounded-xl hover:border-charcoal hover:text-charcoal cursor-pointer transition-colors">
                      <PencilSimple size={12} /> Edit Permissions
                    </button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-5">
              <div className="flex flex-col gap-5">
                {PERM_GROUPS.map(group => {
                  const groupPerms = ALL_PERMISSIONS.filter(p => p.group === group);
                  return (
                    <div key={group}>
                      <p className="font-mono text-[10px] uppercase tracking-widest text-gray-400 mb-2.5">{group}</p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {groupPerms.map(({ key, label }) => {
                          const active = displayRole.permissions.includes(key);
                          return (
                            <button key={key}
                              onClick={() => editMode && togglePerm(key)}
                              disabled={!editMode}
                              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-sans transition-all ${active ? "bg-charcoal/5 border-charcoal/20 text-charcoal" : "bg-gray-50 border-gray-100 text-gray-400"} ${editMode ? "cursor-pointer hover:border-charcoal/40" : "cursor-default"}`}>
                              <div className={`w-4 h-4 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${active ? "bg-charcoal border-charcoal" : "border-gray-300"}`}>
                                {active && <Check size={9} weight="bold" className="text-white" />}
                              </div>
                              {label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* User Role Assignment section */}
      <div className="mt-8">
        <h2 className="font-headline font-bold text-lg text-charcoal mb-1">Role Assignment Guide</h2>
        <p className="font-sans text-sm text-gray-500 mb-4">Roles are automatically detected. The admin email always receives admin access. Other users default to Client role unless manually assigned.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center">
                  <Key size={14} weight="regular" className="text-gold" />
                </div>
                <p className="font-headline font-semibold text-sm text-charcoal">Auto-Assigned Roles</p>
              </div>
              <div className="flex flex-col gap-2 text-xs font-sans text-gray-500">
                <div className="flex items-center gap-2"><span className="px-2 py-0.5 bg-gold/10 text-gold font-mono rounded-full text-[10px]">Admin</span> silviolmonzon@amenagementmonzon.com</div>
                <div className="flex items-center gap-2"><span className="px-2 py-0.5 bg-gray-100 text-gray-600 font-mono rounded-full text-[10px]">Client</span> All other authenticated users</div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                  <Users size={14} weight="regular" className="text-blue-500" />
                </div>
                <p className="font-headline font-semibold text-sm text-charcoal">Manual Role Override</p>
              </div>
              <p className="text-xs font-sans text-gray-500 leading-relaxed">To assign a staff role (Manager, Employee, Accountant) to a user, their role is stored per-session. This can be wired to a full DB-backed user management system in production.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
