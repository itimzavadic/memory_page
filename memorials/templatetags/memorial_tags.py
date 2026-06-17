import os

from django import template
from django.contrib.staticfiles import finders
from django.templatetags.static import static

register = template.Library()

HERO_IMAGES = {
    "frame": "img/frame.png",
    "candle": "img/candle.png",
    "portrait": "img/portrait.png",
}

MONTHS_RU = {
    1: "января",
    2: "февраля",
    3: "марта",
    4: "апреля",
    5: "мая",
    6: "июня",
    7: "июля",
    8: "августа",
    9: "сентября",
    10: "октября",
    11: "ноября",
    12: "декабря",
}

WEEKDAYS_RU = {
    0: "Понедельник",
    1: "Вторник",
    2: "Среда",
    3: "Четверг",
    4: "Пятница",
    5: "Суббота",
    6: "Воскресенье",
}


@register.simple_tag
def hero_image(name):
    path = HERO_IMAGES.get(name)
    if not path:
        return ""
    url = static(path)
    found = finders.find(path)
    if found:
        version = int(os.path.getmtime(found))
        return f"{url}?v={version}"
    return url


@register.filter
def russian_date(value):
    if not value:
        return ""
    return f"{value.day} {MONTHS_RU[value.month]} {value.year}"


@register.filter
def russian_date_short(value):
    if not value:
        return ""
    months_short = {
        1: "янв", 2: "фев", 3: "мар", 4: "апр", 5: "мая", 6: "июн",
        7: "июл", 8: "авг", 9: "сен", 10: "окт", 11: "нов", 12: "дек",
    }
    return f"{value.day} {months_short[value.month]} {value.year}"


@register.filter
def weekday_ru(value):
    if not value:
        return ""
    return WEEKDAYS_RU[value.weekday()].upper()


@register.filter
def time_ampm(value):
    if not value:
        return ""
    hour = value.hour
    minute = value.minute
    period = "AM" if hour < 12 else "PM"
    display_hour = hour % 12 or 12
    return f"{display_hour}:{minute:02d}{period}"
