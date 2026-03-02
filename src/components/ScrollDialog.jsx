import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
const ZOHO = window.ZOHO;

export default function ScrollDialog({
  accountId,
  dealName,
  dealId,
  accountName,
  products,
}) {
  const [open, setOpen] = React.useState(false);
  const [rows, setRows] = React.useState([{ productId: "", quantity: 1 }]);
  const [formData, setFormData] = React.useState({
    Subject: "",
    Quote_Stage: "Draft",
    Valid_Till: "",
    Account_Name: accountId,
    Deal_Name: dealId,
  });
  const scroll = "paper";
  const handleClickOpen = (accountId) => () => {
    if (accountId !== "") {
      setOpen(true);
    } else {
      window.alert("Please select an account to create a quote.");
    }
  };

  const handleClose = (code) => {
    code === 200 ? window.location.reload() : "";
    setOpen(false);
  };

  const descriptionElementRef = React.useRef(null);
  React.useEffect(() => {
    if (open) {
      const { current: descriptionElement } = descriptionElementRef;
      if (descriptionElement !== null) {
        descriptionElement.focus();
      }
    }
  }, [open]);
  const addRow = (e) => {
    e.preventDefault();
    setRows([...rows, { productId: "", quantity: 1 }]);
  };
  const deleteRow = (e, index) => {
    e.preventDefault();
    if (rows.length > 1) {
      const newRows = rows.filter((_, i) => i !== index);
      setRows(newRows);
    } else {
      alert("A quote must have at least one product.");
    }
  };
  const updateRow = (index, field, value) => {
    const newRows = [...rows];
    console.log(index, field);
    newRows[index][field] = value;
    setRows(newRows);
  };
  const handleCreateQuote = async (e) => {
    e.preventDefault();
    const quotedItems = rows
      .filter((row) => row.productId !== "")
      .map((row) => ({
        product: { id: row.productId },
        quantity: row.quantity,
      }));

    if (quotedItems.length === 0) {
      alert("Please select at least one product.");
      return;
    }
    if (formData.Subject === "") {
      window.alert("Please insert quote subject");
      return;
    }
    const recordData = {
      ...formData,
      Account_Name: accountId,
      Deal_Name: dealId,
      Product_Details: quotedItems,
    };

    try {
      const response = await ZOHO.CRM.API.insertRecord({
        Entity: "Quotes",
        APIData: recordData,
        Trigger: [],
      });
      if (response.data && response.data[0].code === "SUCCESS") {
        alert("Quote Created Successfully!");
        handleClose(200);
      } else {
        console.error("Error from Zoho:", response);
        alert("Failed to create quote. Check console for details.");
      }
    } catch (error) {
      alert("Something went wrong please reload the crm and try again");
      console.error("API Error:", error);
    }
  };
  return (
    <React.Fragment>
      <button className="btn btn-light" onClick={handleClickOpen(accountId)}>
        ➕ Create Quote
      </button>
      <Dialog
        open={open}
        onClose={handleClose}
        scroll={scroll}
        aria-labelledby="scroll-dialog-title"
        aria-describedby="scroll-dialog-description"
      >
        <DialogTitle id="scroll-dialog-title">Create Quote</DialogTitle>
        <DialogContent dividers={scroll === "paper"}>
          <form className="row g-3">
            <div className="col-12">
              <label className="form-label">Quote Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="Write quote subject here"
                id="quote_subject"
                required
                defaultValue={formData.Subject}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, Subject: e.target.value }));
                }}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Quote Stage</label>
              <select
                className="form-select"
                defaultValue={formData.Quote_Stage}
              >
                <option defaultValue disabled>
                  Draft
                </option>
                <option disabled>...</option>
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label">Valid Until</label>
              <input
                type="date"
                className="form-control"
                id="validity_date"
                defaultValue={formData.Valid_Till}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    Valid_Till: e.target.value,
                  }));
                }}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Deal Name</label>
              <input
                type="text"
                className="form-control"
                defaultValue={dealName}
                disabled
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Account Name</label>
              <input
                type="text"
                className="form-control"
                defaultValue={accountName}
                disabled
              />
            </div>

            <table>
              <thead>
                <tr>
                  <th className="col-md-9">Product</th>
                  <th className="col-md-2">Quantity</th>
                  <th className="col-md-1">Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={index}>
                    <td>
                      <select
                        className="form-select"
                        onChange={(e) => {
                          updateRow(index, "productId", e.target.value);
                        }}
                      >
                        <option value="">Select Product</option>
                        {products.map((prod) => (
                          <option key={prod.id} value={prod.id}>
                            {prod.Product_Name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-control"
                        value={row.quantity}
                        min={1}
                        onChange={(e) =>
                          updateRow(index, "quantity", Number(e.target.value))
                        }
                      />
                    </td>
                    <td>
                      <button
                        className="btn"
                        type="button"
                        onClick={(e) => deleteRow(e, index)}
                      >
                        ❌
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="col-6">
              <button className="btn btn-success" onClick={addRow}>
                +Add row
              </button>
            </div>
          </form>
        </DialogContent>
        <DialogActions className="m-2">
          <button
            type="submit"
            className="btn btn-primary"
            onClick={(e) => {
              handleCreateQuote(e);
            }}
          >
            Create Quote
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={handleClose}
          >
            Close
          </button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
/*





*/
