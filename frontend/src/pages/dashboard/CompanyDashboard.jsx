import Card from "@/components/ui/Card";
import { useSelector } from "react-redux";

const CompanyDashboard = () => {
    const { user } = useSelector((state) => state.auth);

    return (
        <div>
            <Card title="Company Dashboard">
                <div className="text-lg font-medium">
                    Welcome to {user?.company?.name || "Company"} Dashboard
                </div>
                <p className="mt-4">
                    This is your company management dashboard with access to
                    your company's features.
                </p>
            </Card>
        </div>
    );
};

export default CompanyDashboard;
