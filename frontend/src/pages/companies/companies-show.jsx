import LoadingContent from "@/components/Loading";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import { useGetCompanyQuery } from "@/store/api/companies/companiesApiSlice";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

const CompanyShow = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data: company, isLoading, isError, error } = useGetCompanyQuery(id);

    if (isLoading) {
        return <LoadingContent />;
    }

    if (isError) {
        toast.error(error?.data?.message || "Failed to load company details");
        return (
            <Card>
                <div className="flex flex-col items-center justify-center h-60">
                    <Icon
                        icon="heroicons-outline:exclamation-circle"
                        className="text-danger-500 text-4xl mb-2"
                    />
                    <h3 className="text-xl font-medium text-slate-900">
                        Error Loading Data
                    </h3>
                    <p className="text-sm text-slate-600 mt-1 mb-4">
                        {error?.data?.message ||
                            "Could not load company information"}
                    </p>
                    <Button
                        text="Back to Companies"
                        icon="heroicons-outline:arrow-left"
                        className="btn-primary"
                        onClick={() => navigate("/admin/companies")}
                    />
                </div>
            </Card>
        );
    }

    return (
        <div className="space-y-5">
            {/* Header and action buttons */}
            <div className="flex flex-wrap justify-between items-center">
                <h4 className="font-medium lg:text-2xl text-xl capitalize text-slate-900 inline-block ltr:pr-4 rtl:pl-4">
                    Company Details
                </h4>
                <div className="flex space-x-4 rtl:space-x-reverse">
                    <Button
                        icon="heroicons-outline:arrow-left"
                        text="Back"
                        className="btn-outline-dark"
                        onClick={() => navigate("/admin/companies")}
                    />
                    <Link to={`/admin/companies/${id}/edit`}>
                        <Button
                            icon="heroicons:pencil-square"
                            text="Edit"
                            className="btn-dark"
                        />
                    </Link>
                </div>
            </div>
            {/* Company Details */}
            <Card title={`${company.name} Details`}>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                    {/* Logo Column */}
                    <div className="flex flex-col items-center justify-start">
                        <div className="w-40 h-40 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
                            {company.logo ? (
                                <img
                                    src={`${import.meta.env.VITE_API_URL}/${
                                        company.logo
                                    }`}
                                    alt={`${company.name} Logo`}
                                    className="max-h-full max-w-full object-contain"
                                />
                            ) : (
                                <Icon
                                    icon="heroicons-outline:office-building"
                                    className="text-5xl text-slate-400"
                                />
                            )}
                        </div>
                    </div>

                    {/* Details Column */}
                    <div className="col-span-4">
                        <h3 className="text-xl font-medium text-slate-900 mb-4">
                            {company.name}
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <p className="text-sm text-slate-500">Email</p>
                                <p className="text-base">
                                    {company.email || "—"}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-slate-500">Phone</p>
                                <p className="text-base">
                                    {company.phone || "—"}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-slate-500">
                                    Website
                                </p>
                                {company.website ? (
                                    <a
                                        href={company.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary-500 hover:underline"
                                    >
                                        {company.website}
                                    </a>
                                ) : (
                                    <p className="text-base">—</p>
                                )}
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <p className="text-sm text-slate-500">
                                    Address Line 1
                                </p>
                                <p className="text-base">
                                    {company.address_line_1 || "—"}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-slate-500">
                                    Address Line 2
                                </p>
                                <p className="text-base">
                                    {company.address_line_2 || "—"}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-slate-500">City</p>
                                <p className="text-base">
                                    {company.city || "—"}
                                </p>
                            </div>
                            <div className="space-y-1"></div>
                            <p className="text-sm text-slate-500">State</p>
                            <p className="text-base">{company.state || "—"}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm text-slate-500">
                                Postal Code
                            </p>
                            <p className="text-base">
                                {company.postal_code || "—"}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm text-slate-500">Country</p>
                            <p className="text-base">
                                {company.country || "—"}
                            </p>
                        </div>
                    </div>
                </div>
            </Card>

            <Card title="Plan Information">
                {company.plan ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        <div className="space-y-2">
                            <div className="text-sm text-slate-400">
                                Plan Name
                            </div>
                            <div className="font-medium text-slate-900">
                                {company.plan.plan_name || "—"}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="text-sm text-slate-400">Price</div>
                            <div className="font-medium text-slate-900">
                                ${company.plan.plan_price || "0"}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="text-sm text-slate-400">Status</div>
                            <div className="font-medium">
                                <span
                                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                                        company.plan.plan_status === "active"
                                            ? "bg-success-500 text-white"
                                            : company.plan.plan_status ===
                                              "trial"
                                            ? "bg-warning-500 text-white"
                                            : "bg-danger-500 text-white"
                                    }`}
                                >
                                    {company.plan.plan_status || "Inactive"}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="text-sm text-slate-400">
                                Start Date
                            </div>
                            <div className="font-medium text-slate-900">
                                {company.plan.plan_start_date
                                    ? new Date(
                                          company.plan.plan_start_date
                                      ).toLocaleDateString()
                                    : "—"}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="text-sm text-slate-400">
                                Expiry Date
                            </div>
                            <div className="font-medium text-slate-900">
                                {company.plan.plan_expiry_date
                                    ? new Date(
                                          company.plan.plan_expiry_date
                                      ).toLocaleDateString()
                                    : "—"}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-20">
                        <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-slate-200 text-slate-600">
                            No Plan Information
                        </span>
                    </div>
                )}
            </Card>
            {/* Company Users */}
            <Card title="Company Users">
                {company.users && company.users.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-100 table-fixed dark:divide-slate-700">
                            <thead>
                                <tr>
                                    <th className="table-th">Email</th>
                                    <th className="table-th">Role</th>
                                    <th className="table-th">Created</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-100 dark:bg-slate-800 dark:divide-slate-700">
                                {company.users.map((user) => (
                                    <tr key={user.id}>
                                        <td className="table-td">
                                            {user.email}
                                        </td>
                                        <td className="table-td">
                                            <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-primary-500 text-white">
                                                {user.role?.name || "User"}
                                            </span>
                                        </td>
                                        <td className="table-td">
                                            {new Date(
                                                user.created_at
                                            ).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-20">
                        <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-slate-200 text-slate-600">
                            No Users Found
                        </span>
                    </div>
                )}
            </Card>
            {/* Action buttons at the bottom */}
            <div className="flex justify-between">
                <Button
                    icon="heroicons-outline:arrow-left"
                    text="Back to Companies"
                    className="btn-outline-dark"
                    onClick={() => navigate("/admin/companies")}
                />
                <Link to={`/admin/companies/${id}/edit`}>
                    <Button
                        icon="heroicons:pencil-square"
                        text="Edit Company"
                        className="btn-dark"
                    />
                </Link>
            </div>
        </div>
    );
};

export default CompanyShow;
