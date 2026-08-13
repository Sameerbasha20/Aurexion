from django.contrib import admin
from apps.cms.models import Service, CaseStudy, Industry, Category, BlogPost

@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ('title', 'slug', 'status', 'is_featured', 'created_at')
    list_filter = ('status', 'is_featured')
    search_fields = ('title', 'slug', 'description')
    prepopulated_fields = {'slug': ('title',)}

@admin.register(CaseStudy)
class CaseStudyAdmin(admin.ModelAdmin):
    list_display = ('title', 'slug', 'client', 'confidential', 'status', 'created_at')
    list_filter = ('status', 'confidential')
    search_fields = ('title', 'slug', 'client')
    prepopulated_fields = {'slug': ('title',)}

@admin.register(Industry)
class IndustryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'status', 'created_at')
    list_filter = ('status',)
    search_fields = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'parent')
    search_fields = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}

@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
    list_display = ('title', 'slug', 'category', 'status', 'published_at', 'created_at')
    list_filter = ('status', 'category')
    search_fields = ('title', 'slug', 'content')
    prepopulated_fields = {'slug': ('title',)}
