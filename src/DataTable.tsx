import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";

import {
    faTrash, faPlus, faMinus, faTimes, faChevronUp, faChevronDown, faEdit
  } from '@fortawesome/free-solid-svg-icons';
  import { library } from '@fortawesome/fontawesome-svg-core';
  library.add(
    faTrash, faPlus, faMinus, faTimes, faChevronUp, faChevronDown, faEdit
  );
  
  // Export something so it's a module or something, and add a function so I can do something lol
  export const Library = { library, noop: () => { } };

export const getYearMonthDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
}


const SimpleStyledTable = styled.table`
  th {
    text-align: center;
  }
  th,td {
    padding: 5px;
  }
  tbody tr:nth-child(2n + 1) {
    background-color: #FAF8FF;
  }
  input {
    width: 150px;
  }
`;
const ReorderCell = styled.td`
  display: flex;
  flex-direction: column;

  > button {
    height: 20px;
    width: 40px;
    padding: 0;
  }
`;

interface Props {
  data: any[] | null | undefined;
  columns?: DataTableColumnDef[];

  // If provided, will be used as the list of columns, otherwise automatically computed
  keys?: string[];

  /** If enabled, you must also provide onRowChange  */
  enableEdit?: boolean;
  enableAdd?: boolean;

  onRowChange?: (updatedRow: any, index: number) => void;

  /** If provided, there will be a delete icon */
  onRowDelete?: (index: number) => void;
}
/**
 * Returns a non-customized simple data view of the entire array of objects
 */
export const SimpleDataTable = (props: Props) => {
  const keys = props.keys || props.columns?.map(c => c.key) || listAllKeys(props.data);

  const [editIndex, setEditIndex] = React.useState(-1);
  const [editData, setEditData] = React.useState<any>({});
  const data = props.data?.filter(row => !!row) || [];

  // This shouldn't be necessary, but some consumers seem to be passing
  // null rows and I want to make sure not to break any end users.
  const normalizeNullishRows = () => {
    let changed = false;
    props.data.forEach((d, i) => {
      if (!d) {
        props.onRowDelete(i);
        changed = true;
      }
    });
    return changed;
  }

  const onAddNewRow = () => {
    if (normalizeNullishRows()) {
      return;
    }

    if (editData && editIndex >= 0) {
      props.onRowChange?.(editData, editIndex);
    }

    const newData: any = {};
    keys.forEach(k => { newData[k] = ""; });

    props.onRowChange?.(newData, data?.length || 0);
    setEditIndex(data?.length || 0);
    setEditData(newData);
  };

  const onDeleteRow = (index: number) => {
    if (normalizeNullishRows()) {
      return;
    }
    const ok = confirm("Are you sure you want to remove this row?");
    if (ok) {
      props.onRowDelete?.(index);
    }
  }

  return (
    <>
      <SimpleStyledTable>
        <thead>
          <tr>
            {keys.map(k => <th key={k}>{k}</th>)}
          </tr>
        </thead>
        <tbody>
          {
            data && data.map((row, index) => index === editIndex ? (
              <tr key={"" + index}>
                {keys.map(k => <td key={k}>
                  {(typeof row[k] === "string" || !row[k]) ? (
                    <input type="text" value={editData[k]} onChange={(e) => {
                      const newData = { ...editData };
                      newData[k] = e.target.value
                      setEditData(newData);
                    }} />) : (
                    String(row[k])
                  )}
                </td>)}
                {props.enableEdit && (<td>
                  <button className="inline secondary"
                    title="Confirm changes"
                    onClick={() => {
                      setEditIndex(-1);
                      props.onRowChange?.(editData, index);
                      setEditData({});
                    }}>
                    <FontAwesomeIcon icon="check" />
                  </button>
                  <button className="inline secondary"
                    title="Cancel changes"
                    onClick={() => {
                      setEditIndex(-1);
                      setEditData({});
                    }}
                  ><FontAwesomeIcon icon="times" />
                  </button>
                </td>)}
              </tr>
            ) : (
              <tr key={"" + index}>
                {keys.map(k => <td key={k}>{String(row[k])}</td>)}
                {props.enableEdit && (<td>
                  <button className="inline secondary" title="Start editing"
                    onClick={() => {
                      if (editData && editIndex >= 0) {
                        props.onRowChange?.(editData, editIndex);
                      }
                      setEditData({ ...row });
                      setEditIndex(index);
                    }}>
                    <FontAwesomeIcon icon="edit" />
                  </button>
                  {props.onRowDelete && <button className="inline secondary"
                    title="Delete row"
                    onClick={() => onDeleteRow(index)}>
                    <FontAwesomeIcon icon="trash" />
                  </button>
                  }
                </td>)}
              </tr>
            ))
          }
        </tbody>
      </SimpleStyledTable>
      {props.enableAdd && props.onRowChange && <div>
        <button className="inline secondary" onClick={onAddNewRow}>
          <FontAwesomeIcon icon="plus" /> Add row
        </button>
      </div>}
    </>
  );
};

export const listAllKeys = (data?: any[]): string[] => {
  return Array.from(data?.reduce((acc: Set<string>, cur: any) => {
    Object.keys(cur).forEach(key => acc.add(key));
    return acc;
  }, new Set()) || []);
};

export type DataTableColumn = DataTableColumnDef | string;

export interface DataTableColumnDef {
  label: string;
  tooltip?: string;

  // If provided, will wrap the cell contents in a Link
  href?: (data: any) => string

  // One of key or renderer must be provided
  key?: string;
  type?: "paragraph" | "date" | "text" | "email" | "tel";
  // TODO: Support "file" with the appropriate metadata and AttachmentLink

  renderer?: (data: any, index: number) => React.ReactNode;

  hidden?: boolean; // Set to false to hide the column, ex for a particular user
}
export interface DataTableProps {
  columns: DataTableColumn[];
  data: any[];

  canExpand?: boolean;
  renderExpandedRow?: (data: any, index: number) => React.ReactNode;

  /** If provided, there will be a delete icon. */
  onRowDelete?: (index: number) => void;

  /** 
   * If provided, there will be a reorder handle.
   * A call of onReorder represents a single item moving,
   * which may cause other items to be shifted also.
   */
  onReorder?: (oldIndex: number, newIndex: number) => void;
}
export const DataTable = (props: DataTableProps) => {
  const [expandedIndex, setExpandedIndex] = React.useState(-1);

  const columns = props.columns.map(col => {
    if (typeof col == "string") {
      return {
        key: col,
        label: col
      } as DataTableColumnDef;
    }
    return col;
  }).filter(col => !col.hidden);
  return (<SimpleStyledTable>
    <thead>
      <tr>
        {props.onReorder && <th></th>}
        {props.canExpand && <th>Expand</th>}
        {columns.map((col) => (<th title={col.tooltip} key={col.label}>
          {col.label}
        </th>))}
        {props.onRowDelete && <th>Tools</th>}
      </tr>
    </thead>
    <tbody>
      {props.data.map((data, index) => {
        return (<React.Fragment key={index + ""}>
          <tr>
            {props.onReorder && <ReorderCell>
              <button onClick={() => props.onReorder(index, index - 1)}>
                <FontAwesomeIcon icon="chevron-up" />
              </button>
              <button onClick={() => props.onReorder(index, index + 1)}>
                <FontAwesomeIcon icon="chevron-down" />
              </button>
            </ReorderCell>}
            {props.canExpand && ((<td>
              <button
                className={"inline " + (index === expandedIndex ? "" : "secondary")}
                onClick={() => {
                  setExpandedIndex(index === expandedIndex ? -1 : index);
                }}>
                <FontAwesomeIcon icon={index === expandedIndex ? "minus" : "plus"} />
              </button>
            </td>))}
            {columns.map((col, columnIndex) => {
              let content: any = "";
              let style: React.CSSProperties | undefined = undefined;
              if (col.key) {
                if (col.type === "date") {
                  content = getYearMonthDate(data[col.key]);
                } else if (col.type === "paragraph" && data[col.key]) {
                  style = { cursor: "pointer" };
                  // eslint-disable-next-line
                  content = <a onClick={() => alert(data[col.key])}>{data[col.key].slice(0, 8)}...</a>;
                } else if (!col.type && Array.isArray(data[col.key])) {
                  content = data[col.key].join(", ");
                } else {
                  content = data[col.key];
                }
              }
              if (col.renderer) {
                content = col.renderer?.(data, index);
              }

              if (col.href) {
                const to = col.href(data);
                if (to) {
                  content = <Link to={to}>{content}</Link>
                }
              }

              return <td key={"" + columnIndex} style={style}>{content}</td>
            })}
            {props.onRowDelete && <td><button className="inline secondary"
              title="Delete row"
              onClick={() => {
                const ok = confirm("Are you sure you want to remove this row?");
                if (ok) {
                  props.onRowDelete?.(index);
                }
              }}>
              <FontAwesomeIcon icon="trash" />
            </button>
            </td>
            }
          </tr>
          {
            index === expandedIndex && (
              <>
                <tr>
                  <td colSpan={100}>
                    {props.renderExpandedRow(data, index)}
                  </td>
                </tr>
                <tr><td colSpan={100}></td></tr>
              </>
            )
          }
        </React.Fragment>);
      })}
    </tbody>
  </SimpleStyledTable>)
}