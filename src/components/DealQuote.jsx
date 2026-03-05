import { useEffect, useState } from "react";
import ScrollDialog from "./ScrollDialog";
import "./DealQuote.css";
const ZOHO = window.ZOHO;

export default function DealQuote() {
  const [zohoLoaded, setZohoLoaded] = useState(false);
  const [recordId, setRecordId] = useState("");
  const [moduleName, setModuleName] = useState("");
  const [recordData, setRecordData] = useState(null);
  const [quoteData, setQuoteData] = useState(null);
  const [disabled, setDisabled] = useState(true);
  const [dealName, setDealName] = useState("");
  const [dealId, setDealId] = useState("");
  const [accountId, setAccountId] = useState("");
  const [accountName, setAccountName] = useState("");
  const [email, setEmail] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [products, setProducts] = useState(null);
  const [disabledRows, setDisabledRows] = useState({});
  const [quoteSubject, setQuoteSubject] = useState("");
  const [validDate, setValidDate] = useState("");
  const [pipeline, setPipeline] = useState("");
  const [pipelineStageMap, setPipelineStageMap] = useState({});
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
      console.log(recordData);
      setDealName(recordData["data"][0]["Deal_Name"]);
      setDealId(recordData["data"][0]["id"]);
      setAccountId(recordData["data"][0]["Account_Name"]?.id || "");
      setAccountName(recordData["data"][0]["Account_Name"]?.name || "");
      setEmail(recordData["data"][0]["Email"]);
      setContactName(recordData["data"][0]["Contact_Name"]["name"]);
      setContactPhone(recordData["data"][0]["Contact_Phone"]);
      setAmount(recordData["data"][0]["Amount"]);
      setPipeline(recordData["data"][0]["Pipeline"]);
      ZOHO.CRM.API.getRelatedRecords({
        Entity: "Deals",
        RecordID: recordData["data"][0]["id"],
        RelatedList: "Quotes",
        page: 1,
        per_page: 200,
      }).then(function (quoteData) {
        console.log(quoteData);
        setQuoteData(quoteData["data"]);
      });
    }
  }, [recordData, zohoLoaded, recordId, moduleName]);
  useEffect(() => {
    let pipeline_stage_map = {};
    if (recordData) {
      ZOHO.CRM.META.getLayouts({
        Entity: "Deals",
        LayoutId: "4728790000000091023",
      }).then(function (data) {
        const deal_information = data["layouts"][0]["sections"].find(
          (section) => section["api_name"] === "Deal Information",
        );
        const deal_pipeline_info = deal_information["fields"].find(
          (field) => field["api_name"] === "Pipeline",
        );
        const pipeline_picklist_values = deal_pipeline_info["pick_list_values"];
        console.log(pipeline_picklist_values);
        pipeline_picklist_values.forEach((element) => {
          const pipeline = element.actual_value;
          const stages = element["maps"][0]["pick_list_values"].map(
            (stage) => stage.actual_value,
          );
          pipeline_stage_map[pipeline] = stages;
        });

        setPipelineStageMap(pipeline_stage_map);
      });
    }
  }, [recordData, zohoLoaded]);
  useEffect(() => {
    if (zohoLoaded) {
      ZOHO.CRM.API.getAllRecords({
        Entity: "Products",
        page: 1,
        per_page: 200,
      }).then(function (data) {
        console.log(data.data);
        setProducts(data.data);
      });
    }
  }, [zohoLoaded]);
  const verifyEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  const handleDealUpdate = (e) => {
    e.preventDefault();
    const updatedData = {
      Deal_Name: dealName,
      Amount: amount,
      // Contact_Name: contactName,
      Contact_Phone: contactPhone,
      Email: email,
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
      Trigger: [],
    };
    ZOHO.CRM.API.updateRecord(config)
      .then(function (data) {
        console.log(data);
        alert("Record Updated Successfully");
      })
      .catch(function (error) {
        console.log(error);
      });
    return;
  };
  const handleDelete = async (quoteId, quoteName) => {
    const confirmDelete = window.confirm(
      `Are you sure want to delete the ${quoteName}`,
    );
    if (!confirmDelete) {
      return;
    }
    try {
      const response = await ZOHO.CRM.API.deleteRecord({
        Entity: "Quotes",
        RecordID: quoteId,
      });
      console.log(response);
      const data_index = quoteData.findIndex((item) => item.id === quoteId);
      quoteData.splice(data_index, 1);
      alert("Quote Deleted Successfully!");
      setQuoteData(quoteData);
    } catch (error) {
      console.log("Error fetching quotes", error);
    }
  };
  const handleSave = async (quoteId, quoteName, validDate) => {
    const confirmSave = window.confirm(
      `Sounds good? ${validDate} & ${quoteName}`,
    );
    if (!confirmSave) {
      return;
    }
    console.log(quoteId, quoteName, validDate);
    const updatedData = {
      Subject: quoteName,
      Valid_Till: validDate,
    };
    var config = {
      Entity: moduleName,
      APIData: {
        ...updatedData,
        id: quoteId,
      },
      Trigger: [],
    };
    console.log(config);
    const response = await ZOHO.CRM.API.updateRecord(config)
      .then(function (data) {
        console.log(data);
        alert("Record Updated Successfully");
        setDisabledRows((prev) => ({
          ...prev,
          [quoteId]: !(disabledRows[quoteId] ?? true),
        }));
        console.log(response);
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
  return (
    <div className="container">
      <div className=" card">
        <h5 className="card-header">Deal Information</h5>
        <div className="card-body">
          <form className="row g-3" onSubmit={handleDealUpdate}>
            <div className="col-md-12">
              <label className="form-label">Data Show</label>
              <p className="border p-2">{`${dealName} || ${email} || ${contactPhone} || ${amount}`}</p>
            </div>
            <div className="col-md-4">
              <label className="form-label">Deal Name</label>
              <input
                name={"deal_name"}
                type="text"
                className="form-control"
                id="deal_name"
                defaultValue={dealName}
                disabled={disabled}
                onChange={(e) => {
                  setDealName(e.target.value);
                }}
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
                  defaultValue={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                defaultValue={contactName}
                disabled
              ></input>
            </div>
            <div className="col-md-3">
              <label className="form-label">Contact Phone</label>
              <input
                type="text"
                className="form-control"
                id="phone_number"
                defaultValue={contactPhone}
                onChange={(e) => {
                  setContactPhone(e.target.value);
                }}
                disabled={disabled}
              ></input>
            </div>
            <div className="col-md-3">
              <label className="form-label">Stage</label>
              <select className="form-select" id="stage" disabled={disabled}>
                <option defaultValue={recordData["data"][0]["Stage"]}>
                  {recordData["data"][0]["Stage"]}
                </option>
                {console.log(pipelineStageMap)}
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
                defaultValue={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                }}
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
          <ScrollDialog
            accountId={accountId}
            dealName={dealName}
            accountName={accountName}
            products={products}
            dealId={dealId}
          />
        </div>
      </nav>
      <table border={1} className="w-100 table-responsive my-3">
        <thead>
          <tr>
            <th>Quote Name</th>
            <th>Quote Owner</th>
            <th>Quote Stage</th>
            <th>Valid Till</th>
            <th>Grand Total($)</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {quoteData && quoteData.length > 0 ? (
            quoteData.map((quote) => (
              <tr key={quote.id}>
                <td>
                  <input
                    type="text"
                    style={{ color: "black" }}
                    defaultValue={quote.Subject}
                    onChange={(e) => {
                      setQuoteSubject(e.target.value);
                    }}
                    disabled={disabledRows[quote.id] ?? true}
                  />
                </td>
                <td>{quote.Owner.name}</td>
                <td>{quote.Quote_Stage}</td>
                <td>
                  <input
                    type="date"
                    defaultValue={quote.Valid_Till}
                    disabled={disabledRows[quote.id] ?? true}
                    onChange={(e) => {
                      setValidDate(e.target.value);
                    }}
                  />
                </td>
                <td>{quote.Grand_Total}</td>
                <td>
                  <button
                    className={`btn ${(disabledRows[quote.id] ?? true) ? "btn-outline-success" : "btn-danger"} me-2`}
                    onClick={() => {
                      setDisabledRows((prev) => ({
                        ...prev,
                        [quote.id]: !(disabledRows[quote.id] ?? true),
                      }));
                    }}
                  >
                    {(disabledRows[quote.id] ?? true) ? "Edit" : "Cancel"}
                  </button>
                  {/* btn-outline-success */}
                  <button
                    className={`btn ${(disabledRows[quote.id] ?? true) ? "btn-outline-danger" : "btn-warning"}`}
                    id={`${(disabledRows[quote.id] ?? true) ? "delete_quote" : "save_quote"}`}
                    onClick={(e) => {
                      const quote_del_edit_id = e.target.id;
                      quote_del_edit_id === "delete_quote"
                        ? handleDelete(quote.id, quote.Subject)
                        : handleSave(quote.id, quoteSubject, validDate);
                    }}
                  >
                    {(disabledRows[quote.id] ?? true) ? "Delete" : "Save"}
                  </button>
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
