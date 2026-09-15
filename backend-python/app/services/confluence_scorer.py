class ConfluenceScorer:
    WEIGHTS = {
        "harmonic": 0.35,
        "structure": 0.25,
        "volume_z_score": 0.20,
        "pitchfork_confluence": 0.15,
        "gann_confluence": 0.05
    }

    @staticmethod
    def calculate_total_score(factors: dict) -> float:
        """
        Calculate a weighted confluence score (1-100)
        factors: dict of factor names and their raw scores (0-100)
        """
        total_score = 0
        for factor, weight in ConfluenceScorer.WEIGHTS.items():
            raw_score = factors.get(factor, 0)
            total_score += (raw_score * weight)
        
        return round(total_score, 2)
