import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  FaUserInjured,
  FaMoneyBillWave,
  FaCalendarAlt,
  FaUsers,
} from "react-icons/fa";
import "./DashboardContent.css";
import api from "../../../services/api";

const DashboardContent = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true); // New: loading state
  const [error, setError] = useState(null); // New: error state
  const [recentPatients, setRecentPatients] = useState([]);
  const [monthlyData, setMonthlyData] = useState([
    { name: "Jan", patients: 0 },
    { name: "Feb", patients: 0 },
    { name: "Mar", patients: 0 },
    { name: "Apr", patients: 0 },
    { name: "May", patients: 0 },
    { name: "Jun", patients: 0 },
    { name: "Jul", patients: 0 },
    { name: "Aug", patients: 0 },
    { name: "Sep", patients: 0 },
    { name: "Oct", patients: 0 },
    { name: "Nov", patients: 0 },
    { name: "Dec", patients: 0 },
  ]);
  

  const fetchData = async () => {
    try {
      const res = await api.get("/api/patients/patients_stats/");
      console.log(res.data);
      setData(res.data || []);
      setRecentPatients(res.data.today_patients_data || []);
      const currentMonthIndex = new Date().getMonth(); 
      const updatedMonthlyData = [...monthlyData];
      updatedMonthlyData[currentMonthIndex].patients = res.data.completed_this_month_count;
    setMonthlyData(updatedMonthlyData);
    } catch (error) {
      console.error("Failed to fetch patients stats:", error);
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const stats = [
    {
      title: "Today's Patients",
      value: data.completed_today_count,
      icon: <FaUserInjured />,
      color: "#4e73df",
    },
    {
      title: "Total Patients",
      value: data.completed_this_month_count,
      icon: <FaUsers />,
      color: "#1cc88a",
    },
    {
      title: "Today's Payments",
      value: "₹0",
      icon: <FaMoneyBillWave />,
      color: "#36b9cc",
    },
    {
      title: "Total Payments",
      value: "₹0",
      icon: <FaCalendarAlt />,
      color: "#f6c23e",
    },
  ];


  if (loading) return <p>Loading...</p>;
  if (error) return <p>Something went wrong: {error.message}</p>;

  return (
    <div className="dashboard-container-d">
      <h1 className="dashboard-title">Hospital Dashboard</h1>

      {/* Stats Cards */}
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="stat-card"
            style={{ borderLeft: `4px solid ${stat.color}` }}
          >
            <div className="stat-icon" style={{ color: stat.color }}>
              {stat.icon}
            </div>
            <div className="stat-content">
              <h3>{stat.title}</h3>
              <p>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Chart and Recent Patients */}
      <div className="dashboard-content">
        <div className="chart-container">
          <h2>Monthly Patients Overview</h2>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="patients" fill="#4e73df" name="Patients" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="table-container">
          <h2>Recent Patients</h2>
          <div className="table-wrapper">
            <table className="patients-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Disease</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentPatients.map((patient) => (
                  <tr key={patient.id}>
                    <td>{patient.id}</td>
                    <td>
                      {patient.first_name} {patient.last_name}
                    </td>
                    <td>
                      {patient.created_at
                        ? patient.created_at.split("T")[0]
                        : "-"}
                    </td>
                    <td>
                      {patient.created_at
                        ? patient.created_at.split("T")[1].slice(0, 5)
                        : "-"}
                    </td>
                    <td>{patient.disease}</td>
                    <td>
                      <span
                        className={`status-badge ${patient.status
                          .toLowerCase()
                          .replace(" ", "-")}`}
                      >
                        {patient.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardContent;
