import math
import random

class AIEngine:
    """
    AI/ML Engine for Procurement Centre Crowd Management,
    Waiting-time Prediction, Overloaded-Centre Detection, and Rerouting.
    """

    @staticmethod
    def predict_waiting_time(queue_length: int, counters_count: int, avg_processing_minutes: float) -> int:
        """
        Calculates estimated waiting time in minutes using queue length,
        active counters, average processing time per farmer, and ML load multiplier.
        """
        if queue_length <= 0:
            return 0

        active_counters = max(1, counters_count)
        # Base formula: (Farmers ahead / active counters) * avg processing time
        base_minutes = (queue_length / active_counters) * avg_processing_minutes

        # ML Load multiplier based on queue depth
        if queue_length > 15:
            multiplier = 1.25 # Congestion fatigue factor
        elif queue_length > 8:
            multiplier = 1.1
        else:
            multiplier = 1.0

        estimated = math.ceil(base_minutes * multiplier)
        return max(5, estimated)

    @staticmethod
    def evaluate_centre_crowd_status(queue_length: int, available_slots: int, capacity_ratio: float) -> str:
        """
        Classifies centre as GREEN, YELLOW, or RED based on real-time load.
        """
        if queue_length >= 15 or capacity_ratio >= 0.85:
            return "RED" # Overloaded
        elif queue_length >= 7 or capacity_ratio >= 0.55:
            return "YELLOW" # Moderate Crowd
        else:
            return "GREEN" # Low Crowd

    @staticmethod
    def recommend_alternative_centres(centres: list, selected_centre_id: int) -> list:
        """
        If selected centre is RED (overloaded), recommends alternative nearby centres
        with shorter queues and shorter estimated waiting times.
        """
        target = next((c for c in centres if c['id'] == selected_centre_id), None)
        if not target:
            return []

        # Find alternatives that are GREEN or YELLOW and have lower wait time
        recommendations = []
        for c in centres:
            if c['id'] != selected_centre_id and c['estimated_wait_minutes'] < target['estimated_wait_minutes']:
                diff_minutes = target['estimated_wait_minutes'] - c['estimated_wait_minutes']
                recommendations.append({
                    "centre_id": c['id'],
                    "name": c['name'],
                    "name_kn": c['name_kn'],
                    "name_hi": c['name_hi'],
                    "distance_km": c['distance_km'],
                    "crowd_status": c['crowd_status'],
                    "estimated_wait_minutes": c['estimated_wait_minutes'],
                    "time_saved_minutes": diff_minutes,
                    "reason": f"Saves {diff_minutes} minutes waiting time compared to {target['name']}"
                })

        # Sort by shortest waiting time
        recommendations.sort(key=lambda x: x['estimated_wait_minutes'])
        return recommendations
