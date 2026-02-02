import AdminLayout from "../../components/admin/AdminLayout";

export const metadata = {
    title: "Assal. - Admin",
    description: "Assal. - Admin",
};

export default function RootAdminLayout({ children }) {

    return (
        <>
            <AdminLayout>
                {children}
            </AdminLayout>
        </>
    );
}
