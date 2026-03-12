import React from "react"

import { Typography, Button, Card } from "@mui/material"
import { DataGrid } from "@mui/x-data-grid"
import Router from "next/router"

export default class PostsDatabase extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      posts: [],
      post: null,
      isMobile: false,
    }
    this._mq = null
  }

  componentDidMount() {
    if (typeof window !== "undefined" && window.matchMedia) {
      this._mq = window.matchMedia("(max-width:600px)")
      const setFromMQ = () => this.setState({ isMobile: !!this._mq.matches })
      setFromMQ()

      if (this._mq.addEventListener) this._mq.addEventListener("change", setFromMQ)
      else this._mq.addListener(setFromMQ)

      this._mqHandler = setFromMQ
    }
  }

  componentWillUnmount() {
    if (this._mq && this._mqHandler) {
      if (this._mq.removeEventListener) this._mq.removeEventListener("change", this._mqHandler)
      else this._mq.removeListener(this._mqHandler)
    }
  }

  toPathSegment(str = "") {
    return String(str)
      .trim()
      .replace(/\s+/g, "_")
      .replace(/[^\w-]/g, "")
  }

  goToItem(row) {
    const base = this.props.basePath || "/gallery"
    const collectionSeg = this.toPathSegment(row?.collection || "")
    const itemSeg = this.toPathSegment(row?.item || "")

    if (!collectionSeg || !itemSeg) return

    const pathname = `${base}/[collection]/[item]`
    const asPath = `${base}/${encodeURIComponent(collectionSeg)}/${encodeURIComponent(itemSeg)}`

    if (Router?.push) {
      Router.push({ pathname, query: { collection: collectionSeg, item: itemSeg } }, asPath)
    } else {
      window.location.href = asPath
    }
  }

  canEdit() {
    const email = (this.props.user?.email || "").toLowerCase().trim()
    return email === "abergquist96@gmail.com"
  }

  styles() {
    const CREAM = "#EFE7DC"
    const CREAM_SOFT = "#F7F1E8"
    const GREEN = "#304742"
    const ORANGE = "#E9765B"
    const BORDER = "rgba(48,71,66,0.18)"

    return {
      tableCard: {
        borderRadius: 24,
        border: `1px solid ${BORDER}`,
        background: "rgba(239,231,220,0.72)",
        boxShadow: "0 14px 30px rgba(0,0,0,0.08)",
        padding: 17,
        margin: 5,
        position: "relative",
        overflow: "hidden",
      },

      cardGlow: {
        position: "absolute",
        inset: -2,
        background:
          "radial-gradient(700px 240px at 0% 0%, rgba(233,118,91,0.08), rgba(0,0,0,0))," +
          "radial-gradient(700px 240px at 100% 0%, rgba(48,71,66,0.08), rgba(0,0,0,0))",
        pointerEvents: "none",
      },

      actionBtn: {
        borderRadius: 12,
        border: `1px solid ${GREEN}`,
        padding: "6px 12px",
        color: GREEN,
        textTransform: "none",
        background: CREAM,
        boxShadow: "0 8px 20px rgba(0,0,0,0.10)",
        minWidth: 0,
        fontFamily: "GeorgiaB",
      },

      editBtn: {
        borderRadius: 12,
        border: `1px solid ${GREEN}`,
        padding: "6px 12px",
        color: CREAM,
        textTransform: "none",
        background: `linear-gradient(180deg, ${ORANGE}, #d86245)`,
        boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
        minWidth: 0,
        fontFamily: "GeorgiaB",
      },

      rightShiftCell: {
        paddingLeft: 14,
      },

      gridSx: {
        border: "none",
        backgroundColor: "transparent",
        color: GREEN,

        "& .MuiDataGrid-main": {
          color: GREEN,
        },

        "& .MuiDataGrid-columnHeader, & .MuiDataGrid-cell": {
          color: GREEN,
        },

        "& .MuiDataGrid-columnHeaderTitle": {
          fontWeight: 700,
          letterSpacing: 0.2,
          fontFamily: "GeorgiaB",
        },

        "& .MuiDataGrid-columnHeaders": {
          background: "linear-gradient(180deg, rgba(48,71,66,0.08), rgba(48,71,66,0.04))",
          borderBottom: `1px solid ${BORDER}`,
          borderRadius: 14,
        },

        "& .MuiDataGrid-columnSeparator": {
          display: "none !important",
        },

        "& .MuiDataGrid-columnHeaderTitleContainer": {
          paddingLeft: 2,
          paddingRight: 12,
        },

        "& .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-cell:focus": {
          outline: "none",
        },

        "& .MuiDataGrid-cell": {
          borderBottom: "1px solid rgba(48,71,66,0.10)",
          fontFamily: "Georgia",
          backgroundColor: "transparent",
        },

        "& .MuiDataGrid-row:hover": {
          backgroundColor: "rgba(48,71,66,0.05)",
        },

        "& .MuiDataGrid-row.Mui-selected": {
          backgroundColor: "rgba(48,71,66,0.07)",
        },

        "& .MuiDataGrid-row.Mui-selected:hover": {
          backgroundColor: "rgba(48,71,66,0.10)",
        },

        "& .MuiDataGrid-footerContainer": {
          borderTop: `1px solid ${BORDER}`,
          background: "linear-gradient(180deg, rgba(48,71,66,0.03), rgba(48,71,66,0.07))",
        },

        "& .MuiTablePagination-root, & .MuiTablePagination-displayedRows, & .MuiTablePagination-selectLabel":
          {
            color: `${GREEN} !important`,
            fontFamily: "Georgia",
          },

        "& .MuiSvgIcon-root": {
          color: `${GREEN} !important`,
        },

        "& .MuiDataGrid-iconSeparator": {
          color: "rgba(48,71,66,0.18)",
        },

        "& .MuiDataGrid-menuIconButton, & .MuiDataGrid-sortIcon": {
          color: `${GREEN} !important`,
        },

        "& .MuiDataGrid-overlay": {
          background: "transparent",
          color: GREEN,
          fontFamily: "Georgia",
        },

        "& .MuiDataGrid-virtualScroller": {
          backgroundColor: "transparent",
        },
      },

      headerText: {
        color: GREEN,
        fontWeight: 700,
        fontFamily: "Brasika",
        letterSpacing: 0.3,
      },

      cellText: {
        color: "inherit",
        fontFamily: "Georgia",
      },
    }
  }

  render() {
    const s = this.styles()
    const { isMobile } = this.state
    const canEdit = this.canEdit()

    const itemColumn = {
      field: "item",
      headerName: "Item",
      flex: 2,
      minWidth: 160,
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
          onClick={() => this.goToItem(params.row)}
        >
          <Typography variant="subtitle2" style={{ color: "inherit", fontFamily: "GeorgiaB" }}>
            {params.row.item}
          </Typography>
        </Button>
      ),
    }

    const collectionColumn = {
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
    }

    const dateColumn = {
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
    }

    const editColumn = canEdit
      ? {
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
              style={s.editBtn}
              onClick={() => this.props.editWorks(params.row.id)}
            >
              <Typography variant="subtitle2" style={{ color: "inherit", fontFamily: "GeorgiaB" }}>
                Edit
              </Typography>
            </Button>
          ),
        }
      : null

    const columns = isMobile
      ? [itemColumn, ...(editColumn ? [editColumn] : [])]
      : [itemColumn, collectionColumn, dateColumn, ...(editColumn ? [editColumn] : [])]

    return (
      <Card style={s.tableCard} elevation={0}>
        <div style={s.cardGlow} />
        <div style={{ position: "relative", zIndex: 2 }}>
          <DataGrid
            autoHeight
            headerHeight={isMobile ? 56 : 62}
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