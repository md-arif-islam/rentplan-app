import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";

const AdminDashboard = () => {
    // Static dashboard data
    const stats = {
        totalCompanies: 24,
        activeCompanies: 18,
        trialCompanies: 5,
        inactiveCompanies: 1,
        totalUsers: 124,
        recentLogins: 17,
        totalRevenue: 12750.5,
        monthlyRevenue: 2450.75,
    };

    // Static recent activity
    const recentActivity = [
        {
            type: "company",
            message: 'New company "Tech Solutions Inc." was created',
            timestamp: "5 minutes ago",
        },
        {
            type: "login",
            message: "admin@example.com logged in",
            timestamp: "10 minutes ago",
        },
        {
            type: "company",
            message: 'Company "Global Services Ltd." updated their plan',
            timestamp: "1 hour ago",
        },
        {
            type: "login",
            message: "john.doe@company.com logged in",
            timestamp: "3 hours ago",
        },
    ];

    // Static upcoming plan expirations
    const upcomingExpiries = [
        {
            id: 1,
            name: "ABC Rentals",
            plan: "Premium",
            expiry_date: "Dec 25, 2023",
            days_left: 2,
        },
        {
            id: 2,
            name: "XYZ Equipment",
            plan: "Standard",
            expiry_date: "Dec 28, 2023",
            days_left: 5,
        },
    ];

    return (
        <div className="space-y-5">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <Card>
                    <div className="space-y-1">
                        <div className="flex items-center justify-between">
                            <div className="text-slate-500">
                                Total Companies
                            </div>
                            <div className="bg-primary-500/10 text-primary-500 rounded-full p-2">
                                <Icon icon="heroicons-outline:office-building" />
                            </div>
                        </div>
                        <div className="text-2xl font-medium text-slate-900">
                            {stats.totalCompanies}
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="text-sm text-primary-500 hover:underline cursor-pointer">
                                View all companies
                            </span>
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="space-y-1">
                        <div className="flex items-center justify-between">
                            <div className="text-slate-500">Total Users</div>
                            <div className="bg-success-500/10 text-success-500 rounded-full p-2">
                                <Icon icon="heroicons-outline:user-group" />
                            </div>
                        </div>
                        <div className="text-2xl font-medium text-slate-900">
                            {stats.totalUsers}
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="text-sm text-success-500">
                                <span className="flex items-center gap-1">
                                    <Icon
                                        icon="heroicons-solid:login"
                                        className="text-sm"
                                    />
                                    {stats.recentLogins} recent logins
                                </span>
                            </div>
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="space-y-1">
                        <div className="flex items-center justify-between">
                            <div className="text-slate-500">Total Revenue</div>
                            <div className="bg-info-500/10 text-info-500 rounded-full p-2">
                                <Icon icon="heroicons-outline:currency-dollar" />
                            </div>
                        </div>
                        <div className="text-2xl font-medium text-slate-900">
                            $
                            {stats.totalRevenue.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="text-sm text-info-500">
                                <span className="flex items-center gap-1">
                                    <Icon
                                        icon="heroicons-solid:calendar"
                                        className="text-sm"
                                    />
                                    $
                                    {stats.monthlyRevenue.toLocaleString(
                                        undefined,
                                        {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        }
                                    )}{" "}
                                    this month
                                </span>
                            </div>
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="space-y-1">
                        <div className="flex items-center justify-between">
                            <div className="text-slate-500">Active Plans</div>
                            <div className="bg-warning-500/10 text-warning-500 rounded-full p-2">
                                <Icon icon="heroicons-outline:clipboard-check" />
                            </div>
                        </div>
                        <div className="text-2xl font-medium text-slate-900">
                            {stats.activeCompanies}
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="text-sm text-warning-500">
                                <span className="flex items-center gap-1">
                                    <Icon
                                        icon="heroicons-solid:clock"
                                        className="text-sm"
                                    />
                                    {stats.trialCompanies} trial accounts
                                </span>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Recent Activity and Upcoming Plan Expirations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <Card title="Recent Activity">
                    <ul className="space-y-4">
                        {recentActivity.map((activity, index) => (
                            <li
                                key={index}
                                className="border-b border-slate-100 pb-4 last:border-0 last:pb-0"
                            >
                                <div className="flex items-start">
                                    <div
                                        className={`h-9 w-9 rounded-full flex items-center justify-center mr-3 ${
                                            activity.type === "login"
                                                ? "bg-success-500/10"
                                                : activity.type === "company"
                                                ? "bg-primary-500/10"
                                                : "bg-warning-500/10"
                                        }`}
                                    >
                                        <Icon
                                            icon={
                                                activity.type === "login"
                                                    ? "heroicons-outline:login"
                                                    : activity.type ===
                                                      "company"
                                                    ? "heroicons-outline:office-building"
                                                    : "heroicons-outline:user"
                                            }
                                            className={`text-lg ${
                                                activity.type === "login"
                                                    ? "text-success-500"
                                                    : activity.type ===
                                                      "company"
                                                    ? "text-primary-500"
                                                    : "text-warning-500"
                                            }`}
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <h6 className="text-sm font-medium text-slate-900">
                                            {activity.message}
                                        </h6>
                                        <div className="text-xs text-slate-500 mt-1">
                                            {activity.timestamp}
                                        </div>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </Card>

                <Card title="Upcoming Plan Expirations">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-700">
                                    <th className="px-4 py-3 text-slate-500">
                                        Company
                                    </th>
                                    <th className="px-4 py-3 text-slate-500">
                                        Plan
                                    </th>
                                    <th className="px-4 py-3 text-slate-500">
                                        Expires
                                    </th>
                                    <th className="px-4 py-3 text-slate-500">
                                        Days Left
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {upcomingExpiries.map((item, index) => (
                                    <tr
                                        key={index}
                                        className="border-b border-slate-100"
                                    >
                                        <td className="px-4 py-3">
                                            <span className="text-primary-500 hover:underline cursor-pointer">
                                                {item.name}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            {item.plan}
                                        </td>
                                        <td className="px-4 py-3">
                                            {item.expiry_date}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`inline-block rounded-full px-2 py-1 text-xs font-medium
                                                ${
                                                    item.days_left < 3
                                                        ? "bg-danger-500 text-white"
                                                        : item.days_left < 7
                                                        ? "bg-warning-500 text-white"
                                                        : "bg-info-500 text-white"
                                                }`}
                                            >
                                                {item.days_left} days left
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>

            {/* Quick Actions */}
            <Card title="Quick Actions">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    <div className="p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition duration-150 text-center cursor-pointer">
                        <div className="h-10 w-10 mx-auto bg-primary-500/10 text-primary-500 flex items-center justify-center rounded-full mb-3">
                            <Icon icon="heroicons-outline:plus" />
                        </div>
                        <h5 className="font-medium text-slate-900">
                            Add Company
                        </h5>
                        <p className="text-xs text-slate-500 mt-1">
                            Create a new company account
                        </p>
                    </div>

                    <div className="p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition duration-150 text-center cursor-pointer">
                        <div className="h-10 w-10 mx-auto bg-success-500/10 text-success-500 flex items-center justify-center rounded-full mb-3">
                            <Icon icon="heroicons-outline:office-building" />
                        </div>
                        <h5 className="font-medium text-slate-900">
                            Manage Companies
                        </h5>
                        <p className="text-xs text-slate-500 mt-1">
                            View and edit company details
                        </p>
                    </div>

                    <div className="p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition duration-150 text-center cursor-pointer">
                        <div className="h-10 w-10 mx-auto bg-warning-500/10 text-warning-500 flex items-center justify-center rounded-full mb-3">
                            <Icon icon="heroicons-outline:chart-bar" />
                        </div>
                        <h5 className="font-medium text-slate-900">
                            Analytics
                        </h5>
                        <p className="text-xs text-slate-500 mt-1">
                            View detailed platform analytics
                        </p>
                    </div>

                    <div className="p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition duration-150 text-center cursor-pointer">
                        <div className="h-10 w-10 mx-auto bg-info-500/10 text-info-500 flex items-center justify-center rounded-full mb-3">
                            <Icon icon="heroicons-outline:cog" />
                        </div>
                        <h5 className="font-medium text-slate-900">Settings</h5>
                        <p className="text-xs text-slate-500 mt-1">
                            Configure platform settings
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default AdminDashboard;
