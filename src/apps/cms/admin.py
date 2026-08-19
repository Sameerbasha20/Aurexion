from django.contrib import admin
from apps.cms.models import Service, CaseStudy, Industry, Category, BlogPost

class CustomNoRedirectAdmin(admin.ModelAdmin):
    def response_add(self, request, obj, post_url_continue=None):
        if "_addanother" in request.POST:
            return self.add_view(request)
        elif "_continue" in request.POST:
            return self.change_view(request, str(obj.pk))
        return self.changelist_view(request)

    def response_change(self, request, obj):
        if "_addanother" in request.POST:
            return self.add_view(request)
        elif "_continue" in request.POST:
            return self.change_view(request, str(obj.pk))
        return self.changelist_view(request)

@admin.register(Service)
class ServiceAdmin(CustomNoRedirectAdmin):
    list_display = ('title', 'slug', 'status', 'is_featured', 'created_at')
    list_filter = ('status', 'is_featured')
    search_fields = ('title', 'slug', 'description')
    prepopulated_fields = {'slug': ('title',)}

@admin.register(CaseStudy)
class CaseStudyAdmin(CustomNoRedirectAdmin):
    list_display = ('title', 'slug', 'client', 'confidential', 'status', 'created_at')
    list_filter = ('status', 'confidential')
    search_fields = ('title', 'slug', 'client')
    prepopulated_fields = {'slug': ('title',)}

@admin.register(Industry)
class IndustryAdmin(CustomNoRedirectAdmin):
    list_display = ('name', 'slug', 'status', 'created_at')
    list_filter = ('status', )
    search_fields = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}

@admin.register(Category)
class CategoryAdmin(CustomNoRedirectAdmin):
    list_display = ('name', 'slug', 'parent')
    search_fields = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}

@admin.register(BlogPost)
class BlogPostAdmin(CustomNoRedirectAdmin):
    list_display = ('title', 'slug', 'category', 'status', 'published_at', 'created_at')
    list_filter = ('status', 'category')
    search_fields = ('title', 'slug', 'content')
    prepopulated_fields = {'slug': ('title',)}

