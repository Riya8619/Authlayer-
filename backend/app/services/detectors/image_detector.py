from PIL import Image
import imagehash
import io


def analyze_image(image_bytes: bytes):

    image = Image.open(io.BytesIO(image_bytes))

    perceptual_hash = str(
        imagehash.phash(image)
    )

    return {
        "perceptual_hash": perceptual_hash,
        "image_size": image.size,
        "format": image.format
    }