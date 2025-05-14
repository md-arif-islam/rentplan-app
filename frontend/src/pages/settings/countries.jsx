import SkeletonTable from "@/components/skeleton/Table"; // import skeleton
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import Modal from "@/components/ui/Modal";
import Tooltip from "@/components/ui/Tooltip";
import {
    useDeleteCountryMutation,
    useGetCountriesQuery,
    useRefreshCountriesMutation,
} from "@/store/api/countries/countriesApiSlice";
import { setCountries } from "@/store/api/countries/countriesSlice"; // new: import our setCountries action
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux"; // new: import redux hooks
import {
    useGlobalFilter,
    usePagination,
    useRowSelect,
    useSortBy,
    useTable,
} from "react-table";
import { toast } from "react-toastify";

const Countries = ({ title = "Countries" }) => {
    // Local UI states
    const [deleteModal, setDeleteModal] = useState(false);
    const [selectedCountry, setSelectedCountry] = useState(null);
    const [pagination, setPagination] = useState({
        page: 1,
        perPage: 10,
        search: "",
    });
    const [searchValue, setSearchValue] = useState("");
    const [isSearching, setIsSearching] = useState(false);

    // RTK Query API hooks
    const {
        data: countriesData,
        isLoading,
        isError,
        error,
        isFetching,
    } = useGetCountriesQuery(pagination, {
        refetchOnMountOrArgChange: true,
    });
    const [refreshCountries, { isLoading: isRefreshing }] =
        useRefreshCountriesMutation();
    const [deleteCountry, { isLoading: isDeleting }] =
        useDeleteCountryMutation();

    // Redux hooks – dispatch action and select state
    const dispatch = useDispatch();
    const countriesFromStore = useSelector(
        (state) => state.countries.countries
    );

    // When new countries data is fetched, update redux state
    useEffect(() => {
        if (countriesData && countriesData.data) {
            dispatch(setCountries(countriesData.data));
        }
    }, [countriesData, dispatch]);

    // Handle delete button click
    const handleDeleteClick = (country) => {
        setSelectedCountry(country);
        setDeleteModal(true);
    };

    // Handle delete confirmation
    const handleDeleteConfirm = async () => {
        try {
            await deleteCountry(selectedCountry.id).unwrap();
            toast.success("Country deleted successfully");
            setDeleteModal(false);
            setSelectedCountry(null);
            if (searchValue) {
                setSearchValue("");
                setPagination((prev) => ({
                    ...prev,
                    page: 1,
                    search: "",
                }));
            }
        } catch (err) {
            toast.error(err.data.message);
            console.error("Failed to delete country:", err);
        }
    };

    // Close delete modal
    const handleCloseModal = () => {
        setDeleteModal(false);
        setSelectedCountry(null);
    };

    // Column definitions for react-table
    const columns = useMemo(
        () => [
            {
                Header: "Country Name",
                accessor: "name",
                Cell: ({ cell: { value } }) => <span>{value}</span>,
            },
            {
                Header: "Country Code",
                accessor: "code",
                Cell: ({ cell: { value } }) => <span>{value}</span>,
            },
            {
                Header: "Action",
                accessor: "action",
                Cell: ({ row }) => (
                    <div className="flex space-x-3 rtl:space-x-reverse">
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

    // Determine table data: try redux state first (if available) or fallback to API response
    const tableData = useMemo(() => {
        if (countriesFromStore) {
            return countriesFromStore;
        }
        return countriesData ? countriesData.data : [];
    }, [countriesFromStore, countriesData]);

    const pageCount = useMemo(
        () =>
            countriesData
                ? Math.ceil(countriesData.total / countriesData.per_page)
                : 0,
        [countriesData]
    );

    // Set up react-table
    const tableInstance = useTable(
        {
            columns,
            data: tableData,
            initialState: {
                pageIndex: countriesData ? countriesData.current_page - 1 : 0,
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
        setPagination((prev) => ({ ...prev, page: newPage }));
    };

    const handlePrevious = () => {
        if (countriesData?.prev_page_url) {
            handlePageChange(countriesData.current_page - 1);
        }
    };

    const handleNext = () => {
        if (countriesData?.next_page_url) {
            handlePageChange(countriesData.current_page + 1);
        }
    };

    const handleFirst = () => {
        handlePageChange(1);
    };

    const handleLast = () => {
        handlePageChange(countriesData?.last_page || 1);
    };

    const handleSearch = (value) => {
        setSearchValue(value);
    };

    useEffect(() => {
        console.log("isFetching changed to:", isFetching);
        if (!isFetching) {
            setIsSearching(false);
        }
    }, [isFetching]);

    // Refresh countries from API
    const handleRefreshCountries = async () => {
        try {
            await refreshCountries().unwrap();
            toast.success("Countries refreshed successfully");
        } catch (err) {
            console.error("Failed to refresh countries:", err);
            toast.error(err.data.message);
        }
    };

    // Render pagination buttons
    const renderPaginationButtons = () => {
        if (!countriesData?.links || countriesData.links.length <= 3)
            return null;
        const pageLinks = countriesData.links.filter(
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
                            ? "bg-slate-900 dark:bg-slate-600 dark:text-slate-200 text-white font-medium text-sm rounded leading-[16px] flex h-6 w-6 items-center justify-center transition-all duration-150"
                            : "bg-slate-100 dark:bg-slate-700 dark:text-slate-400 text-slate-900 font-normal text-sm rounded leading-[16px] flex h-6 w-6 items-center justify-center transition-all duration-150"
                    }
                    onClick={() => handlePageChange(parseInt(link.label))}
                >
                    {link.label}
                </button>
            </li>
        ));
    };

    const handlePageSizeChange = (newSize) => {
        setPagination({
            ...pagination,
            page: 1,
            perPage: newSize,
        });
        setPageSize(newSize);
    };

    return (
        <>
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
                    Delete Country
                </h4>
                <div className="text-base text-slate-600 dark:text-slate-300">
                    {selectedCountry ? (
                        <>
                            Are you sure you want to delete{" "}
                            {selectedCountry.name} ({selectedCountry.code})?
                            This action cannot be undone.
                        </>
                    ) : (
                        "Are you sure you want to delete this country? This action cannot be undone."
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
                            placeholder="Search countries..."
                            value={searchValue}
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                        <Button
                            icon="heroicons-outline:refresh"
                            type="button"
                            text="Refresh Countries"
                            isLoading={isLoading || isRefreshing}
                            onClick={handleRefreshCountries}
                            className="btn-primary font-normal btn-sm"
                        />
                    </div>
                </div>
                {isLoading || isSearching ? (
                    <SkeletonTable count={3} />
                ) : isError ? (
                    <div>
                        Error fetching countries:{" "}
                        {error?.data?.message || "Unknown error"}
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto -mx-6">
                            <div className="inline-block min-w-full align-middle">
                                <div className="overflow-hidden">
                                    {countriesData &&
                                    countriesData.data.length > 0 ? (
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
                                                No countries found
                                            </h3>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                                {searchValue
                                                    ? `No results found for "${searchValue}"`
                                                    : "No countries available in the database"}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        {countriesData && countriesData.data.length > 0 && (
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
                                            {countriesData
                                                ? countriesData.current_page
                                                : 0}{" "}
                                            of{" "}
                                            {countriesData
                                                ? countriesData.last_page
                                                : 0}
                                        </span>
                                    </span>
                                </div>
                                <ul className="flex items-center space-x-3 rtl:space-x-reverse">
                                    <li>
                                        <button
                                            className={
                                                !countriesData?.prev_page_url
                                                    ? "opacity-50 cursor-not-allowed"
                                                    : ""
                                            }
                                            onClick={handleFirst}
                                            disabled={
                                                !countriesData?.prev_page_url
                                            }
                                        >
                                            <Icon icon="heroicons:chevron-double-left-solid" />
                                        </button>
                                    </li>
                                    <li>
                                        <button
                                            className={
                                                !countriesData?.prev_page_url
                                                    ? "opacity-50 cursor-not-allowed"
                                                    : ""
                                            }
                                            onClick={handlePrevious}
                                            disabled={
                                                !countriesData?.prev_page_url
                                            }
                                        >
                                            Prev
                                        </button>
                                    </li>
                                    {renderPaginationButtons()}
                                    <li>
                                        <button
                                            className={
                                                !countriesData?.next_page_url
                                                    ? "opacity-50 cursor-not-allowed"
                                                    : ""
                                            }
                                            onClick={handleNext}
                                            disabled={
                                                !countriesData?.next_page_url
                                            }
                                        >
                                            Next
                                        </button>
                                    </li>
                                    <li>
                                        <button
                                            onClick={handleLast}
                                            disabled={
                                                !countriesData?.next_page_url
                                            }
                                            className={
                                                !countriesData?.next_page_url
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

export default Countries;
