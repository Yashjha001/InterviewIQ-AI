def calculate_score(metrics: dict[str, float]) -> float:
    if not metrics:
        return 0.0
    return sum(metrics.values()) / len(metrics)
