from .models import *
from rest_framework.permissions import BasePermission
from django.utils import timezone

class HasPaidMonthlyFee(BasePermission):
    def has_permission(self, request, view):
        if request.user.is_staff:
            return True
            
        today = timezone.now()
        try:
            payment = DoctorPayment.objects.filter(
                doctor=request.user,
                month=today.month,
                year=today.year
            ).latest('created_at')
            return payment.is_paid
        except DoctorPayment.DoesNotExist:
            return False