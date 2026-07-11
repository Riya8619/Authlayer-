from abc import ABC, abstractmethod


class BaseProvider(ABC):

    @abstractmethod
    def analyze_text(self, text: str) -> dict:
        pass

    @abstractmethod
    def analyze_image(self, image_bytes: bytes) -> dict:
        pass

    @abstractmethod
    def check_url(self, url: str) -> dict:
        pass