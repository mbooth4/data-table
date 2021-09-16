import * as React from "react";
import { hot } from "react-hot-loader";
import { DataTable, DataTableColumn } from "../DataTable";
import "./../assets/scss/App.scss";

const INITIAL_DATA = [
  { id: 1, name: "Adam", age: 33 },
  { id: 2, name: "Becky", age: 27 },
  { id: 3, name: "Cathy", age: 42 },
];
const columnConfig: DataTableColumn[] = [
  {
    label: "Identifier",
    renderer: (row) => <span>#{row.id}</span>
  },
  {
    label: "Name",
    key: "name"
  },
  "age"
];

export const App = () => {
  const [data, setData] = React.useState(INITIAL_DATA);
  return (
    <div className="app">
      <h3>Data Table Demo</h3>
      <DataTable data={data} columns={columnConfig}
        onReorder={(oldIndex, newIndex) => {
          const updatedData = [...data];
          const item = updatedData.splice(oldIndex, 1)[0];
          updatedData.splice(newIndex, 0, item);
          setData(updatedData);
        }} />
    </div>
  );
}

declare let module: Record<string, unknown>;

export default hot(module)(App);
