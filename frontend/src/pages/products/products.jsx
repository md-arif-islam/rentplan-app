import SkeletionTable from "@/components/skeleton/Table";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import Modal from "@/components/ui/Modal";
import Tooltip from "@/components/ui/Tooltip";
import {
    useDeleteProductMutation,
    useGetProductsQuery,
} from "@/store/api/products/productsApiSlice";
import { setProduct } from "@/store/api/products/productsSlice";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useCustomTable } from "../common/useCustomTable";

function Products({ title = "Products" }) {
    const [searchValue, setSearchValue] = useState("");
    const [deleteModal, setDeleteModal] = useState(false);
    const [filterType, setFilterType] = useState("");
    const [pagination, setPagination] = useState({
        page: 1,
        perPage: 10,
        search: "",
        type: "",
    });

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const {
        data: products,
        isLoading,
        isError,
        isFetching,
        error,
    } = useGetProductsQuery(pagination);

    const [deleteProduct, { isLoading: isDeleting }] =
        useDeleteProductMutation();

    const handleSearch = (value) => {
        setSearchValue(value);
    };

    const handleTypeFilter = (e) => {
        setFilterType(e.target.value);
    };

    // Delete modal handlers
    const handleDeleteClick = (product) => {
        dispatch(setProduct(product));
        setDeleteModal(true);
    };

    const handleCloseModal = () => {
        setDeleteModal(false);
        dispatch(setProduct(null));
    };

    const selectedProduct = useSelector((state) => state.products.product);

    const handleDeleteConfirm = async () => {
        if (!selectedProduct) return;
        try {
            await deleteProduct(selectedProduct.id).unwrap();
            toast.success(
                `Product ${selectedProduct.name} deleted successfully!`
            );
            setDeleteModal(false);
            dispatch(setProduct(null));
        } catch (error) {
            toast.error(error?.data?.message || "Failed to delete product");
            console.error(error);
        }
    };

    // Format price with currency
    const formatPrice = (price) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(price);
    };

    // Table Configuration
    const columns = useMemo(
        () => [
            {
                Header: "Name",
                accessor: "name",
                Cell: ({ cell: { value }, row }) => (
                    <div className="flex items-center">
                        <div className="h-10 w-10 rounded overflow-hidden mr-3">
                            {row.original.image_url ? (
                                <img
                                    src={`${import.meta.env.VITE_API_URL}/${
                                        row.original.image_url
                                    }`}
                                    alt={value}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="flex items-center justify-center w-full h-full bg-slate-200 dark:bg-slate-700">
                                    <Icon icon="heroicons-outline:photograph" />
                                </div>
                            )}
                        </div>
                        <span>{value || "—"}</span>
                    </div>
                ),
            },
            {
                Header: "Type",
                accessor: "type",
                Cell: ({ cell: { value } }) => (
                    <Badge
                        label={value === 0 ? "Simple" : "Variable"}
                        className={
                            value === 0 ? "bg-success-500" : "bg-info-500"
                        }
                    />
                ),
            },
            {
                Header: "Price",
                accessor: "price",
                Cell: ({ cell: { value }, row }) => {
                    if (row.original.type === 1) {
                        // Variable product
                        const variations = row.original.variations || [];
                        if (variations.length === 0) return <span>—</span>;

                        // Get min and max prices
                        const prices = variations.map((v) =>
                            parseFloat(v.price)
                        );
                        const minPrice = Math.min(...prices);
                        const maxPrice = Math.max(...prices);

                        return (
                            <span>
                                {formatPrice(minPrice)} -{" "}
                                {formatPrice(maxPrice)}
                            </span>
                        );
                    }

                    return <span>{value ? formatPrice(value) : "—"}</span>;
                },
            },
            {
                Header: "Stock",
                accessor: "stock",
                Cell: ({ cell: { value }, row }) => {
                    if (row.original.type === 1) {
                        // Variable product
                        const variations = row.original.variations || [];
                        if (variations.length === 0) return <span>0</span>;

                        // Sum up stock of all variations
                        const totalStock = variations.reduce(
                            (sum, v) => sum + (v.stock || 0),
                            0
                        );

                        return <span>{totalStock}</span>;
                    }

                    return <span>{value || "0"}</span>;
                },
            },
            {
                Header: "Action",
                accessor: "action",
                Cell: ({ row }) => (
                    <div className="flex space-x-3 rtl:space-x-reverse">
                        <Tooltip
                            content="View"
                            placement="top"
                            arrow
                            animation="shift-away"
                        >
                            <button
                                className="action-btn"
                                type="button"
                                onClick={() =>
                                    navigate(
                                        `/company/products/${row.original.id}`
                                    )
                                }
                            >
                                <Icon icon="heroicons:eye" />
                            </button>
                        </Tooltip>

                        <Tooltip
                            content="Edit"
                            placement="top"
                            arrow
                            animation="shift-away"
                        >
                            <button
                                className="action-btn"
                                type="button"
                                onClick={() =>
                                    navigate(
                                        `/company/products/${row.original.id}/edit`
                                    )
                                }
                            >
                                <Icon icon="heroicons:pencil-square" />
                            </button>
                        </Tooltip>

                        <Tooltip
                            content="Delete"
                            placement="top"
                            arrow
                            animation="shift-away"
                            theme="danger"
                        >
                            <button
                                className="action-btn"
                                type="button"
                                onClick={() => handleDeleteClick(row.original)}
                            >
                                <Icon icon="heroicons:trash" />
                            </button>
                        </Tooltip>
                    </div>
                ),
            },
        ],
        []
    );

    useEffect(() => {
        const timer = setTimeout(() => {
            setPagination((prev) => ({
                ...prev,
                page: 1,
                search: searchValue,
                type: filterType,
            }));
        }, 500);
        return () => clearTimeout(timer);
    }, [searchValue, filterType]);

    // Use the custom hook to get table configuration.
    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        page,
        prepareRow,
        handlePageSizeChange,
        handleFirst,
        handleLast,
        handlePrevious,
        handleNext,
        renderPaginationButtons,
    } = useCustomTable({
        dataVar: products,
        columns,
        pagination,
        setPagination,
    });

    return (
        <>
            {/* Delete confirmation Modal */}
            <Modal
                title="Confirm Delete"
                labelClass="btn-outline-danger"
                themeClass="bg-danger-500"
                activeModal={deleteModal}
                onClose={handleCloseModal}
                centered
                footerContent={
                    <div className="flex items-center gap-3">
                        <Button
                            text="Cancel"
                            className="btn-outline-dark"
                            onClick={handleCloseModal}
                        />
                        <Button
                            text="Delete"
                            className="btn-danger"
                            isLoading={isDeleting}
                            onClick={handleDeleteConfirm}
                        />
                    </div>
                }
            >
                <h4 className="font-medium text-lg mb-3 text-slate-900">
                    Delete Product
                </h4>
                <div className="text-base text-slate-600 dark:text-slate-300">
                    {selectedProduct ? (
                        <>
                            Are you sure you want to delete{" "}
                            <strong>{selectedProduct.name}</strong>? This action
                            cannot be undone.
                        </>
                    ) : (
                        "Are you sure you want to delete this product? This action cannot be undone."
                    )}
                </div>
            </Modal>
            <Card>
                <div className="md:flex pb-6 items-center">
                    <h6 className="flex-1 md:mb-0 mb-3">{title}</h6>
                    <div className="md:flex md:space-x-3 items-center flex-none rtl:space-x-reverse">
                        <input
                            type="text"
                            className="form-control py-2"
                            placeholder="Search..."
                            value={searchValue}
                            onChange={(e) => handleSearch(e.target.value)}
                        />

                        <select
                            className="form-control py-2 w-auto"
                            value={filterType}
                            onChange={handleTypeFilter}
                        >
                            <option value="">All Types</option>
                            <option value="0">Simple</option>
                            <option value="1">Variable</option>
                        </select>

                        <Button
                            icon="heroicons-outline:plus-sm"
                            text="Add Product"
                            className="btn-dark font-normal btn-sm"
                            iconClass="text-lg"
                            onClick={() => {
                                navigate("/company/products/create");
                            }}
                        />
                    </div>
                </div>
                {isLoading || isFetching ? (
                    <SkeletionTable count={4} />
                ) : isError ? (
                    <div>
                        Error fetching products:{" "}
                        {error?.data?.message || "Unknown error"}
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto -mx-6">
                            <div className="inline-block min-w-full align-middle">
                                <div className="overflow-hidden">
                                    {products && products.data.length > 0 ? (
                                        <table
                                            className="min-w-full divide-y divide-slate-100 table-fixed dark:divide-slate-700"
                                            {...getTableProps()}
                                        >
                                            <thead className="bg-slate-200 dark:bg-slate-700">
                                                {headerGroups.map(
                                                    (headerGroup) => (
                                                        <tr
                                                            {...headerGroup.getHeaderGroupProps()}
                                                            key={headerGroup.id}
                                                        >
                                                            {headerGroup.headers.map(
                                                                (column) => (
                                                                    <th
                                                                        {...column.getHeaderProps(
                                                                            column.getSortByToggleProps()
                                                                        )}
                                                                        scope="col"
                                                                        className="table-th"
                                                                        key={
                                                                            column.id
                                                                        }
                                                                    >
                                                                        {column.render(
                                                                            "Header"
                                                                        )}
                                                                        <span>
                                                                            {column.isSorted
                                                                                ? column.isSortedDesc
                                                                                    ? " 🔽"
                                                                                    : " 🔼"
                                                                                : ""}
                                                                        </span>
                                                                    </th>
                                                                )
                                                            )}
                                                        </tr>
                                                    )
                                                )}
                                            </thead>
                                            <tbody
                                                className="bg-white divide-y divide-slate-100 dark:bg-slate-800 dark:divide-slate-700"
                                                {...getTableBodyProps()}
                                            >
                                                {page.map((row) => {
                                                    prepareRow(row);
                                                    return (
                                                        <tr
                                                            {...row.getRowProps()}
                                                            key={row.id}
                                                        >
                                                            {row.cells.map(
                                                                (cell) => (
                                                                    <td
                                                                        {...cell.getCellProps()}
                                                                        className="table-td"
                                                                        key={
                                                                            cell
                                                                                .column
                                                                                .id
                                                                        }
                                                                    >
                                                                        {cell.render(
                                                                            "Cell"
                                                                        )}
                                                                    </td>
                                                                )
                                                            )}
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <div className="text-center py-10">
                                            <Icon
                                                icon="heroicons-outline:search"
                                                className="inline-block text-4xl text-slate-400 mb-3"
                                            />
                                            <h3 className="text-lg font-medium text-slate-600 dark:text-slate-300">
                                                No products found
                                            </h3>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                                {searchValue
                                                    ? `No results found for "${searchValue}"`
                                                    : "No products available yet"}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        {products && products.data.length > 0 && (
                            <div className="md:flex md:space-y-0 space-y-5 justify-between mt-6 items-center">
                                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                                    <select
                                        className="form-control py-2 w-max"
                                        value={pagination.perPage}
                                        onChange={(e) =>
                                            handlePageSizeChange(
                                                Number(e.target.value)
                                            )
                                        }
                                    >
                                        {[10, 25, 50].map((size) => (
                                            <option key={size} value={size}>
                                                Show {size}
                                            </option>
                                        ))}
                                    </select>
                                    <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                                        Page{" "}
                                        <span>
                                            {products
                                                ? products.current_page
                                                : 0}{" "}
                                            of{" "}
                                            {products ? products.last_page : 0}
                                        </span>
                                    </span>
                                </div>
                                <ul className="flex items-center space-x-3 rtl:space-x-reverse">
                                    <li>
                                        <button
                                            className={
                                                !products?.prev_page_url
                                                    ? "opacity-50 cursor-not-allowed"
                                                    : ""
                                            }
                                            onClick={handleFirst}
                                            disabled={!products?.prev_page_url}
                                        >
                                            <Icon icon="heroicons:chevron-double-left-solid" />
                                        </button>
                                    </li>
                                    <li>
                                        <button
                                            className={
                                                !products?.prev_page_url
                                                    ? "opacity-50 cursor-not-allowed"
                                                    : ""
                                            }
                                            onClick={handlePrevious}
                                            disabled={!products?.prev_page_url}
                                        >
                                            Prev
                                        </button>
                                    </li>
                                    {renderPaginationButtons()}
                                    <li>
                                        <button
                                            className={
                                                !products?.next_page_url
                                                    ? "opacity-50 cursor-not-allowed"
                                                    : ""
                                            }
                                            onClick={handleNext}
                                            disabled={!products?.next_page_url}
                                        >
                                            Next
                                        </button>
                                    </li>
                                    <li>
                                        <button
                                            onClick={handleLast}
                                            disabled={!products?.next_page_url}
                                            className={
                                                !products?.next_page_url
                                                    ? "opacity-50 cursor-not-allowed"
                                                    : ""
                                            }
                                        >
                                            <Icon icon="heroicons:chevron-double-right-solid" />
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        )}
                    </>
                )}
            </Card>
        </>
    );
}

export default Products;
