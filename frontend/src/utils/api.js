const BASE_URL = "http://localhost:8000/api";

export async function fetchJson(endpoint, options = {}) {
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "API Error" }));
      throw new Error(err.detail || "Server error");
    }
    return await res.json();
  } catch (error) {
    console.error(`API Error on ${endpoint}:`, error);
    throw error;
  }
}

export const api = {
  // Auth
  registerFarmer: (data) => fetchJson("/auth/register", { method: "POST", body: JSON.stringify(data) }),
  getFarmer: (id) => fetchJson(`/farmers/${id}`),
  getFarmerBookings: (farmerId) => fetchJson(`/farmers/${farmerId}/bookings`),

  // Crops
  getCropCategories: () => fetchJson("/crops/categories"),
  getCrops: (categoryId) => fetchJson(`/crops${categoryId ? `?category_id=${categoryId}` : ""}`),

  // Centres & Slots
  getEligibleCentres: (cropId, lat, lng) => fetchJson(`/centres/eligible?crop_id=${cropId}&lat=${lat || 12.52}&lng=${lng || 76.89}`),
  getCentreSlots: (centreId, date) => fetchJson(`/centres/${centreId}/slots${date ? `?slot_date=${date}` : ""}`),

  // Booking & Recovery
  bookSlot: (data) => fetchJson("/bookings/create", { method: "POST", body: JSON.stringify(data) }),
  getBooking: (id) => fetchJson(`/bookings/${id}`),
  reportDelay: (data) => fetchJson("/bookings/delay", { method: "POST", body: JSON.stringify(data) }),

  // Queue & Officer
  checkInToken: (tokenNumber) => fetchJson(`/queue/checkin?token_number=${encodeURIComponent(tokenNumber)}`, { method: "POST" }),
  updateProcurement: (data) => fetchJson("/procurement/update", { method: "POST", body: JSON.stringify(data) }),
  updatePayment: (data) => fetchJson("/payments/status", { method: "POST", body: JSON.stringify(data) }),

  // Voice Chatbot
  queryVoiceBot: (data) => fetchJson("/voice/query", { method: "POST", body: JSON.stringify(data) }),

  // Notifications
  getNotifications: (farmerId) => fetchJson(`/notifications/${farmerId}`),

  // Admin
  getAdminStats: () => fetchJson("/admin/dashboard_stats"),
  updateMsp: (cropId, rate) => fetchJson(`/admin/update_msp?crop_id=${cropId}&new_rate=${rate}`, { method: "POST" }),
};
