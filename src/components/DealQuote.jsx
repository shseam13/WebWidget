import { useEffect, useState } from "react";
import "./DealQuote.css";
const ZOHO = window.ZOHO || {};

export default function DealQuote() {
  const [zohoLoaded, setZohoLoaded] = useState(false);
  const [recordId, setRecordId] = useState("");
  const [moduleName, setModuleName] = useState("");
  const [recordData, setRecordData] = useState(null);
  const [quoteData, setQuoteData] = useState(null);
  const [disabled, setDisabled] = useState(true);
  useEffect(() => {
    ZOHO.embeddedApp.on("PageLoad", function (data) {
      setRecordId(data["EntityId"][0]);
      setModuleName(data?.Entity);
    });
    ZOHO.embeddedApp.init().then(() => {
      setZohoLoaded(true);
    });
  }, []);
  useEffect(() => {
    if (zohoLoaded) {
      ZOHO.CRM.UI.Resize({ width: "1240" })
        .then(function (data) {
          console.log("Resize successful:", data);
        })
        .catch(function (error) {
          console.error("Resize failed:", error);
        });
    }
  }, [zohoLoaded]);

  useEffect(() => {
    if (zohoLoaded && recordId && moduleName) {
      ZOHO.CRM.API.getRecord({
        Entity: moduleName,
        approved: "both",
        RecordID: recordId,
      }).then(function (data) {
        console.log(data);
        setRecordData(data);
      });
    }
  }, [zohoLoaded, recordId, moduleName]);

  useEffect(() => {
    if (recordData) {
      ZOHO.CRM.API.getRelatedRecords({
        Entity: "Deals",
        RecordID: recordData["data"][0]["id"],
        RelatedList: "Quotes",
        page: 1,
        per_page: 200,
      }).then(function (quoteData) {
        setQuoteData(quoteData["data"]);
        console.log(quoteData["data"]);
      });
    }
  }, [recordData, zohoLoaded, recordId, moduleName]);

  // const handleDealUpdate = (e) => {
  //   e.preventDefault();
  //   const updatedData = {
  //     Deal_Name: document.getElementById("deal_name").value,
  //     Amount: document.getElementById("amount").value,
  //     Contact_Phone: document.getElementById("phone_number").value,
  //     Email: document.getElementById("email").value,
  //   };
  //   var config = {
  //     Entity: moduleName,
  //     APIData: {
  //       ...updatedData,
  //       id: recordId,
  //     },
  //     Trigger: ["workflow"],
  //   };
  //   ZOHO.CRM.API.updateRecord(config)
  //     .then(function (data) {
  //       console.log(data);
  //       alert("Record Updated Successfully");
  //       window.location.reload();
  //     })
  //     .catch(function (error) {
  //       console.log(error);
  //     });
  // };
  const verifyEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  const handleDealUpdate = (e) => {
    e.preventDefault();
    const events = e.target.elements;
    const updatedData = {
      Deal_Name: events.deal_name.value,
      Amount: events.amount.value,
      // Contact_Name: events.contact_name.value,
      Contact_Phone: events.phone_number.value,
      Email: events.email.value,
      // Stage: events.stage.value,
    };
    if (!verifyEmail(updatedData.Email)) {
      alert("Please enter a valid email address.");
      return;
    }
    var config = {
      Entity: moduleName,
      APIData: {
        ...updatedData,
        id: recordId,
      },
      Trigger: ["workflow"],
    };
    ZOHO.CRM.API.updateRecord(config)
      .then(function (data) {
        console.log(data);
        alert("Record Updated Successfully");
        window.location.reload();
      })
      .catch(function (error) {
        console.log(error);
      });
    return;
  };
  if (!zohoLoaded) {
    console.log(zohoLoaded);
    return <div>Loading zoho...</div>;
  }
  if (!recordData) {
    console.log(recordData);
    return <div>Loading record data...</div>;
  }
  if (!quoteData) {
    console.log(quoteData);
    return <div>Loading quotes...</div>;
  }
  return (
    <div className="container">
      <div className=" card">
        <h5 className="card-header">Deal Information</h5>
        <div className="card-body">
          <form className="row g-3" onSubmit={handleDealUpdate}>
            <div className="col-md-4">
              <label className="form-label">Deal Name</label>
              <input
                name={"deal_name"}
                type="text"
                className="form-control"
                id="deal_name"
                defaultValue={recordData["data"][0]["Deal_Name"]}
                disabled={disabled}
              ></input>
            </div>
            <div className="col-md-4">
              <label className="form-label">Deal Owner</label>
              <input
                type="text"
                className="form-control"
                id="deal_owner"
                defaultValue={recordData["data"][0]["Owner"]["name"]}
                disabled
              ></input>
            </div>
            <div className="col-md-4">
              <label className="form-label">Email</label>
              <div className="input-group">
                <span className="input-group-text">📩</span>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  defaultValue={recordData["data"][0]["Email"]}
                  disabled={disabled}
                ></input>
              </div>
            </div>
            <div className="col-md-3">
              <label className="form-label">Contact Name</label>
              <input
                type="text"
                className="form-control"
                id="contact_name"
                defaultValue={recordData["data"][0]["Contact_Name"]["name"]}
                disabled
              ></input>
            </div>
            <div className="col-md-3">
              <label className="form-label">Contact Phone</label>
              <input
                type="text"
                className="form-control"
                id="phone_number"
                defaultValue={recordData["data"][0]["Contact_Phone"]}
                disabled={disabled}
              ></input>
            </div>
            <div className="col-md-3">
              <label className="form-label">Stage</label>
              <select className="form-select" id="stage" disabled>
                <option defaultValue={recordData["data"][0]["Stage"]}>
                  {recordData["data"][0]["Stage"]}
                </option>
                <option>Qualification</option>
                <option>Researching</option>
                <option>Proposal/Price Quote</option>
                <option>Negotiate / Review</option>
                <option>Closed Won 👍</option>
                <option>Closed Lost 👎</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Amount</label>
              <input
                type="text"
                className="form-control"
                id="amount"
                defaultValue={`${recordData["data"][0]["Amount"]}`}
                required
                disabled={disabled}
              ></input>
            </div>
            <div className="col-12">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  required
                  onChange={(e) => {
                    setDisabled(e.target.checked ? "" : "disabled");
                  }}
                ></input>
                <label
                  className="form-check-label"
                  htmlFor="invalidCheck"
                  style={{ color: "red" }}
                >
                  Check This To Enable Edit Deal Information
                </label>
              </div>
            </div>
            <div className="col-12">
              <button
                className="btn btn-primary"
                type="submit"
                id="deal_update-btn"
                disabled={disabled}
              >
                Update Deal Information
              </button>
            </div>
          </form>
        </div>
      </div>
      <nav className="navbar bg-success mt-3 rounded-2">
        <div className="container-fluid">
          <a className="navbar-brand text-white">Related Quotes</a>
          <form className="d-flex" role="search">
            <button className="btn btn-light" type="submit">
              ➕ Create Quote
            </button>
          </form>
        </div>
      </nav>
      <table border={1} className="w-100 table-responsive">
        <thead>
          <tr>
            <th>Quote Name</th>
            <th>Quote </th>
            <th>Valid Till</th>
            <th>Grand Total</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {quoteData && quoteData.length > 0 ? (
            quoteData.map((quote) => (
              <tr key={quote.id}>
                <td>{quote.Subject}</td>
                <td>{quote.Quote_Number}</td>
                <td>{quote.Valid_Till}</td>
                <td>{`$${quote.Grand_Total}`}</td>
                <td>
                  <button type="submit">✏️</button>
                  <button type="submit">❌</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5">No related quotes found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
