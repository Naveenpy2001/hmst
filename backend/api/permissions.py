from .models import *
from rest_framework.permissions import BasePermission
from django.utils import timezone

class HasPaidMonthlyFee(BasePermission):
    def has_permission(self, request, view):
        if request.user.is_staff:
            return True
            
        today = timezone.now()
        try:
            payment = DoctorPaymentStatus.objects.filter(
                doctor=request.user,
                month=today.month,
                year=today.year
            ).latest('created_at')
            return payment.is_paid
        except DoctorPaymentStatus.DoesNotExist:
            return False


class IsDoctorPaidThisMonth(BasePermission):
    def has_permission(self, request, view):
        if request.user.is_staff:
            return True  # Admins can always access
        if not request.user.is_active:
            return False  # Inactive accounts can't access
        
        today = timezone.now()
        paid = MonthlyDoctorPayment.objects.filter(
            doctor=request.user,
            year=today.year,
            month=today.month,
            paid=True
        ).exists()
        return paid