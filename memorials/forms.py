from django import forms
from django.forms import inlineformset_factory

from memorials.models import (
    BiographySection,
    Event,
    GalleryItem,
    Memorial,
    TimelineItem,
    Tribute,
)


class MemorialBasicForm(forms.ModelForm):
    class Meta:
        model = Memorial
        fields = [
            "slug",
            "last_name",
            "first_name",
            "patronymic",
            "birth_date",
            "death_date",
            "portrait",
            "remembering_title",
            "remembering_text",
            "events_intro",
            "slideshow_music",
            "status",
        ]
        widgets = {
            "birth_date": forms.DateInput(attrs={"type": "date"}),
            "death_date": forms.DateInput(attrs={"type": "date"}),
            "remembering_text": forms.Textarea(attrs={"rows": 8}),
            "events_intro": forms.Textarea(attrs={"rows": 3}),
        }


class MemorialCreateForm(forms.ModelForm):
    slug = forms.SlugField(
        required=False,
        label="URL-идентификатор",
        widget=forms.TextInput(attrs={"placeholder": "Автоматически из ФИО"}),
    )

    class Meta:
        model = Memorial
        fields = [
            "last_name",
            "first_name",
            "patronymic",
            "birth_date",
            "death_date",
            "slug",
        ]
        widgets = {
            "birth_date": forms.DateInput(attrs={"type": "date"}),
            "death_date": forms.DateInput(attrs={"type": "date"}),
        }


BiographySectionFormSet = inlineformset_factory(
    Memorial,
    BiographySection,
    fields=["title", "text", "image", "order"],
    extra=1,
    can_delete=True,
    widgets={
        "text": forms.Textarea(attrs={"rows": 4}),
        "order": forms.NumberInput(attrs={"style": "width:80px"}),
    },
)

EventFormSet = inlineformset_factory(
    Memorial,
    Event,
    fields=[
        "event_type",
        "date",
        "start_time",
        "end_time",
        "location_name",
        "address",
        "phone",
        "description",
        "order",
    ],
    extra=1,
    can_delete=True,
    widgets={
        "date": forms.DateInput(attrs={"type": "date"}),
        "start_time": forms.TimeInput(attrs={"type": "time"}),
        "end_time": forms.TimeInput(attrs={"type": "time"}),
        "description": forms.Textarea(attrs={"rows": 3}),
        "order": forms.NumberInput(attrs={"style": "width:80px"}),
    },
)

GalleryItemFormSet = inlineformset_factory(
    Memorial,
    GalleryItem,
    fields=["media_type", "image", "video", "caption", "order"],
    extra=1,
    can_delete=True,
    widgets={
        "caption": forms.TextInput(attrs={"placeholder": "Подпись"}),
        "order": forms.NumberInput(attrs={"style": "width:80px"}),
    },
)

TimelineItemFormSet = inlineformset_factory(
    Memorial,
    TimelineItem,
    fields=["year", "title", "description", "order"],
    extra=1,
    can_delete=True,
    widgets={
        "description": forms.Textarea(attrs={"rows": 2}),
        "order": forms.NumberInput(attrs={"style": "width:80px"}),
    },
)


class TributeForm(forms.ModelForm):
    class Meta:
        model = Tribute
        fields = ["author_name", "email", "text", "image", "video"]
        widgets = {
            "text": forms.Textarea(attrs={"rows": 5, "placeholder": "Ваше воспоминание..."}),
            "email": forms.EmailInput(attrs={"placeholder": "Для подтверждения, не публикуется"}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["author_name"].label = "Ваше имя"
        self.fields["email"].label = "Email"
        self.fields["email"].required = False
