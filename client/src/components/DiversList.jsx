import React, { useState, useEffect } from "react";
import axios from "axios";

export const DiversList = ({ onLogout }) => {
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [dives, setDives] = useState([]);
  const [fetching, setFetching] = useState(false);
  const [editingDiveId, setEditingDiveId] = useState(null);
  const [editDate, setEditDate] = useState("");
  const [editStatus, setEditStatus] = useState("Pending");
  const [updating, setUpdating] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
  const isAdmin = (() => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      return user?.role === "admin";
    } catch {
      return false;
    }
  })();

  const handleCreateDive = async () => {
    setError(null);
    if (modalOpen) setModalOpen(false);

    if (!date) {
      const message = "יש לבחור תאריך";
      setError(message);
      setModalTitle("שגיאה");
      setModalMessage(message);
      setModalOpen(true);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      const message = "לא מחובר. נא להתחבר מחדש";
      setError(message);
      setModalTitle("שגיאה");
      setModalMessage(message);
      setModalOpen(true);
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(
        `${API_BASE_URL}/dive/createDive`,
        { date },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res?.status === 201) {
        setModalTitle("בוצע");
        setModalMessage("הצלילה נוצרה בהצלחה");
        setModalOpen(true);
        // אופציונלי: לאפס תאריך
        // setDate('')
        // ריענון הרשימה לאחר יצירה
        fetchDives();
      }
    } catch (err) {
      const status = err?.response?.status;
      const message =
        err?.response?.data?.message || err.message || "שגיאה ביצירת צלילה";
      setError(message);
      if (status === 401 && typeof onLogout === "function") {
        onLogout();
      } else {
        setModalTitle("שגיאה");
        setModalMessage(message);
        setModalOpen(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchDives = async () => {
    setError(null);
    const token = localStorage.getItem("token");
    if (!token) {
      if (typeof onLogout === "function") onLogout();
      return;
    }
    try {
      setFetching(true);
      const endpoint = isAdmin ? "/dive/all" : "/dive/myDives";
      const res = await axios.get(
        `${API_BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setDives(res?.data?.dives || []);
    } catch (err) {
      const status = err?.response?.status;
      const message =
        err?.response?.data?.message || err.message || "שגיאה בטעינת צלילות";
      setError(message);
      if (status === 401 && typeof onLogout === "function") {
        onLogout();
      } else {
        setModalTitle("שגיאה");
        setModalMessage(message);
        setModalOpen(true);
      }
    } finally {
      setFetching(false);
    }
  };

  const handleUpdateDive = async (id, payload) => {
    setError(null);
    if (modalOpen) setModalOpen(false);
    const token = localStorage.getItem("token");
    if (!token) {
      if (typeof onLogout === "function") onLogout();
      return;
    }
    try {
      setUpdating(true);
      await axios.patch(`${API_BASE_URL}/dive/${id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setModalTitle("בוצע");
      setModalMessage("ההזמנה עודכנה בהצלחה");
      setModalOpen(true);
      setEditingDiveId(null);
      fetchDives();
    } catch (err) {
      const status = err?.response?.status;
      const message = err?.response?.data?.message || err.message || "שגיאה בעדכון";
      setError(message);
      if (status === 401 && typeof onLogout === "function") {
        onLogout();
      } else {
        setModalTitle("שגיאה");
        setModalMessage(message);
        setModalOpen(true);
      }
    } finally {
      setUpdating(false);
    }
  };

  const openEditDive = (dive) => {
    setEditingDiveId(dive._id);
    setEditDate(dive.date || "");
    setEditStatus(dive.status || "Pending");
  };

  const cancelEdit = () => {
    setEditingDiveId(null);
  };

  useEffect(() => {
    fetchDives();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-700 to-cyan-600 p-4">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-2xl p-6 mb-6">
          <div className="flex justify-between items-center">
            <button
              onClick={onLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition duration-200"
            >
              התנתק
            </button>
            <div className="text-right">
              <h1 className="text-3xl font-bold text-gray-900">
                רשימת צוללנים
              </h1>
              <p className="text-gray-600 mt-2">ניהול צוללים וצלילות</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-2xl p-6">
          {/* Create Dive */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 text-right">
              יצירת צלילה חדשה
            </h2>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleCreateDive}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-4 py-2 rounded-md transition duration-200"
              >
                {loading ? "יוצר…" : "צור צלילה"}
              </button>
            </div>
            {error && (
              <div className="text-red-600 text-sm mt-2 text-right">
                {error}
              </div>
            )}
            {/* success handled via modal */}
          </div>
          {/* My Dives List */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-800 text-right">
                הצלילות שלי
              </h3>
              <button
                onClick={fetchDives}
                disabled={fetching}
                className="text-sm bg-gray-100 hover:bg-gray-200 disabled:opacity-60 text-gray-800 px-3 py-1 rounded-md"
              >
                {fetching ? "טוען…" : "רענן"}
              </button>
            </div>
            {dives.length === 0 && !fetching && (
              <div className="text-gray-500 text-right">אין צלילות להצגה</div>
            )}
            {dives.length > 0 && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        תאריך
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        סטטוס
                      </th>
                      {isAdmin && (
                        <>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            צוללן
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            אימייל
                          </th>
                        </>
                      )}
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        נוצר
                      </th>
                      {isAdmin && (
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">פעולות</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {dives.map((dive) => (
                      <tr key={dive._id}>
                        <td className="px-4 py-2 whitespace-nowrap">
                          {dive.date}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          {dive.status}
                        </td>
                        {isAdmin && (
                          <>
                            <td className="px-4 py-2 whitespace-nowrap">
                              {dive?.user?.fullName || "-"}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap">
                              {dive?.user?.email || "-"}
                            </td>
                          </>
                        )}
                        <td className="px-4 py-2 whitespace-nowrap">
                          {new Date(dive.createdAt).toLocaleString()}
                        </td>
                        {isAdmin && (
                          <td className="px-4 py-2 whitespace-nowrap">
                            {editingDiveId === dive._id ? (
                              <div className="flex items-center gap-2">
                                <input
                                  type="date"
                                  value={editDate}
                                  onChange={(e) => setEditDate(e.target.value)}
                                  className="px-2 py-1 border border-gray-300 rounded"
                                />
                                <select
                                  value={editStatus}
                                  onChange={(e) => setEditStatus(e.target.value)}
                                  className="px-2 py-1 border border-gray-300 rounded"
                                >
                                  <option value="Pending">Pending</option>
                                  <option value="Approved">Approved</option>
                                  <option value="Rejected">Rejected</option>
                                </select>
                                <button
                                  onClick={() => handleUpdateDive(dive._id, { date: editDate, status: editStatus })}
                                  disabled={updating}
                                  className="text-xs bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-2 py-1 rounded"
                                >
                                  שמור
                                </button>
                                <button
                                  onClick={cancelEdit}
                                  className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-800 px-2 py-1 rounded"
                                >
                                  בטל
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleUpdateDive(dive._id, { status: "Approved" })}
                                  className="text-xs bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded"
                                >
                                  אשר
                                </button>
                                <button
                                  onClick={() => handleUpdateDive(dive._id, { status: "Rejected" })}
                                  className="text-xs bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded"
                                >
                                  דחה
                                </button>
                                <button
                                  onClick={() => openEditDive(dive)}
                                  className="text-xs bg-gray-600 hover:bg-gray-700 text-white px-2 py-1 rounded"
                                >
                                  ערוך
                                </button>
                              </div>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 text-right">{modalTitle}</h3>
            <p className="text-gray-700 mb-6 text-right">{modalMessage}</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setModalOpen(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
              >
                סגור
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
