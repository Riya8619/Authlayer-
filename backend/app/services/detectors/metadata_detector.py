import exifread
import io


def analyze_metadata(file_bytes: bytes):

    tags = exifread.process_file(
        io.BytesIO(file_bytes)
    )

    cleaned = {}

    for key, value in tags.items():
        cleaned[key] = str(value)

    return {
        "metadata_found": len(cleaned) > 0,
        "metadata_count": len(cleaned),
        "metadata": cleaned
    }