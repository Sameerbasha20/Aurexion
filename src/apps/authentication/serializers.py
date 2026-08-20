from rest_framework import serializers
from django.contrib.auth.models import User
from apps.authentication.models import UserProfile, AuditLog

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ('role',)

class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)
    role = serializers.CharField(required=False)
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'is_active', 'profile', 'role', 'password', 'date_joined')
        read_only_fields = ('date_joined',)

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        if hasattr(instance, 'profile') and instance.profile:
            ret['role'] = instance.profile.role
        else:
            ret['role'] = 'client_user'
        
        # Include active assigned leads count for workload indicators
        try:
            from apps.crm.models import Lead
            ret['active_leads_count'] = instance.assigned_leads.exclude(status=Lead.Status.LOST).count()
        except Exception:
            ret['active_leads_count'] = 0

        return ret

    def create(self, validated_data):
        role = validated_data.pop('role', 'client_user')
        password = validated_data.pop('password', None)
        
        user = User.objects.create(**validated_data)
        if password:
            user.set_password(password)
            user.save()
            
        # UserProfile is created automatically by signal, but we ensure role is set
        profile = user.profile
        profile.role = role
        profile.save()
        return user

    def update(self, instance, validated_data):
        role = validated_data.pop('role', None)
        password = validated_data.pop('password', None)

        # Update user fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
            
        if password:
            instance.set_password(password)
            
        instance.save()

        # Update profile role if provided
        if role:
            profile = instance.profile
            profile.role = role
            profile.save()
            
        return instance

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True)

class AuditLogSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True, default=None)

    class Meta:
        model = AuditLog
        fields = '__all__'
