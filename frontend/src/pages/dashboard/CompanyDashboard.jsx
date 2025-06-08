import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import { useGetCompanyDashboardStatsQuery } from "@/store/api/dashboard/dashboardApiSlice";
import { Link } from "react-router-dom";

const CompanyDashboard = () => {
    const {
        data: dashboardData,
        isLoading,
        isError,
        error,
    } = useGetCompanyDashboardStatsQuery();

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
    const company = dashboardData?.company || {
        name: "Your Company",
        plan: "No Plan",
        planStatus: "inactive",
        planExpiry: "N/A",
        daysLeft: 0,
    };

    const stats = dashboardData?.stats || {
        totalUsers: 0,
        totalCustomers: 0,
        totalProducts: 0,
        totalOrders: 0,
        activeRentals: 0,
    };

    const orderTrends = dashboardData?.orderTrends || [];
    const recentActivity = dashboardData?.recentActivity || [];
    const upcomingReturns = dashboardData?.upcomingReturns || [];

    return (
        <div className="space-y-5">
            {/* Plan Status */}
            <Card>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
                    <div>
                        <h2 className="text-xl font-medium text-slate-900">
                            Welcome to {company.name}
                        </h2>
                        <div className="mt-2 text-slate-500">
                            Your current plan:{" "}
                            <span className="font-medium">{company.plan}</span>
                        </div>
                    </div>
                    <div className="mt-4 md:mt-0 flex items-center">
                        <span
                            className={`inline-block rounded-full px-3 py-1 text-sm font-medium text-white mr-3 ${
                                company.planStatus === "active"
                                    ? "bg-success-500"
                                    : company.planStatus === "trial"
                                    ? "bg-warning-500"
                                    : "bg-danger-500"
                            }`}
                        >
                            {company.planStatus.toUpperCase()}
                        </span>
                        {company.daysLeft > 0 && (
                            <span
                                className={`inline-block rounded-full px-3 py-1 text-sm font-medium text-white ${
                                    company.daysLeft < 7
                                        ? "bg-danger-500"
                                        : company.daysLeft < 15
                                        ? "bg-warning-500"
                                        : "bg-success-500"
                                }`}
                            >
                                {company.daysLeft} days left
                            </span>
                        )}
                    </div>
                </div>
                {company.planStatus === "active" && (
                    <div className="mt-4 text-sm text-slate-500">
                        Plan expiry: {company.planExpiry}
                    </div>
                )}
            </Card>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <Card>
                    <div className="space-y-1">
                        <div className="flex items-center justify-between">
                            <div className="text-slate-500">Customers</div>
                            <div className="bg-primary-500/10 text-primary-500 rounded-full p-2">
                                <Icon icon="heroicons-outline:users" />
                            </div>
                        </div>
                        <div className="text-2xl font-medium text-slate-900">
                            {stats.totalCustomers}
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="text-sm text-slate-500">
                                <Link
                                    to="/company/customers"
                                    className="text-primary-500 hover:underline"
                                >
                                    Manage customers
                                </Link>
                            </span>
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="space-y-1">
                        <div className="flex items-center justify-between">
                            <div className="text-slate-500">Products</div>
                            <div className="bg-success-500/10 text-success-500 rounded-full p-2">
                                <Icon icon="heroicons-outline:cube" />
                            </div>
                        </div>
                        <div className="text-2xl font-medium text-slate-900">
                            {stats.totalProducts}
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="text-sm text-slate-500">
                                <Link
                                    to="/company/products"
                                    className="text-success-500 hover:underline"
                                >
                                    Manage products
                                </Link>
                            </span>
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="space-y-1">
                        <div className="flex items-center justify-between">
                            <div className="text-slate-500">Orders</div>
                            <div className="bg-info-500/10 text-info-500 rounded-full p-2">
                                <Icon icon="heroicons-outline:shopping-cart" />
                            </div>
                        </div>
                        <div className="text-2xl font-medium text-slate-900">
                            {stats.totalOrders}
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="text-sm text-slate-500">
                                <Link
                                    to="/company/orders"
                                    className="text-info-500 hover:underline"
                                >
                                    View all orders
                                </Link>
                            </span>
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="space-y-1">
                        <div className="flex items-center justify-between">
                            <div className="text-slate-500">Active Rentals</div>
                            <div className="bg-warning-500/10 text-warning-500 rounded-full p-2">
                                <Icon icon="heroicons-outline:clipboard-check" />
                            </div>
                        </div>
                        <div className="text-2xl font-medium text-slate-900">
                            {stats.activeRentals}
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="text-sm text-warning-500">
                                <span className="flex items-center gap-1">
                                    <Icon
                                        icon="heroicons-solid:clock"
                                        className="text-sm"
                                    />
                                    Currently rented
                                </span>
                            </span>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Order Trends Chart */}
            <Card title="Order Trends (Last 6 Months)">
                <div className="h-[335px] flex flex-col items-center justify-center">
                    <div className="grid grid-cols-12 w-full h-48 items-end gap-1 mb-4 px-4">
                        {orderTrends.map((item, index) => (
                            <div
                                key={index}
                                className="relative flex flex-col items-center justify-center h-full col-span-2"
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
                                                              ...orderTrends.map(
                                                                  (i) => i.count
                                                              ),
                                                              1
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

            {/* Recent Activity and Upcoming Returns */}
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
                                                activity.type === "order"
                                                    ? "bg-info-500/10"
                                                    : activity.type ===
                                                      "customer"
                                                    ? "bg-primary-500/10"
                                                    : "bg-success-500/10"
                                            }`}
                                        >
                                            <Icon
                                                icon={
                                                    activity.type === "order"
                                                        ? "heroicons-outline:shopping-cart"
                                                        : activity.type ===
                                                          "customer"
                                                        ? "heroicons-outline:users"
                                                        : "heroicons-outline:cube"
                                                }
                                                className={`text-lg ${
                                                    activity.type === "order"
                                                        ? "text-info-500"
                                                        : activity.type ===
                                                          "customer"
                                                        ? "text-primary-500"
                                                        : "text-success-500"
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

                <Card title="Upcoming Returns">
                    {upcomingReturns.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-slate-700">
                                        <th className="px-4 py-3 text-slate-500">
                                            Customer
                                        </th>
                                        <th className="px-4 py-3 text-slate-500">
                                            Product
                                        </th>
                                        <th className="px-4 py-3 text-slate-500">
                                            End Date
                                        </th>
                                        <th className="px-4 py-3 text-slate-500">
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {upcomingReturns.map((item, index) => (
                                        <tr
                                            key={index}
                                            className="border-b border-slate-100"
                                        >
                                            <td className="px-4 py-3">
                                                <Link
                                                    to={`/company/orders/${item.id}`}
                                                    className="text-primary-500 hover:underline"
                                                >
                                                    {item.customer_name}
                                                </Link>
                                            </td>
                                            <td className="px-4 py-3">
                                                {item.product_name}
                                            </td>
                                            <td className="px-4 py-3">
                                                {item.end_date}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className={`inline-block rounded-full px-2 py-1 text-xs font-medium text-white ${
                                                        item.days_left < 3
                                                            ? "bg-danger-500"
                                                            : item.days_left < 7
                                                            ? "bg-warning-500"
                                                            : "bg-info-500"
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
                                No upcoming returns
                            </p>
                        </div>
                    )}
                </Card>
            </div>

            {/* Quick Actions */}
            <Card title="Quick Actions">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    <Link to="/company/customers/create" className="block">
                        <div className="p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition duration-150 text-center">
                            <div className="h-10 w-10 mx-auto bg-primary-500/10 text-primary-500 flex items-center justify-center rounded-full mb-3">
                                <Icon icon="heroicons-outline:user-add" />
                            </div>
                            <h5 className="font-medium text-slate-900">
                                Add Customer
                            </h5>
                            <p className="text-xs text-slate-500 mt-1">
                                Create a new customer record
                            </p>
                        </div>
                    </Link>

                    <Link to="/company/products/create" className="block">
                        <div className="p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition duration-150 text-center">
                            <div className="h-10 w-10 mx-auto bg-success-500/10 text-success-500 flex items-center justify-center rounded-full mb-3">
                                <Icon icon="heroicons-outline:plus-circle" />
                            </div>
                            <h5 className="font-medium text-slate-900">
                                Add Product
                            </h5>
                            <p className="text-xs text-slate-500 mt-1">
                                Add new rental product
                            </p>
                        </div>
                    </Link>

                    <Link to="/company/orders/create" className="block">
                        <div className="p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition duration-150 text-center">
                            <div className="h-10 w-10 mx-auto bg-warning-500/10 text-warning-500 flex items-center justify-center rounded-full mb-3">
                                <Icon icon="heroicons-outline:shopping-cart" />
                            </div>
                            <h5 className="font-medium text-slate-900">
                                New Order
                            </h5>
                            <p className="text-xs text-slate-500 mt-1">
                                Create a new rental order
                            </p>
                        </div>
                    </Link>

                    <Link to="/company/reports" className="block">
                        <div className="p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition duration-150 text-center">
                            <div className="h-10 w-10 mx-auto bg-info-500/10 text-info-500 flex items-center justify-center rounded-full mb-3">
                                <Icon icon="heroicons-outline:chart-bar" />
                            </div>
                            <h5 className="font-medium text-slate-900">
                                Reports
                            </h5>
                            <p className="text-xs text-slate-500 mt-1">
                                View detailed business reports
                            </p>
                        </div>
                    </Link>
                </div>
            </Card>
        </div>
    );
};

export default CompanyDashboard;
