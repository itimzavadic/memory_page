from django.db import models


class MemorialStatus(models.TextChoices):
    DRAFT = "draft", "Черновик"
    PUBLISHED = "published", "Опубликован"


class EventType(models.TextChoices):
    SERVICE = "service", "Служба"
    RECEPTION = "reception", "Поминки"
    OTHER = "other", "Другое"


class TributeStatus(models.TextChoices):
    PENDING = "pending", "На модерации"
    APPROVED = "approved", "Одобрено"
    REJECTED = "rejected", "Отклонено"


class MediaType(models.TextChoices):
    PHOTO = "photo", "Фото"
    VIDEO = "video", "Видео"


class Memorial(models.Model):
    slug = models.SlugField("URL-идентификатор", max_length=200, unique=True)
    last_name = models.CharField("Фамилия", max_length=100)
    first_name = models.CharField("Имя", max_length=100)
    patronymic = models.CharField("Отчество", max_length=100, blank=True)
    birth_date = models.DateField("Дата рождения")
    death_date = models.DateField("Дата смерти")
    portrait = models.ImageField("Портрет", upload_to="portraits/", blank=True)
    remembering_title = models.CharField(
        "Заголовок «Помним…»",
        max_length=200,
        default="Помним",
        blank=True,
    )
    remembering_text = models.TextField("Развёрнутая биография", blank=True)
    events_intro = models.TextField(
        "Вступление к событиям",
        blank=True,
        default="Следующие мероприятия организованы для родных и друзей, чтобы вместе вспомнить и поддержать друг друга.",
    )
    slideshow_music = models.FileField(
        "Музыка слайд-шоу",
        upload_to="music/",
        blank=True,
    )
    status = models.CharField(
        max_length=20,
        choices=MemorialStatus.choices,
        default=MemorialStatus.DRAFT,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Страница памяти"
        verbose_name_plural = "Страницы памяти"

    def __str__(self):
        return self.full_name

    @property
    def full_name(self):
        parts = [self.last_name, self.first_name]
        if self.patronymic:
            parts.append(self.patronymic)
        return " ".join(parts)

    @property
    def is_published(self):
        return self.status == MemorialStatus.PUBLISHED


class BiographySection(models.Model):
    memorial = models.ForeignKey(
        Memorial,
        on_delete=models.CASCADE,
        related_name="biography_sections",
    )
    title = models.CharField("Заголовок", max_length=200)
    text = models.TextField("Текст")
    image = models.ImageField("Фото", upload_to="biography/", blank=True)
    order = models.PositiveIntegerField("Порядок", default=0)

    class Meta:
        ordering = ["order", "id"]
        verbose_name = "Блок биографии"
        verbose_name_plural = "Блоки биографии"

    def __str__(self):
        return self.title


class Event(models.Model):
    memorial = models.ForeignKey(
        Memorial,
        on_delete=models.CASCADE,
        related_name="events",
    )
    event_type = models.CharField(
        max_length=20,
        choices=EventType.choices,
        default=EventType.SERVICE,
    )
    date = models.DateField("Дата")
    start_time = models.TimeField("Начало", null=True, blank=True)
    end_time = models.TimeField("Конец", null=True, blank=True)
    location_name = models.CharField("Место", max_length=300)
    address = models.CharField("Адрес", max_length=500, blank=True)
    phone = models.CharField("Телефон", max_length=50, blank=True)
    description = models.TextField("Описание", blank=True)
    order = models.PositiveIntegerField("Порядок", default=0)

    class Meta:
        ordering = ["order", "date", "id"]
        verbose_name = "Событие"
        verbose_name_plural = "События"

    def __str__(self):
        return f"{self.get_event_type_display()} — {self.location_name}"


class GalleryItem(models.Model):
    memorial = models.ForeignKey(
        Memorial,
        on_delete=models.CASCADE,
        related_name="gallery_items",
    )
    media_type = models.CharField(
        max_length=10,
        choices=MediaType.choices,
        default=MediaType.PHOTO,
    )
    image = models.ImageField("Фото", upload_to="gallery/", blank=True)
    video = models.FileField("Видео", upload_to="gallery/videos/", blank=True)
    caption = models.CharField("Подпись", max_length=500, blank=True)
    order = models.PositiveIntegerField("Порядок", default=0)

    class Meta:
        ordering = ["order", "id"]
        verbose_name = "Элемент галереи"
        verbose_name_plural = "Галерея"

    def __str__(self):
        return self.caption or f"Галерея #{self.pk}"


class TimelineItem(models.Model):
    memorial = models.ForeignKey(
        Memorial,
        on_delete=models.CASCADE,
        related_name="timeline_items",
    )
    year = models.PositiveIntegerField("Год")
    title = models.CharField("Заголовок", max_length=200)
    description = models.TextField("Описание", blank=True)
    order = models.PositiveIntegerField("Порядок", default=0)

    class Meta:
        ordering = ["order", "year", "id"]
        verbose_name = "Событие таймлайна"
        verbose_name_plural = "Таймлайн"

    def __str__(self):
        return f"{self.year} — {self.title}"


class Tribute(models.Model):
    memorial = models.ForeignKey(
        Memorial,
        on_delete=models.CASCADE,
        related_name="tributes",
    )
    author_name = models.CharField("Имя автора", max_length=200)
    email = models.EmailField("Email", blank=True)
    text = models.TextField("Текст воспоминания")
    image = models.ImageField("Фото", upload_to="tributes/", blank=True)
    video = models.FileField("Видео", upload_to="tributes/videos/", blank=True)
    status = models.CharField(
        max_length=20,
        choices=TributeStatus.choices,
        default=TributeStatus.PENDING,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Воспоминание"
        verbose_name_plural = "Воспоминания"

    def __str__(self):
        return f"{self.author_name} — {self.memorial.full_name}"
