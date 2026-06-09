import io

import qrcode
from django.http import HttpResponse


def generate_qr_png(url: str, size: int = 10) -> bytes:
    qr = qrcode.QRCode(version=1, box_size=size, border=2)
    qr.add_data(url)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    return buffer.getvalue()


def qr_response(url: str, filename: str = "qr.png") -> HttpResponse:
    data = generate_qr_png(url)
    response = HttpResponse(data, content_type="image/png")
    response["Content-Disposition"] = f'attachment; filename="{filename}"'
    return response
