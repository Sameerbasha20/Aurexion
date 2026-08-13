from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.core.cache import cache

STATUS_CHOICES = [
    ('draft', 'Draft'),
    ('published', 'Published'),
    ('archived', 'Archived'),
]

class Service(models.Model):
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True)
    description = models.TextField()
    problem = models.TextField()
    solution = models.TextField()
    tech_stack = models.JSONField(default=list, blank=True)
    
    # SEO
    meta_title = models.CharField(max_length=200, blank=True, null=True)
    meta_description = models.TextField(blank=True, null=True)
    meta_keywords = models.CharField(max_length=255, blank=True, null=True)
    
    is_featured = models.BooleanField(default=False)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

class CaseStudy(models.Model):
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True)
    client = models.CharField(max_length=200)
    context = models.TextField()
    business_challenge = models.TextField()
    proposed_architecture = models.TextField()
    tech_stack = models.JSONField(default=list, blank=True)
    development_approach = models.TextField()
    modules_integration_security = models.TextField()
    outcomes_performance = models.TextField()
    
    confidential = models.BooleanField(default=False)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

class Industry(models.Model):
    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True)
    challenges = models.TextField()
    target_solutions = models.TextField()
    
    services = models.ManyToManyField(Service, blank=True, related_name='industries')
    case_studies = models.ManyToManyField(CaseStudy, blank=True, related_name='industries')
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=100, unique=True)
    parent = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='children')

    class Meta:
        verbose_name_plural = 'Categories'

    def __str__(self):
        return self.name

class BlogPost(models.Model):
    BLOG_STATUS_CHOICES = STATUS_CHOICES + [('scheduled', 'Scheduled')]

    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True)
    content = models.TextField()
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name='posts')
    tags = models.JSONField(default=list, blank=True)
    media = models.CharField(max_length=255, blank=True, null=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='blog_posts')
    
    published_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # SEO
    meta_title = models.CharField(max_length=200, blank=True, null=True)
    meta_description = models.TextField(blank=True, null=True)
    meta_keywords = models.CharField(max_length=255, blank=True, null=True)
    
    status = models.CharField(max_length=20, choices=BLOG_STATUS_CHOICES, default='draft')

    def __str__(self):
        return self.title

# Signal to invalidate cache when any CMS object is saved or deleted
@receiver([post_save, post_delete], sender=Service)
@receiver([post_save, post_delete], sender=Industry)
@receiver([post_save, post_delete], sender=CaseStudy)
@receiver([post_save, post_delete], sender=Category)
@receiver([post_save, post_delete], sender=BlogPost)
def invalidate_cms_cache(sender, **kwargs):
    cache.clear()
