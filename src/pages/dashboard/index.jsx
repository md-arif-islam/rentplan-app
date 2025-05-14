import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import { useGetDashboardQuery } from "@/store/api/dashboard/dashboardApiSlice";
import HomeBredCurbs from "./HomeBredCurbs";

const Dashboard = () => {
    const { data: dashboardData, isLoading } = useGetDashboardQuery();

    // Create statistics array with dashboard data using current shapeLine design
    const statistics = [
        {
            title: "Total Breeders",
            count: dashboardData?.total_breeders,
            bg: "bg-info-500",
            text: "text-info-500",
            icon: "healthicons:agriculture-worker",
        },
        {
            title: "Total Customers",
            count: dashboardData?.total_customers,
            bg: "bg-red-500",
            text: "text-red-500",
            icon: "ix:customer",
        },
    ];

    return (
        <div>
            <HomeBredCurbs title="Dashboard" />
            <div className="grid grid-cols-12 gap-5 mb-5">
                <div className="lg:col-span-12 col-span-12">
                    <Card bodyClass="p-4">
                        <div className="grid lg:grid-cols-4 md:grid-cols-2 col-span-1 gap-4">
                            {isLoading
                                ? [...Array(2)].map((_, i) => (
                                      <div
                                          key={i}
                                          className="rounded-md p-4 bg-opacity-[0.15] dark:bg-opacity-50 animate-pulse"
                                      >
                                          <div className="flex items-center space-x-4">
                                              <div className="h-14 w-14 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                                              <div className="flex-1 space-y-2">
                                                  <div className="w-1/2 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                                  <div className="w-1/3 h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                              </div>
                                          </div>
                                      </div>
                                  ))
                                : statistics.map((item, i) => (
                                      <div
                                          key={i}
                                          className={`${item.bg} rounded-md p-4 bg-opacity-[0.15] dark:bg-opacity-50`}
                                      >
                                          <div className="flex items-center space-x-4">
                                              <div
                                                  className={`${item.text} h-14 w-14 flex flex-col items-center justify-center rounded-full bg-white text-2xl`}
                                              >
                                                  <Icon icon={item.icon} />
                                              </div>
                                              <div className="flex-1">
                                                  <span className="block text-sm text-slate-600 font-medium dark:text-white mb-1">
                                                      {item.title}
                                                  </span>
                                                  <span className="block text-2xl text-slate-900 dark:text-white font-medium">
                                                      {item.count}
                                                  </span>
                                              </div>
                                          </div>
                                      </div>
                                  ))}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
