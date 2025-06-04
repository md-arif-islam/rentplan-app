import LoadingContent from "@/components/Loading";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import { useGetProductQuery } from "@/store/api/products/productsApiSlice";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

const ProductShow = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data: product, isLoading, isError, error } = useGetProductQuery(id);

    // Format price with currency
    const formatPrice = (price) => {
        if (!price) return "—";
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(price);
    };

    if (isLoading) {
        return <LoadingContent />;
    }

    if (isError) {
        toast.error(error?.data?.message || "Failed to load product details");
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
                            "Could not load product information"}
                    </p>
                    <Button
                        text="Back to Products"
                        icon="heroicons-outline:arrow-left"
                        className="btn-primary"
                        onClick={() => navigate("/company/products")}
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
                    Product Details
                </h4>
                <div className="flex space-x-4 rtl:space-x-reverse">
                    <Button
                        icon="heroicons-outline:arrow-left"
                        text="Back"
                        className="btn-outline-dark"
                        onClick={() => navigate("/company/products")}
                    />
                    <Button
                        icon="heroicons:pencil-square"
                        text="Edit"
                        className="btn-dark"
                        onClick={() => navigate(`/company/products/${id}/edit`)}
                    />
                </div>
            </div>

            {/* Product Details */}
            <Card title="Product Information">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                    {/* Image Column */}
                    <div className="flex flex-col items-center justify-start">
                        <div className="w-full h-auto rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
                            {product.image_url ? (
                                <img
                                    src={`${import.meta.env.VITE_API_URL}/${
                                        product.image_url
                                    }`}
                                    alt={product.name}
                                    className="max-w-full h-auto object-contain"
                                />
                            ) : (
                                <Icon
                                    icon="heroicons-outline:photograph"
                                    className="text-5xl text-slate-400"
                                />
                            )}
                        </div>
                    </div>

                    {/* Details Column */}
                    <div className="col-span-4">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-medium text-slate-900">
                                {product.name}
                            </h3>
                            <Badge
                                label={
                                    product.type === 0
                                        ? "Simple Product"
                                        : "Variable Product"
                                }
                                className={
                                    product.type === 0
                                        ? "bg-success-500"
                                        : "bg-info-500"
                                }
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            {product.type === 0 && (
                                <>
                                    <div className="space-y-1">
                                        <p className="text-sm text-slate-500">
                                            Price
                                        </p>
                                        <p className="text-lg font-semibold">
                                            {formatPrice(product.price)}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm text-slate-500">
                                            Stock
                                        </p>
                                        <p className="text-base">
                                            {product.stock || 0}
                                        </p>
                                    </div>
                                </>
                            )}

                            {product.woocommerce_product_id && (
                                <div className="space-y-1">
                                    <p className="text-sm text-slate-500">
                                        WooCommerce ID
                                    </p>
                                    <p className="text-base">
                                        {product.woocommerce_product_id}
                                    </p>
                                </div>
                            )}
                        </div>

                        {product.specifications && (
                            <div className="mb-6">
                                <p className="text-sm text-slate-500 mb-1">
                                    Specifications
                                </p>
                                <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-md">
                                    <pre className="text-sm whitespace-pre-wrap">
                                        {typeof product.specifications ===
                                        "object"
                                            ? JSON.stringify(
                                                  product.specifications,
                                                  null,
                                                  2
                                              )
                                            : product.specifications}
                                    </pre>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </Card>

            {/* Product Variations */}
            {product.type === 1 &&
                product.variations &&
                product.variations.length > 0 && (
                    <Card title="Product Variations">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-100 table-fixed dark:divide-slate-700">
                                <thead className="bg-slate-200 dark:bg-slate-700">
                                    <tr>
                                        <th className="table-th">Image</th>
                                        <th className="table-th">Name</th>
                                        <th className="table-th">SKU</th>
                                        <th className="table-th">Price</th>
                                        <th className="table-th">Stock</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-100 dark:bg-slate-800 dark:divide-slate-700">
                                    {product.variations.map((variation) => (
                                        <tr key={variation.id}>
                                            <td className="table-td text-center">
                                                <div className="flex justify-center">
                                                    <div className="h-12 w-12 rounded overflow-hidden">
                                                        {variation.image_url ? (
                                                            <img
                                                                src={`${
                                                                    import.meta
                                                                        .env
                                                                        .VITE_API_URL
                                                                }/${
                                                                    variation.image_url
                                                                }`}
                                                                alt={
                                                                    variation.variant_name
                                                                }
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="flex items-center justify-center w-full h-full bg-slate-200 dark:bg-slate-700">
                                                                <Icon
                                                                    icon="heroicons-outline:photograph"
                                                                    className="text-lg"
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="table-td">
                                                {variation.variant_name || "—"}
                                            </td>
                                            <td className="table-td">
                                                {variation.sku || "—"}
                                            </td>
                                            <td className="table-td">
                                                {formatPrice(variation.price)}
                                            </td>
                                            <td className="table-td">
                                                {variation.stock || 0}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                )}

            {/* Action buttons at the bottom */}
            <div className="flex justify-between">
                <Button
                    icon="heroicons-outline:arrow-left"
                    text="Back to Products"
                    className="btn-outline-dark"
                    onClick={() => navigate("/company/products")}
                />
                <Button
                    icon="heroicons:pencil-square"
                    text="Edit Product"
                    className="btn-dark"
                    onClick={() => navigate(`/company/products/${id}/edit`)}
                />
            </div>
        </div>
    );
};

export default ProductShow;
