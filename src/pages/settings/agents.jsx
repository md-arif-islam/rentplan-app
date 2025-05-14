import SkeletionTable from "@/components/skeleton/Table";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import Tooltip from "@/components/ui/Tooltip";
import {
    useDeleteAgentMutation,
    useGetAgentsQuery,
} from "@/store/api/agents/agentsApiSlice";
import { useEffect, useMemo, useState } from "react";

import Modal from "@/components/ui/Modal";
import { setAgent } from "@/store/api/agents/agentsSlice";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useCustomTable } from "../common/useCustomTable";

function Agents({ title = "Agents" }) {
    const [searchValue, setSearchValue] = useState("");
    const [isSearching, setIsSearching] = useState(false);

    const [deleteModal, setDeleteModal] = useState(false);
    const [pagination, setPagination] = useState({
        page: 1,
        perPage: 10,
        search: "",
    });
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const {
        data: agents,
        isLoading,
        isError,
        isFetching,
        error,
    } = useGetAgentsQuery(pagination);

    const [deleteAgent, { isLoading: isDeleting }] = useDeleteAgentMutation();

    const handleSearch = (value) => {
        setSearchValue(value);
    };

    // Delete modal handlers
    const handleDeleteClick = (agent) => {
        dispatch(setAgent(agent));
        setDeleteModal(true);
    };

    const handleCloseModal = () => {
        setDeleteModal(false);
        dispatch(setAgent(null));
    };

    const selectedAgent = useSelector((state) => state.agents.agent);

    const handleDeleteConfirm = async () => {
        if (!selectedAgent) return;
        try {
            await deleteAgent(selectedAgent.id).unwrap();
            toast.success(`Agent ${selectedAgent.name} deleted successfully!`);
            setDeleteModal(false);
            dispatch(setAgent(null));
        } catch (error) {
            toast.error(error?.data?.message || "Failed to delete agent");
            console.log(error);
        }
    };

    // Table Configuration
    const columns = useMemo(
        () => [
            {
                Header: "Agent Name",
                accessor: "name",
                Cell: ({ cell: { value } }) => <span>{value}</span>,
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
                                        `/admin/agents/${row.original.id}/edit`
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
        dataVar: agents,
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
                    Delete Agent
                </h4>
                <div className="text-base text-slate-600 dark:text-slate-300">
                    {selectedAgent ? (
                        <>
                            Are you sure you want to delete{" "}
                            <strong>{selectedAgent.name}</strong>? This action
                            cannot be undone.
                        </>
                    ) : (
                        "Are you sure you want to delete this agent? This action cannot be undone."
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
                                navigate("/admin/agents/create");
                            }}
                        />
                    </div>
                </div>
                {isLoading || isFetching ? (
                    <SkeletionTable count={4} />
                ) : isError ? (
                    <div>
                        Error fetching agents:{" "}
                        {error?.data?.message || "Unknown error"}
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto -mx-6">
                            <div className="inline-block min-w-full align-middle">
                                <div className="overflow-hidden">
                                    {agents && agents.data.length > 0 ? (
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
                                                No agents found
                                            </h3>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                                {searchValue
                                                    ? `No results found for "${searchValue}"`
                                                    : "No agents available in the database"}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        {agents && agents.data.length > 0 && (
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
                                            {agents ? agents.current_page : 0}{" "}
                                            of {agents ? agents.last_page : 0}
                                        </span>
                                    </span>
                                </div>
                                <ul className="flex items-center space-x-3 rtl:space-x-reverse">
                                    <li>
                                        <button
                                            className={
                                                !agents?.prev_page_url
                                                    ? "opacity-50 cursor-not-allowed"
                                                    : ""
                                            }
                                            onClick={handleFirst}
                                            disabled={!agents?.prev_page_url}
                                        >
                                            <Icon icon="heroicons:chevron-double-left-solid" />
                                        </button>
                                    </li>
                                    <li>
                                        <button
                                            className={
                                                !agents?.prev_page_url
                                                    ? "opacity-50 cursor-not-allowed"
                                                    : ""
                                            }
                                            onClick={handlePrevious}
                                            disabled={!agents?.prev_page_url}
                                        >
                                            Prev
                                        </button>
                                    </li>
                                    {renderPaginationButtons()}
                                    <li>
                                        <button
                                            className={
                                                !agents?.next_page_url
                                                    ? "opacity-50 cursor-not-allowed"
                                                    : ""
                                            }
                                            onClick={handleNext}
                                            disabled={!agents?.next_page_url}
                                        >
                                            Next
                                        </button>
                                    </li>
                                    <li>
                                        <button
                                            onClick={handleLast}
                                            disabled={!agents?.next_page_url}
                                            className={
                                                !agents?.next_page_url
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

export default Agents;
