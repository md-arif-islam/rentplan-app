import Card from "@/components/ui/Card";

const AdminDashboard = () => {
    return (
        <div>
            <Card title="Admin Dashboard">
                <div className="text-lg font-medium">
                    Welcome to Super Admin Dashboard
                </div>
                <p className="mt-4">
                    This is the platform administrator dashboard with full
                    access to all system features.
                </p>
            </Card>
        </div>
    );
};

export default AdminDashboard;
