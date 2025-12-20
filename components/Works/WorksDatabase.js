import React from "react"

import { Typography, Button, Card } from "@mui/material"
import { DataGrid } from "@mui/x-data-grid"

export default class PostsDatabase extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      posts: [],
      post: null,
    }
  }

  componentDidMount() {}
  componentWillUnmount() {}

  styles() {
    const ACCENT = "#6BAA6A"
    const GLASS = "rgba(255,255,255,0.04)"
    const BORDER = "rgba(107,170,106,0.22)"

    return {
      tableCard: {
        borderRadius: 22,
        border: `1px solid ${BORDER}`,
        background: `linear-gradient(180deg, ${GLASS}, rgba(255,255,255,0.02))`,
        padding: 17,
        margin: 5,
        position: "relative",
        overflow: "hidden",
      },
      cardGlow: {
        position: "absolute",
        inset: -2,
        background:
          "radial-gradient(600px 240px at 0% 0%, rgba(107,170,106,0.16), rgba(0,0,0,0))," +
          "radial-gradient(600px 240px at 100% 0%, rgba(255,114,143,0.10), rgba(0,0,0,0))",
        pointerEvents: "none",
      },

      actionBtn: {
        borderRadius: 15,
        border: `1px solid ${BORDER}`,
        padding: "6px 12px",
        color: ACCENT,
        textTransform: "none",
        background: "rgba(0,0,0,0.10)",
        backdropFilter: "blur(8px)",
        boxShadow: "none",
        minWidth: 0,
      },

      // Right-shift helper for the plain text columns
      rightShiftCell: {
        paddingLeft: 14, // increase to push content right
      },

      gridSx: {
        border: "none",
        backgroundColor: "transparent",

        // Make ALL grid text the same green
        color: ACCENT,
        "& .MuiDataGrid-columnHeader, & .MuiDataGrid-cell": {
          color: ACCENT,
        },
        "& .MuiDataGrid-columnHeaderTitle": {
          fontWeight: 900,
          letterSpacing: 0.2,
        },

        "& .MuiDataGrid-columnHeaders": {
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.22), rgba(0,0,0,0.10))",
          borderBottom: "1px solid rgba(107,170,106,0.18)",
          borderRadius: 14,
        },

        // Remove the "stray divider" (the resizer/separator line)
        "& .MuiDataGrid-columnSeparator": {
          display: "none !important",
        },

        // Header label padding (horizontal only) — avoids clipping
        "& .MuiDataGrid-columnHeaderTitleContainer": {
          paddingLeft: 2,
          paddingRight: 12,
        },

        "& .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-cell:focus": {
          outline: "none",
        },

        "& .MuiDataGrid-cell": {
          borderBottom: "1px solid rgba(107,170,106,0.12)",
        },
        "& .MuiDataGrid-row:hover": {
          backgroundColor: "rgba(107,170,106,0.08)",
        },
        "& .MuiDataGrid-row.Mui-selected": {
          backgroundColor: "rgba(107,170,106,0.10)",
        },
        "& .MuiDataGrid-row.Mui-selected:hover": {
          backgroundColor: "rgba(107,170,106,0.14)",
        },

        "& .MuiDataGrid-footerContainer": {
          borderTop: "1px solid rgba(107,170,106,0.18)",
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.10), rgba(0,0,0,0.22))",
        },

        // Pagination text/icons also green
        "& .MuiTablePagination-root, & .MuiTablePagination-displayedRows, & .MuiTablePagination-selectLabel":
          {
            color: `${ACCENT} !important`,
          },
        "& .MuiSvgIcon-root": {
          color: `${ACCENT} !important`,
        },

        "& .MuiDataGrid-iconSeparator": {
          color: "rgba(107,170,106,0.25)",
        },
        "& .MuiDataGrid-menuIconButton, & .MuiDataGrid-sortIcon": {
          color: "rgba(107,170,106,0.9)",
        },
      },

      headerText: { color: ACCENT, fontWeight: 900 },
      cellText: { color: "inherit" }, // inherit green from gridSx
    }
  }

  render() {
    const s = this.styles()

    const columns = [
      {
        field: "item",
        headerName: "Item",
        flex: 2,
        minWidth: 120,
        sortable: true,
        renderHeader: () => (
          <Typography variant="subtitle1" style={s.headerText}>
            Item
          </Typography>
        ),
        renderCell: (params) => (
          <Button
            variant="outlined"
            size="small"
            style={s.actionBtn}
            onClick={() =>
              this.props.selWork({
                item: params.row.item,
                collection: params.row.collection,
              })
            }
          >
            <Typography variant="subtitle2" style={{ color: "inherit" }}>
              {params.row.item}
            </Typography>
          </Button>
        ),
      },
      {
        field: "collection",
        headerName: "Collection",
        flex: 2,
        minWidth: 140,
        align: "left",
        headerAlign: "left",
        renderHeader: () => (
          <Typography variant="subtitle1" style={s.headerText}>
            Collection
          </Typography>
        ),
        renderCell: (params) => (
          <div style={s.rightShiftCell}>
            <Typography variant="body2" style={s.cellText}>
              {params.row.collection}
            </Typography>
          </div>
        ),
      },
      {
        field: "date",
        headerName: "Date",
        flex: 1.4,
        minWidth: 120,
        align: "left",
        headerAlign: "left",
        renderHeader: () => (
          <Typography variant="subtitle1" style={s.headerText}>
            Date
          </Typography>
        ),
        renderCell: (params) => (
          <div style={s.rightShiftCell}>
            <Typography variant="body2" style={s.cellText}>
              {params.row.date}
            </Typography>
          </div>
        ),
      },
    ]

    if (this.props.user) {
      columns.push({
        field: "__edit",
        headerName: "Edit",
        flex: 1,
        minWidth: 110,
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        renderHeader: () => (
          <Typography variant="subtitle1" style={s.headerText}>
            Edit
          </Typography>
        ),
        renderCell: (params) => (
          <Button
            variant="outlined"
            size="small"
            style={s.actionBtn}
            onClick={() => this.props.editWorks(params.row.id)}
          >
            <Typography variant="subtitle2" style={{ color: "inherit" }}>
              Edit
            </Typography>
          </Button>
        ),
      })
    }

    return (
      <Card style={s.tableCard} elevation={0}>
        <div style={s.cardGlow} />
        <div style={{ position: "relative", zIndex: 2 }}>
          <DataGrid
            autoHeight
            headerHeight={62}
            rows={this.props.works || []}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5, 10, 25]}
            disableRowSelectionOnClick
            hideFooterSelectedRowCount
            sx={s.gridSx}
          />
        </div>
      </Card>
    )
  }
}
