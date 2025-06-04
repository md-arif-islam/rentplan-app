import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import { useGetAdminDashboardStatsQuery } from "@/store/api/dashboard/dashboardApiSlice";
import { Link } from "react-router-dom";

const AdminDashboard = () => {
    const {
        data: dashboardData,
        isLoading,
        isError,
        error,
    } = useGetAdminDashboardStatsQuery();

    if (isLoading) {
        return (
            <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {[1, 2, 3, 4].map((i) => (
                        <Card key={i}>
                            <div className="h-24 animate-pulse bg-slate-200 dark:bg-slate-700 rounded"></div>
                        </Card>
                    ))}
                </div>
                <Card>
                    <div className="h-[335px] animate-pulse bg-slate-200 dark:bg-slate-700 rounded"></div>
                </Card>
            </div>
        );
    }

    if (isError) {
        return (
            <Card>
                <div className="flex flex-col items-center justify-center h-60">
                    <Icon
                        icon="heroicons-outline:exclamation-circle"
                        className="text-danger-500 text-4xl mb-2"
                    />
                    <h3 className="text-xl font-medium text-slate-900">
                        Error Loading Dashboard Data
                    </h3>
                    <p className="text-sm text-slate-600 mt-1 mb-4">
                        {error?.data?.message ||
                            "Could not load dashboard information"}
                    </p>
                </div>
            </Card>
        );
    }

    // Extract data from the API response
    const stats = dashboardData?.stats || {
        totalCompanies: 0,
        activeCompanies: 0,
        trialCompanies: 0,
        inactiveCompanies: 0,
        totalUsers: 0,
        recentLogins: 0,
        totalRevenue: 0,
        monthlyRevenue: 0,
    };

    const companyTrends = dashboardData?.companyTrends || [];
    const recentActivity = dashboardData?.recentActivity || [];
    const upcomingExpiries = dashboardData?.upcomingExpiries || [];

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
                            <span className="text-sm text-slate-500">
                                <Link
                                    to="/admin/companies"
                                    className="text-primary-500 hover:underline"
                                >
                                    View all companies
                                </Link>
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

            {/* Company Growth Chart */}
            <Card title="Company Growth (Last 12 Months)">
                <div className="h-[335px] flex flex-col items-center justify-center">
                    <div className="grid grid-cols-12 w-full h-48 items-end gap-1 mb-4 px-4">
                        {companyTrends.map((item, index) => (
                            <div
                                key={index}
                                className="relative flex flex-col items-center justify-center h-full"
                            >
                                <div
                                    className="bg-primary-500 w-full rounded-t-md"
                                    style={{
                                        height: `${
                                            item.count
                                                ? Math.max(
                                                      20,
                                                      (item.count /
                                                          Math.max(
                                                              ...companyTrends.map(
                                                                  (i) => i.count
                                                              )
                                                          )) *
                                                          100
                                                  )
                                                : 2
                                        }%`,
                                    }}
                                ></div>
                                <span className="absolute -bottom-6 text-[10px] text-slate-600 rotate-45 origin-top-left">
                                    {item.month}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </Card>

            {/* Recent Activity and Upcoming Plan Expirations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <Card title="Recent Activity">
                    {recentActivity.length > 0 ? (
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
                                                    : activity.type ===
                                                      "company"
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
                    ) : (
                        <div className="text-center py-5">
                            <Icon
                                icon="heroicons-outline:clock"
                                className="text-3xl text-slate-300 mx-auto"
                            />
                            <p className="text-sm text-slate-500 mt-2">
                                No recent activity
                            </p>
                        </div>
                    )}
                </Card>

                <Card title="Upcoming Plan Expirations">
                    {upcomingExpiries.length > 0 ? (
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
                                            Status
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
                                                <Link
                                                    to={`/admin/companies/${item.id}`}
                                                    className="text-primary-500 hover:underline"
                                                >
                                                    {item.name}
                                                </Link>
                                            </td>
                                            <td className="px-4 py-3">
                                                {item.plan}
                                            </td>
                                            <td className="px-4 py-3">
                                                {item.expiry_date}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                                                        item.days_left < 7
                                                            ? "bg-danger-500 text-white"
                                                            : item.days_left <
                                                              15
                                                            ? "bg-warning-500 text-white"
                                                            : "bg-info-500 text-white"
                                                    }`}
                                                >
                                                    {Math.floor(item.days_left)}{" "}
                                                    days left
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-5">
                            <Icon
                                icon="heroicons-outline:check-circle"
                                className="text-3xl text-success-500 mx-auto"
                            />
                            <p className="text-sm text-slate-500 mt-2">
                                No upcoming expirations
                            </p>
                        </div>
                    )}
                </Card>
            </div>

            {/* Quick Actions */}
            <Card title="Quick Actions">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    <Link to="/admin/companies/create" className="block">
                        <div className="p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition duration-150 text-center">
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
                    </Link>

                    <Link to="/admin/companies" className="block">
                        <div className="p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition duration-150 text-center">
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
                    </Link>

                    <div className="p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition duration-150 text-center">
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

                    <div className="p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition duration-150 text-center">
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
