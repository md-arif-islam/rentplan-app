import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import Radio from "@/components/ui/Radio";
import Textarea from "@/components/ui/Textarea";
import Textinput from "@/components/ui/Textinput";
import { useCreateProductMutation } from "@/store/api/products/productsApiSlice";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useRef, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
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

const ProductCreate = () => {
    const navigate = useNavigate();
    const [productType, setProductType] = useState(0); // 0 = simple, 1 = variable
    const fileInputRef = useRef(null);
    const [variationFileInputRefs, setVariationFileInputRefs] = useState([]);

    const [createProduct, { isLoading }] = useCreateProductMutation();

    const {
        register,
        handleSubmit,
        control,
        formState: { errors, isSubmitting },
        setError,
        setValue,
        watch,
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
            variations: [
                {
                    variant_name: "",
                    sku: "",
                    price: "",
                    stock: "",
                    specifications: "",
                    attributes: "",
                    image_url: null,
                },
            ],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "variations",
    });

    // Handle product type change
    useEffect(() => {
        const subscription = watch((value, { name, type }) => {
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

            await createProduct(formData).unwrap();
            toast.success("Product created successfully");
            navigate("/company/products");
        } catch (error) {
            console.error("Create failed", error);

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
                toast.error(error?.data?.message || "Failed to create product");
            }
        }
    };

    // Watch form values for previews
    const mainImagePreview = watch("image_url");
    const variations = watch("variations");

    return (
        <div className="space-y-5">
            <div className="flex flex-wrap justify-between items-center">
                <h4 className="font-medium lg:text-2xl text-xl capitalize text-slate-900 inline-block ltr:pr-4 rtl:pl-4">
                    Create New Product
                </h4>
                <Button
                    icon="heroicons-outline:arrow-left"
                    text="Back"
                    className="btn-outline-dark"
                    onClick={() => navigate("/company/products")}
                />
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
                                <img
                                    src={mainImagePreview}
                                    alt="Product Preview"
                                    className="h-32 w-32 object-contain border border-slate-200 rounded-lg p-1"
                                />
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
                                text="Upload Image"
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
                                                text="Upload Image"
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
                        icon="heroicons-outline:plus"
                        text="Create Product"
                        className="btn-dark"
                        isLoading={isLoading || isSubmitting}
                    />
                </div>
            </form>
        </div>
    );
};

export default ProductCreate;
