import LoadingContent from "@/components/Loading";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import Radio from "@/components/ui/Radio";
import Textarea from "@/components/ui/Textarea";
import Textinput from "@/components/ui/Textinput";
import {
    useGetProductQuery,
    useUpdateProductMutation,
} from "@/store/api/products/productsApiSlice";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useRef, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import * as yup from "yup";

const schema = yup.object().shape({
    name: yup
        .string()
        .required("Product name is required")
        .max(255, "Product name cannot exceed 255 characters"),
    type: yup
        .number()
        .required("Product type is required")
        .oneOf([0, 1], "Invalid product type"),
    price: yup
        .number()
        .transform((value) => (isNaN(value) || value === "" ? null : value))
        .when("type", {
            is: 0,
            then: () =>
                yup
                    .number()
                    .transform((value) =>
                        isNaN(value) || value === "" ? null : value
                    )
                    .required("Price is required for simple products")
                    .typeError("Price must be a valid number")
                    .min(0, "Price cannot be negative"),
            otherwise: () => yup.number().nullable(),
        }),
    stock: yup
        .number()
        .nullable()
        .transform((value) => (isNaN(value) || value === "" ? null : value))
        .typeError("Stock must be a valid number or empty"),
    specifications: yup.string().nullable(),
    woocommerce_product_id: yup
        .number()
        .nullable()
        .transform((value) => (isNaN(value) || value === "" ? null : value)),
    variations: yup.array().when("type", {
        is: 1,
        then: () =>
            yup
                .array()
                .of(
                    yup.object().shape({
                        id: yup
                            .number()
                            .nullable()
                            .transform((value) =>
                                isNaN(value) || value === "" ? null : value
                            ),
                        variant_name: yup
                            .string()
                            .required("Variation name is required"),
                        sku: yup.string().nullable(),
                        price: yup
                            .number()
                            .transform((value) =>
                                isNaN(value) || value === "" ? null : value
                            )
                            .required("Price is required for variations")
                            .min(0, "Price cannot be negative"),
                        stock: yup
                            .number()
                            .nullable()
                            .transform((value) =>
                                isNaN(value) || value === "" ? null : value
                            ),
                        specifications: yup.string().nullable(),
                        attributes: yup.string().nullable(),
                    })
                )
                .min(
                    1,
                    "At least one variation is required for variable products"
                ),
        otherwise: () => yup.array().nullable(),
    }),
});

const ProductEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [productType, setProductType] = useState(0);
    const fileInputRef = useRef(null);
    const [variationFileInputRefs, setVariationFileInputRefs] = useState([]);

    const { data: product, isLoading, isError, error } = useGetProductQuery(id);
    const [updateProduct, { isLoading: isUpdating }] =
        useUpdateProductMutation();

    const {
        register,
        handleSubmit,
        control,
        formState: { errors, isSubmitting },
        setError,
        setValue,
        watch,
        reset,
    } = useForm({
        resolver: yupResolver(schema),
        mode: "onChange",
        defaultValues: {
            name: "",
            type: 0,
            price: "",
            stock: "",
            specifications: "",
            image_url: null,
            woocommerce_product_id: "",
            variations: [],
        },
    });

    const { fields, append, remove, replace } = useFieldArray({
        control,
        name: "variations",
    });

    // Initialize form values when product data is loaded
    useEffect(() => {
        if (product) {
            // Set basic product information
            reset({
                name: product.name || "",
                type: product.type || 0,
                price: product.price || "",
                stock: product.stock || "",
                specifications: product.specifications || "",
                image_url: product.image_url || null,
                woocommerce_product_id: product.woocommerce_product_id || "",
            });

            // Set product type
            setProductType(product.type);

            // Handle variations if product is variable
            if (
                product.type === 1 &&
                product.variations &&
                product.variations.length > 0
            ) {
                replace(
                    product.variations.map((v) => ({
                        id: v.id,
                        variant_name: v.variant_name || "",
                        sku: v.sku || "",
                        price: v.price || "",
                        stock: v.stock || "",
                        specifications: v.specifications || "",
                        attributes: v.attributes || "",
                        image_url: v.image_url || null,
                    }))
                );
            } else if (product.type === 1) {
                // If variable but no variations yet, add an empty one
                replace([
                    {
                        variant_name: "",
                        sku: "",
                        price: "",
                        stock: "",
                        specifications: "",
                        attributes: "",
                        image_url: null,
                    },
                ]);
            }
        }
    }, [product, reset, replace]);

    // Handle product type change
    useEffect(() => {
        const subscription = watch((value, { name }) => {
            if (name === "type") {
                setProductType(parseInt(value.type));
            }
        });
        return () => subscription.unsubscribe();
    }, [watch]);

    // Initialize refs for variation file inputs
    useEffect(() => {
        setVariationFileInputRefs(fields.map(() => ({ current: null })));
    }, [fields.length]);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setValue("image_url", reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleFileUploadClick = () => {
        fileInputRef.current.click();
    };

    const handleVariationFileChange = (index, e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setValue(`variations.${index}.image_url`, reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleVariationFileUploadClick = (index) => {
        if (
            variationFileInputRefs[index] &&
            variationFileInputRefs[index].current
        ) {
            variationFileInputRefs[index].current.click();
        }
    };

    const addVariation = () => {
        append({
            variant_name: "",
            sku: "",
            price: "",
            stock: "",
            specifications: "",
            attributes: "",
            image_url: null,
        });
    };

    const onSubmit = async (formData) => {
        try {
            // Convert type to number to ensure consistency
            formData.type = parseInt(formData.type);

            // Ensure numeric values are properly converted
            if (formData.type === 0) {
                // Simple product
                if (formData.price === null || formData.price === "") {
                    setError("price", {
                        type: "manual",
                        message: "Price is required for simple products",
                    });
                    return; // Stop submission if price is missing
                }
                formData.price = Number(formData.price);
                formData.stock =
                    formData.stock === null || formData.stock === ""
                        ? null
                        : Number(formData.stock);
                // Remove variations for simple product
                delete formData.variations;
            } else {
                // Variable product
                // Make sure prices and stock in variations are numbers
                formData.variations = formData.variations.map((variation) => ({
                    ...variation,
                    id:
                        variation.id === null || variation.id === ""
                            ? null
                            : Number(variation.id),
                    price:
                        variation.price === null || variation.price === ""
                            ? 0
                            : Number(variation.price),
                    stock:
                        variation.stock === null || variation.stock === ""
                            ? null
                            : Number(variation.stock),
                }));
            }

            // Send update request
            await updateProduct({
                id,
                ...formData,
            }).unwrap();

            toast.success("Product updated successfully");
            navigate("/company/products");
        } catch (error) {
            console.error("Update failed", error);

            if (error?.data?.errors) {
                Object.entries(error.data.errors).forEach(
                    ([field, messages]) => {
                        // Handle nested fields for variations
                        if (field.includes("variations.")) {
                            const [parent, index, child] = field.split(".");
                            setError(`${parent}[${index}].${child}`, {
                                type: "manual",
                                message: messages[0],
                            });
                        } else {
                            setError(field, {
                                type: "manual",
                                message: messages[0],
                            });
                        }
                    }
                );
            } else {
                toast.error(error?.data?.message || "Failed to update product");
            }
        }
    };

    // Watch form values for previews
    const mainImagePreview = watch("image_url");
    const variations = watch("variations");

    if (isLoading) {
        return <LoadingContent />;
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
                        Error Loading Product
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
            <div className="flex flex-wrap justify-between items-center">
                <h4 className="font-medium lg:text-2xl text-xl capitalize text-slate-900 inline-block ltr:pr-4 rtl:pl-4">
                    Edit Product
                </h4>
                <div className="flex space-x-3 rtl:space-x-reverse">
                    <Button
                        icon="heroicons-outline:arrow-left"
                        text="Back"
                        className="btn-outline-dark"
                        onClick={() => navigate("/company/products")}
                    />
                    <Button
                        icon="heroicons-outline:eye"
                        text="View Details"
                        className="btn-outline-dark"
                        onClick={() => navigate(`/company/products/${id}`)}
                    />
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
                <Card title="Basic Information">
                    <div className="grid lg:grid-cols-2 md:grid-cols-2 grid-cols-1 gap-5 mb-5">
                        <Textinput
                            label="Product Name *"
                            type="text"
                            placeholder="Enter product name"
                            register={register}
                            name="name"
                            error={errors.name}
                        />
                        <Textinput
                            label="WooCommerce Product ID"
                            type="number"
                            placeholder="Enter WooCommerce ID (optional)"
                            register={register}
                            name="woocommerce_product_id"
                            error={errors.woocommerce_product_id}
                        />
                    </div>

                    <div className="mb-5">
                        <label className="form-label">Product Type *</label>
                        <div className="flex items-center space-x-7 rtl:space-x-reverse">
                            <Radio
                                label="Simple Product"
                                name="type"
                                value={0}
                                checked={productType === 0}
                                onChange={() => {
                                    setValue("type", 0);
                                    setProductType(0);
                                }}
                                error={errors.type}
                            />
                            <Radio
                                label="Variable Product"
                                name="type"
                                value={1}
                                checked={productType === 1}
                                onChange={() => {
                                    setValue("type", 1);
                                    setProductType(1);
                                }}
                                error={errors.type}
                            />
                        </div>
                        {errors.type && (
                            <div className="text-danger-500 text-sm mt-1">
                                {errors.type.message}
                            </div>
                        )}
                    </div>

                    {productType === 0 && (
                        <div className="grid lg:grid-cols-2 md:grid-cols-2 grid-cols-1 gap-5">
                            <div>
                                <Textinput
                                    label="Price *"
                                    type="number"
                                    step="0.01"
                                    placeholder="Enter price"
                                    register={register}
                                    name="price"
                                    error={errors.price}
                                />
                                {errors.price &&
                                    errors.price.type === "typeError" && (
                                        <div className="text-danger-500 text-sm mt-1">
                                            Please enter a valid price
                                        </div>
                                    )}
                                {!errors.price && productType === 0 && (
                                    <div className="text-xs text-slate-500 mt-1">
                                        Required for simple products
                                    </div>
                                )}
                            </div>
                            <Textinput
                                label="Stock"
                                type="number"
                                placeholder="Enter stock"
                                register={register}
                                name="stock"
                                error={errors.stock}
                            />
                        </div>
                    )}
                </Card>

                <Card title="Product Image" className="mt-5">
                    <div className="flex items-start space-x-4 rtl:space-x-reverse">
                        <div>
                            {mainImagePreview ? (
                                typeof mainImagePreview === "string" &&
                                mainImagePreview.startsWith("data:") ? (
                                    <img
                                        src={mainImagePreview}
                                        alt="Product Preview"
                                        className="h-32 w-32 object-contain border border-slate-200 rounded-lg p-1"
                                    />
                                ) : (
                                    <img
                                        src={`${
                                            import.meta.env.VITE_API_URL
                                        }/${mainImagePreview}`}
                                        alt="Product Preview"
                                        className="h-32 w-32 object-contain border border-slate-200 rounded-lg p-1"
                                    />
                                )
                            ) : (
                                <div className="h-32 w-32 rounded-lg bg-slate-100 flex items-center justify-center">
                                    <Icon
                                        icon="heroicons-outline:photograph"
                                        className="text-3xl text-slate-400"
                                    />
                                </div>
                            )}
                        </div>
                        <div className="flex-1">
                            <Button
                                text="Change Image"
                                icon="heroicons-outline:upload"
                                className="btn-outline-dark"
                                onClick={handleFileUploadClick}
                            />
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                            <p className="text-xs text-slate-500 mt-2">
                                Supported formats: JPG, PNG, GIF (Max size: 2MB)
                            </p>
                        </div>
                    </div>
                </Card>

                <Card title="Specifications" className="mt-5">
                    <Textarea
                        label="Product Specifications"
                        placeholder="Enter product specifications"
                        register={register}
                        name="specifications"
                        error={errors.specifications}
                        className="h-32"
                    />
                    <p className="text-xs text-slate-500 mt-2">
                        Enter product specifications in text or JSON format.
                    </p>
                </Card>

                {productType === 1 && (
                    <Card title="Product Variations" className="mt-5">
                        <div className="space-y-8">
                            {fields.map((field, index) => (
                                <div
                                    key={field.id}
                                    className="border border-slate-200 dark:border-slate-700 rounded-lg p-4"
                                >
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-medium">
                                            Variation #{index + 1}
                                        </h3>
                                        {fields.length > 1 && (
                                            <Button
                                                icon="heroicons-outline:trash"
                                                className="btn-outline-danger h-8 w-8 p-0"
                                                onClick={() => remove(index)}
                                            />
                                        )}
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        {/* Add hidden field for variation ID if it exists */}
                                        {field.id && (
                                            <input
                                                type="hidden"
                                                {...register(
                                                    `variations.${index}.id`
                                                )}
                                                defaultValue={field.id}
                                            />
                                        )}
                                        <Textinput
                                            label="Variation Name *"
                                            type="text"
                                            placeholder="E.g. Small, Red, etc."
                                            register={register}
                                            name={`variations.${index}.variant_name`}
                                            error={
                                                errors.variations?.[index]
                                                    ?.variant_name
                                            }
                                        />
                                        <Textinput
                                            label="SKU"
                                            type="text"
                                            placeholder="Enter SKU"
                                            register={register}
                                            name={`variations.${index}.sku`}
                                            error={
                                                errors.variations?.[index]?.sku
                                            }
                                        />
                                        <Textinput
                                            label="Price *"
                                            type="number"
                                            step="0.01"
                                            placeholder="Enter price"
                                            register={register}
                                            name={`variations.${index}.price`}
                                            error={
                                                errors.variations?.[index]
                                                    ?.price
                                            }
                                        />
                                        <Textinput
                                            label="Stock"
                                            type="number"
                                            placeholder="Enter stock"
                                            register={register}
                                            name={`variations.${index}.stock`}
                                            error={
                                                errors.variations?.[index]
                                                    ?.stock
                                            }
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 gap-4 mb-4">
                                        <Textarea
                                            label="Attributes"
                                            placeholder="Enter attributes (e.g. Color: Red, Size: Small)"
                                            register={register}
                                            name={`variations.${index}.attributes`}
                                            error={
                                                errors.variations?.[index]
                                                    ?.attributes
                                            }
                                        />
                                        <Textarea
                                            label="Specifications"
                                            placeholder="Enter specifications"
                                            register={register}
                                            name={`variations.${index}.specifications`}
                                            error={
                                                errors.variations?.[index]
                                                    ?.specifications
                                            }
                                        />
                                    </div>
                                    <div className="flex items-start space-x-4 rtl:space-x-reverse">
                                        <div>
                                            {variations &&
                                            variations[index]?.image_url ? (
                                                typeof variations[index]
                                                    .image_url === "string" &&
                                                variations[
                                                    index
                                                ].image_url.startsWith(
                                                    "data:"
                                                ) ? (
                                                    <img
                                                        src={
                                                            variations[index]
                                                                .image_url
                                                        }
                                                        alt={`Variation ${
                                                            index + 1
                                                        }`}
                                                        className="h-20 w-20 object-contain border border-slate-200 rounded-lg p-1"
                                                    />
                                                ) : (
                                                    <img
                                                        src={`${
                                                            import.meta.env
                                                                .VITE_API_URL
                                                        }/${
                                                            variations[index]
                                                                .image_url
                                                        }`}
                                                        alt={`Variation ${
                                                            index + 1
                                                        }`}
                                                        className="h-20 w-20 object-contain border border-slate-200 rounded-lg p-1"
                                                    />
                                                )
                                            ) : (
                                                <div className="h-20 w-20 rounded-lg bg-slate-100 flex items-center justify-center">
                                                    <Icon
                                                        icon="heroicons-outline:photograph"
                                                        className="text-xl text-slate-400"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <Button
                                                text="Change Image"
                                                icon="heroicons-outline:upload"
                                                className="btn-outline-dark btn-sm"
                                                onClick={() =>
                                                    handleVariationFileUploadClick(
                                                        index
                                                    )
                                                }
                                            />
                                            <input
                                                type="file"
                                                ref={(el) => {
                                                    variationFileInputRefs[
                                                        index
                                                    ] = { current: el };
                                                }}
                                                className="hidden"
                                                accept="image/*"
                                                onChange={(e) =>
                                                    handleVariationFileChange(
                                                        index,
                                                        e
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div className="flex justify-center">
                                <Button
                                    text="Add Variation"
                                    icon="heroicons-outline:plus"
                                    className="btn-secondary"
                                    onClick={addVariation}
                                />
                            </div>
                        </div>
                    </Card>
                )}

                <div className="flex justify-between items-center mt-5">
                    <Button
                        type="button"
                        icon="heroicons-outline:x"
                        text="Cancel"
                        className="btn-outline-dark"
                        onClick={() => navigate("/company/products")}
                    />
                    <Button
                        type="submit"
                        icon="heroicons-outline:save"
                        text="Update Product"
                        className="btn-dark"
                        isLoading={isUpdating || isSubmitting}
                    />
                </div>
            </form>
        </div>
    );
};

export default ProductEdit;
