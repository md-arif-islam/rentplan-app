import SkeletonTable from "@/components/skeleton/Table";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import Modal from "@/components/ui/Modal";
import Tooltip from "@/components/ui/Tooltip";
import {
    useDeleteHoldersTaxMutation,
    useGetHoldersTaxesQuery,
} from "@/store/api/holdersTaxes/holdersTaxesApiSlice";
import { setHoldersTaxes } from "@/store/api/holdersTaxes/holdersTaxesSlice";
import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
    useGlobalFilter,
    usePagination,
    useRowSelect,
    useSortBy,
    useTable,
} from "react-table";
import { toast } from "react-toastify";

const HoldersTaxes = ({ title = "Holders Taxes" }) => {
    // State for delete modal and the selected tax record
    const [deleteModal, setDeleteModal] = useState(false);
    const [selectedTax, setSelectedTax] = useState(null);

    // States for pagination and search
    const [pagination, setPagination] = useState({
        page: 1,
        perPage: 10,
        search: "",
        // You can add additional filters if needed (e.g. is_deductible)
    });
    const [searchValue, setSearchValue] = useState("");
    const [isSearching, setIsSearching] = useState(false);

    const dispatch = useDispatch();

    const navigate = useNavigate();

    // API hooks
    const {
        data: taxes,
        isLoading,
        isError,
        error,
        isFetching,
        refetch,
    } = useGetHoldersTaxesQuery(pagination, {
        refetchOnMountOrArgChange: true,
    });
    const [deleteHoldersTax, { isLoading: isDeleting }] =
        useDeleteHoldersTaxMutation();

    // Delete modal handlers
    const handleDeleteClick = (tax) => {
        setSelectedTax(tax);
        setDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        if (!selectedTax) return;
        try {
            await deleteHoldersTax(selectedTax.id).unwrap();
            toast.success("Tax deleted successfully");
            setDeleteModal(false);
            setSelectedTax(null);
        } catch (err) {
            toast.error(err.data.message);
            console.error("Failed to delete tax:", err);
        }
    };

    const handleCloseModal = () => {
        setDeleteModal(false);
        setSelectedTax(null);
    };

    // Table columns
    const columns = useMemo(
        () => [
            {
                Header: "Country Name",
                accessor: "country.name",
                Cell: ({ cell: { value } }) => <span>{value}</span>,
            },
            {
                Header: "Percentage",
                accessor: "percentage",
                Cell: ({ cell: { value } }) => <span>{value}%</span>,
            },
            {
                Header: "Deductible",
                accessor: "is_deductible",
                Cell: ({ cell: { value } }) => (
                    <span className="block w-full">
                        <span
                            className={` inline-block px-3 min-w-[90px] text-center mx-auto py-1 rounded-[999px] bg-opacity-25 ${
                                value == 1
                                    ? "text-success-500 bg-success-500"
                                    : ""
                            }
            ${value == 0 ? "text-warning-500 bg-warning-500" : ""}


             `}
                        >
                            {value ? "Yes" : "No"}
                        </span>
                    </span>
                ),
            },
            {
                Header: "Time",
                accessor: "time",
                Cell: ({ cell: { value } }) => {
                    // Create a Date object from the ISO string.
                    const dateObj = new Date(value);
                    // Format the time portion as 12-hour with AM/PM.
                    const formattedTime = dateObj.toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                        hour12: true,
                    });
                    return <span>{formattedTime}</span>;
                },
            },

            {
                Header: "Action",
                accessor: "action",
                Cell: ({ row }) => (
                    <div className="flex space-x-3 rtl:space-x-reverse">
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
                                        `/admin/holders-taxes/${row.original.id}/edit`
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

    // Search functionality
    useEffect(() => {
        setIsSearching(true);
        const timer = setTimeout(() => {
            setPagination((prev) => ({
                ...prev,
                page: 1,
                search: searchValue,
            }));
        }, 500);
        return () => clearTimeout(timer);
    }, [searchValue]);

    useEffect(() => {
        if (!isFetching) setIsSearching(false);
    }, [isFetching]);

    const data = useMemo(() => (taxes ? taxes.data : []), [taxes]);
    const pageCount = useMemo(
        () => (taxes ? Math.ceil(taxes.total / taxes.per_page) : 0),
        [taxes]
    );

    // Set up react-table
    const tableInstance = useTable(
        {
            columns,
            data,
            initialState: {
                pageIndex: taxes ? taxes.current_page - 1 : 0,
                pageSize: pagination.perPage,
            },
            manualPagination: true,
            pageCount,
            autoResetPage: false,
        },
        useGlobalFilter,
        useSortBy,
        usePagination,
        useRowSelect
    );

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        page,
        setPageSize,
        prepareRow,
    } = tableInstance;

    // Pagination handlers
    const handlePageChange = (newPage) => {
        setPagination((prev) => ({
            ...prev,
            page: newPage,
        }));
    };

    const handlePrevious = () => {
        if (taxes?.prev_page_url) {
            handlePageChange(taxes.current_page - 1);
        }
    };

    const handleNext = () => {
        if (taxes?.next_page_url) {
            handlePageChange(taxes.current_page + 1);
        }
    };

    const handleFirst = () => {
        handlePageChange(1);
    };

    const handleLast = () => {
        handlePageChange(taxes?.last_page || 1);
    };

    const handleSearch = (value) => {
        setSearchValue(value);
    };

    const handlePageSizeChange = (newSize) => {
        setPagination({
            ...pagination,
            page: 1,
            perPage: newSize,
        });
        setPageSize(newSize);
    };

    // Render pagination buttons based on links from API response
    const renderPaginationButtons = () => {
        if (!taxes?.links || taxes.links.length <= 3) return null;
        const pageLinks = taxes.links.filter(
            (link) =>
                !link.label.includes("Previous") &&
                !link.label.includes("Next") &&
                link.label !== "..."
        );
        return pageLinks.map((link, idx) => (
            <li key={idx}>
                <button
                    className={
                        link.active
                            ? " bg-slate-900 dark:bg-slate-600 dark:text-slate-200 text-white font-medium text-sm rounded leading-[16px] flex h-6 w-6 items-center justify-center transition-all duration-150"
                            : " bg-slate-100 dark:bg-slate-700 dark:text-slate-400 text-slate-900 font-normal text-sm rounded leading-[16px] flex h-6 w-6 items-center justify-center transition-all duration-150"
                    }
                    onClick={() => handlePageChange(parseInt(link.label))}
                >
                    {link.label}
                </button>
            </li>
        ));
    };

    // Inside your HoldersTaxes component, after taxes have loaded
    useEffect(() => {
        if (taxes) {
            dispatch(setHoldersTaxes(taxes.data));
        }
    }, [taxes, dispatch]);

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
                    Delete Tax
                </h4>
                <div className="text-base text-slate-600 dark:text-slate-300">
                    {selectedTax ? (
                        <>
                            Are you sure you want to delete{" "}
                            <strong>{selectedTax.name}</strong>? This action
                            cannot be undone.
                        </>
                    ) : (
                        "Are you sure you want to delete this tax? This action cannot be undone."
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

                        <Button
                            icon="heroicons-outline:plus-sm"
                            text="Add Record"
                            className=" btn-dark font-normal btn-sm "
                            iconClass="text-lg"
                            onClick={() => {
                                navigate("/admin/holders-taxes/create");
                            }}
                        />
                    </div>
                </div>
                {isLoading || isSearching ? (
                    <SkeletonTable count={4} />
                ) : isError ? (
                    <div>
                        Error fetching taxes:{" "}
                        {error?.data?.message || "Unknown error"}
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto -mx-6">
                            <div className="inline-block min-w-full align-middle">
                                <div className="overflow-hidden">
                                    {taxes && taxes.data.length > 0 ? (
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
                                                No taxes found
                                            </h3>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                                {searchValue
                                                    ? `No results found for "${searchValue}"`
                                                    : "No taxes available in the database"}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        {taxes && taxes.data.length > 0 && (
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
                                            {taxes ? taxes.current_page : 0} of{" "}
                                            {taxes ? taxes.last_page : 0}
                                        </span>
                                    </span>
                                </div>
                                <ul className="flex items-center space-x-3 rtl:space-x-reverse">
                                    <li>
                                        <button
                                            className={
                                                !taxes?.prev_page_url
                                                    ? "opacity-50 cursor-not-allowed"
                                                    : ""
                                            }
                                            onClick={handleFirst}
                                            disabled={!taxes?.prev_page_url}
                                        >
                                            <Icon icon="heroicons:chevron-double-left-solid" />
                                        </button>
                                    </li>
                                    <li>
                                        <button
                                            className={
                                                !taxes?.prev_page_url
                                                    ? "opacity-50 cursor-not-allowed"
                                                    : ""
                                            }
                                            onClick={handlePrevious}
                                            disabled={!taxes?.prev_page_url}
                                        >
                                            Prev
                                        </button>
                                    </li>
                                    {renderPaginationButtons()}
                                    <li>
                                        <button
                                            className={
                                                !taxes?.next_page_url
                                                    ? "opacity-50 cursor-not-allowed"
                                                    : ""
                                            }
                                            onClick={handleNext}
                                            disabled={!taxes?.next_page_url}
                                        >
                                            Next
                                        </button>
                                    </li>
                                    <li>
                                        <button
                                            onClick={handleLast}
                                            disabled={!taxes?.next_page_url}
                                            className={
                                                !taxes?.next_page_url
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
};

export default HoldersTaxes;
