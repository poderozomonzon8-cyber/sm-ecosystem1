import { Helmet } from "react-helmet-async";
import AdminShell from "@/components/AdminShell";

export default function AdminPage() {
  return (
    <>
      <Helmet>
        <title>Admin Panel – Aménagement Monzon</title>
      </Helmet>
      <AdminShell />
    </>
  );
}