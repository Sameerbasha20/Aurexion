from django.db import models
from apps.crm.models import Lead, LeadFollowUp


class BdmLead(Lead):
    """BDM pipeline view proxy model for Lead records."""

    class Meta:
        proxy = True
        verbose_name = "BDM Lead Overview"
        verbose_name_plural = "BDM Lead Pipeline"


class BdmFollowUp(LeadFollowUp):
    """BDM activity tracking proxy model for LeadFollowUp records."""

    class Meta:
        proxy = True
        verbose_name = "BDM Follow-up Activity"
        verbose_name_plural = "BDM Follow-up Activities"

