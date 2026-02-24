import { useEffect, useState } from "react";
import GradientCircularProgress from "./Spinner.jsx";
import "./FormUpdater.css";
const ZOHO = window.ZOHO || {};

export default function FormUpdater() {
  const [zohoLoaded, setZohoLoaded] = useState(false);
  const [recordId, setRecordId] = useState("");
  const [moduleName, setModuleName] = useState("");
  const [recordData, setRecordData] = useState(null);

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
    if (zohoLoaded && recordId && moduleName) {
      ZOHO.CRM.API.getRecord({
        Entity: moduleName,
        approved: "both",
        RecordID: recordId,
      }).then(function (data) {
        setRecordData(data);
      });
    }
  }, [zohoLoaded, recordId, moduleName]);
  const verifyEmail = (email) => {
    // Simple regex for email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  const isLoading = zohoLoaded && !recordData;
  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <GradientCircularProgress />
      </div>
    );
  }
  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedData = {
      Deal_Name: document.getElementById("deal_name").value,
      Amount: document.getElementById("amount").value,
      Contact_Phone: document.getElementById("phone_number").value,
      Email: document.getElementById("email").value,
    };
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
  };
  return (
    <>
      <div>
        <h1 className="title">{moduleName} Information Updater</h1>
        <hr />
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Deal Name</th>
                <th>Amount</th>
                <th>Phone No.</th>
                <th>Email</th>
                <th>isVerified</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <input
                    type="text"
                    id="deal_name"
                    defaultValue={recordData?.data[0]?.Deal_Name || ""}
                    placeholder="Enter Deal Name"
                  />
                </td>
                <td>
                  <input
                    type="text"
                    id="amount"
                    defaultValue={recordData?.data[0]?.Amount || ""}
                    placeholder="Enter Amount"
                  />
                </td>
                <td>
                  <input
                    type="text"
                    id="phone_number"
                    defaultValue={recordData?.data[0]?.Contact_Phone || ""}
                    placeholder="Enter Phone Number"
                  />
                </td>
                <td>
                  <input
                    type="email"
                    id="email"
                    defaultValue={recordData?.data[0]?.Email || "Enter Email"}
                  />
                </td>
                <td>
                  {verifyEmail(recordData?.data[0]?.Email)
                    ? "Valid Email"
                    : "Invalid Email"}
                </td>
                <td>
                  <button type="submit" id="submit-btn" onClick={handleSubmit}>
                    Update
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
