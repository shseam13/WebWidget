import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

export default function ScrollDialog({ accountId, dealName, accountName }) {
  const [open, setOpen] = React.useState(false);
  const scroll = "paper";
  const handleClickOpen = (accountId) => () => {
    if (accountId !== "") {
      setOpen(true);
    } else {
      window.alert("Please select an account to create a quote.");
    }
  };

  const handleClose = () => {
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
                placeholder="কোটা নাম এখানে লিখো"
                required
              />
            </div>
            <div className="col-md-6">
              <label for="inputState" className="form-label">
                Quote Stage
              </label>
              <select id="inputState" className="form-select">
                <option defaultValue>Draft</option>
                <option disabled>...</option>
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label">Valid Until</label>
              <input type="date" className="form-control" />
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

            <div className="col-12">
              <label for="inputAddress" className="form-label">
                Address
              </label>
              <input
                type="text"
                className="form-control"
                id="inputAddress"
                placeholder="1234 Main St"
              />
            </div>
            <div className="col-12">
              <label for="inputAddress2" className="form-label">
                Address 2
              </label>
              <input
                type="text"
                className="form-control"
                id="inputAddress2"
                placeholder="Apartment, studio, or floor"
              />
            </div>
            <div className="col-md-6">
              <label for="inputCity" className="form-label">
                City
              </label>
              <input type="text" className="form-control" id="inputCity" />
            </div>
            <div className="col-md-4">
              <label for="inputState" className="form-label">
                State
              </label>
              <select id="inputState" className="form-select">
                <option defaultValue>Choose...</option>
                <option>...</option>
              </select>
            </div>
            <div className="col-md-2">
              <label for="inputZip" className="form-label">
                Zip
              </label>
              <input type="text" className="form-control" id="inputZip" />
            </div>
            <div className="col-12">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="gridCheck"
                />
                <label className="form-check-label" for="gridCheck">
                  Check me out
                </label>
              </div>
            </div>
            <div className="col-12">
              <button type="submit" className="btn btn-primary">
                Create Quote
              </button>
            </div>
          </form>
        </DialogContent>
        <DialogActions className="m-2">
          <button
            type="button"
            className="btn btn-danger"
            onClick={handleClose}
          >
            Close & Refresh
          </button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
