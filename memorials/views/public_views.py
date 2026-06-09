from django.contrib import messages
from django.http import Http404
from django.shortcuts import get_object_or_404, redirect, render
from django.views.decorators.http import require_http_methods

from memorials.forms import TributeForm
from memorials.models import Memorial, MemorialStatus, TributeStatus


def memorial_detail(request, slug):
    memorial = get_object_or_404(Memorial, slug=slug)
    if memorial.status != MemorialStatus.PUBLISHED:
        raise Http404

    approved_tributes = memorial.tributes.filter(status=TributeStatus.APPROVED)

    context = {
        "memorial": memorial,
        "biography_sections": memorial.biography_sections.all(),
        "events": memorial.events.all(),
        "gallery_items": memorial.gallery_items.all(),
        "timeline_items": memorial.timeline_items.all(),
        "tributes": approved_tributes,
        "tribute_form": TributeForm(),
        "page_url": request.build_absolute_uri(),
    }
    return render(request, "memorial/detail.html", context)


@require_http_methods(["POST"])
def tribute_submit(request, slug):
    memorial = get_object_or_404(Memorial, slug=slug, status=MemorialStatus.PUBLISHED)
    form = TributeForm(request.POST, request.FILES)
    if form.is_valid():
        tribute = form.save(commit=False)
        tribute.memorial = memorial
        tribute.status = TributeStatus.PENDING
        tribute.save()
        messages.success(
            request,
            "Спасибо за ваше воспоминание. Оно появится на странице после проверки.",
        )
    else:
        messages.error(request, "Пожалуйста, проверьте заполнение формы.")
    return redirect("memorial_detail", slug=slug)
