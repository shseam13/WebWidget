import { useEffect, useState } from "react";
import "./refreshButton.css";
import { CheckBox } from "@mui/icons-material";
const ZOHO = window.ZOHO || {};

export default function BulkUpdater() {
  const [zohoLoaded, setZohoLoaded] = useState(false);
  const [recordData, setRecordData] = useState(null);
  useEffect(() => {
    ZOHO.embeddedApp.init().then(() => {
      setZohoLoaded(true);
    });
  }, []);
  // useEffect(() => {
  //   if (zohoLoaded) {
  //     var config = {
  //       select_query:
  //         "select Deal_Name, Amount, Contact_Phone, Email from Deals where Deal_Name is not null order by Created_Time desc limit 12",
  //     };
  //     ZOHO.CRM.API.coql(config).then(function (data) {
  //       console.log(data);
  //       setRecordData(data);
  //     });
  //   }
  // }, [zohoLoaded]);
  const handleFetchData = (e) => {
    e.preventDefault();
    const module = document.getElementById("module-select").value;
    const recordLimit = document.getElementById("record-limit").value;
    const fields = document.getElementById("fields").value;
    if (recordLimit < 1 || recordLimit > 100) {
      alert("Record limit must be between 1 and 100");
      return;
    }
    if (!fields) {
      alert("Please enter fields to fetch data");
      return;
    }
    var config = {
      select_query: `select ${fields} from ${module} where ${fields.split(",")[0]} is not null order by Created_Time desc limit ${recordLimit}`,
    };
    ZOHO.CRM.API.coql(config).then(function (data) {
      console.log(data);
      setRecordData(data);
    });
  };
  const verifyEmail = (email) => {
    // Simple regex for email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  const handleSingleUpdate = (record, index) => {
    console.log(record.id);
    const updatedData = {
      Deal_Name: document.getElementById(`deal_name_${index}`).value,
      Amount: document.getElementById(`amount_${index}`).value,
      Contact_Phone: document.getElementById(`phone_number_${index}`).value,
      Email: document.getElementById(`email_${index}`).value,
    };
    var config = {
      Entity: "Deals",
      APIData: {
        ...updatedData,
        id: record.id,
      },
      Trigger: ["workflow"],
    };
    ZOHO.CRM.API.updateRecord(config).then(function (data) {
      console.log(data);
      alert("Record Updated Successfully");
      window.location.reload();
    });
  };
  const handleBulkUpdate = () => {
    const selectedRecords = [];
    recordData.data.forEach((record, index) => {
      const checkbox = document.getElementById(`checkbox_${index}`);
      if (checkbox.checked) {
        selectedRecords.push({
          id: record.id,
          Deal_Name: document.getElementById(`deal_name_${index}`).value,
          Amount: document.getElementById(`amount_${index}`).value,
          Contact_Phone: document.getElementById(`phone_number_${index}`).value,
          Email: document.getElementById(`email_${index}`).value,
        });
      }
    });
    var config = {
      Entity: "Deals",
      APIData: selectedRecords,
      Trigger: ["workflow"],
    };
    ZOHO.CRM.API.updateRecord(config).then(function (data) {
      console.log(data);
      alert("Selected Records Updated Successfully");
      window.location.reload();
    });
  };
  if (!zohoLoaded) {
    return <div>Loading...</div>;
  }
  if (!recordData) {
    return (
      <div style={{ padding: "15px" }}>
        <h2>Bulk Updater</h2>
        <p>
          This component will allow you to update multiple records of a module
          at once.
        </p>
        <form action="" onSubmit={(e) => handleFetchData(e)}>
          <fieldset>
            <label htmlFor="module-select">Select Module:</label>
            <select name="module" id="module-select">
              <option value="Deals">Deals</option>
              <option value="Leads">Leads</option>
              <option value="Contacts">Contacts</option>
            </select>
            <label htmlFor="record-limit">Record Limit(1-100)</label>
            <input type="number" id="record-limit" defaultValue="10" />
            <label htmlFor="fields">Fields to View Data:</label>
            <input
              type="text"
              id="fields"
              placeholder="Enter fields api separated by comma"
            />
            <br />
            <button type="submit" id="submit-btn" style={{ marginTop: "15px" }}>
              Fetch Data
            </button>
          </fieldset>
        </form>
      </div>
    );
  }
  return (
    <div style={{ padding: "15px" }}>
      <h2>Bulk Updater</h2>
      <p>
        This component will allow you to update multiple records of a module at
        once.
      </p>
      <form action="" onSubmit={(e) => handleFetchData(e)}>
        <fieldset>
          <label htmlFor="module-select">Select Module:</label>
          <select name="module" id="module-select">
            <option value="Deals">Deals</option>
            <option value="Leads">Leads</option>
            <option value="Contacts">Contacts</option>
          </select>
          <label htmlFor="record-limit">Record Limit(1-100)</label>
          <input type="number" id="record-limit" defaultValue="10" />
          <label htmlFor="fields">Fields to View Data:</label>
          <input
            type="text"
            id="fields"
            placeholder="Enter fields api separated by comma"
          />
          <br />
          <button type="submit" id="submit-btn" style={{ marginTop: "15px" }}>
            Fetch Data
          </button>
        </fieldset>
      </form>
      <button
        class="button"
        type="button"
        onClick={() => window.location.reload()}
      >
        <span class="button__text">Frame r.</span>
        <span class="button__icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            viewBox="0 0 48 48"
            height="48"
            class="svg"
          >
            <path d="M35.3 12.7c-2.89-2.9-6.88-4.7-11.3-4.7-8.84 0-15.98 7.16-15.98 16s7.14 16 15.98 16c7.45 0 13.69-5.1 15.46-12h-4.16c-1.65 4.66-6.07 8-11.3 8-6.63 0-12-5.37-12-12s5.37-12 12-12c3.31 0 6.28 1.38 8.45 3.55l-6.45 6.45h14v-14l-4.7 4.7z"></path>
            <path fill="none" d="M0 0h48v48h-48z"></path>
          </svg>
        </span>
      </button>
      <hr />
      <div className="table-responsive">
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  id="select_all"
                  onChange={(e) => {
                    const checkboxes = document.querySelectorAll(
                      'input[id^="checkbox_"]',
                    );
                    checkboxes.forEach((checkbox) => {
                      checkbox.checked = e.target.checked;
                    });
                  }}
                />
              </th>
              <th>Deal Name</th>
              <th>Amount</th>
              <th>Phone No.</th>
              <th>Email</th>
              <th>isVerified</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {recordData &&
              recordData.data.map((record, index) => (
                <tr key={index}>
                  <td>
                    <input type="checkbox" id={`checkbox_${index}`} />
                  </td>
                  <td>
                    <input
                      type="text"
                      id={`deal_name_${index}`}
                      defaultValue={record.Deal_Name}
                      placeholder="Enter Deal Name"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      id={`amount_${index}`}
                      defaultValue={record.Amount}
                      placeholder="Enter Amount"
                    />
                  </td>
                  <td>
                    <input
                      type="tel"
                      id={`phone_number_${index}`}
                      defaultValue={record.Contact_Phone}
                      placeholder="Enter Contact Phone"
                    />
                  </td>
                  <td>
                    <input
                      type="email"
                      id={`email_${index}`}
                      defaultValue={record.Email}
                      placeholder="Enter Email"
                    />
                  </td>
                  <td
                    style={{
                      color: verifyEmail(record.Email) ? "green" : "red",
                    }}
                  >
                    {verifyEmail(record.Email)
                      ? "Valid Email"
                      : "Invalid Email"}
                  </td>
                  <td>
                    <button
                      type="submit"
                      id="submit-btn"
                      onClick={() => handleSingleUpdate(record, index)}
                    >
                      Update
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      <button
        type="submit"
        id="submit-btn"
        style={{ marginTop: "20px" }}
        onClick={handleBulkUpdate}
      >
        Update Selections
      </button>
    </div>
  );
}
