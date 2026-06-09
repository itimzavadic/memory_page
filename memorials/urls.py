from django.urls import path

from memorials import views

urlpatterns = [
    path("p/<slug:slug>/", views.memorial_detail, name="memorial_detail"),
    path("p/<slug:slug>/tribute/", views.tribute_submit, name="tribute_submit"),
    path("panel/login/", views.admin_login, name="admin_login"),
    path("panel/logout/", views.admin_logout, name="admin_logout"),
    path("panel/", views.admin_dashboard, name="admin_dashboard"),
    path("panel/create/", views.memorial_create, name="admin_memorial_create"),
    path("panel/<int:pk>/edit/", views.memorial_edit, name="admin_memorial_edit"),
    path("panel/<int:pk>/delete/", views.memorial_delete, name="admin_memorial_delete"),
    path("panel/<int:pk>/preview/", views.memorial_preview, name="admin_memorial_preview"),
    path("panel/<int:pk>/qr/", views.memorial_qr, name="admin_memorial_qr"),
    path("panel/tributes/", views.tribute_moderation, name="admin_tribute_moderation"),
    path("panel/tributes/<int:pk>/approve/", views.tribute_approve, name="admin_tribute_approve"),
    path("panel/tributes/<int:pk>/reject/", views.tribute_reject, name="admin_tribute_reject"),
    path("panel/api/suggest-slug/", views.suggest_slug, name="admin_suggest_slug"),
]
