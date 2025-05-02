# signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from .models import PatientRegister, DoctorPayment

@receiver(post_save, sender=PatientRegister)
def create_payment_record(sender, instance, created, **kwargs):
    if created:
        today = timezone.now()
        month = today.month
        year = today.year
        
        # Get or create payment record
        payment, created = DoctorPayment.objects.get_or_create(
            doctor=instance.user,
            month=month,
            year=year,
            defaults={
                'amount': 0,
                'patients_count': 0
            }
        )
        
        # Update the record
        payment.patients_count += 1
        payment.amount += float(instance.charge_to_admin)
        payment.save()