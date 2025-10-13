import React, { useState } from "react";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function OnboardingStep2({ onNext, onBack }) {
  const [progress, setProgress] = useState(30);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    phone: "",
    email: "",
    year: "",
    gender: "",
    regNo: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const regPattern = /^RA\d{13}$/; // starts with RA + 13 digits
    if (!formData.name || !formData.age || !formData.phone || !formData.email || !formData.year || !formData.gender || !formData.regNo) {
      setError("Please fill out all fields.");
      return false;
    }
    if (!regPattern.test(formData.regNo)) {
      setError("Registration number must be in RAxxxxxxxxxxxxx format (RA + 13 digits).");
      return false;
    }
    setError("");
    return true;
  };

  const handleNext = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const res = await fetch("https://hackmate-ybgv.onrender.com/user/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          age: Number(formData.age),
          phoneNumber: formData.phone,
          email: formData.email,
          password: "temp123", // temporary for onboarding
          year: formData.year,
          gender: formData.gender,
          raNumber: formData.regNo,
        }),
      });

      const data = await res.json();
      if (data.success) {
        console.log("✅ User created:", data.user);
        setProgress(100);
        onNext?.(formData);
        navigate("/skills"); // next onboarding step
      } else {
        setError(data.message || "Something went wrong. Please try again.");
      }
    } catch (err) {
      console.error("❌ Error creating user:", err);
      setError("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200 font-sans">
      {/* Progress Bar */}
      <div className="w-3/4 mb-10">
        <div className="h-2 bg-blue-300 rounded-full overflow-hidden">
          <div
            className="h-2 bg-blue-700 transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Form Section */}
      <div className="flex flex-col md:flex-row w-3/4">
        {/* Left Panel */}
        <div className="bg-blue-800 text-white p-10 rounded-2xl flex items-center justify-center md:w-1/3 mb-6 md:mb-0 md:mr-6">
          <h2 className="text-2xl font-bold tracking-widest rotate-0 md:-rotate-90 whitespace-nowrap">
            Introduce Yourself !
          </h2>
        </div>

        {/* Form Card */}
        <div className="flex-1 bg-white/70 backdrop-blur-md p-10 rounded-2xl shadow-lg">
          <h1 className="text-3xl font-extrabold text-blue-900 mb-8 text-center">
            Tell us about yourself
          </h1>

          {error && <p className="text-red-600 text-center mb-4">{error}</p>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Full Name"
              className="p-3 rounded-xl border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              placeholder="Age"
              className="p-3 rounded-xl border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Phone Number"
              className="p-3 rounded-xl border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Personal Email"
              className="p-3 rounded-xl border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <select
              name="year"
              value={formData.year}
              onChange={handleChange}
              className="p-3 rounded-xl border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Year of Study</option>
              <option value="1st Year">1st Year</option>
              <option value="2nd Year">2nd Year</option>
              <option value="3rd Year">3rd Year</option>
              <option value="4th Year">4th Year</option>
            </select>

            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="p-3 rounded-xl border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>

            <input
              type="text"
              name="regNo"
              value={formData.regNo}
              onChange={handleChange}
              placeholder="Registration Number (e.g. RA2311043010009)"
              className="md:col-span-2 p-3 rounded-xl border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Buttons */}
          <div className="mt-10 flex justify-between">
            <button
              onClick={() => {
                setProgress(33);
                onBack?.();
                navigate("/details");
              }}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-6 rounded-xl flex items-center gap-2 transition-all duration-300"
            >
              <ArrowLeft size={18} /> Back
            </button>

            <button
              onClick={handleNext}
              disabled={loading}
              className={`${
                loading ? "bg-green-300" : "bg-green-500 hover:bg-green-600"
              } text-white font-bold py-2 px-6 rounded-xl flex items-center gap-2 transition-all duration-300`}
            >
              {loading ? "Saving..." : <>Next <ArrowRight size={18} /></>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
