import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../firebase.js";
import { collection, getDocs, query, where } from "firebase/firestore";
import SearchBar from "./SearchBar.jsx";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.pathname);
  const [user, setUser] = useState(null);
  const [selectedProfessor, setSelectedProfessor] = useState(null);

  // Update active tab when route changes
  useEffect(() => {
    setActiveTab(location.pathname);
  }, [location.pathname]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const colRef = collection(db, "Users");
        const q = query(colRef, where("uid", "==", currentUser.uid));
        const snapshot = await getDocs(q);

        if (snapshot.size > 0) {
          snapshot.forEach((doc) => {
            setUser(doc.data());
          });
        } else {
          setUser(currentUser);
        }
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <div className="bg-white shadow-md px-6 py-3 flex justify-between items-center">
      {/* Left - Portal Title */}
      <h1 className="text-2xl font-bold text-gray-800">
        <Link to="/" className="hover:underline">
          Faculty Portal
        </Link>
      </h1>

      {/* Show full navbar only if user is logged in */}
      {user && (
        <>
          {/* Center - Search Bar */}
          <SearchBar onSelect={setSelectedProfessor} />

          {/* Display Professor Card when selected */}
          {selectedProfessor && (
            <div className="mt-4 p-4 border border-gray-300 rounded-md shadow-md w-full">
              <h2 className="text-xl font-bold">{selectedProfessor.name}</h2>
              <p className="text-gray-600">Department: {selectedProfessor.department}</p>
              <p className="text-gray-600">Email: {selectedProfessor.email}</p>
            </div>
          )}

          {/* Right - Navigation */}
          <div className="flex items-center space-x-6 text-gray-700">
            <button
              onClick={() => navigate("/messages")}
              className={`px-3 py-1 rounded ${activeTab === "/messages" ? "bg-gray-200 text-gray-900 font-semibold" : "hover:text-blue-500"}`}
            >
              Messages
            </button>

            <button
              onClick={() => navigate("/profile/" + user.userName)}
              className={`px-3 py-1 rounded ${activeTab === "/profile" ? "bg-gray-200 text-gray-900 font-semibold" : "hover:text-blue-500"}`}
            >
              Profile
            </button>

            <button onClick={handleLogout} className="text-gray-600 hover:text-red-500">
              Logout
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Navbar;
