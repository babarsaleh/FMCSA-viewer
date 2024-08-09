import React, { useState, useEffect, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Paper,
  TableSortLabel,
  CircularProgress,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { loadData } from "../utils/loadData";
import { styled } from "@mui/material/styles";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import "./style.css";

const columns = [
  {
    id: "created_dt",
    label: "Created_DT",
    format: (value) => new Date(value).toLocaleString(),
  },
  {
    id: "data_source_modified_dt",
    label: "Modified_DT",
    format: (value) => new Date(value).toLocaleString(),
  },
  { id: "entity_type", label: "Entity" },
  { id: "operating_status", label: "Operating status" },
  { id: "legal_name", label: "Legal name" },
  { id: "dba_name", label: "DBA name" },
  { id: "physical_address", label: "Physical address" },
  { id: "phone", label: "Phone" },
  { id: "usdot_number", label: "DOT" },
  { id: "mc_mx_ff_number", label: "MC/MX/FF" },
  { id: "power_units", label: "Power units" },
  { id: "out_of_service_date", label: "Out of service date" },
];

const EnhancedTableContainer = styled(TableContainer)(({ theme }) => ({
  maxHeight: 500,
}));

const FMCSATable = () => {
  const [data, setData] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [displayedRecords, setDisplayedRecords] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("");
  const [filterText, setFilterText] = useState("");
  const [columnFilters, setColumnFilters] = useState({});
  const [columnsConfig, setColumnsConfig] = useState(columns);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewName, setViewName] = useState("");
  const [savedViews, setSavedViews] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const data = await loadData();
        setData(data);
        setTotalRecords(data.length); // Set total records from fetched data
        setDisplayedRecords(data.length); // Set displayed records initially to total
      } catch (error) {
        console.error("Error fetching data:", error);
      }
      setIsLoading(false);
    };

    fetchData();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const viewId = params.get("view");

    if (viewId) {
      const savedView = JSON.parse(localStorage.getItem(`view_${viewId}`));
      if (savedView) {
        setColumnsConfig(savedView.columnsConfig);
        setFilterText(savedView.filterText);
        setColumnFilters(savedView.columnFilters);
        setOrder(savedView.order);
        setOrderBy(savedView.orderBy);
        setPage(savedView.page);
        setRowsPerPage(savedView.rowsPerPage);
        setData(savedView.filteredData || []); // Load filtered data

        // Set input fields values
        if (savedView.filterText) {
          document.getElementById("global-search-input").value =
            savedView.filterText;
        }
        Object.keys(savedView.columnFilters).forEach((columnId) => {
          const inputField = document.getElementById(
            `filter-input-${columnId}`
          );
          if (inputField) {
            inputField.value = savedView.columnFilters[columnId];
          }
        });
      }
    }
  }, []);

  const generateUniqueId = () => {
    return Date.now().toString(36);
  };

  useEffect(() => {
    const views = Object.keys(localStorage);
    setSavedViews(views);
  }, []);

  const handleGenerateShareLink = () => {
    const uniqueId = generateUniqueId(); // Implement this function to create a unique identifier
    const filteredData = filterData(sortedData(data)); // Get filtered data
    const viewConfig = {
      columnsConfig,
      filterText,
      columnFilters,
      order,
      orderBy,
      page,
      rowsPerPage,
      filteredData,
    };

    // Save viewConfig to backend or localStorage
    // For simplicity, we'll use localStorage
    localStorage.setItem(`view_${uniqueId}`, JSON.stringify(viewConfig));

    const shareLink = `${window.location.href.split("?")[0]}?view=${uniqueId}`;
    prompt("Share this link with others:", shareLink);
  };

  useEffect(() => {
    if (!filterText && !Object.keys(columnFilters).length) {
      // Reset pagination and displayedRecords when filters are cleared
      setDisplayedRecords(totalRecords);
      setPage(0);
    }
  }, [filterText, columnFilters, totalRecords]);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (event) => {
    setFilterText(event.target.value);
  };

  const handleColumnFilterChange = (event, columnId) => {
    setColumnFilters({
      ...columnFilters,
      [columnId]: event.target.value,
    });
  };

  const filterData = useCallback((data) => {
    return data.filter((row) => {
      const globalSearch = Object.values(row).some(
        (value) =>
          value &&
          value.toString().toLowerCase().includes(filterText.toLowerCase())
      );

      const columnFilterSearch = Object.entries(columnFilters).every(
        ([key, value]) =>
          row[key] &&
          row[key].toString().toLowerCase().includes(value.toLowerCase())
      );

      return globalSearch && columnFilterSearch;
    });
  }, [filterText, columnFilters]);

  const sortedData = useCallback((data) => {
    if (!orderBy) return data;
    return data.sort((a, b) => {
      const aValue = a[orderBy] || "";
      const bValue = b[orderBy] || "";
      if (order === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      }
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    });
  }, [order, orderBy]);
  useEffect(() => {
    // Update displayed records based on filtered data
    const filtered = filterData(sortedData(data));
    setDisplayedRecords(filtered.length);
    setPage(0); // Reset to first page
  }, [filterText, columnFilters, data, filterData, sortedData ]);
  const filteredData = filterData(sortedData(data));
  const displayedData = filteredData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const reorderedColumns = Array.from(columnsConfig);
    const [movedColumn] = reorderedColumns.splice(result.source.index, 1);
    reorderedColumns.splice(result.destination.index, 0, movedColumn);

    setColumnsConfig(reorderedColumns);
  };

  const handleSaveView = () => {
    if (!viewName) {
      alert("Please enter a name to filter/search data to save.");
      return;
    }
    const currentView = {
      columnsConfig,
      filterText,
      columnFilters,
      order,
      orderBy,
      page,
      rowsPerPage,
    };
    localStorage.setItem(viewName, JSON.stringify(currentView));
    setSavedViews([...savedViews, viewName]);

    alert(`Search / Filter Data '${viewName}' saved.`);
    setViewName(''); // Reset view name input field
    
  };

  const handleLoadView = (name) => {
    const savedView = JSON.parse(localStorage.getItem(name));
    if (savedView) {
      setColumnsConfig(savedView.columnsConfig);
      setFilterText(savedView.filterText);
      setColumnFilters(savedView.columnFilters);
      setOrder(savedView.order);
      setOrderBy(savedView.orderBy);
      setPage(savedView.page);
      setRowsPerPage(savedView.rowsPerPage);
      alert(`View '${name}' loaded.`);

       // Set input fields values
       if (savedView.filterText) {
        document.getElementById("global-search-input").value =
          savedView.filterText;
      }
      Object.keys(savedView.columnFilters).forEach((columnId) => {
        const inputField = document.getElementById(
          `filter-input-${columnId}`
        );
        if (inputField) {
          inputField.value = savedView.columnFilters[columnId];
        }
      });


    } else {
      alert(`No saved data found with the name '${name}'.`);
    }
  };

  const handleResetView = () => {
    setColumnsConfig(columns);
    setFilterText("");
    setColumnFilters({});
    setOrder("asc");
    setOrderBy("");
    setPage(0);
    setRowsPerPage(10);
    setDisplayedRecords(totalRecords);

    document
      .querySelectorAll('input[type="text"]')
      .forEach((input) => (input.value = ""));

    alert("View reset to default.");
  };

  const handleDeleteView = (name) => {
    localStorage.removeItem(name);
    setSavedViews(savedViews.filter((view) => view !== name));
    alert(`View '${name}' deleted.`);
  };

  const totalCount =
    filterText || Object.keys(columnFilters).length
      ? displayedRecords
      : totalRecords;

  return (
    <Paper>
      <Button
        onClick={() => setModalOpen(true)}
        variant="contained"
        color="primary"
      >
        Save Filtered Data
      </Button>
      <Button
        onClick={handleResetView}
        variant="contained"
        color="secondary"
        sx={{ marginLeft: "15px" }}
      >
        Reset All Search Fields
      </Button>
      <Button
        onClick={handleGenerateShareLink}
        variant="contained"
        color="primary"
        sx={{ marginLeft: "15px" }}
      >
        Generate Share Link
      </Button>
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)}>
        <DialogTitle>Manage Saved Search/Filter Data</DialogTitle>
        <DialogContent>
          <TextField
            label="Name to save filter data"
            variant="outlined"
            fullWidth
            margin="normal"
            value={viewName}
            onChange={(event) => setViewName(event.target.value)}
          />
          <div style={{ marginTop: "20px" }}>
            {savedViews.map((name, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "10px",
                }}
              >
                <span>{name}</span>
                <div>
                  <Button
                    onClick={() => handleLoadView(name)}
                    variant="outlined"
                    color="primary"
                    size="small"
                    style={{ marginRight: "10px" }}
                  >
                    Load
                  </Button>
                  <Button
                    onClick={() => handleDeleteView(name)}
                    variant="outlined"
                    color="secondary"
                    size="small"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSaveView} variant="contained" color="primary">
            Save Filtered Data
          </Button>
          <Button
            onClick={handleResetView}
            variant="contained"
            color="secondary"
          >
            Reset All Search Fields
          </Button>
          <Button onClick={() => setModalOpen(false)} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
      <TextField
        id="global-search-input"
        label="Search"
        variant="outlined"
        fullWidth
        margin="normal"
        onChange={handleFilterChange}
      />
      <EnhancedTableContainer>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="columns" direction="horizontal">
            {(provided) => (
              <Table {...provided.droppableProps} ref={provided.innerRef}>
                <TableHead>
                  <TableRow>
                    {columnsConfig.map((column, index) => (
                      <Draggable
                        key={column.id}
                        draggableId={column.id}
                        index={index}
                      >
                        {(provided) => (
                          <TableCell
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            sortDirection={
                              orderBy === column.id ? order : false
                            }
                          >
                            <TableSortLabel
                              active={orderBy === column.id}
                              direction={orderBy === column.id ? order : "asc"}
                              onClick={(event) =>
                                handleRequestSort(event, column.id)
                              }
                            >
                              {column.label}
                            </TableSortLabel>
                            <TextField
                              id={`filter-input-${column.id}`}
                              variant="outlined"
                              size="small"
                              placeholder={`Filter ${column.label}`}
                              onChange={(event) =>
                                handleColumnFilterChange(event, column.id)
                              }
                            />
                          </TableCell>
                        )}
                      </Draggable>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={columnsConfig.length} align="center">
                        <CircularProgress />
                      </TableCell>
                    </TableRow>
                  ) : (
                    displayedData.map((row, index) => (
                      <TableRow hover key={index}>
                        {columnsConfig.map((column) => {
                          const value = row[column.id];
                          return (
                            <TableCell key={column.id}>
                              {column.format && typeof value === "string"
                                ? column.format(value)
                                : value || "N/A"}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </Droppable>
        </DragDropContext>
      </EnhancedTableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={totalCount}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
};

export default FMCSATable;
