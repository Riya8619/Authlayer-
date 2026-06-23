from sqlalchemy import Column, Integer, String, Text

from app.database.database import Base


class ScanHistory(Base):

    __tablename__ = "scan_history"

    id = Column(Integer, primary_key=True, index=True)

    scan_type = Column(String)

    trust_score = Column(Integer)

    risk_level = Column(String)

    explanations = Column(Text)

    perceptual_hash = Column(String, nullable=True)