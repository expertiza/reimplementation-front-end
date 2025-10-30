import React, { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import Table from "components/Table/Table";
import { Button, Spinner } from "react-bootstrap";
import { BsBookmark, BsBookmarkFill } from "react-icons/bs";

export interface TeamMember { id: string; name?: string }
export interface Team { teamId: string; members: TeamMember[] }

export interface TopicRow {
  id: string;
  name: string;
  url?: string;
  description?: string;
  availableSlots: number;
  waitlistCount: number;
  assignedTeams?: Team[];
  waitlistedTeams?: Team[];
  isTaken?: boolean;
  isBookmarked?: boolean;
  isSelected?: boolean;
}

type Mode = "student" | "instructor";

interface TopicsTableProps {
  data: TopicRow[];
  mode: Mode;
  showPaginationThreshold?: number;
  // Student actions
  onBookmarkToggle?: (topicId: string) => void;
  onSelectTopic?: (topicId: string) => void;
  isSigningUp?: boolean;
  selectedTopicId?: string | null;
  showBookmarks?: boolean; // Control whether to show bookmarks column in student view
  // Instructor actions: renderer receives row to render custom actions (edit/delete/drop etc.)
  renderInstructorActions?: (row: TopicRow) => React.ReactNode;
  // Selection support (instructor bulk actions)
  selectable?: boolean;
  selectAll?: boolean;
  isRowSelected?: (id: string) => boolean;
  onToggleAll?: () => void;
  onToggleRow?: (id: string) => void;
  // Extra columns (e.g., Questionnaire, Num. slots)
  extraColumns?: ColumnDef<TopicRow>[];
  // Expandable row details renderer
  renderDetails?: (row: TopicRow) => React.ReactNode;
  // Optional sizing passthrough for underlying Table
  tableSize?: { span: number; offset: number };
}

const TopicsTable: React.FC<TopicsTableProps> = ({
  data,
  mode,
  showPaginationThreshold = 10,
  onBookmarkToggle,
  onSelectTopic,
  isSigningUp,
  selectedTopicId,
  showBookmarks = true,
  renderInstructorActions,
  selectable = false,
  selectAll = false,
  isRowSelected,
  onToggleAll,
  onToggleRow,
  extraColumns = [],
  renderDetails,
  tableSize,
}) => {
  const baseColumns: ColumnDef<TopicRow>[] = useMemo(() => [
    {
      accessorKey: "id",
      header: "Topic ID",
      cell: ({ row }) => <span style={{ whiteSpace: "nowrap" }}>{row.original.id}</span>,
    },
    {
      accessorKey: "name",
      header: "Topic Names",
      cell: ({ row }) => (
        <span>{row.original.name}</span>
      ),
    },
  ], []);

  const studentColumns: ColumnDef<TopicRow>[] = useMemo(() => {
    return [
      ...baseColumns,
      {
        id: "availableSlots",
        header: "Available Slots",
        cell: ({ row }) => (
          <span className="d-block text-center" style={{ whiteSpace: "nowrap" }}>
            {row.original.availableSlots}
          </span>
        ),
      },
      {
        id: "waitlistCount",
        header: "Num. of Waitlist",
        cell: ({ row }) => (
          <span className="d-block text-center" style={{ whiteSpace: "nowrap" }}>
            {row.original.waitlistCount}
          </span>
        ),
      },
      ...(showBookmarks ? [{
        id: "bookmark",
        header: "Bookmarks",
        cell: ({ row }) => (
          <div className="text-center" style={{ whiteSpace: "nowrap" }}>
            <Button
              variant="link"
              size="sm"
              onClick={() => onBookmarkToggle?.(row.original.id)}
              className="p-0"
              style={{ border: "none", background: "none" }}
              aria-label={row.original.isBookmarked ? "Remove bookmark" : "Add bookmark"}
            >
              {row.original.isBookmarked ? (
                <BsBookmarkFill size={20} color="#007bff" />
              ) : (
                <BsBookmark size={20} color="#6c757d" />
              )}
            </Button>
          </div>
        ),
        enableSorting: false,
        enableColumnFilter: false,
      } as ColumnDef<TopicRow>] : []),
      {
        id: "select",
        header: "Select",
        cell: ({ row }) => {
          const t = row.original;
          const disabled = t.isTaken || !!isSigningUp;
          const isThisSigning = !!isSigningUp && selectedTopicId === t.id;
          return (
            <div className="text-center" style={{ whiteSpace: "nowrap" }}>
              <Button
                variant="link"
                size="sm"
                onClick={() => onSelectTopic?.(t.id)}
                className="p-0"
                style={{ border: "none", background: "none" }}
                disabled={disabled}
                aria-label={t.isSelected ? "Deselect topic" : "Select topic"}
              >
                {isThisSigning ? (
                  <Spinner size="sm" animation="border" />
                ) : t.isSelected ? (
                  <img src="/assets/images/delete-icon-24.png" alt="Deselect" width={20} height={20} />
                ) : (
                  <img src="/assets/icons/Check-icon.png" alt="Select" width={20} height={20} />
                )}
              </Button>
            </div>
          );
        },
        enableSorting: false,
        enableColumnFilter: false,
      },
    ];
  }, [baseColumns, isSigningUp, onBookmarkToggle, onSelectTopic, selectedTopicId, showBookmarks]);

  const instructorColumns: ColumnDef<TopicRow>[] = useMemo(() => {
    return [
      // Optional selection column for bulk operations
      ...(selectable
        ? [{
            id: "select",
            header: () => (
              <input
                type="checkbox"
                aria-label="Select all topics"
                checked={!!selectAll}
                onChange={() => onToggleAll?.()}
              />
            ),
            cell: ({ row }) => (
              <input
                type="checkbox"
                aria-label={`Select topic ${row.original.id}`}
                checked={!!isRowSelected?.(row.original.id)}
                onChange={() => onToggleRow?.(row.original.id)}
              />
            ),
            enableSorting: false,
            enableColumnFilter: false,
          } as ColumnDef<TopicRow>] : []),
      ...baseColumns,
      ...extraColumns,
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="d-flex align-items-center" style={{ gap: 8 }}>
            {renderInstructorActions?.(row.original)}
          </div>
        ),
        enableSorting: false,
        enableColumnFilter: false,
      },
    ];
  }, [baseColumns, renderInstructorActions, selectable, selectAll, isRowSelected, onToggleAll, onToggleRow, extraColumns]);

  const columns = mode === "student" ? studentColumns : instructorColumns;

  return (
    <Table
      data={data}
      columns={columns as ColumnDef<any, any>[]}
      showGlobalFilter={false}
      showColumnFilter={true}
      showPagination={true}
      renderSubComponent={renderDetails ? ({ row }) => renderDetails(row.original as TopicRow) : undefined}
      getRowCanExpand={renderDetails ? (row) => {
        const r = row.original as TopicRow;
        return !!((r.assignedTeams && r.assignedTeams.length) || (r.waitlistedTeams && r.waitlistedTeams.length));
      } : undefined}
      tableSize={tableSize}
    />
  );
};

export default TopicsTable;
