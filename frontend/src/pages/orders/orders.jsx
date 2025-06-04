import SkeletionTable from "@/components/skeleton/Table";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import Modal from "@/components/ui/Modal";
import Tooltip from "@/components/ui/Tooltip";
import Badge from "@/components/ui/Badge";
import {
    useDeleteOrderMutation,
    useGetOrdersQuery,
} from "@/store/api/orders/ordersApiSlice";
import { setOrder } from "@/store/api/orders/ordersSlice";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useCustomTable } from "../common/useCustomTable";

function Orders({ title = "Orders" }) {
    const [searchValue, setSearchValue] = useState("");
    const [deleteModal, setDeleteModal] = useState(false);
    const [statusFilter, setStatusFilter] = useState("");
    const [pagination, setPagination] = useState({
        page: 1,
        perPage: 10,
        search: "",
        status: "",
    });
    
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const {
        data: orders,
        isLoading,
        isError,
        isFetching,
        error,
    } = useGetOrdersQuery(pagination);

    const [deleteOrder, { isLoading: isDeleting }] =
        useDeleteOrderMutation();

    const handleSearch = (value) => {
        setSearchValue(value);
    };

    const handleStatusFilter = (e) => {
        setStatusFilter(e.target.value);
    };

    // Delete modal handlers
    const handleDeleteClick = (order) => {
        dispatch(setOrder(order));
        setDeleteModal(true);
    };

    const handleCloseModal = () => {
        setDeleteModal(false);
        dispatch(setOrder(null));
    };

    const selectedOrder = useSelector((state) => state.orders.order);

    const handleDeleteConfirm = async () => {
        if (!selectedOrder) return;
        try {
            await deleteOrder(selectedOrder.id).unwrap();
            toast.success("Order deleted successfully!");
            setDeleteModal(false);
            dispatch(setOrder(null));
        } catch (error) {
            toast.error(error?.data?.message || "Failed to delete order");
            console.error(error);
        }
    };

    // Format date helper
    const formatDate = (dateString) => {
        if (!dateString) return "—";
        
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    // Get status badge color
    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed':
                return 'bg-success-500';
            case 'processing':
                return 'bg-info-500';
            case 'pending':
                return 'bg-warning-500';
            case 'cancelled':
                return 'bg-danger-500';
            default:
                return 'bg-slate-500';
        }
    };

    // Table Configuration
    const columns = useMemo(
        () => [
            {
                Header: "Customer",
                accessor: (row) => `${row.customer?.first_name || ''} ${row.customer?.last_name || ''}`,
                Cell: ({ cell: { value }, row }) => (
                    <div className="flex items-center">
                        <span>{value.trim() || "—"}</span>
                    </div>
                ),
            },
            {
                Header: "Product",
                accessor: "product.name",
                Cell: ({ cell: { value } }) => <span>{value || "—"}</span>,
            },
            {
                Header: "Start Date",
                accessor: "start_date",
                Cell: ({ cell: { value } }) => <span>{formatDate(value)}</span>,
            },
            {
                Header: "End Date",
                accessor: "end_date",
                Cell: ({ cell: { value } }) => <span>{formatDate(value)}</span>,
            },
            {
                Header: "Status",
                accessor: "order_status",
                Cell: ({ cell: { value } }) => (
                    <Badge
                        label={value || "Unknown"}
                        className={getStatusColor(value)}
                    />
                ),
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
                                        `/company/orders/${row.original.id}`
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
                                        `/company/orders/${row.original.id}/edit`
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
                status: statusFilter,
            }));
        }, 500);
        return () => clearTimeout(timer);
    }, [searchValue, statusFilter]);

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
        dataVar: orders,
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
                    Delete Order
                </h4>
                <div className="text-base text-slate-600 dark:text-slate-300">
                    {selectedOrder ? (
                        <>
                            Are you sure you want to delete this order? This action
                            cannot be undone.
                        </>
                    ) : (
                        "Are you sure you want to delete this order? This action cannot be undone."
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
                            value={statusFilter}
                            onChange={handleStatusFilter}
                        >
                            <option value="">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>

                        <Button
                            icon="heroicons-outline:plus-sm"
                            text="Add Order"
                            className="btn-dark font-normal btn-sm"
                            iconClass="text-lg"
                            onClick={() => {
                                navigate("/company/orders/create");
                            }}
                        />
                    </div>
                </div>
                {isLoading || isFetching ? (
                    <SkeletionTable count={4} />
                ) : isError ? (
                    <div>
                        Error fetching orders:{" "}
                        {error?.data?.message || "Unknown error"}
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto -mx-6">
                            <div className="inline-block min-w-full align-middle">
                                <div className="overflow-hidden">
                                    {orders && orders.data.length > 0 ? (
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
                                                No orders found
                                            </h3>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                                {searchValue
                                                    ? `No results found for "${searchValue}"`
                                                    : "No orders available yet"}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        {orders && orders.data.length > 0 && (
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
                                            {orders ? orders.current_page : 0} of{" "}
                                            {orders ? orders.last_page : 0}
                                        </span>
                                    </span>
                                </div>
                                <ul className="flex items-center space-x-3 rtl:space-x-reverse">
                                    <li>
                                        <button
                                            className={
                                                !orders?.prev_page_url
                                                    ? "opacity-50 cursor-not-allowed"
                                                    : ""
                                            }
                                            onClick={handleFirst}
                                            disabled={!orders?.prev_page_url}
                                        >
                                            <Icon icon="heroicons:chevron-double-left-solid" />
                                        </button>
                                    </li>
                                    <li>
                                        <button
                                            className={
                                                !orders?.prev_page_url
                                                    ? "opacity-50 cursor-not-allowed"
                                                    : ""
                                            }
                                            onClick={handlePrevious}
                                            disabled={!orders?.prev_page_url}
                                        >
                                            Prev
                                        </button>
                                    </li>
                                    {renderPaginationButtons()}
                                    <li>
                                        <button
                                            className={
                                                !orders?.next_page_url
                                                    ? "opacity-50 cursor-not-allowed"
                                                    : ""
                                            }
                                            onClick={handleNext}
                                            disabled={!orders?.next_page_url}
                                        >
                                            Next
                                        </button>
                                    </li>
                                    <li>
                                        <button
                                            onClick={handleLast}
                                            disabled={!orders?.next_page_url}
                                            className={
                                                !orders?.next_page_url
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

export default Orders;
