import React, { useState, useEffect } from "react";

export default function StudentAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch all assignments
  useEffect(() => {
    fetch("/api/student/assignments")
      .then((res) => res.json())
      .then((data) => setAssignments(data))
      .catch((err) => console.error(err));
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!title || !file) return alert("Please add title and file!");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("file", file);

    setLoading(true);
    try {
      const res = await fetch("/api/student/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        alert("Assignment uploaded successfully!");
        setAssignments([data, ...assignments]);
        setTitle("");
        setFile(null);
      } else {
        alert(data.message || "Upload failed");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  const statusColors = {
    Draft: "bg-gray-300 text-gray-900",
    Submitted: "bg-yellow-400 text-white",
    Approved: "bg-green-500 text-white",
    Rejected: "bg-red-500 text-white",
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">My Assignments</h1>

      {/* Upload Form */}
      <div className="bg-white p-6 rounded-xl shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Upload New Assignment</h2>
        <form onSubmit={handleUpload} className="flex flex-col md:flex-row items-center gap-4">
          <input
            type="text"
            placeholder="Enter assignment title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full md:w-1/3 border border-gray-300 rounded-lg px-4 py-2 focus:outline-blue-400"
          />
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            className="w-full md:w-1/3 border border-gray-300 rounded-lg px-4 py-2"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow-md transition"
          >
            {loading ? "Uploading..." : "Upload"}
          </button>
        </form>
      </div>

      {/* Assignment Table */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-semibold mb-4">All Assignments</h2>
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b bg-gray-100">
              <th className="p-3">Title</th>
              <th className="p-3">Status</th>
              <th className="p-3">Date</th>
              <th className="p-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {assignments.length > 0 ? (
              assignments.map((item, i) => (
                <tr key={i} className="border-b hover:bg-gray-50">
                  <td className="p-3">{item.title}</td>
                  <td className="p-3">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[item.status]}`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="p-3">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-3 text-right">
                    <a
                      href={item.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View File
                    </a>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center py-6 text-gray-500">
                  No assignments uploaded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Navigation */}
      <div className="mt-8 flex justify-end">
        <a
          href="/dashboard"
          className="bg-gray-600 hover:bg-gray-700 text-white px-5 py-2 rounded-lg shadow-md transition"
        >
          Go to Dashboard
        </a>
      </div>
    </div>
  );
}
