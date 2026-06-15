from datetime import date, time
from pathlib import Path

from django.conf import settings
from django.core.files import File
from django.core.management.base import BaseCommand

from memorials.models import (
    BiographySection,
    Event,
    EventType,
    Memorial,
    MemorialStatus,
    TimelineItem,
    Tribute,
    TributeStatus,
)
from memorials.templatetags.memorial_tags import HERO_IMAGES

DEMO_PORTRAIT_CANDIDATES = [
    Path(settings.BASE_DIR) / "content" / "photo_2026-06-09_17-13-00.png",
    Path(settings.BASE_DIR) / "memorials" / "static" / HERO_IMAGES["portrait"],
]


class Command(BaseCommand):
    help = "Загрузить демо-страницу памяти (Маргарет Томпсон)"

    def _attach_demo_portrait(self, memorial):
        if memorial.portrait:
            return
        portrait_path = next((p for p in DEMO_PORTRAIT_CANDIDATES if p.is_file()), None)
        if not portrait_path:
            return
        with portrait_path.open("rb") as portrait_file:
            memorial.portrait.save(portrait_path.name, File(portrait_file), save=True)

    def handle(self, *args, **options):
        memorial, created = Memorial.objects.get_or_create(
            slug="thompson-margaret-elaine-1948",
            defaults={
                "last_name": "Томпсон",
                "first_name": "Маргарет",
                "patronymic": "Элейн",
                "birth_date": date(1948, 4, 12),
                "death_date": date(2024, 9, 24),
                "remembering_title": "Помним",
                "remembering_text": (
                    "Маргарет Элейн «Мэгги» Томпсон, 76 лет, мирно ушла из жизни дома "
                    "24 сентября 2024 года, в окружении близких.\n\n"
                    "Мэгги прожила 42 года в счастливом браке с Чарльзом «Чарли» Томпсоном. "
                    "Вместе они воспитали двоих детей — Эмили и Томаса — и радовались трём внукам."
                ),
                "status": MemorialStatus.PUBLISHED,
            },
        )

        if created:
            BiographySection.objects.bulk_create([
                BiographySection(
                    memorial=memorial, order=0,
                    title="Тёплая и любящая душа",
                    text="Маргарет Элейн «Мэгги» Томпсон родилась в Чарльстоне, Южная Каролина, 12 апреля 1948 года. "
                         "На протяжении всей жизни она несла тепло и доброту, которые трогали каждого.",
                ),
                BiographySection(
                    memorial=memorial, order=1,
                    title="Семейная жизнь",
                    text="Мэгги глубоко любили родители Самуэль и Рут Томпсон. Она прожила 42 года в браке с Чарльзом "
                         "«Чарли» Томпсоном. Вместе они воспитали Эмили и Томаса.",
                ),
                BiographySection(
                    memorial=memorial, order=2,
                    title="Наследие любви",
                    text="Вид её кресла-качалки на крыльце, где она сидела с чашкой чая и махала соседям, "
                         "остаётся символом её гостеприимного духа.",
                ),
            ])

            Event.objects.create(
                memorial=memorial, order=0,
                event_type=EventType.SERVICE,
                date=date(2024, 9, 27),
                start_time=time(10, 0),
                end_time=time(12, 0),
                location_name="Rose City Cemetery and Funeral Home",
                address="5625 Northeast Fremont Street, Portland, OR, 97213",
                phone="+15035551234",
            )
            Event.objects.create(
                memorial=memorial, order=1,
                event_type=EventType.RECEPTION,
                date=date(2024, 9, 27),
                start_time=time(14, 0),
                location_name="Резиденция Томпсонов",
                description="После службы семья приглашает на поминальный приём.",
            )

            TimelineItem.objects.bulk_create([
                TimelineItem(memorial=memorial, order=0, year=1948, title="Рождение", description="Чарльстон, Южная Каролина"),
                TimelineItem(memorial=memorial, order=1, year=1970, title="Начало карьеры учителя", description="35 лет в начальной школе"),
                TimelineItem(memorial=memorial, order=2, year=2018, title="Книга стихов", description="Опубликовала сборник стихов в 70 лет"),
            ])

            Tribute.objects.create(
                memorial=memorial,
                author_name="Лукас Томпсон",
                text="Бабушка всегда называла меня «дружище» и вселяла уверенность, что я могу всё.",
                status=TributeStatus.APPROVED,
            )

        self._attach_demo_portrait(memorial)

        self.stdout.write(self.style.SUCCESS(
            f"Демо-страница: /p/{memorial.slug}/"
        ))
