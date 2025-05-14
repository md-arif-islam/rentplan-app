// useCustomTable.jsx
import { useMemo } from "react";
import {
    useGlobalFilter,
    usePagination,
    useRowSelect,
    useSortBy,
    useTable,
} from "react-table";

export const useCustomTable = ({
    dataVar,
    columns,
    pagination,
    setPagination,
}) => {
    // Compute the table data and page count.
    const data = useMemo(() => (dataVar ? dataVar.data : []), [dataVar]);
    const pageCount = useMemo(
        () => (dataVar ? Math.ceil(dataVar.total / dataVar.per_page) : 0),
        [dataVar]
    );

    // Create the table instance.
    const tableInstance = useTable(
        {
            columns,
            data,
            initialState: {
                pageIndex: dataVar ? dataVar.current_page - 1 : 0,
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

    // Define pagination handlers.
    const handlePageSizeChange = (newSize) => {
        setPagination({
            ...pagination,
            page: 1,
            perPage: newSize,
        });
        setPageSize(newSize);
    };

    const handlePageChange = (newPage) => {
        setPagination((prev) => ({
            ...prev,
            page: newPage,
        }));
    };

    const handleFirst = () => {
        handlePageChange(1);
    };

    const handleLast = () => {
        handlePageChange(dataVar?.last_page || 1);
    };

    const handlePrevious = () => {
        if (dataVar?.prev_page_url) {
            handlePageChange(dataVar.current_page - 1);
        }
    };

    const handleNext = () => {
        if (dataVar?.next_page_url) {
            handlePageChange(dataVar.current_page + 1);
        }
    };

    // Render pagination buttons based on API response links.
    const renderPaginationButtons = () => {
        if (!dataVar?.links || dataVar.links.length <= 3) return null;
        const pageLinks = dataVar.links.filter(
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

    return {
        // Table instance properties.
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
    };
};
