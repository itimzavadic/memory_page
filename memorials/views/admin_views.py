from django.contrib import messages
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db.models import Q
from django.shortcuts import get_object_or_404, redirect, render
from django.views.decorators.http import require_http_methods

from memorials.forms import (
    BiographySectionFormSet,
    EventFormSet,
    GalleryItemFormSet,
    MemorialBasicForm,
    MemorialCreateForm,
    TimelineItemFormSet,
)
from memorials.models import Memorial, Tribute, TributeStatus
from memorials.utils.qr import qr_response
from memorials.utils.slug import generate_slug


def admin_login(request):
    if request.user.is_authenticated:
        return redirect("admin_dashboard")
    if request.method == "POST":
        username = request.POST.get("username", "")
        password = request.POST.get("password", "")
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return redirect("admin_dashboard")
        messages.error(request, "Неверный логин или пароль.")
    return render(request, "panel/login.html")


@login_required
def admin_logout(request):
    logout(request)
    return redirect("admin_login")


@login_required
def admin_dashboard(request):
    query = request.GET.get("q", "").strip()
    memorials = Memorial.objects.all()
    if query:
        memorials = memorials.filter(
            Q(slug__icontains=query)
            | Q(last_name__icontains=query)
            | Q(first_name__icontains=query)
            | Q(patronymic__icontains=query)
        )
    pending_count = Tribute.objects.filter(status=TributeStatus.PENDING).count()
    return render(
        request,
        "panel/dashboard.html",
        {"memorials": memorials, "query": query, "pending_count": pending_count},
    )


@login_required
def memorial_create(request):
    if request.method == "POST":
        form = MemorialCreateForm(request.POST)
        if form.is_valid():
            memorial = form.save(commit=False)
            if not memorial.slug:
                memorial.slug = generate_slug(
                    memorial.last_name,
                    memorial.first_name,
                    memorial.patronymic,
                    memorial.birth_date,
                )
            memorial.save()
            messages.success(request, "Страница создана. Заполните содержимое.")
            return redirect("admin_memorial_edit", pk=memorial.pk)
    else:
        form = MemorialCreateForm()
    return render(request, "panel/memorial_create.html", {"form": form})


@login_required
@require_http_methods(["GET", "POST"])
def memorial_edit(request, pk):
    memorial = get_object_or_404(Memorial, pk=pk)
    section = request.GET.get("section", "basic")

    basic_form = MemorialBasicForm(instance=memorial)
    bio_formset = BiographySectionFormSet(instance=memorial, prefix="bio")
    event_formset = EventFormSet(instance=memorial, prefix="events")
    gallery_formset = GalleryItemFormSet(instance=memorial, prefix="gallery")
    timeline_formset = TimelineItemFormSet(instance=memorial, prefix="timeline")

    if request.method == "POST":
        post_section = request.POST.get("section", "basic")
        if post_section == "basic":
            basic_form = MemorialBasicForm(request.POST, request.FILES, instance=memorial)
            if basic_form.is_valid():
                basic_form.save()
                messages.success(request, "Основные данные сохранены.")
                return redirect(f"{request.path}?section=basic")
        elif post_section == "biography":
            bio_formset = BiographySectionFormSet(
                request.POST, request.FILES, instance=memorial, prefix="bio"
            )
            if bio_formset.is_valid():
                bio_formset.save()
                messages.success(request, "Биография сохранена.")
                return redirect(f"{request.path}?section=biography")
        elif post_section == "events":
            event_formset = EventFormSet(request.POST, instance=memorial, prefix="events")
            if event_formset.is_valid():
                event_formset.save()
                messages.success(request, "События сохранены.")
                return redirect(f"{request.path}?section=events")
        elif post_section == "gallery":
            gallery_formset = GalleryItemFormSet(
                request.POST, request.FILES, instance=memorial, prefix="gallery"
            )
            if gallery_formset.is_valid():
                gallery_formset.save()
                messages.success(request, "Галерея сохранена.")
                return redirect(f"{request.path}?section=gallery")
        elif post_section == "timeline":
            timeline_formset = TimelineItemFormSet(
                request.POST, instance=memorial, prefix="timeline"
            )
            if timeline_formset.is_valid():
                timeline_formset.save()
                messages.success(request, "Таймлайн сохранён.")
                return redirect(f"{request.path}?section=timeline")
        section = post_section

    return render(
        request,
        "panel/memorial_edit.html",
        {
            "memorial": memorial,
            "section": section,
            "basic_form": basic_form,
            "bio_formset": bio_formset,
            "event_formset": event_formset,
            "gallery_formset": gallery_formset,
            "timeline_formset": timeline_formset,
        },
    )


@login_required
@require_http_methods(["POST"])
def memorial_delete(request, pk):
    memorial = get_object_or_404(Memorial, pk=pk)
    memorial.delete()
    messages.success(request, "Страница удалена.")
    return redirect("admin_dashboard")


@login_required
def memorial_preview(request, pk):
    memorial = get_object_or_404(Memorial, pk=pk)
    context = {
        "memorial": memorial,
        "biography_sections": memorial.biography_sections.all(),
        "events": memorial.events.all(),
        "gallery_items": memorial.gallery_items.all(),
        "timeline_items": memorial.timeline_items.all(),
        "tributes": memorial.tributes.filter(status=TributeStatus.APPROVED),
        "tribute_form": None,
        "page_url": request.build_absolute_uri(f"/p/{memorial.slug}/"),
        "is_preview": True,
    }
    return render(request, "memorial/detail.html", context)


@login_required
def memorial_qr(request, pk):
    memorial = get_object_or_404(Memorial, pk=pk)
    url = request.build_absolute_uri(f"/p/{memorial.slug}/")
    return qr_response(url, filename=f"{memorial.slug}-qr.png")


@login_required
def tribute_moderation(request):
    tributes = Tribute.objects.select_related("memorial").filter(
        status=TributeStatus.PENDING
    )
    return render(request, "panel/tribute_moderation.html", {"tributes": tributes})


@login_required
@require_http_methods(["POST"])
def tribute_approve(request, pk):
    tribute = get_object_or_404(Tribute, pk=pk)
    tribute.status = TributeStatus.APPROVED
    tribute.save()
    messages.success(request, "Воспоминание одобрено.")
    return redirect("admin_tribute_moderation")


@login_required
@require_http_methods(["POST"])
def tribute_reject(request, pk):
    tribute = get_object_or_404(Tribute, pk=pk)
    tribute.status = TributeStatus.REJECTED
    tribute.save()
    messages.success(request, "Воспоминание отклонено.")
    return redirect("admin_tribute_moderation")


@login_required
def suggest_slug(request):
    last_name = request.GET.get("last_name", "")
    first_name = request.GET.get("first_name", "")
    patronymic = request.GET.get("patronymic", "")
    birth_date = request.GET.get("birth_date", "")
    from datetime import datetime

    bd = None
    if birth_date:
        try:
            bd = datetime.strptime(birth_date, "%Y-%m-%d").date()
        except ValueError:
            pass
    slug = generate_slug(last_name, first_name, patronymic, bd)
    from django.http import JsonResponse

    return JsonResponse({"slug": slug})
