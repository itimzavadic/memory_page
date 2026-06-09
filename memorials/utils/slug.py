import re

from transliterate import translit

from memorials.models import Memorial


def slugify_part(text: str) -> str:
    if not text:
        return ""
    latin = translit(text.strip(), "ru", reversed=True)
    latin = latin.lower()
    latin = re.sub(r"[^a-z0-9]+", "-", latin)
    return latin.strip("-")


def generate_slug(last_name: str, first_name: str, patronymic: str, birth_date) -> str:
    parts = [
        slugify_part(last_name),
        slugify_part(first_name),
        slugify_part(patronymic),
    ]
    parts = [p for p in parts if p]
    if birth_date:
        parts.append(str(birth_date.year))
    base = "-".join(parts) or "memorial"
    slug = base
    counter = 2
    while Memorial.objects.filter(slug=slug).exists():
        slug = f"{base}-{counter}"
        counter += 1
    return slug
