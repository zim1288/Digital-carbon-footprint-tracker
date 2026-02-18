def generate_recommendations(features):

    recommendations = []

    if not features:
        return None

    if features["most_used_activity"] == "video_streaming":
        recommendations.append(
            "Reduce video streaming quality to 720p to lower carbon emission."
        )

    if features["video_streaming_ratio"] > 0.5:
        recommendations.append(
            "Try limiting video streaming hours per day."
        )

    if features["social_media_ratio"] > 0.4:
        recommendations.append(
            "Reduce excessive social media scrolling time."
        )

    if features["avg_daily_carbon"] > 80:
        recommendations.append(
            "Consider setting daily digital usage limits."
        )

    if not recommendations:
        recommendations.append(
            "Your digital usage is well balanced. Keep maintaining eco-friendly habits."
        )

    return recommendations
