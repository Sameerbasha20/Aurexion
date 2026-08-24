# Generated for performance optimization — Phase 1
# Adds two indexes to authentication_auditlog:
#   1. auditlog_timestamp_idx        — (timestamp DESC)  for ORDER BY queries
#   2. auditlog_module_timestamp_idx — (module, timestamp DESC) for module-filtered dashboard queries
#
# Write overhead: each AuditLog INSERT now updates 2 additional B-tree indexes.
# Since AuditLog is append-only (no UPDATEs to indexed columns) and read-heavy
# on dashboard endpoints, the read benefit far outweighs the marginal write cost.
# Estimated write overhead per INSERT: <1 ms additional.

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('authentication', '0002_auditlog'),
    ]

    operations = [
        migrations.AddIndex(
            model_name='auditlog',
            index=models.Index(fields=['-timestamp'], name='auditlog_timestamp_idx'),
        ),
        migrations.AddIndex(
            model_name='auditlog',
            index=models.Index(fields=['module', '-timestamp'], name='auditlog_module_timestamp_idx'),
        ),
    ]
