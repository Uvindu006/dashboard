import React, { useState, useEffect } from "react";
import axios from "axios";
import { TrendingUp, Users, MapPin, Clock, BarChart3, Loader } from "lucide-react";  // Import Loader icon
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";

// Register chart components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface Session {
  name: string;
  visitors: number;
  color: string;
}

const OverviewWidget: React.FC = () => {
  const [timeRange, setTimeRange] = useState("10am-1pm"); // Human-readable time range
  const [zone, setZone] = useState("zone1");
  const [building, setBuilding] = useState<string>("13"); // Default building ID (Drawing Office 2)
  const [date, setDate] = useState<string>("2025-09-17"); // Set date to 2025-09-17 for testing
  const [slot, setSlot] = useState<number>(1); // Default slot (1 for 10am-1pm)

  const [stats, setStats] = useState({
    totalVisitors: 0,
    totalCheckIns: 0,
    avgDuration: "0m",
    repeatVisitors: 0,
  });

  const [topSessions, setTopSessions] = useState<Session[]>([]);
  const [buildingData, setBuildingData] = useState<{ [key: string]: number }>({});
  const [fetchData, setFetchData] = useState(false); // Button to trigger data fetch
  const [loading, setLoading] = useState(false); // State to track loading

  // Corrected building IDs with names for different zones
  const zoneBuildings: Record<string, { name: string; id: number }[]> = {
    zone1: [
      { name: "Drawing Office 2", id: 13 },
      { name: "Department of Manufacturing and Industrial Engineering", id: 15 },
      { name: "Corridor", id: 17 },
      { name: "Lecture Room (middle-right)", id: 19 },
      { name: "Structures Laboratory", id: 21 },
      { name: "Lecture Room (bottom-right)", id: 23 },
      { name: "Engineering Library", id: 10 },
    ],
    zone2: [
      { name: "Drawing Office 1", id: 33 },
      { name: "Professor E.O.E. Pereira Theatre", id: 16 },
      { name: "Administrative Building", id: 7 },
      { name: "Security Unit", id: 12 },
      { name: "Department of Chemical and Process Engineering", id: 11 },
      { name: "Department Engineering Mathematics", id: 32 },
    ],
    zone3: [
      { name: "Department of Electrical and Electronic Engineering", id: 34 },
      { name: "Department of Computer Engineering", id: 20 },
      { name: "Electrical and Electronic Workshop", id: 19 },
      { name: "Surveying Lab", id: 31 },
      { name: "Soil Lab", id: 31 },
      { name: "Materials Lab", id: 28 },
    ],
    zone4: [
      { name: "Fluids Lab", id: 30 },
      { name: "New Mechanics Lab", id: 24 },
      { name: "Applied Mechanics Lab", id: 23 },
      { name: "Thermodynamics Lab", id: 29 },
      { name: "Generator Room", id: 4 },
      { name: "Engineering Workshop", id: 2 },
      { name: "Engineering Carpentry Shop", id: 1 },
    ],
  };

  const slotMap: Record<string, number> = {
    "10am-1pm": 1, // Slot 1
    "1pm-4pm": 2,  // Slot 2
    "4pm-7pm": 3,  // Slot 3
  };

  // Handle timeRange change to update the slot value
  const handleTimeRangeChange = (range: string) => {
    setTimeRange(range);
    setSlot(slotMap[range]); // Update the slot based on selected time range
  };

  // Fetch stats based on selected building, time range, and date when the button is clicked
  useEffect(() => {
    if (!fetchData) return; // Don't fetch data if fetchData is false

    async function fetchStats() {
      setLoading(true);  // Start loading

      try {
        const baseURL = "http://localhost:5006/analytics";
        console.log(`Fetching data for building: B${building}, Date: ${date}, Slot: ${slot}`);

        const [
          totalVisitorsRes,
          totalCheckInsRes,
          avgDurationRes,
          repeatVisitorsRes,
          topSessionsRes,
          buildingDataRes,
        ] = await Promise.all([
          axios.get(`${baseURL}/total-visitors`, { params: { buildingId: `B${building}`, date, slot } }),
          axios.get(`${baseURL}/total-checkins`, { params: { buildingId: `B${building}`, date, slot } }),
          axios.get(`${baseURL}/avg-duration`, { params: { buildingId: `B${building}`, date, slot } }),
          axios.get(`${baseURL}/repeat-visitors`, { params: { buildingId: `B${building}`, date, slot } }),
          axios.get(`${baseURL}/top3-buildings`, { params: { date, slot } }),
          axios.get(`${baseURL}/visitors-per-building`, { params: { date, slot } }),
        ]);

        console.log("Total Visitors Data:", totalVisitorsRes.data);
        console.log("Total Check-ins Data:", totalCheckInsRes.data);
        console.log("Average Duration Data:", avgDurationRes.data);
        console.log("Repeat Visitors Data:", repeatVisitorsRes.data);
        console.log("Top Sessions Data:", topSessionsRes.data);
        console.log("Visitors per Building Data:", buildingDataRes.data);

        setStats({
          totalVisitors: totalVisitorsRes.data.total_visitors || 0,
          totalCheckIns: totalCheckInsRes.data.total_checkins || 0,
          avgDuration: avgDurationRes.data.averageDuration || "0m",
          repeatVisitors: repeatVisitorsRes.data.repeatVisitors || 0,
        });

        // Set visitors per building data
        const buildingStats: { [key: string]: number } = {};
        buildingDataRes.data.forEach((item: any) => {
          buildingStats[item.building] = parseInt(item.total_visitors);
        });
        setBuildingData(buildingStats);

        // Map the top 3 buildings data to our session state
        const sessions: Session[] = topSessionsRes.data
          ? topSessionsRes.data.map((s: any) => ({
              name: s.building,
              visitors: parseInt(s.visitors),
              color: "blue", // Customize the color as needed
            }))
          : [];
        setTopSessions(sessions);

        // Set fetchData to false after fetching data to prevent repeated fetching
        setFetchData(false);
      } catch (err) {
        console.error("Failed to fetch stats", err);
        setTopSessions([]); // clear sessions on error
      } finally {
        setLoading(false);  // Stop loading once the data is fetched
      }
    }

    fetchStats();
  }, [fetchData, building, timeRange, date, slot]); // Trigger fetchStats when fetchData changes

  // Handle Date selection
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDate(e.target.value);
  };

  // Prepare bar chart data using the building data
  const barChartData = {
    labels: Object.keys(buildingData),
    datasets: [
      {
        label: "Total Visitors",
        data: Object.values(buildingData),
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  // Define color classes for stat elements
  const getColorClasses = (color: string) => {
    const colors = {
      blue: "from-blue-500 to-blue-600",
      green: "from-green-500 to-green-600",
      purple: "from-purple-500 to-purple-600",
      yellow: "from-yellow-400 to-yellow-500",
    };
    return colors[color as keyof typeof colors];
  };

  const getBgColorClasses = (color: string) => {
    const colors = {
      blue: "bg-blue-50/80",
      green: "bg-green-50/80",
      purple: "bg-purple-50/80",
      yellow: "bg-yellow-50/80",
    };
    return colors[color as keyof typeof colors];
  };

  return (
    <div className="space-y-8">
      {/* 🔽 Filters Row */}
      <div className="flex flex-wrap justify-end gap-3">
        <select
          value={zone}
          onChange={(e) => {
            const selectedZone = e.target.value;
            setZone(selectedZone);
            setBuilding(zoneBuildings[selectedZone][0].id.toString()); // Ensure the correct buildingId is set
          }}
          className="border rounded-lg px-3 py-2"
        >
          <option value="zone1">Zone A</option>
          <option value="zone2">Zone B</option>
          <option value="zone3">Zone C</option>
          <option value="zone4">Zone D</option>
        </select>

        <select value={building} onChange={(e) => setBuilding(e.target.value)} className="border rounded-lg px-3 py-2">
          {zoneBuildings[zone].map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>

        {/* Time Slot Filter (Human-readable only, internally mapped to slot number) */}
        <select value={timeRange} onChange={(e) => handleTimeRangeChange(e.target.value)} className="border rounded-lg px-3 py-2">
          <option value="10am-1pm">10am-1pm</option>
          <option value="1pm-4pm">1pm-4pm</option>
          <option value="4pm-7pm">4pm-7pm</option>
        </select>

        {/* Date Picker */}
        <input
          type="date"
          value={date}
          onChange={handleDateChange}
          min="2025-09-17"
          max="2025-09-28"
          className="border rounded-lg px-3 py-2"
        />

        <button
          onClick={() => setFetchData(true)} // Trigger the data fetch when the button is clicked
          className="px-4 py-2 bg-blue-500 text-white rounded-lg"
        >
          Get Data
        </button>

        {/* Loading spinner */}
        {loading && (
          <div className="flex items-center text-sm text-gray-500">
            <Loader size={16} className="animate-spin mr-2" />
            <span>Loading...</span>
          </div>
        )}
      </div>

      {/* 📊 Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[{ label: "Total Attendees", value: stats.totalVisitors, change: "+12%", icon: Users, color: "blue" },
        { label: "Check-ins", value: stats.totalCheckIns, change: "+8%", icon: MapPin, color: "green" },
        { label: "Avg. Session Time", value: stats.avgDuration, change: "+15%", icon: Clock, color: "purple" },
        { label: "Repeat Visitors", value: stats.repeatVisitors, change: "+10%", icon: BarChart3, color: "yellow" }].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="group relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div
                className={`absolute inset-0 ${getBgColorClasses(stat.color)} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
              ></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`p-3 rounded-xl bg-gradient-to-br ${getColorClasses(stat.color)} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon size={24} />
                  </div>
                  <div className="flex items-center space-x-1 px-2 py-1 bg-green-100 rounded-full">
                    <TrendingUp size={14} className="text-green-600" />
                    <span className="text-sm font-semibold text-green-700">{stat.change}</span>
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* 📈 Bar Chart and Top Sessions side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 📈 Bar Chart */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 p-6 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Visitors per Building</h3>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-600">{timeRange}</span>
            </div>
          </div>
          <div className="h-64 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl flex items-center justify-center border border-white/50">
            <Bar 
              data={barChartData} 
              options={{
                responsive: true,
                scales: {
                  x: {
                    display: false, // Hide the x-axis labels
                  },
                },
                plugins: {
                  tooltip: {
                    callbacks: {
                      title: function (tooltipItem) {
                        const label = tooltipItem[0].label;
                        return label; // Show the building name on hover
                      },
                      label: function (tooltipItem) {
                        const value = tooltipItem.raw;
                        return `Visitors: ${value}`; // Show the visitor count on hover
                      },
                    },
                  },
                },
              }} 
            />
          </div>
        </div>

        {/* 📈 Popular Sessions */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 p-6 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Top Sessions</h3>
            <div className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">Top 3</div>
          </div>
          <div className="space-y-4">
            {topSessions.length === 0 ? (
              <p className="text-gray-400 text-sm text-center">No sessions available</p>
            ) : (
              topSessions.map((session, i) => (
                <div
                  key={i}
                  className="group flex items-center justify-between p-4 bg-gradient-to-r from-gray-50/50 to-white/50 rounded-xl border border-white/50 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 bg-${session.color}-500 rounded-full`}></div>
                    <span className="font-medium text-gray-900 group-hover:text-gray-700 transition-colors duration-200">
                      {session.name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-semibold text-gray-700">{session.visitors}</span>
                    <span className="text-xs text-gray-500">attendees</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewWidget;
