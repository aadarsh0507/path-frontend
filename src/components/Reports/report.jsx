import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../API/api";
import { FaFileExcel, FaFilePdf } from "react-icons/fa";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

const ReportScreen = () => {
    const navigate = useNavigate(); // ✅ Define navigate for redirection
  const [pathId, setPathId] = useState("");
  const [uhid, setUhid] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ Fetch all patients initially
  const fetchPatients = async () => {
    setLoading(true);
    try {
      const response = await api.get("/api/patients/get-all");
      setPatients(response.data);
      setFilteredPatients(response.data);
    } catch (error) {
      console.error("Error fetching patient data:", error);
      alert("Failed to load patient data");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  // ✅ Instant Filtering for Path ID & UHID (Real-Time as You Type)
  useEffect(() => {
    const filteredData = patients.filter((patient) => {
      return (
        (pathId === "" || patient.pathId.toString().includes(pathId)) &&
        (uhid === "" || patient.uhid.toString().includes(uhid))
      );
    });
    setFilteredPatients(filteredData);
  }, [pathId, uhid, patients]);

  // ✅ Filtering by Date Range (Only When GO Button is Clicked)
  const applyDateFilter = () => {
    const filteredData = patients.filter((patient) => {
      const matchesDate =
        fromDate && toDate
          ? patient.date >= fromDate && patient.date <= toDate
          : true;

      return matchesDate;
    });
    setFilteredPatients(filteredData);
  };

  // ✅ Export to Excel (With User ID properly mapped)
  const exportToExcel = () => {
    const formattedData = filteredPatients.map(
      ({ _id, userId, ...rest }, index) => ({
        SNo: index + 1, // ✅ Adding Serial Number
        ...rest,
        userId: userId?.firstName || userId?.employeeId || "N/A", // ✅ Ensure User ID is shown properly
      })
    );

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Patients");
    XLSX.writeFile(workbook, "Patient_Report.xlsx");
  };

  // ✅ Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Patient Report", 90, 10);

    // Table Headers
    const headers = [
      [
        "SNo",
        "Date",
        "Time",
        "Path ID",
        "UHID",
        "Patient Name",
        "Age",
        "Gender",
        "User ID",
      ],
    ];

    // Table Data with SNo and Corrected User ID
    const data = filteredPatients.map(({ userId, ...patient }, index) => [
      index + 1, // ✅ Add Serial Number
      patient.date,
      patient.time,
      patient.pathId,
      patient.uhid,
      patient.patientName,
      patient.age,
      patient.gender,
      userId?.firstName || userId?.employeeId || "N/A", // ✅ Fix User ID
    ]);

    // Generate Table
    doc.autoTable({
      head: headers,
      body: data,
      startY: 20,
      theme: "grid",
      headStyles: { fillColor: [41, 128, 185] }, // Blue header
    });

    doc.save("Patient_Report.pdf");
  };


  return (
    <div className="flex items-center justify-center min-h-screen bg-[linear-gradient(135deg,#4caf50,#2a9d8f)] p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-7xl">
        <div className="flex justify-between items-center mb-4">
          {/* ✅ Path ID - Instant Search */}
          <input
            type="text"
            placeholder="Path ID"
            value={pathId}
            onChange={(e) => setPathId(e.target.value)}
            className="border px-3 py-2 rounded-md w-1/5 focus:ring-2 focus:ring-blue-500"
          />

          {/* ✅ UHID - Instant Search */}
          <input
            type="text"
            placeholder="UHID"
            value={uhid}
            onChange={(e) => setUhid(e.target.value)}
            className="border px-3 py-2 rounded-md w-1/5 focus:ring-2 focus:ring-blue-500"
          />

          {/* ✅ Date Filtering (Only When "GO" is Clicked) */}
          <div className="flex items-center gap-2">
            <span>From:</span>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="border px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500"
            />
            <span>To:</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="border px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={applyDateFilter} // ✅ GO Button Triggers Filter Only for Dates
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            >
              GO
            </button>
          </div>

          {/* ✅ Export Buttons */}
          <div className="flex gap-2">
            <button
              onClick={exportToExcel}
              className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 flex items-center gap-2"
            >
              <FaFileExcel />
            </button>
            <button
              onClick={exportToPDF}
              className="bg-red-700 text-white px-4 py-2 rounded-md hover:bg-red-800 flex items-center gap-2"
            >
              <FaFilePdf />
            </button>
          </div>
        </div>

        {/* Table Section with Sticky Headers */}
        <div className="overflow-y-auto max-h-[500px] border border-gray-300 rounded-md">
          {loading ? (
            <p className="text-center text-gray-500">Loading...</p>
          ) : (
            <table className="w-full border-collapse">
              <thead className="bg-gray-200 sticky top-0 z-10">
                <tr>
                  <th className="border px-4 py-2">S.No</th>{" "}
                  {/* ✅ Adding Serial Number */}
                  <th className="border px-4 py-2">Date</th>
                  <th className="border px-4 py-2">Time</th>
                  <th className="border px-4 py-2">Path ID</th>
                  <th className="border px-4 py-2">UHID</th>
                  <th className="border px-4 py-2">Patient Name</th>
                  <th className="border px-4 py-2">Age</th>
                  <th className="border px-4 py-2">Gender</th>
                  <th className="border px-4 py-2">User ID</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center py-4 text-gray-500">
                      No data found
                    </td>
                  </tr>
                ) : (
                  filteredPatients.map((patient, index) => (
                    <tr key={index} className="text-center">
                      <td className="border px-4 py-2">{index + 1}</td>{" "}
                      {/* ✅ S.No */}
                      <td className="border px-4 py-2">{patient.date}</td>
                      <td className="border px-4 py-2">{patient.time}</td>
                      <td className="border px-4 py-2">{patient.pathId}</td>
                      <td className="border px-4 py-2">{patient.uhid}</td>
                      <td className="border px-4 py-2">
                        {patient.patientName}
                      </td>
                      <td className="border px-4 py-2">{patient.age}</td>
                      <td className="border px-4 py-2">{patient.gender}</td>
                      <td className="border px-4 py-2">
                        {patient.userId?.firstName ||
                          patient.userId?.employeeId ||
                          "N/A"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
              <button
                  type="back"
          onClick={() => navigate("/home")} 
          className="bg-blue-500 mt-4 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Back
        </button>
      </div>
    </div>
  );
};

export default ReportScreen;
