import React, { useEffect, useState } from "react";
import { batchAPI, batchAccessAPI } from "../services/apiService";

const StudentBatchAccessUI = ({ studentId }) => {
  const [batches, setBatches] = useState([]); // all batches from server
  const [accessList, setAccessList] = useState([]); // access requests for this student
  const [loading, setLoading] = useState(true);
  const [requestingBatch, setRequestingBatch] = useState(null); // batchName being requested
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch all batches
    const fetchBatches = async () => {
      try {
        const batchesRes = await batchAPI.getBatches();
        setBatches(batchesRes);
      } catch (err) {
        setError("Failed to load batches");
      }
    };

    // Fetch this student's batch access list
    const fetchAccessList = async () => {
      try {
        const accessRes = await batchAccessAPI.getAccessList(studentId);
        setAccessList(accessRes);
      } catch (err) {
        setError("Failed to load access list");
      }
    };

    Promise.all([fetchBatches(), fetchAccessList()]).finally(() => setLoading(false));
  }, [studentId]);

  const handleRequestAccess = async (batchName) => {
    setRequestingBatch(batchName);
    setError(null);
    try {
      await batchAccessAPI.requestAccess(studentId, batchName);
      // Refresh access list after request
      const accessRes = await batchAccessAPI.getAccessList(studentId);
      setAccessList(accessRes);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to send access request"
      );
    } finally {
      setRequestingBatch(null);
    }
  };

  const getBatchAccessStatus = (batchName) => {
    const access = accessList.find((a) => a.batchName === batchName);
    return access ? access.status : null;
  };

  if (loading) return <div>Loading batches and access status...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">
        🎓 Student Batch Access
      </h1>

      {error && (
        <div className="mb-4 text-red-600 font-semibold">{error}</div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        {batches.map((batch) => {
          const status = getBatchAccessStatus(batch.batchName);
          const isApproved = status === "approved";
          const isPending = status === "pending";

          return (
            <div
              key={batch._id}
              className="border rounded-lg p-4 shadow hover:shadow-lg transition relative"
            >
              <h2 className="text-xl font-semibold mb-2">{batch.batchName}</h2>

              <div className="mb-4">
                {isApproved && (
                  <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                    ✔ Approved - Access Granted
                  </span>
                )}
                {isPending && (
                  <span className="inline-block bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold">
                    ⏳ Pending Approval
                  </span>
                )}
                {!status && (
                  <span className="inline-block bg-gray-200 text-gray-600 px-3 py-1 rounded-full text-sm font-semibold">
                    ❌ No Request Made
                  </span>
                )}
              </div>

              {/* Show exams if approved */}
              {isApproved && batch.exams && batch.exams.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Exams in this Batch:</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {batch.exams.map((exam) => (
                      <li key={exam._id}>
                        {exam.examName} ({exam.examCode}) - Duration: {exam.duration} mins
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Request Access Button if not pending or approved */}
              {!isApproved && !isPending && (
                <button
                  disabled={requestingBatch === batch.batchName}
                  onClick={() => handleRequestAccess(batch.batchName)}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-wait"
                >
                  {requestingBatch === batch.batchName
                    ? "Requesting..."
                    : "Request Access"}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StudentBatchAccessUI;
