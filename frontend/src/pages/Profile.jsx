import { useState } from "react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { Upload, User } from "lucide-react";
import api from "../api";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [saving, setSaving] = useState(false);
  const [uploadingId, setUploadingId] = useState(false);
  const [uploadingAddr, setUploadingAddr] = useState(false);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put("/users/me", { name, phone });
      await refreshUser();
      toast.success("Profile updated");
    } catch {
      toast.error("Update failed");
    } finally {
      setSaving(false);
    }
  };

  const uploadFile = async (file, endpoint, setLoading) => {
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      await api.post(endpoint, fd);
      await refreshUser();
      toast.success("Document uploaded");
    } catch {
      toast.error("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Profile</h1>

      <div className="card p-6">
        <div className="flex items-center gap-4 mb-6">
          {user?.profile_pic
            ? <img src={user.profile_pic} className="w-16 h-16 rounded-full object-cover" alt="" />
            : <div className="w-16 h-16 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-2xl font-bold">
                {user?.name?.[0]}
              </div>}
          <div>
            <p className="font-semibold text-gray-900">{user?.name}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              Member since {user?.created_at ? format(new Date(user.created_at), "MMMM yyyy") : "—"}
            </p>
          </div>
        </div>
        <form onSubmit={save} className="space-y-4">
          <div>
            <label className="label">Full Name</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <label className="label">Phone Number</label>
            <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 XXXXX XXXXX" />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input bg-gray-50" value={user?.email || ""} disabled />
          </div>
          <button type="submit" disabled={saving} className="btn-primary">{saving ? "Saving…" : "Save Changes"}</button>
        </form>
      </div>

      <div className="card p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Identity Documents</h2>
        <p className="text-xs text-gray-500">Required before renting items. Documents are kept private.</p>

        {[
          { label: "ID Proof", urlKey: "id_proof_url", endpoint: "/users/me/upload-id-proof", loading: uploadingId, setLoading: setUploadingId, placeholder: "Aadhaar, PAN, Passport" },
          { label: "Address Proof", urlKey: "address_proof_url", endpoint: "/users/me/upload-address-proof", loading: uploadingAddr, setLoading: setUploadingAddr, placeholder: "Utility bill, Bank statement" },
        ].map(({ label, urlKey, endpoint, loading, setLoading, placeholder }) => (
          <div key={urlKey} className="flex items-center gap-3">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700">{label}</p>
              <p className="text-xs text-gray-400">{placeholder}</p>
            </div>
            {user?.[urlKey] ? (
              <div className="flex items-center gap-2">
                <span className="badge bg-green-100 text-green-800">Uploaded ✓</span>
                <label className="text-xs text-primary-600 cursor-pointer hover:underline">
                  Replace
                  <input type="file" className="hidden" accept="image/*,.pdf"
                    onChange={(e) => e.target.files[0] && uploadFile(e.target.files[0], endpoint, setLoading)} />
                </label>
              </div>
            ) : (
              <label className={`btn-secondary text-xs flex items-center gap-1.5 cursor-pointer ${loading ? "opacity-50" : ""}`}>
                <Upload size={13} /> {loading ? "Uploading…" : "Upload"}
                <input type="file" className="hidden" accept="image/*,.pdf" disabled={loading}
                  onChange={(e) => e.target.files[0] && uploadFile(e.target.files[0], endpoint, setLoading)} />
              </label>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
